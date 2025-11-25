
import { Course, Review, Coupon } from './types';

const DEFAULT_POLICIES = {
  refund: "30-day money-back guarantee. If you're unsatisfied, request a full refund within 30 days.",
  privacy: "Your data is encrypted. We do not share your personal information with third parties.",
  license: "Single-user license. Content cannot be redistributed or resold.",
  terms: "By enrolling in this course, you agree to complete the assignments and respect intellectual property rights. Account sharing is strictly prohibited and may lead to suspension."
};

const DEFAULT_FAQS = [
  { question: "Do I get lifetime access?", answer: "Yes! Once you purchase a course, you have unlimited access to it forever." },
  { question: "Is this beginner friendly?", answer: "Yes, we start from the basics and move to advanced topics." }
];

const DEFAULT_FEATURES = [
  "Lifetime Access",
  "Access on Mobile & TV",
  "Certificate of completion",
  "Secure Payment"
];

const DEFAULT_BONUSES = [
  { title: "Software & Lab Tools", description: "Worth ₹8,000" },
  { title: "Live Workshop Pass", description: "Worth ₹1,399" },
  { title: "DarkNet & DeepWeb Course", description: "Worth ₹2,945" }
];

const DEFAULT_REVIEWS: Review[] = [
  { id: 'r1', studentName: 'Rahul Sharma', timeAgo: '2 days ago', rating: 5, comment: 'This course changed my career. The projects are real-world quality.' },
  { id: 'r2', studentName: 'Priya Patel', timeAgo: '1 week ago', rating: 5, comment: 'Amazing instructor! Explains complex topics very easily.' },
  { id: 'r3', studentName: 'Amit Kumar', timeAgo: '3 weeks ago', rating: 4.5, comment: 'Great content, but I wish there were more quizzes.' }
];

const DEFAULT_COUPONS: Coupon[] = [
   { id: 'c1', code: 'WELCOME50', type: 'percent', value: 50, isActive: true },
   { id: 'c2', code: 'FLAT500', type: 'flat', value: 500, isActive: true }
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'hacking-bundle-1',
    title: '125+ Premium Hacking Softwares And 100+ House Hacking Couse',
    instructor: 'Cyber Security Expert',
    price: 599,
    originalPrice: 5000,
    rating: 4.3,
    students: 1212,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    videoAspectRatio: '16:9',
    category: 'Hacking',
    level: 'Advanced',
    description: 'Unlock the ultimate cybersecurity toolkit. This exclusive bundle includes 125+ premium software tools used by industry professionals and comprehensive strategies for house hacking and digital security.',
    curriculum: [
      'Introduction to Ethical Hacking', 
      'Setting up the Lab', 
      '125+ Premium Tools Installation Guide', 
      'Network Scanning & Enumeration', 
      'System Hacking Strategies', 
      'House Hacking Fundamentals', 
      'Wi-Fi Security & Penetration Testing'
    ],
    tags: ['Hacking', 'Cyber Security', 'Tools', 'Security'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "100% Satisfaction Guarantee",
    features: ["125+ Premium Tools Included", "Lifetime Access", "Mobile Friendly", "Secure Download"],
    bonuses: [
      { title: "Dark Web Safety Guide", description: "Worth ₹2,500" },
      { title: "Anonymous Browsing Toolkit", description: "Worth ₹1,500" }
    ],
    bonusTotalValue: "₹4,000+",
    reviews: [
      { id: 'h1', studentName: 'Vikram Singh', timeAgo: '1 day ago', rating: 5, comment: 'The tool collection is insane. Totally worth the price.' },
      { id: 'h2', studentName: 'Arjun M.', timeAgo: '3 days ago', rating: 4, comment: 'Great content for beginners and pros.' }
    ],
    coupons: DEFAULT_COUPONS
  },
  {
    id: 'c1',
    title: 'Fullstack React & Node.js Masterclass',
    instructor: 'Expert Instructor',
    price: 5999,
    originalPrice: 19999,
    rating: 4.9,
    students: 15420,
    image: 'https://picsum.photos/id/1/1200/600',
    promoVideo: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    videoAspectRatio: '16:9',
    category: 'Development',
    level: 'Advanced',
    description: 'The flagship course of our academy. Master the MERN stack by building 5 real-world projects. This comprehensive course covers TypeScript, Tailwind CSS, Postgres, and scalable architecture patterns.',
    curriculum: ['React Fundamentals', 'Node.js & Express', 'PostgreSQL & Prisma', 'Authentication & Security', 'Deployment (AWS)'],
    tags: ['React', 'Node.js', 'Fullstack', 'Web Dev'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "30-Day Money-Back Guarantee",
    features: DEFAULT_FEATURES,
    bonuses: DEFAULT_BONUSES,
    bonusTotalValue: "₹12,500+",
    supportEmail: "support@reactmaster.com",
    supportPhone: "+91 98765 43210",
    reviews: DEFAULT_REVIEWS,
    coupons: DEFAULT_COUPONS
  }
];

export const CATEGORIES = ['All', 'Development', 'Design', 'Data Science', 'Marketing', 'Cyber Security', 'Ethical Hacker', 'Hacking'];
