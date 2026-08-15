import React, { useState } from 'react';
import { CartItem, Transaction, Coupon } from '../types';
import { formatCurrency } from '../utils';
import { Button } from './ui/Button';
import {
  Loader2,
  Smartphone,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Clock,
  CreditCard,
  Tag,
  ArrowLeft,
  Lock,
  Building2,
  Landmark,
  AlertCircle
} from 'lucide-react';

interface CheckoutProps {
  items: CartItem[];
  onComplete: (transactions: Transaction[]) => void;
  onCancel: () => void;
}

type CheckoutStep = 'details' | 'payment' | 'verification' | 'success';
type PaymentMethod = 'upi' | 'card' | 'emi' | 'netbanking';

export const Checkout: React.FC<CheckoutProps> = ({
  items,
  onComplete,
  onCancel
}) => {
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  let totalDiscount = 0;

  if (appliedCoupon) {
    items.forEach(item => {
      const validCoupon = item.coupons?.find(
        c =>
          c.code.toUpperCase() ===
          appliedCoupon.code.toUpperCase()
      );

      if (validCoupon) {
        if (validCoupon.type === 'percent') {
          totalDiscount +=
            (item.price * validCoupon.value) / 100;
        } else {
          totalDiscount += validCoupon.value;
        }
      }
    });
  }

  const finalTotal = Math.max(
    1,
    originalTotal - totalDiscount
  );

  const [step, setStep] =
    useState<CheckoutStep>('details');

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('upi');

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const PAYMENT_LINK_URL =
    'https://p.ppsl.io/PYTMPS/kOpbBk';

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    setIsCheckingCoupon(true);
    setCouponError('');

    let foundCoupon: Coupon | undefined;

    for (const item of items) {
      if (
        item.coupons &&
        item.coupons.length > 0
      ) {
        const match = item.coupons.find(
          c =>
            c.code.toUpperCase() ===
            couponCode.trim().toUpperCase()
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
      setCouponError(
        'Invalid Code for these courses.'
      );
      setAppliedCoupon(null);
    }

    setIsCheckingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const createTransactions = (
    status: 'success' | 'failed' | 'pending',
    txnId: string
  ): Transaction[] => {
    return items.map(item => ({
      id: `ORD-${Math.floor(
        100000 + Math.random() * 900000
      )}`,
      transactionId: txnId,
      courseId: item.id,
      courseTitle: item.title,
      amount: finalTotal,
      originalAmount: originalTotal,
      couponCode: appliedCoupon?.code,
      date: new Date().toISOString(),
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      status: status,
      approvalStatus: (
        status === 'pending'
          ? 'pending'
          : status === 'success'
          ? 'approved'
          : 'rejected'
      ) as
        | 'pending'
        | 'approved'
        | 'rejected'
    }));
  };

  const handleSimulatedPayment = (
    e: React.FormEvent,
    method: string
  ) => {
    e.preventDefault();

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('verification');

      setTimeout(() => {
        const pendingTxns =
          createTransactions(
            'pending',
            `${method.toUpperCase()}-GATEWAY-${Date.now()}`
          );

        onComplete(pendingTxns);
      }, 1500);
    }, 2500);
  };

  const handlePaymentDoneClick = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setStep('verification');

    setTimeout(() => {
      const pendingTxns =
        createTransactions(
          'pending',
          'PAYMENT-LINK-VERIFY'
        );

      onComplete(pendingTxns);
    }, 1500);
  };

  const handlePayNowClick = () => {
    window.open(
      PAYMENT_LINK_URL,
      '_blank',
      'noopener,noreferrer'
    );
  };

  if (step === 'verification') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-indigo-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <ShieldCheck
              size={40}
              className="text-indigo-600"
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Payment
          </h2>

          <p className="text-gray-500 mb-6 leading-relaxed">
            Please wait while we verify your transaction
            details securely.
            <br />
            Do not close this window.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 flex justify-center items-center gap-3">
            <Loader2
              size={20}
              className="animate-spin text-indigo-600"
            />

            <span className="font-bold text-gray-700">
              Connecting to Bank...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-100 pt-8 md:pt-16 px-4 pb-20">
        <div className="max-w-5xl mx-auto">

          <div className="flex justify-between items-center mb-6">
            <div
              className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-gray-900"
              onClick={() => setStep('details')}
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">
                Back
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Lock
                size={14}
                className="text-green-600"
              />

              <span className="text-xs font-bold text-gray-500 uppercase">
                100% Secure Payment
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            <div className="md:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Payment Options
                </p>
              </div>

              <div className="divide-y divide-gray-100">

                <button
                  onClick={() =>
                    setSelectedMethod('upi')
                  }
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedMethod === 'upi'
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-green-600">
                    <Smartphone size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      UPI / Pay Now
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Google Pay, PhonePe, Paytm
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setSelectedMethod('card')
                  }
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedMethod === 'card'
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-indigo-600">
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      Cards
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Credit & Debit Cards
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setSelectedMethod('emi')
                  }
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedMethod === 'emi'
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-amber-600">
                    <Building2 size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      EMI
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Easy Monthly Installments
                    </p>
                  </div>
                </button>

                <button
                  onClick={() =>
                    setSelectedMethod('netbanking')
                  }
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedMethod === 'netbanking'
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-blue-600">
                    <Landmark size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      Net Banking
                    </p>

                    <p className="text-[10px] text-gray-400">
                      All Major Banks
                    </p>
                  </div>
                </button>

              </div>
            </div>

            <div className="md:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">

              {selectedMethod === 'upi' && (
                <div className="max-w-md mx-auto text-center">

                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Smartphone
                        size={30}
                        className="text-green-600"
                      />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900">
                      Pay Securely
                    </h3>

                    <p className="text-sm text-gray-500 mt-2">
                      Complete your payment using the
                      secure payment link.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-6">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">
                      Amount Payable
                    </p>

                    <p className="text-3xl font-bold text-indigo-600">
                      {formatCurrency(finalTotal)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handlePayNowClick}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 shadow-lg text-lg"
                  >
                    Pay Now
                    <ExternalLink
                      size={18}
                      className="ml-2"
                    />
                  </Button>

                  <form
                    onSubmit={handlePaymentDoneClick}
                    className="mt-4"
                  >
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full h-11"
                    >
                      I Have Completed Payment
                      <ArrowRight
                        size={18}
                        className="ml-2"
                      />
                    </Button>
                  </form>

                  <div className="mt-5 bg-amber-50 border border-amber-100 rounded-lg p-3 text-left">
                    <div className="flex gap-2">
                      <AlertCircle
                        size={18}
                        className="text-amber-600 flex-shrink-0"
                      />

                      <p className="text-xs text-amber-800">
                        After completing payment, return to
                        this page and click "I Have Completed
                        Payment". Your order will be sent for
                        verification.
                      </p>
                    </div>
                  </div>

                </div>
              )}

              {selectedMethod === 'card' && (
                <form
                  onSubmit={e =>
                    handleSimulatedPayment(
                      e,
                      'CARD'
                    )
                  }
                  className="max-w-md mx-auto space-y-5"
                >
                  {isProcessing ? (
                    <div className="text-center py-10">
                      <Loader2
                        size={40}
                        className="text-indigo-600 animate-spin mx-auto mb-4"
                      />

                      <p className="font-bold text-gray-800">
                        Processing Card Payment...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>

                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={e =>
                            setCardDetails({
                              ...cardDetails,
                              number: e.target.value
                            })
                          }
                          placeholder="1234 5678 9012 3456"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>

                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={e =>
                            setCardDetails({
                              ...cardDetails,
                              name: e.target.value
                            })
                          }
                          placeholder="Name on card"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry
                          </label>

                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={e =>
                              setCardDetails({
                                ...cardDetails,
                                expiry: e.target.value
                              })
                            }
                            placeholder="MM/YY"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                          </label>

                          <input
                            type="password"
                            value={cardDetails.cvv}
                            onChange={e =>
                              setCardDetails({
                                ...cardDetails,
                                cvv: e.target.value
                              })
                            }
                            placeholder="CVV"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Pay {formatCurrency(finalTotal)}
                      </Button>
                    </>
                  )}
                </form>
              )}

              {selectedMethod === 'emi' && (
                <form
                  onSubmit={e =>
                    handleSimulatedPayment(
                      e,
                      'EMI'
                    )
                  }
                  className="max-w-md mx-auto space-y-6"
                >
                  {isProcessing ? (
                    <div className="text-center py-10">
                      <Loader2
                        size={40}
                        className="text-indigo-600 animate-spin mx-auto mb-4"
                      />

                      <p className="font-bold text-gray-800">
                        Processing EMI...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Choose EMI
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Select an EMI option to continue.
                        </p>
                      </div>

                      <select
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      >
                        <option value="">
                          Select EMI plan
                        </option>
                        <option value="3">
                          3 Months EMI
                        </option>
                        <option value="6">
                          6 Months EMI
                        </option>
                        <option value="9">
                          9 Months EMI
                        </option>
                        <option value="12">
                          12 Months EMI
                        </option>
                      </select>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700"
                      >
                        Continue
                      </Button>
                    </>
                  )}
                </form>
              )}

              {selectedMethod === 'netbanking' && (
                <form
                  onSubmit={e =>
                    handleSimulatedPayment(
                      e,
                      'NETBANKING'
                    )
                  }
                  className="max-w-md mx-auto space-y-6 animate-in fade-in"
                >
                  {isProcessing ? (
                    <div className="text-center py-10">
                      <Loader2
                        size={40}
                        className="text-indigo-600 animate-spin mx-auto mb-4"
                      />

                      <p className="font-bold text-gray-800">
                        Redirecting to Bank...
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">
                        Select your bank to continue
                        securely:
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          'HDFC Bank',
                          'SBI',
                          'ICICI Bank',
                          'Axis Bank',
                          'Kotak Bank',
                          'Yes Bank'
                        ].map(bank => (
                          <label
                            key={bank}
                            className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 mb-2 flex items-center justify-center text-gray-500 font-bold text-xs">
                              {bank[0]}
                            </div>

                            <span className="text-xs font-bold text-gray-700">
                              {bank}
                            </span>

                            <input
                              type="radio"
                              name="bank"
                              className="mt-2 text-indigo-600"
                            />
                          </label>
                        ))}
                      </div>

                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white">
                        <option>
                          Select other bank
                        </option>

                        <option>
                          Punjab National Bank
                        </option>

                        <option>
                          Bank of Baroda
                        </option>
                      </select>

                      <Button
                        type="submit"
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                      >
                        Proceed to Pay
                      </Button>
                    </>
                  )}
                </form>
              )}

            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onCancel}
            className="text-gray-400 text-sm hover:text-gray-600 underline"
          >
            Cancel Payment & Return
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-12">

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Order Summary
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

            <div className="p-6 space-y-6">
              {items.map(item => (
                <div
                  key={item.cartId}
                  className="flex gap-4"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                  />

                  <div>
                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-gray-500 mb-2">
                      {item.instructor}
                    </p>

                    <p className="text-sm font-bold text-indigo-600">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">

              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                Discount Coupon
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-100 border border-green-200 text-green-800 px-3 py-2 rounded-lg">

                  <span className="text-sm font-bold flex items-center gap-2">
                    <Tag size={14} />
                    {appliedCoupon.code} Applied!
                  </span>

                  <button
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
                    onChange={e =>
                      setCouponCode(e.target.value)
                    }
                  />

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={
                      !couponCode.trim() ||
                      isCheckingCoupon
                    }
                  >
                    {isCheckingCoupon
                      ? '...'
                      : 'Apply'}
                  </Button>
                </div>
              )}

              {couponError && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {couponError}
                </p>
              )}
            </div>

            <div className="bg-gray-100 p-6 border-t border-gray-200 space-y-2">

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Subtotal</span>

                <span>
                  {formatCurrency(originalTotal)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                  <span>
                    Discount ({appliedCoupon.code})
                  </span>

                  <span>
                    - {formatCurrency(totalDiscount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-300 mt-2">
                <span>Total</span>

                <span>
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">

            <ShieldCheck
              className="text-blue-600 flex-shrink-0"
              size={24}
            />

            <div>
              <h4 className="font-bold text-blue-900 text-sm">
                Secure Payment
              </h4>

              <p className="text-xs text-blue-700 mt-1">
                Transactions are encrypted and secured.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Student Details
          </h2>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 relative overflow-hidden">

            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

            <form
              onSubmit={e => {
                e.preventDefault();
                setStep('payment');
              }}
              className="space-y-5"
            >

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      name: e.target.value
                    })
                  }
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
                  onChange={e =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. amit@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>

                <div className="relative">
                  <Smartphone
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={20}
                  />

                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                      })
                    }
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
                Proceed to Pay{' '}
                {formatCurrency(finalTotal)}
                <ArrowRight
                  size={18}
                  className="ml-2"
                />
              </Button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
