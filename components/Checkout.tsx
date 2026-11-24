import React, { useState, useEffect } from 'react';
import { CartItem, Transaction, Coupon, MerchantSettings } from '../types';
import { formatCurrency } from '../utils';
import { Button } from './ui/Button';
import {
  Loader2,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Tag,
  ArrowLeft,
  Lock,
  Check,
} from 'lucide-react';
import { fetchMerchantSettings, saveTransactionToDb } from '../services/firebase';

interface CheckoutProps {
  items: CartItem[];
  onComplete: (transactions: Transaction[]) => void | Promise<void>;
  onCancel: () => void;
}

type CheckoutStep = 'details' | 'payment' | 'verification' | 'success';

interface LeadRecord {
  id: string;
  firebaseKey?: string;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const Checkout: React.FC<CheckoutProps> = ({ items, onComplete, onCancel }) => {
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);

  // Abandoned-checkout lead tracking:
  // Saves a lightweight "abandoned" record per item when details are submitted,
  // then reuses its firebaseKey when creating the final transaction.
  const [leadRecords, setLeadRecords] = useState<LeadRecord[]>([]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Calculate Final Price
  let totalDiscount = 0;
  if (appliedCoupon) {
    items.forEach((item) => {
      const validCoupon = item.coupons?.find(
        (c) => c.code.toUpperCase() === appliedCoupon.code.toUpperCase()
      );
      if (validCoupon) {
        if (validCoupon.type === 'percent') {
          totalDiscount += (item.price * validCoupon.value) / 100;
        } else {
          totalDiscount += validCoupon.value;
        }
      }
    });
  }

  const finalTotal = Math.max(1, originalTotal - totalDiscount);

  // Checkout & Form States
  const [step, setStep] = useState<CheckoutStep>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [merchantSettings, setMerchantSettings] = useState<MerchantSettings | null>(null);

  useEffect(() => {
    fetchMerchantSettings()
      .then(setMerchantSettings)
      .catch((err) => console.error('Failed to load merchant settings:', err));
  }, []);

  const orderRef = React.useMemo(() => `ORD${Date.now().toString().slice(-8)}`, []);

  // --- Handlers ---

  const handleApplyCoupon = () => {
    const trimmed = couponCode.trim();
    if (!trimmed) return;

    setIsCheckingCoupon(true);
    setCouponError('');

    let foundCoupon: Coupon | undefined;
    for (const item of items) {
      if (item.coupons && item.coupons.length > 0) {
        const match = item.coupons.find(
          (c) => c.code.toUpperCase() === trimmed.toUpperCase()
        );
        if (match) {
          foundCoupon = match;
          break;
        }
      }
    }

    if (foundCoupon) {
      setAppliedCoupon(foundCoupon);
      setCouponError('');
    } else {
      setCouponError('Invalid code for these courses.');
      setAppliedCoupon(null);
    }

    setIsCheckingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const createTransactions = (
    status: 'success' | 'failed' | 'pending',
    txnId: string
  ): Transaction[] => {
    return items.map((item, idx) => ({
      id: leadRecords[idx]?.id || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      firebaseKey: leadRecords[idx]?.firebaseKey,
      transactionId: txnId,
      courseId: item.id,
      courseTitle: item.title,
      amount: finalTotal,
      originalAmount: originalTotal,
      couponCode: appliedCoupon?.code,
      date: new Date().toISOString(),
      customerName: formData.name.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      status,
      approvalStatus:
        status === 'pending' ? 'pending' : status === 'success' ? 'approved' : 'rejected',
    }));
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');
    setStep('payment');

    const leads: Transaction[] = items.map((item) => ({
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      courseId: item.id,
      courseTitle: item.title,
      amount: finalTotal,
      originalAmount: originalTotal,
      couponCode: appliedCoupon?.code,
      date: new Date().toISOString(),
      customerName: formData.name.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      status: 'abandoned',
      checkoutStage: 'DETAILS_SUBMITTED',
    }));

    // Set initial IDs immediately, then attach firebaseKeys once saved
    setLeadRecords(leads.map((l) => ({ id: l.id })));

    Promise.all(leads.map((l) => saveTransactionToDb(l)))
      .then((keys) => {
        setLeadRecords(
          leads.map((l, i) => ({
            id: l.id,
            firebaseKey: keys[i] || undefined,
          }))
        );
      })
      .catch((err) => console.error('Lead capture failed:', err));
  };

  const handlePayNowClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPaymentError('');

    try {
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        throw new Error('Payment is not configured yet. Please contact support.');
      }

      if (!window.Razorpay) {
        throw new Error('Secure checkout failed to load. Please refresh and try again.');
      }

      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100),
          currency: 'INR',
          receipt: orderRef,
          customerEmail: formData.email.trim(),
          customerName: formData.name.trim(),
          courseIds: items.map((i) => i.id),
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.order_id) {
        throw new Error(orderData.error || 'Unable to start payment. Please try again.');
      }

