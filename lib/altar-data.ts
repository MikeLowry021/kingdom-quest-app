// Scripture verses for blessing cards
export const blessingVerses = [
  {
    id: 'numbers-6-24-26',
    text: 'The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you; the LORD turn his face toward you and give you peace.',
    reference: 'Numbers 6:24-26',
    category: 'blessing'
  },
  {
    id: 'jeremiah-29-11',
    text: 'For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future.',
    reference: 'Jeremiah 29:11',
    category: 'future'
  },
  {
    id: 'philippians-4-13',
    text: 'I can do all this through him who gives me strength.',
    reference: 'Philippians 4:13',
    category: 'strength'
  },
  {
    id: 'psalm-23-1',
    text: 'The LORD is my shepherd, I lack nothing.',
    reference: 'Psalm 23:1',
    category: 'provision'
  },
  {
    id: 'isaiah-41-10',
    text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    reference: 'Isaiah 41:10',
    category: 'courage'
  },
  {
    id: 'matthew-5-16',
    text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.',
    reference: 'Matthew 5:16',
    category: 'inspiration'
  },
  {
    id: 'proverbs-3-5-6',
    text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    reference: 'Proverbs 3:5-6',
    category: 'guidance'
  },
  {
    id: 'psalm-91-11',
    text: 'For he will command his angels concerning you to guard you in all your ways.',
    reference: 'Psalm 91:11',
    category: 'protection'
  },
  {
    id: 'joshua-1-9',
    text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go.',
    reference: 'Joshua 1:9',
    category: 'courage'
  },
  {
    id: '1-john-4-19',
    text: 'We love because he first loved us.',
    reference: '1 John 4:19',
    category: 'love'
  },
  {
    id: 'romans-8-28',
    text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    reference: 'Romans 8:28',
    category: 'hope'
  },
  {
    id: 'psalm-139-14',
    text: 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.',
    reference: 'Psalm 139:14',
    category: 'identity'
  }
];

// Challenge templates for weekly family challenges
export const challengeTemplates = [
  {
    id: 'gratitude',
    title: 'Gratitude Challenge',
    description: 'Each family member shares one thing they are grateful for each day this week.',
    scriptureRef: 'Colossians 3:15',
    difficulty: 'easy'
  },
  {
    id: 'kindness',
    title: 'Secret Acts of Kindness',
    description: 'Perform one secret act of kindness for another family member each day.',
    scriptureRef: 'Ephesians 4:32',
    difficulty: 'medium'
  },
  {
    id: 'memorization',
    title: 'Scripture Memorization',
    description: 'Work together to memorize a verse as a family by the end of the week.',
    scriptureRef: 'Psalm 119:11',
    difficulty: 'medium'
  },
  {
    id: 'prayer-walk',
    title: 'Family Prayer Walk',
    description: 'Take a walk around your neighborhood and pray for your neighbors.',
    scriptureRef: '1 Timothy 2:1',
    difficulty: 'easy'
  },
  {
    id: 'worship',
    title: 'Family Worship Night',
    description: 'Set aside one evening for family worship with songs, prayer, and sharing.',
    scriptureRef: 'Psalm 95:1-2',
    difficulty: 'medium'
  },
  {
    id: 'blessing',
    title: 'Blessing Declarations',
    description: 'Parents speak a blessing over each child every morning this week.',
    scriptureRef: 'Numbers 6:24-26',
    difficulty: 'easy'
  },
  {
    id: 'service',
    title: 'Family Service Project',
    description: 'Plan and complete a service project together as a family.',
    scriptureRef: 'Galatians 5:13',
    difficulty: 'hard'
  },
  {
    id: 'tech-fast',
    title: 'Digital Sabbath',
    description: 'Choose one day to disconnect from screens and connect with God and each other.',
    scriptureRef: 'Exodus 20:8-10',
    difficulty: 'hard'
  }
];

// Badge definitions
export const badgeDefinitions = [
  {
    id: 'prayer-warrior',
    name: 'Prayer Warrior',
    description: 'Logged prayers for 7 consecutive days',
    scriptureRef: '1 Thessalonians 5:17',
    image: '/images/badges/prayer-warrior.png',
    requirement: { type: 'streak', days: 7 }
  },
  {
    id: 'intercessor',
    name: 'Intercessor',
    description: 'Prayed for others 10 times',
    scriptureRef: 'James 5:16',
    image: '/images/badges/intercessor.png',
    requirement: { type: 'count', category: 'intercession', count: 10 }
  },
  {
    id: 'scripture-devotion',
    name: 'Scripture Devotion',
    description: 'Included scripture in prayers 15 times',
    scriptureRef: 'Joshua 1:8',
    image: '/images/badges/scripture-devotion.png',
    requirement: { type: 'count', category: 'scripture', count: 15 }
  },
  {
    id: 'family-leadership',
    name: 'Family Leadership',
    description: 'Led family prayer time 5 times',
    scriptureRef: 'Joshua 24:15',
    image: '/images/badges/family-leadership.png',
    requirement: { type: 'count', category: 'family', count: 5 }
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Completed 3 family challenges',
    scriptureRef: 'Philippians 3:14',
    image: '/images/badges/challenge-champion.png',
    requirement: { type: 'challenges', count: 3 }
  },
  {
    id: 'consistency-crown',
    name: 'Consistency Crown',
    description: 'Maintained a 30-day prayer streak',
    scriptureRef: 'Colossians 4:2',
    image: '/images/badges/consistency-crown.png',
    requirement: { type: 'streak', days: 30 }
  },
  {
    id: 'blessing-bearer',
    name: 'Blessing Bearer',
    description: 'Created and shared 5 blessing cards',
    scriptureRef: 'Numbers 6:24-26',
    image: '/images/badges/blessing-bearer.png',
    requirement: { type: 'cards', count: 5 }
  },
  {
    id: 'gratitude-heart',
    name: 'Gratitude Heart',
    description: 'Logged 20 thanksgiving prayers',
    scriptureRef: 'Psalm 136:1',
    image: '/images/badges/gratitude-heart.png',
    requirement: { type: 'count', category: 'thanksgiving', count: 20 }
  }
];
