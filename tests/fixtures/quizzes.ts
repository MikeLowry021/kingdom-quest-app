/**
 * Mock quiz data for testing age-appropriate question generation
 * and theological accuracy validation
 */

export const mockQuizzes = {
  'noah-ark-toddler': {
    storyId: 'noah-ark',
    ageTier: 'toddler',
    questions: [
      {
        id: 'noah-1-toddler',
        type: 'multiple-choice',
        question: 'Who built the big boat?',
        answers: [
          { text: 'Noah', correct: true },
          { text: 'Moses', correct: false },
          { text: 'David', correct: false }
        ],
        explanation: 'Noah listened to God and built the boat.',
        scriptureReference: null, // Simplified for toddlers
        difficulty: 'easy',
        imageHint: 'noah-building.jpg'
      },
      {
        id: 'noah-2-toddler', 
        type: 'true-false',
        question: 'God asked Noah to build the boat.',
        answer: true,
        explanation: 'Yes! God told Noah to build the ark.',
        difficulty: 'easy'
      }
    ],
    passingScore: 1, // Very lenient for toddlers
    maxAttempts: 5,
    timeLimit: null // No time pressure for toddlers
  },

  'noah-ark-elementary': {
    storyId: 'noah-ark',
    ageTier: 'elementary',
    questions: [
      {
        id: 'noah-1-elem',
        type: 'multiple-choice',
        question: 'Why did God choose Noah to build the ark?',
        answers: [
          { text: 'Noah was the strongest man on earth', correct: false },
          { text: 'Noah was righteous and walked with God', correct: true },
          { text: 'Noah was the best builder', correct: false },
          { text: 'Noah had the most money', correct: false }
        ],
        explanation: 'God chose Noah because he was righteous and had a close relationship with God.',
        scriptureReference: {
          book: 'Genesis',
          chapter: 6,
          verse: 9,
          translation: 'ESV',
          text: 'Noah was a righteous man, blameless in his generation. Noah walked with God.'
        },
        difficulty: 'medium',
        theologyFocus: 'righteousness'
      },
      {
        id: 'noah-2-elem',
        type: 'fill-in-blank',
        question: 'It rained for _______ days and _______ nights.',
        blanks: ['forty', 'forty'],
        explanation: 'The Bible tells us it rained for forty days and forty nights.',
        scriptureReference: {
          book: 'Genesis',
          chapter: 7,
          verse: 12,
          translation: 'ESV'
        },
        difficulty: 'easy'
      },
      {
        id: 'noah-3-elem',
        type: 'multiple-choice',
        question: 'What was the sign of God\'s covenant with Noah?',
        answers: [
          { text: 'A dove with an olive branch', correct: false },
          { text: 'The rainbow', correct: true },
          { text: 'The ark on the mountain', correct: false },
          { text: 'Noah\'s altar', correct: false }
        ],
        explanation: 'God set the rainbow in the clouds as the sign of His covenant promise.',
        scriptureReference: {
          book: 'Genesis',
          chapter: 9,
          verse: 13,
          translation: 'ESV',
          text: 'I have set my bow in the cloud, and it shall be a sign of the covenant between me and the earth.'
        },
        difficulty: 'medium',
        theologyFocus: 'covenant'
      }
    ],
    passingScore: 2,
    maxAttempts: 3,
    timeLimit: 300 // 5 minutes
  },

  'david-goliath-preschool': {
    storyId: 'david-goliath', 
    ageTier: 'preschool',
    questions: [
      {
        id: 'david-1-preschool',
        type: 'multiple-choice',
        question: 'What was David\'s job before he fought Goliath?',
        answers: [
          { text: 'He was a soldier', correct: false },
          { text: 'He was a shepherd', correct: true },
          { text: 'He was a king', correct: false }
        ],
        explanation: 'David was a shepherd boy who took care of sheep.',
        difficulty: 'easy',
        imageHint: 'david-with-sheep.jpg'
      },
      {
        id: 'david-2-preschool',
        type: 'multiple-choice', 
        question: 'How many stones did David pick up?',
        answers: [
          { text: 'Three stones', correct: false },
          { text: 'Five stones', correct: true },
          { text: 'Ten stones', correct: false }
        ],
        explanation: 'David picked up five smooth stones from the stream.',
        difficulty: 'easy'
      },
      {
        id: 'david-3-preschool',
        type: 'true-false',
        question: 'David was afraid of Goliath.',
        answer: false,
        explanation: 'David was not afraid because he trusted in God to help him.',
        difficulty: 'medium'
      }
    ],
    passingScore: 2,
    maxAttempts: 4,
    timeLimit: null
  }
};

export const mockQuizQuestionTypes = [
  'multiple-choice',
  'true-false', 
  'fill-in-blank',
  'matching',
  'ordering',
  'drag-and-drop'
];

export const mockDifficultyLevels = [
  'very-easy',
  'easy',
  'medium', 
  'hard',
  'very-hard'
];

export const mockTheologyFocusAreas = [
  'salvation',
  'faith',
  'obedience',
  'God\'s character',
  'covenant',
  'righteousness',
  'forgiveness',
  'love',
  'justice',
  'mercy',
  'prayer',
  'worship',
  'discipleship'
];

// Age-appropriate passing score guidelines
export const ageTierQuizSettings = {
  toddler: {
    maxQuestions: 3,
    passingScorePercent: 33, // Very lenient
    maxAttempts: 10,
    timeLimit: null,
    allowedQuestionTypes: ['multiple-choice', 'true-false'],
    maxAnswerOptions: 3
  },
  preschool: {
    maxQuestions: 5,
    passingScorePercent: 60,
    maxAttempts: 5,
    timeLimit: null,
    allowedQuestionTypes: ['multiple-choice', 'true-false', 'matching'],
    maxAnswerOptions: 4
  },
  elementary: {
    maxQuestions: 8,
    passingScorePercent: 70,
    maxAttempts: 3,
    timeLimit: 300, // 5 minutes
    allowedQuestionTypes: ['multiple-choice', 'true-false', 'fill-in-blank', 'matching'],
    maxAnswerOptions: 5
  },
  teen: {
    maxQuestions: 10,
    passingScorePercent: 80,
    maxAttempts: 2,
    timeLimit: 480, // 8 minutes
    allowedQuestionTypes: ['multiple-choice', 'true-false', 'fill-in-blank', 'matching', 'ordering', 'essay'],
    maxAnswerOptions: 6
  },
  adult: {
    maxQuestions: 12,
    passingScorePercent: 85,
    maxAttempts: 2,
    timeLimit: 600, // 10 minutes
    allowedQuestionTypes: ['multiple-choice', 'true-false', 'fill-in-blank', 'matching', 'ordering', 'essay'],
    maxAnswerOptions: 8
  }
};