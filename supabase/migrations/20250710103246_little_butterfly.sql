/*
  # E-commerce Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (decimal)
      - `description` (text)
      - `image_url` (text)
      - `category_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `inquiries`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `customer_name` (text)
      - `phone` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to products and categories
    - Add policies for authenticated admin access to manage products
    - Add policies for public inquiry submissions
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  description text,
  image_url text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Public can view categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true);

-- Products policies
CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Inquiries policies
CREATE POLICY "Public can create inquiries"
  ON inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view inquiries"
  ON inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample categories
INSERT INTO categories (name) VALUES 
  ('Running'),
  ('Basketball'),
  ('Football'),
  ('Tennis'),
  ('Training'),
  ('Casual')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, description, image_url, category_id) 
SELECT 
  'Nike Air Max 90',
  129.99,
  'Classic running shoe with superior comfort and style',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM categories WHERE name = 'Running')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nike Air Max 90');

INSERT INTO products (name, price, description, image_url, category_id) 
SELECT 
  'Adidas Ultraboost 22',
  189.99,
  'Revolutionary running shoe with Boost technology',
  'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM categories WHERE name = 'Running')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Adidas Ultraboost 22');

INSERT INTO products (name, price, description, image_url, category_id) 
SELECT 
  'Jordan 1 Retro High',
  170.00,
  'Iconic basketball shoe with premium materials',
  'https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM categories WHERE name = 'Basketball')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Jordan 1 Retro High');

INSERT INTO products (name, price, description, image_url, category_id) 
SELECT 
  'Nike Dunk Low',
  110.00,
  'Classic basketball style meets street fashion',
  'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM categories WHERE name = 'Basketball')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nike Dunk Low');

INSERT INTO products (name, price, description, image_url, category_id) 
SELECT 
  'Adidas Stan Smith',
  85.00,
  'Timeless tennis shoe with clean design',
  'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM categories WHERE name = 'Tennis')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Adidas Stan Smith');

INSERT INTO products (name, price, description, image_url, category_id) 
SELECT 
  'Nike Air Force 1',
  90.00,
  'Classic basketball shoe perfect for everyday wear',
  'https://images.pexels.com/photos/2529146/pexels-photo-2529146.jpeg?auto=compress&cs=tinysrgb&w=800',
  (SELECT id FROM categories WHERE name = 'Casual')
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Nike Air Force 1');