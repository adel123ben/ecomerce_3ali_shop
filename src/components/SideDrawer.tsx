'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  products?: any[]
}

export default function SideDrawer({ open, onClose, title = 'Shopping cart', products: allProducts = [] }: SideDrawerProps) {
  const { items, totalPrice, removeFromCart, updateQuantity, wishlist, removeFromWishlist, addToCart, clearWishlist } = useCartStore()
  const navigate = useNavigate()

  const isWishlist = title.toLowerCase().includes('wishlist')
  const products = isWishlist ? wishlist : items

  // Ajout sécurisé au panier depuis la wishlist
  const handleAddToCart = (product: any) => {
    // Cherche le vrai produit dans la liste complète
    const realProduct = allProducts.find((p) => p.id === product.id);
    const stock = realProduct?.stock_quantity ?? null;
    if (stock === null || stock === undefined) {
      toast.error('Stock inconnu pour ce produit');
      return;
    }
    // Cherche si le produit est déjà dans le panier
    const cartItem = items.find((item) => item.id === product.id);
    if (cartItem && cartItem.quantity >= stock) {
      toast.error('Quantité maximale atteinte pour ce produit');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: stock,
    });
    toast.success('Votre produit a été ajouté au panier');
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-[9999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 transition-opacity duration-300 ease-in-out data-[state=closed]:opacity-0 z-[9999]"
      />
      <div className="fixed inset-0 overflow-hidden z-[9999]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16 z-[9999]">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md h-full bg-white shadow-xl flex flex-col transform transition-transform duration-500 ease-in-out translate-x-0 data-[state=closed]:translate-x-full z-[9999]"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">{title}</DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative -m-2 p-2 text-gray-700 hover:text-black bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                      >
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Close panel</span>
                        <X className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="flow-root">
                      {products.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                          {isWishlist ? 'Your wishlist is empty' : 'Your cart is empty'}
                        </div>
                      ) : (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {products.map((product) => (
                            <li key={product.id} className="flex gap-3 py-4 sm:py-6 items-center">
                              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-md border border-gray-200 flex items-center justify-center bg-gray-50">
                                <img alt={product.name} src={product.image_url} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                  <h3 className="font-medium text-gray-900 text-base truncate max-w-[140px] sm:max-w-[180px]">{product.name}</h3>
                                  <p className="text-sm text-gray-700 font-semibold whitespace-nowrap">{product.price} DA</p>
                                </div>
                                <div className="flex items-center justify-between w-full mt-2 sm:mt-1">
                                  {isWishlist ? (
                                    <>
                                      <button
                                        onClick={() => handleAddToCart(product)}
                                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                                        title="Ajouter au panier"
                                      >
                                        Ajouter au panier
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="flex items-center justify-center bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200 transition-colors ml-auto"
                                        title="Supprimer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        {'quantity' in product && (
                                          <>
                                            <button
                                              onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                              className="px-2 py-1 text-gray-500 hover:text-black"
                                              disabled={product.quantity <= 1}
                                            >-</button>
                                            <span>{product.quantity}</span>
                                            <button
                                              onClick={() => {
                                                if (product.quantity < product.stock_quantity) {
                                                  updateQuantity(product.id, product.quantity + 1);
                                                } else {
                                                  toast.error('Stock maximum atteint pour ce produit');
                                                }
                                              }}
                                              className={`px-2 py-1 text-gray-500 hover:text-black ${product.quantity >= product.stock_quantity ? 'opacity-50 cursor-not-allowed' : ''}`}
                                              disabled={product.quantity >= product.stock_quantity}
                                            >+</button>
                                          </>
                                        )}
                                      </div>
                                      <button type="button" onClick={() => removeFromCart(product.id)} className="flex items-center justify-center bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200 transition-colors ml-auto" title="Supprimer">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  {isWishlist ? (
                    products.length > 0 && (
                      <button onClick={clearWishlist} className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors mb-2">Clear Wishlist</button>
                    )
                  ) : (
                    <>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>{totalPrice} DA</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            onClose();
                            navigate('/order');
                          }}
                          className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors"
                        >
                          Checkout
                        </button>
                      </div>
                    </>
                  )}
                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                      or{' '}
                      <button
                        type="button"
                        onClick={onClose}
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
