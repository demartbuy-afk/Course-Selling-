import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';
import { Button } from './ui/Button';
import { formatCurrency } from '../utils';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onRemove: (cartId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, items, onClose, onRemove, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">Your Cart ({items.length})</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-4">
              <ShoppingBag size={48} className="text-gray-300" />
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={onClose}>Browse Courses</Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex gap-4 bg-white p-2 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-20 h-20 object-cover rounded-md bg-gray-100"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                   <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.title}</h4>
                   <p className="text-xs text-gray-500">{item.instructor}</p>
                   <div className="flex justify-between items-center mt-2">
                     <span className="font-bold text-indigo-600">{formatCurrency(item.price)}</span>
                     <button 
                        onClick={() => onRemove(item.cartId)}
                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={onCheckout}>
              Checkout Now
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3">Secure Checkout via Stripe (Mock)</p>
          </div>
        )}
      </div>
    </>
  );
};