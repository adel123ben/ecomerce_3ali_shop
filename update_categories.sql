-- Update categories to be more appropriate for a sportswear e-commerce
DELETE FROM categories;

INSERT INTO categories (name) VALUES 
  ('Men'),
  ('Women'),
  ('Kids'),
  ('Running'),
  ('Basketball'),
  ('Football'),
  ('Tennis'),
  ('Training'),
  ('Casual'),
  ('Sale')
ON CONFLICT (name) DO NOTHING; 