      setIsProcessing(false);

      const checkoutOptions = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: merchantSettings?.name || 'Course Store',
        description: items.map((i) => i.title).join(', '),
        order_id: orderData.order_id,
        prefill: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          contact: formData.phone.trim(),
        },
        notes: {
          receipt: orderRef,
          course_ids: items.map((i) => i.id).join(','),
        },
        theme: { color: '#4f46e5' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setIsProcessing(true);
          try {
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.verified) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }

            const successfulTxns = createTransactions(
              'success',
              response.razorpay_payment_id
            ).map((txn) => ({
              ...txn,
              approvalStatus: 'approved' as const,
              transactionId: response.razorpay_payment_id,
            }));

            setStep('success');
            await onComplete(successfulTxns);
          } catch (err: any) {
            setPaymentError(
              err?.message ||
                'Payment verification failed. Please contact support with your payment ID.'
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentError('Payment window closed. You can try again when ready.');
          },
        },
      };

      const checkout = new window.Razorpay(checkoutOptions);
      checkout.on('payment.failed', (event: any) => {
        setIsProcessing(false);
        setPaymentError(
          event?.error?.description || 'Payment failed. Please try another method.'
        );
      });
      checkout.open();
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentError(err?.message || 'Something went wrong while starting payment.');
    }
  };

  // --- RENDER STEPS ---

  if (step === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-green-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={42} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h2>
          <p className="text-gray-600">
            Your payment is verified successfully and your course purchase is recorded. You can now
            access your course.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'verification') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-indigo-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShieldCheck size={40} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">
            Please wait while we verify your transaction details securely. <br />
            Do not close this window.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 flex justify-center items-center gap-3">
            <Loader2 size={20} className="animate-spin text-indigo-600" />
            <span className="font-bold text-gray-700">Connecting to Bank...</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-100 pt-8 md:pt-16 px-4 pb-20">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-green-600" />
              <span className="text-xs font-bold text-gray-500 uppercase">
                Secure Razorpay Checkout
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-indigo-100 text-center">
              <ShieldCheck size={36} className="mx-auto text-indigo-600 mb-2" />
              <h2 className="text-xl font-black text-gray-900">Complete Your Purchase</h2>
              <p className="text-sm text-gray-500 mt-1">
                Pay securely with UPI, cards, netbanking or wallets.
              </p>
              <p className="text-3xl font-black text-gray-900 mt-4">
                {formatCurrency(finalTotal)}
              </p>
            </div>

            <div className="p-6 space-y-3">
              {items.map((item) => (
                <div key={item.cartId} className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-600">{item.title}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(item.price)}</span>
                </div>
              ))}

              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total to pay</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>

              <Button
                type="button"
                onClick={handlePayNowClick}
                disabled={isProcessing}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg shadow-lg mt-3"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" /> Opening secure checkout...
                  </>
                ) : (
                  <>
                    Pay {formatCurrency(finalTotal)} securely <ArrowRight size={18} />
                  </>
                )}
              </Button>

              {paymentError && (
                <p className="text-sm text-red-600 text-center" role="alert">
                  {paymentError}
                </p>
              )}

              <p className="text-xs text-gray-400 text-center">
                Your course access is activated only after payment verification succeeds.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 text-sm hover:text-gray-600 underline"
            >
              Cancel payment &amp; return
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: DETAILS STEP ---
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left: Order Summary */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 space-y-6">
              {items.map((item) => (
                <div key={item.cartId} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{item.instructor}</p>
                    <p className="text-sm font-bold text-indigo-600">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                Discount Coupon
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-100 border border-green-200 text-green-800 px-3 py-2 rounded-lg">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <Tag size={14} /> {appliedCoupon.code} Applied!
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs hover:underline text-green-900"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Code"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase font-bold outline-none focus:border-indigo-500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isCheckingCoupon}
                  >
                    {isCheckingCoupon ? '...' : 'Apply'}
                  </Button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-1 font-medium">{couponError}</p>
              )}
            </div>

            <div className="bg-gray-100 p-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(originalTotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>- {formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-300 mt-2">
                <span>Total</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <ShieldCheck className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-blue-900 text-sm">Secure Payment</h4>
              <p className="text-xs text-blue-700 mt-1">
                Transactions are encrypted and secured.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Details Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Details</h2>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Amit Kumar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. amit@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 98765 43210"
                    pattern="[0-9]{10,}"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg mt-4 bg-indigo-600 hover:bg-indigo-700"
              >
                Proceed to Pay {formatCurrency(finalTotal)}{' '}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
