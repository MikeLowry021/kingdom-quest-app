-- Migration: populate_altar_data
-- Created at: 1756149933

-- Populate altar_badges table with scripture-based badge definitions
INSERT INTO altar_badges (name, description, scripture_reference, category, tier, requirement_type, requirement_value, icon_path)
VALUES
  -- Prayer badges
  ('Faithful Steward', 'Logged your first prayer', 'Luke 16:10', 'prayer', 1, 'prayer_count', 1, '/images/badges/faithful-steward-1.svg'),
  ('Faithful Steward', 'Logged 10 prayers', 'Luke 16:10', 'prayer', 2, 'prayer_count', 10, '/images/badges/faithful-steward-2.svg'),
  ('Faithful Steward', 'Logged 50 prayers', 'Luke 16:10', 'prayer', 3, 'prayer_count', 50, '/images/badges/faithful-steward-3.svg'),
  
  ('Prayer Warrior', 'Logged a prayer for 3 consecutive days', 'Ephesians 6:18', 'streak', 1, 'streak_length', 3, '/images/badges/prayer-warrior-1.svg'),
  ('Prayer Warrior', 'Logged a prayer for 7 consecutive days', 'Ephesians 6:18', 'streak', 2, 'streak_length', 7, '/images/badges/prayer-warrior-2.svg'),
  ('Prayer Warrior', 'Logged a prayer for 30 consecutive days', 'Ephesians 6:18', 'streak', 3, 'streak_length', 30, '/images/badges/prayer-warrior-3.svg'),
  
  ('Persistent Widow', 'Recorded first answered prayer', 'Luke 18:1-8', 'prayer', 1, 'answered_prayers', 1, '/images/badges/persistent-widow-1.svg'),
  ('Persistent Widow', 'Recorded 5 answered prayers', 'Luke 18:1-8', 'prayer', 2, 'answered_prayers', 5, '/images/badges/persistent-widow-2.svg'),
  ('Persistent Widow', 'Recorded 20 answered prayers', 'Luke 18:1-8', 'prayer', 3, 'answered_prayers', 20, '/images/badges/persistent-widow-3.svg'),
  
  -- Intention badges
  ('Good Soil', 'Created your first intention', 'Mark 4:8', 'prayer', 1, 'intention_completed', 1, '/images/badges/good-soil-1.svg'),
  ('Good Soil', 'Completed 3 intentions', 'Mark 4:8', 'prayer', 2, 'intention_completed', 3, '/images/badges/good-soil-2.svg'),
  ('Good Soil', 'Completed 10 intentions', 'Mark 4:8', 'prayer', 3, 'intention_completed', 10, '/images/badges/good-soil-3.svg'),
  
  -- Challenge badges
  ('Salt of the Earth', 'Completed your first family challenge', 'Matthew 5:13', 'community', 1, 'challenge_completed', 1, '/images/badges/salt-earth-1.svg'),
  ('Salt of the Earth', 'Completed 3 family challenges', 'Matthew 5:13', 'community', 2, 'challenge_completed', 3, '/images/badges/salt-earth-2.svg'),
  ('Salt of the Earth', 'Completed 10 family challenges', 'Matthew 5:13', 'community', 3, 'challenge_completed', 10, '/images/badges/salt-earth-3.svg');

-- Populate family_challenges table with sample challenges
INSERT INTO family_challenges (title, description, category, difficulty, duration_days, scripture_reference, instructions)
VALUES
  ('Gratitude Journal', 'Start a family gratitude journal where each family member writes one thing they''re thankful for each day.', 'prayer', 'beginner', 7, 'Psalm 107:1', 'Each family member should write one thing they''re thankful for in the journal daily. Take turns reading entries aloud during family meals.'),
  
  ('Acts of Kindness', 'Complete one act of kindness each day as a family, reflecting Christ''s love to others.', 'service', 'beginner', 7, 'Ephesians 4:32', 'Brainstorm acts of kindness together. Ideas include: writing notes of encouragement, making a meal for someone, cleaning up a neighbor''s yard, etc.'),
  
  ('Scripture Memory', 'Memorize a Bible verse together as a family each day for a week.', 'learning', 'intermediate', 7, 'Psalm 119:11', 'Choose verses that are meaningful to your family. Practice them at breakfast, dinner, and bedtime. Create hand motions to help remember the words.'),
  
  ('Family Worship', 'Set aside time each day for family worship through song, Scripture, and prayer.', 'worship', 'beginner', 7, 'Psalm 95:1-2', 'Choose simple worship songs that everyone can participate in. Take turns leading different parts of your worship time. Include all ages appropriately.'),
  
  ('Serving Your Community', 'Identify a need in your community and plan a service project to address it.', 'service', 'advanced', 14, 'Matthew 25:35-40', 'Discuss community needs as a family. Research local organizations that serve those needs. Plan and execute a service project together.'),
  
  ('Digital Sabbath', 'Take a break from screens and technology for one day each week.', 'worship', 'intermediate', 28, 'Genesis 2:2-3', 'Plan alternative activities like board games, outdoor adventures, reading, crafts, etc. Prepare everyone in advance for the technology-free day.');

-- Populate blessing_card_templates table
INSERT INTO blessing_card_templates (name, description, category, background_image, default_font, default_color, layout_type)
VALUES
  ('Simple Elegance', 'A clean, elegant design with centered text', 'general', '/images/cards/simple-elegance-bg.jpg', 'serif', '#333333', 'centered'),
  
  ('Sunrise Hope', 'Warm sunrise background symbolizing new beginnings', 'encouragement', '/images/cards/sunrise-hope-bg.jpg', 'serif', '#ffffff', 'bottom'),
  
  ('Golden Celebration', 'Festive golden background for celebrations', 'celebration', '/images/cards/golden-celebration-bg.jpg', 'serif', '#ffffff', 'centered'),
  
  ('Gentle Comfort', 'Soft, comforting design for sympathy messages', 'sympathy', '/images/cards/gentle-comfort-bg.jpg', 'serif', '#333333', 'top'),
  
  ('Thankful Heart', 'Expressive design for messages of gratitude', 'gratitude', '/images/cards/thankful-heart-bg.jpg', 'serif', '#333333', 'split'),
  
  ('Scripture Focus', 'Clean design emphasizing Scripture text', 'general', '/images/cards/scripture-focus-bg.jpg', 'serif', '#333333', 'centered');;