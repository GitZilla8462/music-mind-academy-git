// Single source of truth for email template metadata
// Used by EmailsPage, TeacherAnalyticsPage, and BatchEmailModal

export const EMAIL_TEMPLATES = [
  {
    id: 'drip-1',
    name: 'Welcome Email',
    subject: "You're in! Music Mind Academy pilot access is ready",
    trigger: 'Immediately on approval',
    description: 'Sent to teachers when their application is approved. Contains login instructions and pilot dates.',
    color: 'sky',
    outreachField: 'dripWelcomeSent',
    from: 'Rob Taube - Music Mind Academy',
    variables: ['firstName', 'siteUrl', 'loginUrl'],
  },
  {
    id: 'drip-2',
    name: '7-Day Follow-up',
    subject: 'Just checking in - have you had a chance to log in?',
    trigger: '7 days after approval, if no login',
    description: "Auto-sent to teachers who were approved but haven't logged in after a week.",
    color: 'blue',
    outreachField: 'dripFollowup1Sent',
    from: 'Rob Taube - Music Mind Academy',
    variables: ['firstName', 'siteUrl', 'loginUrl'],
  },
  {
    id: 'drip-3',
    name: 'Final Reminder',
    subject: 'Last reminder - your pilot access is waiting',
    trigger: '14 days after approval, if no login',
    description: "Last automated reminder for teachers who still haven't logged in.",
    color: 'indigo',
    outreachField: 'dripFollowup2Sent',
    from: 'Rob Taube - Music Mind Academy',
    variables: ['firstName', 'siteUrl', 'loginUrl'],
  },
  {
    id: 'survey-l3',
    name: 'Mid-Pilot Survey',
    subject: "You're halfway through the pilot! Quick survey inside",
    trigger: 'After Lesson 3 with 5+ students',
    description: 'Automatically sent when a teacher completes Lesson 3 with a real class.',
    color: 'purple',
    outreachField: 'emailedL3',
    from: 'Music Mind Academy',
    variables: ['firstName', 'surveyUrl', 'siteUrl'],
  },
  {
    id: 'survey-l5',
    name: 'Final Survey',
    subject: 'You finished the pilot! Final survey inside',
    trigger: 'After Lesson 5 with 5+ students',
    description: 'Automatically sent when a teacher completes Lesson 5 with a real class.',
    color: 'green',
    outreachField: 'emailedDone',
    from: 'Music Mind Academy',
    variables: ['firstName', 'surveyUrl', 'siteUrl'],
  },
  {
    id: 'application-notify',
    name: 'Application Notification',
    subject: 'New pilot application: [Name]',
    trigger: 'When teacher submits application form',
    description: 'Sent to admin (rob@musicmindacademy.com) with application details and approve/decline buttons.',
    color: 'orange',
    outreachField: null,
    from: 'Music Mind Academy',
    variables: ['fullName', 'applicationTable', 'applicationDetails', 'approveUrl', 'declineUrl', 'siteUrl'],
  },
];

// Quick lookup: id → friendly name
export const EMAIL_NAMES = Object.fromEntries(
  EMAIL_TEMPLATES.map(t => [t.id, t.name])
);
