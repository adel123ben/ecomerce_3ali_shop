/*
  # Add Stock Management Fields

  1. Schema Updates
    - Add `in_stock` boolean field to products table
    - Add `stock_quantity` integer field to products table
    - Set default values for existing products
    - Update RLS policies to include new fields

  2. Data Migration
    - Set default stock quantities for existing products
    - Mark all existing products as in stock by default
*/

-- Add stock management fields to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'in_stock'
  ) THEN
    ALTER TABLE products ADD COLUMN in_stock boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 50;
  END IF;
END $$;

-- Update existing products with default stock values
UPDATE products 
SET 
  in_stock = true,
  stock_quantity = CASE 
    WHEN stock_quantity IS NULL THEN 50
    ELSE stock_quantity
  END
WHERE in_stock IS NULL OR stock_quantity IS NULL;

-- Add constraints
ALTER TABLE products 
  ALTER COLUMN in_stock SET NOT NULL,
  ALTER COLUMN stock_quantity SET NOT NULL,
  ADD CONSTRAINT stock_quantity_positive CHECK (stock_quantity >= 0);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "Admin users can manage products" ON products;
CREATE POLICY "Admin users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);