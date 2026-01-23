const express = require('express');
const router = express.Router();
const ErrorLog = require('../models/ErrorLog');
const { sendErrorAlert } = require('../services/errorEmailService');

// POST /api/errors - Log a new error (public endpoint, no auth required)
router.post('/', async (req, res) => {
  try {
    const {
      message,
      stack,
      page,
      component,
      browser,
      device,
      userAgent,
      screenSize,
      online,
      siteMode,
      appVersion,
      lesson,
      activity,
      userRole,
      errorType,
      severity,
      breadcrumbs,
      consoleLogs,
      localTime
    } = req.body;

    // Basic validation
    if (!message || !page) {
      return res.status(400).json({ error: 'message and page are required' });
    }

    // Sanitize page URL - remove query params that might contain session/student IDs
    const sanitizedPage = page.split('?')[0];

    // Limit breadcrumbs and console logs to prevent abuse
    const safeBreadcrumbs = Array.isArray(breadcrumbs)
      ? breadcrumbs.slice(-20).map(b => ({
          type: String(b.type || '').substring(0, 50),
          message: String(b.message || '').substring(0, 200),
          timestamp: b.timestamp
        }))
      : [];

    const safeConsoleLogs = Array.isArray(consoleLogs)
      ? consoleLogs.slice(-15).map(log => ({
          level: String(log.level || '').substring(0, 10),
          message: String(log.message || '').substring(0, 300),
          timestamp: log.timestamp
        }))
      : [];

    const errorLog = new ErrorLog({
      message: message.substring(0, 1000), // Limit message length
      stack: stack ? stack.substring(0, 5000) : null, // Limit stack length
      page: sanitizedPage,
      component: component ? component.substring(0, 200) : null,
      browser,
      device,
      userAgent: userAgent ? userAgent.substring(0, 500) : null,
      screenSize: screenSize ? screenSize.substring(0, 20) : null,
      online: online !== false, // Default to true
      siteMode: siteMode || 'unknown',
      appVersion,
      lesson: lesson ? lesson.substring(0, 100) : null,
      activity: activity ? activity.substring(0, 100) : null,
      userRole: ['teacher', 'student'].includes(userRole) ? userRole : null,
      errorType: errorType || 'unknown',
      severity: severity || 'medium',
      breadcrumbs: safeBreadcrumbs,
      consoleLogs: safeConsoleLogs,
      localTime
    });

    await errorLog.save();

    // Send email alert for critical/high severity errors (async, don't block)
    if (['critical', 'high'].includes(severity)) {
      sendErrorAlert(errorLog.toObject()).then(sent => {
        if (sent) {
          ErrorLog.findByIdAndUpdate(errorLog._id, { emailSent: true }).catch(() => {});
        }
      }).catch(() => {});
    }

    // Don't log every error to console - just acknowledge
    res.status(201).json({ success: true, id: errorLog._id });
  } catch (error) {
    console.error('Error saving error log:', error);
    // Still return success to avoid blocking the client
    res.status(200).json({ success: false });
  }
});

// GET /api/errors - Get error logs (admin only)
router.get('/', async (req, res) => {
  try {
    const {
      status,
      page,
      errorType,
      severity,
      limit = 100,
      offset = 0,
      since // ISO date string
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (page) query.page = { $regex: page, $options: 'i' };
    if (errorType) query.errorType = errorType;
    if (severity) query.severity = severity;
    if (since) query.createdAt = { $gte: new Date(since) };

    const [errors, total] = await Promise.all([
      ErrorLog.find(query)
        .sort({ createdAt: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit))
        .lean(),
      ErrorLog.countDocuments(query)
    ]);

    res.json({
      errors,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

// GET /api/errors/stats - Get error statistics
router.get('/stats', async (req, res) => {
  try {
    const since = req.query.since
      ? new Date(req.query.since)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days

    const [
      totalCount,
      byStatus,
      byType,
      bySeverity,
      byPage,
      recentErrors
    ] = await Promise.all([
      ErrorLog.countDocuments({ createdAt: { $gte: since } }),
      ErrorLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      ErrorLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$errorType', count: { $sum: 1 } } }
      ]),
      ErrorLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]),
      ErrorLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ErrorLog.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      since: since.toISOString(),
      total: totalCount,
      byStatus: Object.fromEntries(byStatus.map(s => [s._id, s.count])),
      byType: Object.fromEntries(byType.map(t => [t._id, t.count])),
      bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
      topPages: byPage,
      recentErrors
    });
  } catch (error) {
    console.error('Error fetching error stats:', error);
    res.status(500).json({ error: 'Failed to fetch error stats' });
  }
});

// PATCH /api/errors/:id - Update error status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'seen', 'investigating', 'resolved', 'ignored'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const errorLog = await ErrorLog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!errorLog) {
      return res.status(404).json({ error: 'Error log not found' });
    }

    res.json(errorLog);
  } catch (error) {
    console.error('Error updating error log:', error);
    res.status(500).json({ error: 'Failed to update error log' });
  }
});

// DELETE /api/errors/:id - Delete an error log
router.delete('/:id', async (req, res) => {
  try {
    await ErrorLog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting error log:', error);
    res.status(500).json({ error: 'Failed to delete error log' });
  }
});

module.exports = router;
