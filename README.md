# SportShop - Modern E-commerce Platform

A modern, production-ready e-commerce platform built with React, TypeScript, Tailwind CSS, and Supabase. Features a customer-facing storefront and a comprehensive admin dashboard.

## Features

### Customer Features
- **Responsive Product Gallery**: Mobile-first design with smooth animations
- **Advanced Filtering**: Search and filter products by category
- **Product Detail Modal**: High-resolution images and detailed product information
- **Purchase Inquiry System**: Simple form with WhatsApp integration
- **Real-time Updates**: Products update instantly when modified by admin

### Admin Features
- **Secure Authentication**: Email/password authentication with Supabase Auth
- **Product Management**: Full CRUD operations for products
- **Category Management**: Organize products by categories
- **Inquiry Management**: View and respond to customer inquiries
- **Analytics Dashboard**: Track popular products and inquiry trends
- **Image Management**: Easy image URL management

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Form Validation**: Comprehensive validation with Zod and React Hook Form
- **Real-time Database**: Powered by Supabase PostgreSQL
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Performance Optimized**: Lazy loading and optimized images

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sportshop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Copy `.env.example` to `.env` and add your Supabase credentials

4. **Set up the database**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and run the migration from `supabase/migrations/create_initial_schema.sql`
   - This will create all tables, security policies, and sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

### Customer Interface
- Visit the homepage to browse products
- Use the search bar or category filters to find specific items
- Click on any product to view details and submit an inquiry
- Fill out the purchase form to generate a WhatsApp message

### Admin Interface
- Visit `/admin` to access the admin dashboard
- Sign up for an admin account or sign in with existing credentials
- Manage products, view inquiries, and analyze store performance

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── Header.tsx       # Main navigation
│   ├── ProductGrid.tsx  # Product display grid
│   ├── ProductCard.tsx  # Individual product cards
│   ├── ProductModal.tsx # Product detail modal
│   └── AdminLogin.tsx   # Admin authentication
├── hooks/
│   └── useAuth.ts      # Authentication hook
├── lib/
│   └── supabase.ts     # Supabase client configuration
├── types/
│   └── index.ts        # TypeScript type definitions
└── App.tsx             # Main application component
```

## Database Schema

### Tables
- **categories**: Product categories (Running, Basketball, etc.)
- **products**: Product information with category relationships
- **inquiries**: Customer purchase inquiries with product relationships

### Security
- Row Level Security (RLS) enabled on all tables
- Public read access for products and categories
- Authenticated access for admin operations
- Public insert access for customer inquiries

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Make sure to set these in your production environment:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Customization

### Adding New Product Categories
1. Insert new categories in the Supabase dashboard
2. Categories will automatically appear in the navigation

### Modifying WhatsApp Integration
Update the `whatsappNumber` variable in `ProductModal.tsx` with your business WhatsApp number.

### Styling
The application uses Tailwind CSS. Modify the design by updating the className attributes throughout the components.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.