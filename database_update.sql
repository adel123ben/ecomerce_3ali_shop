-- Add images field to products table for multiple images support
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Update existing products to have their image_url in the images array
UPDATE products 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE images IS NULL OR images = '[]'::jsonb; 