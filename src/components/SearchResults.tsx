import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { ProductGrid } from './ProductGrid';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchResults({ products }: { products: Product[] }) {
  const query = useQuery();
  const navigate = useNavigate();
  const search = query.get('q') || '';

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-6">Résultats pour : <span className="text-orange-600">{search}</span></h1>
      {filtered.length > 0 ? (
        <ProductGrid products={filtered} loading={false} onProductClick={(p) => navigate(`/product/${p.id}`)} />
      ) : (
        <div className="text-center text-gray-500 text-lg py-16">Product not found</div>
      )}
    </main>
  );
}
