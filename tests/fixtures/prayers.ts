/**
 * Mock prayer data for testing family altar functionality
 * and content moderation systems
 */

export const mockPrayers = {
  'prayer-001': {
    id: 'prayer-001',
    title: 'Prayer for School',
    content: 'Dear God, please help me be brave at school today and make new friends. Help me to be kind and share with others. Thank You for loving me. In Jesus\' name, Amen.',
    category: 'school',
    authorId: 'user-child-001',
    authorName: 'Emma',
    authorAge: 5,
    familyId: 'family-001',
    sharedWith: ['family'],
    approved: true,
    moderationStatus: 'approved',
    moderationNotes: 'Age-appropriate content, positive message',
    tags: ['courage', 'friendship', 'kindness', 'school'],
    createdAt: '2025-08-20T07:00:00Z',
    approvedAt: '2025-08-20T07:01:00Z'
  },

  'prayer-002': {
    id: 'prayer-002',
    title: 'Thank You for Family',
    content: 'Thank You, God, for my mom and dad and my little sister. Thank You for our house and food and toys. Help us to love each other and be happy together. Amen.',
    category: 'gratitude',
    authorId: 'user-child-002',
    authorName: 'Noah',
    authorAge: 8,
    familyId: 'family-001',
    sharedWith: ['family', 'friends'],
    approved: true,
    moderationStatus: 'approved',
    moderationNotes: 'Beautiful expression of gratitude, theologically sound',
    tags: ['gratitude', 'family', 'thanksgiving'],
    createdAt: '2025-08-18T19:30:00Z',
    approvedAt: '2025-08-18T19:32:00Z'
  },

  'prayer-003': {
    id: 'prayer-003',
    title: 'Help for Grandma',
    content: 'Dear Jesus, please help my grandma feel better. She is sick and we are worried about her. Please heal her and help the doctors know what to do. We love her so much. Amen.',
    category: 'healing',
    authorId: 'user-child-002',
    authorName: 'Noah',
    authorAge: 8,
    familyId: 'family-001',
    sharedWith: ['family'],
    approved: true,
    moderationStatus: 'approved',
    moderationNotes: 'Compassionate prayer request, age-appropriate handling of illness',
    tags: ['healing', 'family', 'compassion', 'intercession'],
    createdAt: '2025-08-15T16:45:00Z',
    approvedAt: '2025-08-15T16:47:00Z'
  },

  'prayer-004': {
    id: 'prayer-004', 
    title: 'My Pet', 
    content: 'God, my hamster died and I am very sad. I loved Fluffy so much. Will I see him in heaven? Please help me not be so sad.',
    category: 'grief',
    authorId: 'user-child-001',
    authorName: 'Emma',
    authorAge: 5,
    familyId: 'family-001',
    sharedWith: ['family'],
    approved: false,
    moderationStatus: 'pending_parent_review',
    moderationNotes: 'Sensitive topic of death and pet loss. Requires parent guidance for age-appropriate discussion.',
    moderationFlags: ['death_topic', 'requires_parent_guidance'],
    tags: ['grief', 'pets', 'death', 'heaven'],
    createdAt: '2025-08-22T14:20:00Z'
  },

  // Example of inappropriate content that should be flagged
  'prayer-005': {
    id: 'prayer-005',
    title: 'Mad at Teacher',
    content: 'God, I hate my teacher. She is mean and stupid. I wish something bad would happen to her.',
    category: 'anger',
    authorId: 'user-child-002',
    authorName: 'Noah', 
    authorAge: 8,
    familyId: 'family-001',
    sharedWith: ['family'],
    approved: false,
    moderationStatus: 'rejected',
    moderationNotes: 'Contains inappropriate language (hate, stupid) and harmful wishes. Requires guidance on healthy expression of frustration and forgiveness.',
    moderationFlags: ['inappropriate_language', 'harmful_wishes', 'needs_guidance'],
    tags: ['anger', 'school', 'conflict'],
    createdAt: '2025-08-23T15:30:00Z',
    rejectedAt: '2025-08-23T15:32:00Z',
    alternativeSuggestion: 'Try: "God, I\'m feeling frustrated with my teacher. Please help me understand her better and help us get along. Show me how to be respectful even when I\'m upset."'
  }
};

export const mockPrayerCategories = [
  'gratitude',
  'requests',
  'healing',
  'family',
  'friends',
  'school',
  'protection',
  'guidance',
  'forgiveness',
  'worship',
  'intercession',
  'confession',
  'praise',
  'comfort'
];

export const mockPrayerModerationRules = {
  // Automatic approval criteria
  autoApprove: {
    maxLength: 500,
    allowedTopics: ['gratitude', 'family', 'friends', 'school', 'protection', 'guidance'],
    requiredElements: [], // No required elements for auto-approval
    forbiddenWords: [], // Words that prevent auto-approval
    ageRestrictions: {
      toddler: {
        maxLength: 100,
        allowedTopics: ['gratitude', 'family', 'protection', 'simple-requests']
      },
      preschool: {
        maxLength: 200,
        allowedTopics: ['gratitude', 'family', 'friends', 'school', 'protection', 'guidance']
      }
    }
  },

  // Content that requires parent review
  parentReview: {
    triggers: [
      'death',
      'illness',
      'fear',
      'nightmares',
      'family_conflict',
      'bullying',
      'questions_about_faith'
    ],
    sensitiveTopics: [
      'divorce',
      'loss',
      'medical_issues',
      'emotional_distress',
      'theological_questions'
    ]
  },

  // Content that should be rejected
  automaticReject: {
    inappropriateLanguage: ['hate', 'stupid', 'dumb', 'kill', 'hurt'],
    harmfulWishes: ['wish bad things', 'hope something happens', 'want them to get hurt'],
    violentContent: ['fight', 'punch', 'hit', 'violence'],
    inappropriateRequests: ['money', 'material_gain_only', 'harmful_to_others']
  },

  // Moderation guidelines by age
  ageGuidelines: {
    toddler: {
      focus: 'simple gratitude and basic requests',
      avoid: 'complex theology, death, violence, fear',
      encourage: 'family love, thankfulness, simple needs'
    },
    preschool: {
      focus: 'gratitude, family, friends, basic moral concepts',
      avoid: 'complex theology, graphic content, adult concerns',
      encourage: 'kindness, sharing, obedience, God\'s love'
    },
    elementary: {
      focus: 'broader life concerns, moral development, biblical concepts',
      avoid: 'mature themes, complex theological debates',
      encourage: 'intercession, character development, biblical values'
    },
    teen: {
      focus: 'identity, purpose, relationships, life challenges',
      avoid: 'inappropriate content, harmful ideologies',
      encourage: 'deep spiritual growth, leadership, service'
    }
  }
};