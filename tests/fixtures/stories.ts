/**
 * Mock story data for testing KingdomQuest story functionality
 * Includes age-tier variations and theological content validation
 */

export const mockStories = {
  'noah-ark': {
    id: 'noah-ark',
    title: 'Noah and the Ark',
    category: 'Old Testament',
    themes: ['obedience', 'faith', 'salvation', 'God\'s protection'],
    scripture: {
      primary: {
        book: 'Genesis',
        chapters: [6, 7, 8, 9],
        translation: 'ESV',
        verses: [
          {
            reference: 'Genesis 6:19',
            text: 'And of every living thing of all flesh, you shall bring two of every sort into the ark to keep them alive with you. They shall be male and female.'
          },
          {
            reference: 'Genesis 7:16',
            text: 'And those that entered, male and female of all flesh, went in as God had commanded him. And the LORD shut him in.'
          }
        ]
      }
    },
    ageTiers: {
      toddler: {
        title: 'Noah Builds a Big Boat',
        summary: 'God asked Noah to build a very big boat and put animals inside to keep them safe.',
        content: [
          'God talked to Noah.',
          'God said "Build a big boat."',
          'Noah built the boat.',
          'Animals came to the boat.',
          'God kept everyone safe.',
          'The boat landed on a mountain.',
          'Everyone was happy!'
        ],
        images: ['noah-boat-simple.jpg', 'animals-happy.jpg'],
        vocabulary: ['boat', 'animals', 'safe', 'God', 'happy'],
        quiz: [
          {
            question: 'Who built the big boat?',
            answers: ['Noah', 'Moses', 'David'],
            correct: 0,
            explanation: 'Noah listened to God and built the boat.'
          },
          {
            question: 'Why did Noah build the boat?',
            answers: ['To go fishing', 'God asked him to', 'He was bored'],
            correct: 1,
            explanation: 'Noah obeyed God and built the boat to keep everyone safe.'
          }
        ]
      },
      preschool: {
        title: 'Noah Obeys God',
        summary: 'God asked Noah to build an ark to save his family and the animals from a great flood.',
        content: [
          'God saw that people were not being good.',
          'But Noah loved God and tried to do what was right.',
          'God told Noah to build a very big ark.',
          'Noah obeyed God even though it seemed hard.',
          'God told Noah to bring animals onto the ark.',
          'It rained for many days and nights.',
          'God kept Noah, his family, and all the animals safe.',
          'When the rain stopped, they praised God!'
        ],
        images: ['noah-building-ark.jpg', 'animals-entering-ark.jpg', 'rainbow-covenant.jpg'],
        vocabulary: ['obey', 'ark', 'flood', 'covenant', 'rainbow', 'praise'],
        moralLesson: 'When we obey God, He takes care of us.',
        quiz: [
          {
            question: 'What did God ask Noah to build?',
            answers: ['A house', 'An ark', 'A tower'],
            correct: 1,
            explanation: 'God asked Noah to build an ark to save his family and the animals.'
          },
          {
            question: 'Why was Noah chosen by God?',
            answers: ['He was the strongest', 'He loved and obeyed God', 'He was the smartest'],
            correct: 1,
            explanation: 'Noah was chosen because he loved God and tried to do what was right.'
          }
        ]
      },
      elementary: {
        title: 'Noah and the Great Flood',
        summary: 'God chose Noah to build an ark and preserve life during the worldwide flood because of his righteousness.',
        content: [
          'In the days of Noah, the earth was filled with violence and wickedness.',
          'But Noah was a righteous man who walked with God.',
          'God decided to cleanse the earth with a great flood.',
          'God commanded Noah to build an ark of gopher wood.',
          'The ark was to be 300 cubits long, 50 cubits wide, and 30 cubits high.',
          'God told Noah to bring two of every kind of animal, and seven pairs of clean animals.',
          'Noah\'s family entered the ark: Noah, his wife, his three sons, and their wives.',
          'God Himself shut them in the ark.',
          'It rained for forty days and forty nights.',
          'All life on earth was destroyed except those in the ark.',
          'After 150 days, the waters began to recede.',
          'Noah sent out a raven and then a dove to test for dry land.',
          'When the dove returned with an olive leaf, Noah knew the waters had receded.',
          'God commanded them to leave the ark and replenish the earth.',
          'Noah built an altar and offered sacrifices to God.',
          'God made a covenant with Noah, promising never to destroy the earth by flood again.',
          'The rainbow became the sign of this covenant.'
        ],
        images: ['noah-righteous.jpg', 'ark-construction.jpg', 'animals-boarding.jpg', 'great-flood.jpg', 'dove-olive-branch.jpg', 'noah-altar.jpg', 'rainbow-covenant.jpg'],
        vocabulary: ['righteous', 'covenant', 'cleanse', 'cubits', 'recede', 'sacrifice', 'replenish'],
        theologyPoints: [
          'God is holy and just, and sin must be judged.',
          'God is merciful and provides salvation for the righteous.',
          'God keeps His promises (covenant faithfulness).',
          'Obedience to God brings blessing and protection.'
        ],
        quiz: [
          {
            question: 'Why did God choose Noah?',
            answers: ['He was wealthy', 'He was righteous and walked with God', 'He was a skilled builder'],
            correct: 1,
            explanation: 'Noah was chosen because he was righteous and had a relationship with God.'
          },
          {
            question: 'What was the sign of God\'s covenant with Noah?',
            answers: ['A dove', 'The rainbow', 'An olive branch'],
            correct: 1,
            explanation: 'God set the rainbow in the sky as a sign of His covenant never to destroy the earth by flood again.'
          }
        ]
      }
    },
    safetyRating: {
      violence: 'minimal', // flood destruction mentioned but not graphic
      fearContent: 'low', // some discussion of judgment but balanced with salvation
      complexThemes: 'medium' // covenant, judgment, salvation
    },
    educationalObjectives: [
      'Understanding God\'s holiness and justice',
      'Learning about obedience and faith',
      'Recognizing God\'s mercy and covenant faithfulness',
      'Appreciating God\'s protection of the righteous'
    ]
  },

  'david-goliath': {
    id: 'david-goliath',
    title: 'David and Goliath',
    category: 'Old Testament',
    themes: ['courage', 'faith', 'God\'s power', 'trusting God'],
    scripture: {
      primary: {
        book: '1 Samuel',
        chapters: [17],
        translation: 'ESV',
        verses: [
          {
            reference: '1 Samuel 17:45',
            text: 'Then David said to the Philistine, "You come to me with a sword and with a spear and with a javelin, but I come to you in the name of the LORD of hosts, the God of the armies of Israel, whom you have defied."'
          }
        ]
      }
    },
    ageTiers: {
      toddler: {
        title: 'David the Brave Boy',
        summary: 'Young David trusted God and was very brave when facing a big, mean man.',
        content: [
          'David was a young boy who loved God.',
          'There was a very big, mean man named Goliath.',
          'Goliath was being mean to God\'s people.',
          'David said, "God will help me!"',
          'David had five smooth stones.',
          'David threw one stone and God helped him.',
          'The big mean man fell down.',
          'Everyone cheered for David!',
          'God helps brave children who trust Him.'
        ],
        images: ['young-david-sheep.jpg', 'david-five-stones.jpg', 'david-victory.jpg'],
        vocabulary: ['brave', 'trust', 'help', 'stone', 'God'],
        safetyNote: 'Violence minimized, focus on God\'s help and bravery',
        quiz: [
          {
            question: 'Who helped David be brave?',
            answers: ['His mom', 'God', 'His friends'],
            correct: 1,
            explanation: 'God helped David be brave and strong.'
          }
        ]
      },
      preschool: {
        title: 'David Trusts in God',
        summary: 'David, a shepherd boy, defeated the giant Goliath because he trusted in God\'s power.',
        content: [
          'David was a shepherd who took care of sheep.',
          'He loved God and praised Him every day.',
          'A giant named Goliath was scaring God\'s army.',
          'All the soldiers were afraid of Goliath.',
          'But David was not afraid because he trusted God.',
          'David picked up five smooth stones from the stream.',
          'He put one stone in his sling.',
          'David said, "I come in the name of the Lord!"',
          'God helped David\'s stone hit Goliath.',
          'Goliath fell down and could not hurt anyone anymore.',
          'Everyone praised God for helping David!'
        ],
        images: ['david-shepherd.jpg', 'goliath-intimidating.jpg', 'david-sling.jpg', 'victory-celebration.jpg'],
        vocabulary: ['shepherd', 'giant', 'trust', 'sling', 'praise', 'victory'],
        moralLesson: 'When we trust in God, He helps us do amazing things.',
        safetyNote: 'Conflict resolved quickly, emphasis on God\'s power rather than violence'
      }
    },
    safetyRating: {
      violence: 'moderate', // battle context but age-appropriate presentation
      fearContent: 'low', // giant may be scary but overcome by faith
      complexThemes: 'low' // straightforward faith and courage theme
    }
  }
};

export const mockStoryCategories = [
  'Old Testament',
  'New Testament', 
  'Parables',
  'Creation',
  'Prophets',
  'Kings and Queens',
  'Miracles',
  'Christmas',
  'Easter'
];

export const mockStoryThemes = [
  'faith',
  'obedience', 
  'courage',
  'love',
  'forgiveness',
  'wisdom',
  'patience',
  'kindness',
  'honesty',
  'gratitude',
  'God\'s protection',
  'God\'s love',
  'prayer',
  'salvation'
];