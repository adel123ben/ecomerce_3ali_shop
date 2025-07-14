-- Complete database setup for SportShop e-commerce
-- Run this script in your Supabase SQL editor

-- 1. Update categories
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

-- 2. Add images field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Update existing products to have their image_url in the images array
UPDATE products 
SET images = CASE 
  WHEN image_url IS NOT NULL AND image_url != '' 
  THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE images IS NULL OR images = '[]'::jsonb;

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_address text,
  notes text,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Enable RLS on new tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 6. Orders policies
CREATE POLICY "Public can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- 7. Order items policies
CREATE POLICY "Public can create order items"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 9. Insert sample products with multiple images
INSERT INTO products (name, price, description, image_url, images, category_id, in_stock, stock_quantity) 
SELECT 
  'Nike Air Max 270',
  150.00,
  'Comfortable running shoes with Air Max technology',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
  jsonb_build_array(
    'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800'
  ),
  (SELECT id FROM categories WHERE name = 'Men'),
  true,
  25
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nike Air Max 270');

INSERT INTO products (name, price, description, image_url, images, category_id, in_stock, stock_quantity) 
SELECT 
  'Adidas Ultraboost 22',
  180.00,
  'Revolutionary running shoe with Boost technology',
  'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
  jsonb_build_array(
    'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800'
  ),
  (SELECT id FROM categories WHERE name = 'Women'),
  true,
  15
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Adidas Ultraboost 22');

-- Success message
SELECT 'Database setup completed successfully!' as status; 