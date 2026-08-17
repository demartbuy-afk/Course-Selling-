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
  code: string;
  type: 'percent' | 'flat';
  value: number;
  isActive: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice?: number;
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

  faqs?: {
    question: string;
    answer: string;
  }[];

  policies?: {
    refund?: string;
    privacy?: string;
    license?: string;
    terms?: string;
  };

  guarantee?: string;
  features?: string[];

  bonuses?: Bonus[];
  bonusTotalValue?: string;

  supportEmail?: string;
  supportPhone?: string;

  reviews?: Review[];

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

export interface PaymentLink {
  id: string;
  amount: number;
  url: string;
  label?: string;
}

export interface Transaction {
  id: string;
  firebaseKey?: string;
  transactionId?: string;

  courseId: string;
  courseTitle: string;

  amount: number;
  originalAmount?: number;

  couponCode?: string;

  date: string;

  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  status: 'success' | 'failed' | 'pending';

  approvalStatus?: 'pending' | 'approved' | 'rejected';

  failureReason?: string;
}

export type ViewState =
  | {
      type: 'COURSE_DETAIL';
      courseId: string;
    }
  | {
      type: 'CHECKOUT';
    }
  | {
      type: 'ADMIN_LOGIN';
    }
  | {
      type: 'SELLER_DASHBOARD';
    };
