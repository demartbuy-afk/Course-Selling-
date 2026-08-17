import React, { useState, useEffect } from 'react';
import { CartItem, Transaction, Coupon, PaymentLink } from '../types';
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
import { fetchPaymentLinks } from '../services/firebase';

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

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Calculate Final Price
  let totalDiscount = 0;

  if (appliedCoupon) {
    items.forEach(item => {
      const validCoupon = item.coupons?.find(
        c => c.code.toUpperCase() === appliedCoupon.code.toUpperCase()
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

  // States
  const [step, setStep] = useState<CheckoutStep>('details');
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Card Form State
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Payment Links
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);

  useEffect(() => {
    fetchPaymentLinks().then(setPaymentLinks);
  }, []);

  const roundedFinalTotal = Math.round(finalTotal);

  const matchedPaymentLink = paymentLinks.find(
    l => Math.round(l.amount) === roundedFinalTotal
  );

  // --- Handlers ---

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    setIsCheckingCoupon(true);
    setCouponError('');

    let foundCoupon: Coupon | undefined;

    for (const item of items) {
      if (item.coupons && item.coupons.length > 0) {
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
      setCouponError('Invalid Code for these courses.');
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
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
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
      ) as 'pending' | 'approved' | 'rejected'
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
        const pendingTxns = createTransactions(
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
      const pendingTxns = createTransactions(
        'pending',
        'PAYMENT-LINK-VERIFY'
      );

      onComplete(pendingTxns);
    }, 1500);
  };

  const handlePayNowClick = () => {
    if (!matchedPaymentLink) return;

    window.open(
      matchedPaymentLink.url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // --- VERIFICATION STEP ---

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

  // --- PAYMENT GATEWAY UI ---

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-100 pt-8 md:pt-16 px-4 pb-20">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
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

            {/* LEFT: PAYMENT OPTIONS SIDEBAR */}

            <div className="md:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Payment Options
                </p>
              </div>

              <div className="divide-y divide-gray-100">

                {/* UPI */}

                <button
                  onClick={() => setSelectedMethod('upi')}
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

                {/* CARD */}

                <button
                  onClick={() => setSelectedMethod('card')}
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

                {/* EMI */}

                <button
                  onClick={() => setSelectedMethod('emi')}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedMethod === 'emi'
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-amber-600">
                    <Clock size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      EMI
                    </p>

                    <p className="text-[10px] text-gray-400">
                      Credit Card EMI
                    </p>
                  </div>

                  {finalTotal < 5000 && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      N/A
                    </span>
                  )}
                </button>

                {/* NET BANKING */}

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
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600">
                    <Landmark size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-gray-800 text-sm">
                      Netbanking
                    </p>

                    <p className="text-[10px] text-gray-400">
                      All Indian Banks
                    </p>
                  </div>
                </button>

              </div>
            </div>

            {/* RIGHT: CONTENT AREA */}

            <div className="md:col-span-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[400px] flex flex-col">

                {/* Top Bar */}

                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-sm">
                    {selectedMethod === 'upi' &&
                      'Pay via UPI'}

                    {selectedMethod === 'card' &&
                      'Enter Card Details'}

                    {selectedMethod === 'emi' &&
                      'Easy Monthly Installments'}

                    {selectedMethod === 'netbanking' &&
                      'Select Your Bank'}
                  </span>

                  <span className="font-black text-gray-900 text-lg">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>

                <div className="p-6 md:p-8 flex-1">

                  {/* UPI CONTENT */}

                  {selectedMethod === 'upi' && (
                    <div className="max-w-md mx-auto text-center">

                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-6">
                        <Smartphone
                          size={36}
                          className="text-indigo-600 mx-auto mb-3"
                        />

                        <p className="text-sm text-gray-600 mb-1">
                          Click below to pay securely using
                          UPI, Cards, Netbanking & Wallets.
                        </p>

                        <p className="text-2xl font-black text-gray-900 mt-2">
                          {formatCurrency(finalTotal)}
                        </p>
                      </div>

                      <Button
                        onClick={handlePayNowClick}
                        disabled={!matchedPaymentLink}
                        className={`w-full h-12 sm:h-14 text-base sm:text-lg shadow-lg flex items-center justify-center gap-2 ${
                          matchedPaymentLink
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Pay Now
                        <ExternalLink size={18} />
                      </Button>

                      {matchedPaymentLink ? (
                        <p className="text-[11px] text-gray-400 mt-3">
                          Opens our secure payment page in a new tab.
                        </p>
                      ) : (
                        <p className="text-[11px] text-red-500 mt-3 flex items-center justify-center gap-1">
                          <AlertCircle size={12} />
                          Online payment isn't set up for this amount yet.
                          Please contact support before paying.
                        </p>
                      )}

                      <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-gray-200 flex-1"></div>

                        <span className="text-xs text-gray-400 font-bold">
                          AFTER PAYMENT
                        </span>

                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        Already completed the payment? Let us know
                        so we can verify and confirm your order.
                      </p>

                      <Button
                        onClick={handlePaymentDoneClick}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        I Have Paid
                      </Button>
                    </div>
                  )}

                  {/* CARD CONTENT */}

                  {selectedMethod === 'card' && (
                    <form
                      onSubmit={e =>
                        handleSimulatedPayment(e, 'CARD')
                      }
                      className="max-w-md mx-auto space-y-5 animate-in fade-in"
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

                          <p className="text-xs text-gray-400 mt-2">
                            Connecting to Secure Gateway
                          </p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                              Card Number
                            </label>

                            <div className="relative">
                              <CreditCard
                                className="absolute left-3 top-3 text-gray-400"
                                size={18}
                              />

                              <input
                                type="text"
                                maxLength={19}
                                placeholder="0000 0000 0000 0000"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                onChange={e =>
                                  setCardDetails({
                                    ...cardDetails,
                                    number: e.target.value
                                  })
                                }
                              />

                              <div className="absolute right-3 top-3 flex gap-1 opacity-50">
                                <div className="w-8 h-5 bg-blue-600 rounded"></div>
                                <div className="w-8 h-5 bg-red-500 rounded"></div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                Expiry Date
                              </label>

                              <input
                                type="text"
                                placeholder="MM / YY"
                                maxLength={5}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                                onChange={e =>
                                  setCardDetails({
                                    ...cardDetails,
                                    expiry: e.target.value
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                CVV / CVC
                              </label>

                              <div className="relative">
                                <Lock
                                  className="absolute left-3 top-3 text-gray-400"
                                  size={16}
                                />

                                <input
                                  type="password"
                                  maxLength={3}
                                  placeholder="123"
                                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                  onChange={e =>
                                    setCardDetails({
                                      ...cardDetails,
                                      cvv: e.target.value
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                              Card Holder Name
                            </label>

                            <input
                              type="text"
                              placeholder="Name as on card"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              onChange={e =>
                                setCardDetails({
                                  ...cardDetails,
                                  name: e.target.value
                                })
                              }
                            />
                          </div>

                          <div className="pt-2">
                            <Button
                              type="submit"
                              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                            >
                              Pay {formatCurrency(finalTotal)} Securely
                            </Button>

                            <p className="text-center text-[10px] text-gray-400 mt-3 flex items-center justify-center gap-1">
                              <Lock size={10} />
                              256-bit SSL Encrypted
                            </p>
                          </div>
                        </>
                      )}
                    </form>
                  )}

                  {/* EMI CONTENT */}

                  {selectedMethod === 'emi' && (
                    <div className="max-w-md mx-auto animate-in fade-in">
                      {finalTotal < 5000 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle
                              size={32}
                              className="text-gray-400"
                            />
                          </div>

                          <h3 className="font-bold text-gray-900">
                            EMI Not Available
                          </h3>

                          <p className="text-sm text-gray-500 mt-2">
                            Minimum order value for EMI is{' '}
                            <span className="font-bold">
                              ₹5,000
                            </span>.
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Current Total: {formatCurrency(finalTotal)}
                          </p>
                        </div>
                      ) : (
                        <form
                          onSubmit={e =>
                            handleSimulatedPayment(e, 'EMI')
                          }
                          className="space-y-5"
                        >
                          {isProcessing ? (
                            <div className="text-center py-10">
                              <Loader2
                                size={40}
                                className="text-indigo-600 animate-spin mx-auto mb-4"
                              />

                              <p className="font-bold text-gray-800">
                                Processing EMI Request...
                              </p>
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                  Select Bank
                                </label>

                                <div className="relative">
                                  <Building2
                                    className="absolute left-3 top-3 text-gray-400"
                                    size={18}
                                  />

                                  <select className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none">
                                    <option>
                                      HDFC Bank Credit Card
                                    </option>
                                    <option>
                                      SBI Credit Card
                                    </option>
                                    <option>
                                      ICICI Bank Credit Card
                                    </option>
                                    <option>
                                      Axis Bank Credit Card
                                    </option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                                  Select Tenure
                                </label>

                                <div className="space-y-3">
                                  <label className="flex items-center justify-between p-3 border border-indigo-500 bg-indigo-50 rounded-lg cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name="tenure"
                                        defaultChecked
                                        className="text-indigo-600 focus:ring-indigo-500"
                                      />

                                      <span className="text-sm font-bold text-gray-900">
                                        3 Months
                                      </span>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-sm font-bold text-indigo-700">
                                        {formatCurrency(
                                          Math.round(
                                            (finalTotal / 3) * 1.15
                                          )
                                        )}{' '}
                                        /mo
                                      </div>

                                      <div className="text-[10px] text-gray-500">
                                        @ 15% p.a
                                      </div>
                                    </div>
                                  </label>

                                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="radio"
                                        name="tenure"
                                        className="text-indigo-600"
                                      />

                                      <span className="text-sm font-bold text-gray-900">
                                        6 Months
                                      </span>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-sm font-bold text-gray-700">
                                        {formatCurrency(
                                          Math.round(
                                            (finalTotal / 6) * 1.15
                                          )
                                        )}{' '}
                                        /mo
                                      </div>

                                      <div className="text-[10px] text-gray-500">
                                        @ 15% p.a
                                      </div>
                                    </div>
                                  </label>
                                </div>
                              </div>

                              <Button
                                type="submit"
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg mt-2"
                              >
                                Convert to EMI
                              </Button>
                            </>
                          )}
                        </form>
                      )}
                    </div>
                  )}

                  {/* NETBANKING CONTENT */}

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
                            Select your bank to continue securely:
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

  // --- DETAILS STEP ---

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-12">

        {/* Left: Order Summary */}

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

            {/* Coupon Section */}

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
                    {isCheckingCoupon ? '...' : 'Apply'}
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

        {/* Right: Details Form */}

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
                Proceed to Pay {formatCurrency(finalTotal)}
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
