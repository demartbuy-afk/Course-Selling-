
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
  status: 'success' | 'failed' | 'pending'; 
  approvalStatus?: 'pending' | 'approved' | 'rejected'; 
  failureReason?: string;
}

export type ViewState = 
  | { type: 'CATALOG'; category?: string }
  | { type: 'COURSE_DETAIL'; courseId: string }
  | { type: 'CHECKOUT' }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'SELLER_DASHBOARD' };
