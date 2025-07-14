export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  images?: string[];
  category_id?: string;
  created_at: string;
  updated_at: string;
  in_stock: boolean;
  stock_quantity: number;
  category?: Category;
  material?: string;
}

export interface Inquiry {
  id: string;
  product_id: string;
  customer_name: string;
  phone: string;
  created_at: string;
  product?: Product;
}

export interface PurchaseFormData {
  customer_name: string;
  phone: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
  category_id: string;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
}