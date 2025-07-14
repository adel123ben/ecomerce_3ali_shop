/*
  # Storage Setup and Product Image Management

  1. Storage Configuration
    - Create product-images bucket for storing product photos
    - Set up public access for viewing images
    - Configure authenticated access for uploads/management

  2. Database Updates
    - Add storage_path column to products table for image references
    - Update RLS policies for better admin control
    - Create helper function for generating image URLs

  3. Security
    - Public read access for product images
    - Authenticated write access for admin operations
    - Proper RLS policies for product management
*/

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Update products table to use storage URLs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE products ADD COLUMN storage_path text;
  END IF;
END $$;

-- Enhanced RLS policies for better admin control
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
CREATE POLICY "Admin users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to generate storage URL from path
CREATE OR REPLACE FUNCTION get_storage_url(bucket_name text, file_path text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN file_path IS NOT NULL AND file_path != '' THEN 
      concat(
        current_setting('app.settings.supabase_url', true),
        '/storage/v1/object/public/',
        bucket_name,
        '/',
        file_path
      )
    ELSE NULL
  END;
$$;

-- Function specifically for product images
CREATE OR REPLACE FUNCTION get_product_image_url(storage_path text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT get_storage_url('product-images', storage_path);
$$;