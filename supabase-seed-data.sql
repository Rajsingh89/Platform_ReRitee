-- ============================================
-- REKITEE SEED DATA
-- Run this in Supabase SQL Editor AFTER running the main schema
-- ============================================

-- First, insert sample tags
INSERT INTO public.tags (name) VALUES 
  ('AI'),
  ('Design'),
  ('Technology'),
  ('Cognitive Science'),
  ('UX'),
  ('Startups'),
  ('Product'),
  ('Philosophy'),
  ('Neuroscience'),
  ('Psychology')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- OPTION 1: Make author_id nullable (for demo posts without authors)
-- Run this to allow posts without authors
-- ============================================

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts ALTER COLUMN author_id DROP NOT NULL;

-- ============================================
-- Now insert sample posts (without author_id)
-- They will show up in your feed but without author info
-- ============================================

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'The Minimalist Second Brain: How to Build a High-Output Digital Brain with Just 2 Apps',
  'Your biological brain is a CEO, not a warehouse. Let''s act like it.',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "The Turing Test is no longer a sufficient measure of intelligence. We need to look deeper into the architecture of understanding."}, {"type": "paragraph", "content": "In an age where information overload is the norm, having a second brain isn''t just nice to have—it''s essential."}, {"type": "paragraph", "content": "Most productivity systems fail because they''re too complex. The best ones are disarmingly simple."}]'::jsonb,
  true,
  120,
  3,
  '8 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'Apple Just Fired the Designer Who Made iOS 26 Unreadable',
  'Now he''s going to Meta, and Apple employees are publicly celebrating.',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "Design trends come and go, but usability is forever."}, {"type": "paragraph", "content": "The best design is the design you don''t notice."}]'::jsonb,
  true,
  7900,
  287,
  '12 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'How To Prepare For The Coming Collapse of the Tech Industry',
  'Here''s what the end of technology''s reign will look like.',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "The tech industry has been on an unprecedented bull run. But all cycles come to an end."}]'::jsonb,
  true,
  2300,
  94,
  '6 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'Understanding Quantum Computing: A Practical Guide',
  'Breaking down the complex world of qubits and superposition.',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "Quantum computing promises to revolutionize everything from drug discovery to cryptography."}]'::jsonb,
  false,
  1850,
  67,
  '10 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'Decision Fatigue Is Real: How Your Brain Sabotages Your Best Thinking After Lunch',
  'Neuroscience explains why judges give harsher sentences before lunch.',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "Every decision you make depletes your mental energy."}, {"type": "paragraph", "content": "The solution isn''t to make fewer decisions—it''s to build systems that make decisions for you."}]'::jsonb,
  false,
  3400,
  156,
  '7 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'Your Attention Is Being Stolen: The Cognitive Science of Digital Distraction',
  'How tech companies exploit your brain''s reward circuits.',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "The attention economy is real, and it''s winning."}]'::jsonb,
  true,
  5200,
  203,
  '11 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'Why Every Design System Fails — And the 3 Principles That Make Them Last',
  'After auditing 40+ design systems at scale, here''s what actually separates the ones that thrive.',
  'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "Design systems are like gardens—they require constant tending."}]'::jsonb,
  false,
  4100,
  178,
  '9 min'
);

INSERT INTO public.posts (
  title,
  subtitle,
  cover_image,
  content,
  is_member_only,
  claps_count,
  comments_count,
  read_time
) VALUES (
  'Figma''s AI Just Made Junior Designers Obsolete. Or Did It?',
  'A deep product critique of Figma''s new AI features.',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1600&q=80',
  '[{"type": "paragraph", "content": "AI is a tool, not a replacement for human creativity."}]'::jsonb,
  true,
  6800,
  312,
  '14 min'
);

-- ============================================
-- SEED DATA COMPLETED!
-- ============================================

-- Posts are now in your database!
-- When users sign up, their posts will have proper author info.
-- ============================================