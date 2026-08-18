declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface Bonus {
  title: string;
  description: string;
}

export interface Review {
  id: string;
  studentName: string;
  timeAgo: string;
  rating: number;
  comment: string;
}

export interface Coupon {
  id: string;
  code: string;       // e.g. "WELCOME50"
  type: 'percent' | 'flat'; 
  value: number;      // e.g. 50 (if percent) or 500 (if flat)
  isActive: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number; // Added field for MRP
  rating: number;
  students: number;
  image: string;
  promoVideo?: string;
  videoAspectRatio?: '16:9' | '9:16';
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  curriculum: string[];
  tags: string[];
  // New Fields for Course Editor
  faqs?: { question: string; answer: string }[];
  policies?: {
    refund?: string;
    privacy?: string;
    license?: string;
    terms?: string; 
  };
  // Sidebar specific fields
  guarantee?: string;
  features?: string[];
  bonuses?: Bonus[];
  bonusTotalValue?: string; 
  // Support Info
  supportEmail?: string;
  supportPhone?: string;
  // Fake Stats
  reviews?: Review[];
  // Course Specific Coupons
  coupons?: Coupon[];
}

export interface CartItem extends Course {
  cartId: string; 
}

export interface MerchantSettings {
  name: string;
  upiId: string;
  merchantId: string;
  number: string;
}

// A payment link tied to an exact amount. Checkout looks up the link whose
// `amount` matches the final payable total (after any coupon discount) and
// sends the customer there - so a discounted order never opens the full-price link.
export interface PaymentLink {
  id: string;
  amount: number;
  url: string;
  label?: string;
}

export interface Transaction {
  id: string; 
  firebaseKey?: string; // Direct reference to Firebase node for updates
  transactionId?: string; 
  courseId: string;
  courseTitle: string;
  amount: number;
  originalAmount?: number; // Store original price before discount
  couponCode?: string;     // Store which coupon was used
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  // 'abandoned' = customer filled checkout details but never completed payment.
  // Captured automatically so the seller can follow up (email/WhatsApp/call).
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  approvalStatus?: 'pending' | 'approved' | 'rejected'; 
  failureReason?: string;
  // How far an abandoned checkout got before the customer left:
  // DETAILS_SUBMITTED = filled name/email/phone but never opened the payment page.
  // PAYMENT_LINK_OPENED = clicked "Pay Now" (opened the payment page) but never confirmed.
  checkoutStage?: 'DETAILS_SUBMITTED' | 'PAYMENT_LINK_OPENED';
}

export type ViewState = 
  | { type: 'COURSE_DETAIL'; courseId: string }
  | { type: 'CHECKOUT' }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'SELLER_DASHBOARD' };
