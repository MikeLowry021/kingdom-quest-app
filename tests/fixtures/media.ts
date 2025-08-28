import type { Media } from '@/lib/supabase'

export const mockMedia: Media[] = [
  // Safe, family-friendly image
  {
    id: 'media-001',
    title: 'Jesus with Children',
    type: 'image',
    url: 'https://example.com/images/jesus-children.jpg',
    content_type: 'image/jpeg',
    filename: 'jesus-children.jpg',
    file_size: 245760, // 240KB
    duration: null,
    alt_text: 'Jesus sitting with children, blessing them with love and kindness',
    caption: 'Let the little children come to me - Matthew 19:14',
    attribution: 'KingdomQuest Illustration Team',
    tags: ['jesus', 'children', 'blessing', 'love'],
    created_at: '2025-08-01T10:00:00Z',
    updated_at: '2025-08-01T10:00:00Z'
  },
  
  // Audio content - appropriate
  {
    id: 'media-002',
    title: 'Psalm 23 Reading',
    type: 'audio',
    url: 'https://example.com/audio/psalm23.mp3',
    content_type: 'audio/mpeg',
    filename: 'psalm23.mp3',
    file_size: 1048576, // 1MB
    duration: 120, // 2 minutes
    alt_text: null,
    caption: 'The Lord is my shepherd - Psalm 23 (NIV)',
    attribution: 'Scripture Reading Ministry',
    tags: ['psalm', 'scripture', 'shepherd', 'comfort'],
    created_at: '2025-08-01T11:00:00Z',
    updated_at: '2025-08-01T11:00:00Z'
  },
  
  // Video content - appropriate
  {
    id: 'media-003',
    title: 'David and Goliath Animation',
    type: 'video',
    url: 'https://example.com/videos/david-goliath.mp4',
    content_type: 'video/mp4',
    filename: 'david-goliath.mp4',
    file_size: 52428800, // 50MB
    duration: 480, // 8 minutes
    alt_text: null,
    caption: 'Animated retelling of David\'s courage and faith',
    attribution: 'Bible Stories Animation Studio',
    tags: ['david', 'goliath', 'courage', 'faith', 'animation'],
    created_at: '2025-08-01T12:00:00Z',
    updated_at: '2025-08-01T12:00:00Z'
  },
  
  // Image with inappropriate alt text (for testing)
  {
    id: 'media-004',
    title: 'Battle Scene',
    type: 'image',
    url: 'https://example.com/images/battle-scene.jpg',
    content_type: 'image/jpeg',
    filename: 'battle-scene.jpg',
    file_size: 512000, // 500KB
    duration: null,
    alt_text: 'Violent battle with blood and death, soldiers killing enemies with swords',
    caption: 'Biblical warfare scene',
    attribution: 'Historical Art Collection',
    tags: ['battle', 'war', 'biblical', 'history'],
    created_at: '2025-08-01T13:00:00Z',
    updated_at: '2025-08-01T13:00:00Z'
  },
  
  // Audio with inappropriate content (for testing)
  {
    id: 'media-005',
    title: 'Inappropriate Audio',
    type: 'audio',
    url: 'https://example.com/audio/inappropriate.mp3',
    content_type: 'audio/mpeg',
    filename: 'inappropriate.mp3',
    file_size: 2097152, // 2MB
    duration: 180, // 3 minutes
    alt_text: null,
    caption: 'Audio with problematic content for testing safety validation',
    attribution: 'Test Content',
    tags: ['test', 'inappropriate'],
    created_at: '2025-08-01T14:00:00Z',
    updated_at: '2025-08-01T14:00:00Z'
  },
  
  // Document with complex theological content
  {
    id: 'media-006',
    title: 'Advanced Systematic Theology',
    type: 'document',
    url: 'https://example.com/docs/theology.pdf',
    content_type: 'application/pdf',
    filename: 'theology.pdf',
    file_size: 10485760, // 10MB
    duration: null,
    alt_text: null,
    caption: 'Comprehensive study on predestination, election, and soteriology',
    attribution: 'Seminary Publications',
    tags: ['theology', 'doctrine', 'systematic', 'advanced'],
    created_at: '2025-08-01T15:00:00Z',
    updated_at: '2025-08-01T15:00:00Z'
  },
  
  // Image with scary content for young children
  {
    id: 'media-007',
    title: 'Scary Biblical Scene',
    type: 'image',
    url: 'https://example.com/images/scary-scene.jpg',
    content_type: 'image/jpeg',
    filename: 'scary-scene.jpg',
    file_size: 384000, // 375KB
    duration: null,
    alt_text: 'Dark demons and evil spirits surrounding terrified people in a nightmare scene',
    caption: 'Spiritual warfare illustration',
    attribution: 'Biblical Art Studio',
    tags: ['spiritual', 'warfare', 'demons', 'evil'],
    created_at: '2025-08-01T16:00:00Z',
    updated_at: '2025-08-01T16:00:00Z'
  },
  
  // Appropriate worship music
  {
    id: 'media-008',
    title: 'Children\'s Worship Song',
    type: 'audio',
    url: 'https://example.com/audio/worship-song.mp3',
    content_type: 'audio/mpeg',
    filename: 'worship-song.mp3',
    file_size: 3145728, // 3MB
    duration: 210, // 3.5 minutes
    alt_text: null,
    caption: 'Jesus Loves Me - Classic children\'s worship song',
    attribution: 'KingdomQuest Music Ministry',
    tags: ['worship', 'song', 'children', 'music', 'jesus'],
    created_at: '2025-08-01T17:00:00Z',
    updated_at: '2025-08-01T17:00:00Z'
  }
]

// Audio transcripts for testing (simulating speech-to-text)
export const audioTranscripts: Record<string, string> = {
  'media-002': 'The Lord is my shepherd, I shall not want. He makes me lie down in green pastures, he leads me beside quiet waters.',
  'media-005': 'This audio contains inappropriate damn language and references to hell in non-biblical context.',
  'media-008': 'Jesus loves me this I know, for the Bible tells me so. Little ones to Him belong, they are weak but He is strong.'
}

// Categorized media for testing
export const safeMedia = [mockMedia[0], mockMedia[1], mockMedia[2], mockMedia[7]]
export const unsafeMedia = [mockMedia[3], mockMedia[4], mockMedia[6]]
export const complexMedia = [mockMedia[5]]
export const scaryMedia = [mockMedia[6]]