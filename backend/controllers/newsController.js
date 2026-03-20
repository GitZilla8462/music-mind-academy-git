const Article = require('../models/Article');

const newsController = {
  // GET /api/news/feed — paginated, filtered list of approved articles
  getFeed: async (req, res) => {
    try {
      const { genre, artist, topic, page = 1, limit = 20 } = req.query;
      const filter = { approved: true };

      if (genre) filter.genres = genre;
      if (artist) filter.artists = { $regex: artist, $options: 'i' };
      if (topic) filter.topics = { $regex: topic, $options: 'i' };

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const articles = await Article.find(filter)
        .sort({ generated_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-body_standard -body_simplified')
        .lean();

      const total = await Article.countDocuments(filter);

      res.json({
        success: true,
        data: articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching news feed:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch news feed', error: error.message });
    }
  },

  // GET /api/news/featured — current featured article
  getFeatured: async (req, res) => {
    try {
      const article = await Article.findOne({ featured: true, approved: true }).lean();
      if (!article) {
        // Fallback to most recent approved
        const fallback = await Article.findOne({ approved: true }).sort({ generated_at: -1 }).lean();
        return res.json({ success: true, data: fallback });
      }
      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error fetching featured article:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch featured article', error: error.message });
    }
  },

  // GET /api/news/article/:id — single article, increment view count
  getArticle: async (req, res) => {
    try {
      const article = await Article.findByIdAndUpdate(
        req.params.id,
        { $inc: { view_count: 1 } },
        { new: true }
      ).lean();

      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }

      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error fetching article:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch article', error: error.message });
    }
  },

  // GET /api/news/search?q= — search articles
  searchArticles: async (req, res) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      if (!q || q.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const regex = new RegExp(q.trim(), 'i');

      const articles = await Article.find({
        approved: true,
        $or: [
          { generated_headline: regex },
          { body_standard: regex },
          { artists: regex },
          { topics: regex }
        ]
      })
        .sort({ generated_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-body_standard -body_simplified')
        .lean();

      res.json({ success: true, data: articles, query: q });
    } catch (error) {
      console.error('Error searching articles:', error);
      res.status(500).json({ success: false, message: 'Search failed', error: error.message });
    }
  },

  // POST /api/news/flag/:id — flag an article
  flagArticle: async (req, res) => {
    try {
      const article = await Article.findByIdAndUpdate(
        req.params.id,
        { $inc: { flag_count: 1 } },
        { new: true }
      );

      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }

      // Auto-unapprove if flagged 3+ times
      if (article.flag_count >= 3 && article.approved) {
        article.approved = false;
        await article.save();
        console.log(`🚩 Article auto-unapproved (${article.flag_count} flags): "${article.generated_headline}"`);
      }

      res.json({ success: true, message: 'Article flagged', flag_count: article.flag_count });
    } catch (error) {
      console.error('Error flagging article:', error);
      res.status(500).json({ success: false, message: 'Failed to flag article', error: error.message });
    }
  },

  // GET /api/news/admin — all articles including unapproved (admin only)
  adminGetAll: async (req, res) => {
    try {
      const { page = 1, limit = 50, approved, featured } = req.query;
      const filter = {};
      if (approved !== undefined) filter.approved = approved === 'true';
      if (featured !== undefined) filter.featured = featured === 'true';

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const articles = await Article.find(filter)
        .sort({ generated_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Article.countDocuments(filter);

      res.json({
        success: true,
        data: articles,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
      });
    } catch (error) {
      console.error('Error fetching admin articles:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch articles', error: error.message });
    }
  },

  // PATCH /api/news/admin/:id — approve/unapprove, feature/unfeature, edit
  adminUpdateArticle: async (req, res) => {
    try {
      const { approved, featured, generated_headline } = req.body;
      const update = {};

      if (approved !== undefined) update.approved = approved;
      if (generated_headline) update.generated_headline = generated_headline;

      // If featuring this article, unfeature all others first
      if (featured === true) {
        await Article.updateMany({ featured: true }, { featured: false });
        update.featured = true;
      } else if (featured === false) {
        update.featured = false;
      }

      const article = await Article.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

      if (!article) {
        return res.status(404).json({ success: false, message: 'Article not found' });
      }

      res.json({ success: true, data: article, message: 'Article updated' });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ success: false, message: 'Failed to update article', error: error.message });
    }
  }
};

module.exports = newsController;
