/**
 * Mock user data for testing authentication, age-tier logic,
 * and family account functionality
 */

export const mockUsers = {
  // Parent accounts
  parent1: {
    id: 'user-parent-001',
    email: 'parent1@example.com',
    firstName: 'John',
    lastName: 'Smith', 
    role: 'parent',
    accountType: 'premium',
    dateOfBirth: '1985-03-15',
    ageTier: 'adult',
    preferences: {
      bibleTranslation: 'ESV',
      contentLanguage: 'en',
      emailNotifications: true,
      pushNotifications: false,
      privacyLevel: 'moderate'
    },
    children: ['user-child-001', 'user-child-002'],
    familyId: 'family-001',
    createdAt: '2024-01-15T10:30:00Z',
    lastActive: '2025-08-25T09:15:00Z',
    subscription: {
      plan: 'family-premium',
      status: 'active',
      expiresAt: '2025-12-15T10:30:00Z'
    }
  },

  parent2: {
    id: 'user-parent-002', 
    email: 'parent2@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'parent',
    accountType: 'basic',
    dateOfBirth: '1990-07-22',
    ageTier: 'adult',
    preferences: {
      bibleTranslation: 'KJV',
      contentLanguage: 'en',
      emailNotifications: false,
      pushNotifications: true,
      privacyLevel: 'strict'
    },
    children: ['user-child-003'],
    familyId: 'family-002',
    createdAt: '2024-06-10T14:20:00Z',
    lastActive: '2025-08-24T16:45:00Z',
    subscription: {
      plan: 'basic',
      status: 'active',
      expiresAt: null // Free plan
    }
  },

  // Child accounts
  child1: {
    id: 'user-child-001',
    firstName: 'Emma',
    lastName: 'Smith',
    role: 'child',
    dateOfBirth: '2020-05-10', // 5 years old
    ageTier: 'preschool',
    parentId: 'user-parent-001',
    familyId: 'family-001',
    preferences: {
      favoriteThemes: ['animals', 'creation', 'miracles'],
      completedStories: ['noah-ark', 'creation-day1'],
      currentQuests: ['kindness-quest'],
      safetyLevel: 'strict'
    },
    progress: {
      storiesCompleted: 12,
      quizzesCompleted: 8,
      questsCompleted: 2,
      prayersShared: 5,
      badgesEarned: ['first-story', 'kind-heart', 'prayer-warrior']
    },
    createdAt: '2024-01-15T10:35:00Z',
    lastActive: '2025-08-25T08:30:00Z'
  },

  child2: {
    id: 'user-child-002',
    firstName: 'Noah',
    lastName: 'Smith', 
    role: 'child',
    dateOfBirth: '2016-11-03', // 8 years old
    ageTier: 'elementary',
    parentId: 'user-parent-001',
    familyId: 'family-001',
    preferences: {
      favoriteThemes: ['courage', 'adventure', 'kings'],
      completedStories: ['david-goliath', 'daniel-lions', 'joshua-jericho'],
      currentQuests: ['courage-quest', 'wisdom-quest'],
      safetyLevel: 'moderate'
    },
    progress: {
      storiesCompleted: 28,
      quizzesCompleted: 25,
      questsCompleted: 7,
      prayersShared: 15,
      badgesEarned: ['story-explorer', 'quiz-master', 'brave-heart', 'family-leader']
    },
    createdAt: '2024-01-15T10:36:00Z',
    lastActive: '2025-08-25T07:45:00Z'
  },

  child3: {
    id: 'user-child-003',
    firstName: 'Grace',
    lastName: 'Johnson',
    role: 'child', 
    dateOfBirth: '2022-02-14', // 3 years old
    ageTier: 'toddler',
    parentId: 'user-parent-002',
    familyId: 'family-002',
    preferences: {
      favoriteThemes: ['love', 'animals', 'simple-stories'],
      completedStories: ['jesus-loves-me', 'good-shepherd'],
      currentQuests: [],
      safetyLevel: 'maximum'
    },
    progress: {
      storiesCompleted: 4,
      quizzesCompleted: 2,
      questsCompleted: 0,
      prayersShared: 1,
      badgesEarned: ['first-story', 'little-listener']
    },
    createdAt: '2024-06-10T14:25:00Z',
    lastActive: '2025-08-24T19:15:00Z'
  },

  // Teen account
  teen1: {
    id: 'user-teen-001',
    email: 'teen1@example.com',
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'teen',
    dateOfBirth: '2010-09-18', // 14 years old
    ageTier: 'teen',
    parentId: 'user-parent-003', // Supervised account
    preferences: {
      bibleTranslation: 'NIV',
      favoriteThemes: ['leadership', 'courage', 'identity', 'purpose'],
      completedStories: ['david-goliath', 'esther-courage', 'daniel-integrity'],
      safetyLevel: 'moderate'
    },
    progress: {
      storiesCompleted: 45,
      quizzesCompleted: 42,
      questsCompleted: 15,
      prayersShared: 23,
      badgesEarned: ['story-scholar', 'theology-student', 'peer-leader', 'servant-heart']
    },
    createdAt: '2024-03-20T16:00:00Z',
    lastActive: '2025-08-25T20:10:00Z'
  },

  // Admin account
  admin1: {
    id: 'user-admin-001',
    email: 'admin@kingdomquest.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    ageTier: 'adult',
    permissions: [
      'content:create',
      'content:edit', 
      'content:delete',
      'content:approve',
      'user:view',
      'user:moderate',
      'analytics:view',
      'system:configure'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    lastActive: '2025-08-25T22:00:00Z'
  },

  // Moderator account
  moderator1: {
    id: 'user-mod-001',
    email: 'moderator@kingdomquest.com', 
    firstName: 'Content',
    lastName: 'Moderator',
    role: 'moderator',
    ageTier: 'adult',
    permissions: [
      'content:review',
      'content:moderate',
      'user:moderate',
      'reports:handle'
    ],
    specializations: ['theology', 'safety', 'age-appropriateness'],
    createdAt: '2024-02-01T10:00:00Z',
    lastActive: '2025-08-25T21:30:00Z'
  }
};

export const mockFamilies = {
  'family-001': {
    id: 'family-001',
    name: 'The Smith Family',
    primaryParent: 'user-parent-001',
    members: ['user-parent-001', 'user-child-001', 'user-child-002'],
    familyAltar: {
      currentPrayers: [
        {
          id: 'prayer-001',
          title: 'Prayer for Emma\'s First Day of School',
          content: 'Dear God, please help Emma feel brave and make new friends at school.',
          authorId: 'user-parent-001',
          sharedWith: ['family'],
          createdAt: '2025-08-20T07:00:00Z'
        }
      ],
      sharedVerses: [
        {
          reference: 'Philippians 4:13',
          translation: 'ESV',
          text: 'I can do all things through him who strengthens me.',
          sharedBy: 'user-child-002',
          createdAt: '2025-08-22T19:30:00Z'
        }
      ],
      familyGoals: ['Read one Bible story together each week', 'Pray together before meals']
    },
    settings: {
      allowChildSharing: true,
      moderationLevel: 'moderate',
      bibleTranslation: 'ESV'
    },
    createdAt: '2024-01-15T10:30:00Z'
  }
};

export const mockAgeTiers = {
  toddler: {
    ageRange: '2-4 years',
    contentComplexity: 'very-simple',
    maxStoryLength: 100, // words
    safetyLevel: 'maximum',
    allowedThemes: ['love', 'kindness', 'simple-obedience', 'God\'s-care'],
    restrictedThemes: ['violence', 'fear', 'complex-theology', 'death'],
    uiComplexity: 'minimal',
    maxQuizQuestions: 3
  },
  preschool: {
    ageRange: '4-6 years',
    contentComplexity: 'simple',
    maxStoryLength: 200,
    safetyLevel: 'high',
    allowedThemes: ['obedience', 'courage', 'friendship', 'God\'s-love', 'helping-others'],
    restrictedThemes: ['graphic-violence', 'complex-theology', 'mature-themes'],
    uiComplexity: 'basic',
    maxQuizQuestions: 5
  },
  elementary: {
    ageRange: '6-12 years',
    contentComplexity: 'moderate',
    maxStoryLength: 500,
    safetyLevel: 'moderate',
    allowedThemes: ['all-basic-themes', 'light-conflict', 'moral-choices', 'biblical-history'],
    restrictedThemes: ['graphic-content', 'very-complex-theology', 'romantic-themes'],
    uiComplexity: 'standard',
    maxQuizQuestions: 8
  },
  teen: {
    ageRange: '13-17 years',
    contentComplexity: 'complex',
    maxStoryLength: 1000,
    safetyLevel: 'light',
    allowedThemes: ['all-themes-with-guidance', 'identity', 'purpose', 'relationships', 'life-challenges'],
    restrictedThemes: ['explicit-content'],
    uiComplexity: 'advanced',
    maxQuizQuestions: 10
  },
  adult: {
    ageRange: '18+ years',
    contentComplexity: 'full',
    maxStoryLength: 'unlimited',
    safetyLevel: 'minimal',
    allowedThemes: ['all-biblical-themes'],
    restrictedThemes: [],
    uiComplexity: 'full',
    maxQuizQuestions: 'unlimited'
  }
};