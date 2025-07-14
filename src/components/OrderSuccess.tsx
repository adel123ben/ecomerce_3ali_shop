import React from 'react';
import { CheckCircle } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <CheckCircle className="text-green-500 w-20 h-20 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Demande d'achat envoyée avec succès !</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Merci pour votre commande. Nous avons bien reçu votre demande d'achat et nous vous contacterons très bientôt pour finaliser la livraison.
      </p>
      <a href="/" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">Retour à l'accueil</a>
    </div>
  );
};

export default OrderSuccess; 