/**
 * NextGen Page Registry
 * Maps application tabs, routes, and individual module & feature detail screens.
 */

export const PAGE_PATHS = {
  home: './pages/main/home.html',
  features: './pages/main/features.html',
  billing: './pages/main/billing.html',
  knowledge: './pages/main/knowledge.html',
  study: './pages/main/knowledge.html',
  terms: './pages/main/terms.html',

  // 8 Knowledge / Study Deep-Dive Pages
  'knowledge/bucket-list-the-secret': './pages/Knowledge/bucket-list-the-secret.html',
  'knowledge/day-week-atomic-habits': './pages/Knowledge/day-week-atomic-habits.html',
  'knowledge/deep-work-flow-state': './pages/Knowledge/deep-work-flow-state.html',
  'knowledge/social-feed-influence': './pages/Knowledge/social-feed-influence.html',
  'knowledge/habit-stacking-tiny-habits': './pages/Knowledge/habit-stacking-tiny-habits.html',
  'knowledge/continuous-improvement-kaizen': './pages/Knowledge/continuous-improvement-kaizen.html',
  'knowledge/performance-dip-j-curve': './pages/Knowledge/performance-dip-j-curve.html',
  'knowledge/behavioral-science-research': './pages/Knowledge/behavioral-science-research.html',

  // Backward-compatible short aliases
  'knowledge/the-secret': './pages/Knowledge/bucket-list-the-secret.html',
  'knowledge/atomic-habits': './pages/Knowledge/day-week-atomic-habits.html',
  'knowledge/flow-state': './pages/Knowledge/deep-work-flow-state.html',
  'knowledge/social-accountability': './pages/Knowledge/social-feed-influence.html',
  'knowledge/habit-stacking': './pages/Knowledge/habit-stacking-tiny-habits.html',
  'knowledge/kaizen': './pages/Knowledge/continuous-improvement-kaizen.html',
  'knowledge/j-curve': './pages/Knowledge/performance-dip-j-curve.html',
  'knowledge/research': './pages/Knowledge/behavioral-science-research.html',

  // Backward-compatible study/ aliases
  'study/the-secret': './pages/Knowledge/bucket-list-the-secret.html',
  'study/atomic-habits': './pages/Knowledge/day-week-atomic-habits.html',
  'study/flow-state': './pages/Knowledge/deep-work-flow-state.html',
  'study/social-accountability': './pages/Knowledge/social-feed-influence.html',
  'study/habit-stacking': './pages/Knowledge/habit-stacking-tiny-habits.html',
  'study/kaizen': './pages/Knowledge/continuous-improvement-kaizen.html',
  'study/j-curve': './pages/Knowledge/performance-dip-j-curve.html',
  'study/research': './pages/Knowledge/behavioral-science-research.html',

  // 11 Core Action Modules
  'features/day-task': './pages/modules/day-task.html',
  'features/weekly-task': './pages/modules/weekly-task.html',
  'features/long-goal': './pages/modules/long-goal.html',
  'features/bucket': './pages/modules/bucket.html',
  'features/diary': './pages/modules/diary.html',
  'features/dashboard': './pages/modules/dashboard.html',
  'features/competitions': './pages/modules/competitions.html',
  'features/leaderboard': './pages/modules/leaderboard.html',
  'features/mentorship': './pages/modules/mentorship.html',
  'features/social': './pages/modules/social.html',
  'features/chat': './pages/modules/chat.html',

  // 3 Platform & System Features
  'features/ai': './pages/modules/ai.html',
  'features/settings': './pages/modules/settings.html',
  'features/notifications': './pages/modules/notifications.html'
};

export const PAGE_TITLES = {
  home: 'NextGen — Intelligent Ecosystem & Time Chart',
  features: 'Modules & Features (11+3) — Time Chart',
  billing: 'Subscriptions & Monetization — Time Chart',
  knowledge: 'Knowledge & Research Hub — NextGen',
  study: 'Knowledge & Research Hub — NextGen',
  terms: 'Terms & Conditions — Time Chart',

  // 8 Knowledge / Study Deep-Dive Titles
  'knowledge/j-curve': 'The J-Curve Effect — Time Chart Research',
  'knowledge/atomic-habits': 'Atomic Habits Framework — Time Chart Research',
  'knowledge/research': 'App Research & Data — Time Chart Research',
  'knowledge/kaizen': 'Kaizen & The 1% Rule — Time Chart Research',
  'knowledge/flow-state': 'Flow State Architecture — Time Chart Research',
  'knowledge/habit-stacking': 'Habit Stacking & Anchoring — Time Chart Research',
  'knowledge/the-secret': 'The Secret & Visualization — Time Chart Research',
  'knowledge/social-accountability': 'Social Proof & Public Accountability — Time Chart Research',

  'study/j-curve': 'The J-Curve Effect — Time Chart Research',
  'study/atomic-habits': 'Atomic Habits Framework — Time Chart Research',
  'study/research': 'App Research & Data — Time Chart Research',
  'study/kaizen': 'Kaizen & The 1% Rule — Time Chart Research',
  'study/flow-state': 'Flow State Architecture — Time Chart Research',
  'study/habit-stacking': 'Habit Stacking & Anchoring — Time Chart Research',
  'study/the-secret': 'The Secret & Visualization — Time Chart Research',
  'study/social-accountability': 'Social Proof & Public Accountability — Time Chart Research',

  // 11 Module Detail Titles
  'features/day-task': 'Day Task Module — Time Chart',
  'features/weekly-task': 'Weekly Task Module — Time Chart',
  'features/long-goal': 'Long Goal Module — Time Chart',
  'features/bucket': 'Bucket List Module — Time Chart',
  'features/diary': 'Personal Diary Module — Time Chart',
  'features/dashboard': 'Analytics Dashboard Module — Time Chart',
  'features/competitions': 'Competitions Module — Time Chart',
  'features/leaderboard': 'Leaderboard Module — Time Chart',
  'features/mentorship': 'Mentorship Module — Time Chart',
  'features/social': 'Social Feed Module — Time Chart',
  'features/chat': 'Task-Connected Chat Module — Time Chart',

  // 3 Platform Feature Titles
  'features/ai': 'Nova AI Copilot — Time Chart Feature',
  'features/settings': 'Settings & Sovereignty — Time Chart Feature',
  'features/notifications': 'Smart Notifications & Focus Guard — Time Chart Feature'
};

export const MODULE_NAMES = {
  'day-task': 'Day Task',
  'weekly-task': 'Weekly Task',
  'long-goal': 'Long Goal',
  'bucket': 'Bucket List',
  'diary': 'Personal Diary',
  'dashboard': 'Analytics Dashboard',
  'competitions': 'Competitions',
  'leaderboard': 'Leaderboard',
  'mentorship': 'Mentorship',
  'social': 'Social Feed',
  'chat': 'Chat',
  'ai': 'Nova AI',
  'settings': 'Settings',
  'notifications': 'Notifications'
};

