
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
    id: 'c1',
    title: 'Fullstack React & Node.js Masterclass',
    instructor: 'OmniLearn Academy',
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
  },
  {
    id: 'c2',
    title: 'UI/UX Design Principles for Developers',
    instructor: 'OmniLearn Academy',
    price: 3499,
    originalPrice: 7999,
    rating: 4.7,
    students: 8200,
    image: 'https://picsum.photos/id/3/1200/600',
    promoVideo: 'https://www.youtube.com/shorts/ylsF_3jS7S0',
    videoAspectRatio: '9:16', 
    category: 'Design',
    level: 'Beginner',
    description: 'Learn to design beautiful interfaces that convert. We cover color theory, typography, layout grids, and how to hand off designs to developers effectively.',
    curriculum: ['Design Thinking', 'Figma Mastery', 'Color Theory', 'Typography', 'Prototyping'],
    tags: ['UI/UX', 'Figma', 'Design', 'Frontend'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "30-Day Money-Back Guarantee",
    features: DEFAULT_FEATURES,
    bonuses: DEFAULT_BONUSES,
    bonusTotalValue: "₹8,000+",
    supportEmail: "design@omnilearn.com",
    reviews: [
      { id: 'r4', studentName: 'Sneha Gupta', timeAgo: '1 day ago', rating: 5, comment: 'Finally understood how to use Figma properly. Thanks!' }
    ]
  },
  {
    id: 'c3',
    title: 'Python for Data Science and AI',
    instructor: 'OmniLearn Academy',
    price: 7499,
    originalPrice: 14999,
    rating: 4.8,
    students: 22100,
    image: 'https://picsum.photos/id/4/1200/600',
    promoVideo: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    videoAspectRatio: '16:9',
    category: 'Data Science',
    level: 'Intermediate',
    description: 'Dive deep into data analysis with Pandas, NumPy, and Scikit-Learn. Includes an introduction to Generative AI using LLMs.',
    curriculum: ['Python Basics', 'Pandas & NumPy', 'Data Visualization', 'Machine Learning Basics', 'Intro to LLMs'],
    tags: ['Python', 'AI', 'Data Science', 'Machine Learning'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "30-Day Money-Back Guarantee",
    features: DEFAULT_FEATURES,
    bonuses: DEFAULT_BONUSES,
    bonusTotalValue: "₹15,000+",
    supportEmail: "ai-help@omnilearn.com",
    reviews: DEFAULT_REVIEWS
  },
  {
    id: 'c4',
    title: 'Digital Marketing Strategy 2024',
    instructor: 'OmniLearn Academy',
    price: 2999,
    originalPrice: 5999,
    rating: 4.5,
    students: 5300,
    image: 'https://picsum.photos/id/6/1200/600',
    videoAspectRatio: '16:9',
    category: 'Marketing',
    level: 'Beginner',
    description: 'A complete guide to SEO, SEM, Social Media Marketing, and Email automation strategies.',
    curriculum: ['SEO Fundamentals', 'Google Ads', 'Social Media Content', 'Email Marketing', 'Analytics'],
    tags: ['Marketing', 'SEO', 'Business'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "30-Day Money-Back Guarantee",
    features: DEFAULT_FEATURES,
    bonuses: DEFAULT_BONUSES,
    bonusTotalValue: "₹5,000+"
  },
  {
    id: 'c5',
    title: 'Advanced Go Programming',
    instructor: 'OmniLearn Academy',
    price: 4999,
    originalPrice: 9999,
    rating: 4.9,
    students: 3100,
    image: 'https://picsum.photos/id/60/1200/600',
    videoAspectRatio: '16:9',
    category: 'Development',
    level: 'Advanced',
    description: 'Build high-performance microservices with Go. Learn concurrency patterns, channels, and gRPC.',
    curriculum: ['Go Syntax Deep Dive', 'Concurrency & Channels', 'Microservices', 'gRPC', 'Performance Tuning'],
    tags: ['Go', 'Backend', 'Microservices'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "30-Day Money-Back Guarantee",
    features: DEFAULT_FEATURES,
    bonuses: DEFAULT_BONUSES,
    bonusTotalValue: "₹9,000+"
  },
  {
    id: 'c6',
    title: 'Cinematic Video Editing',
    instructor: 'OmniLearn Academy',
    price: 3999,
    originalPrice: 6999,
    rating: 4.8,
    students: 9000,
    image: 'https://picsum.photos/id/96/1200/600',
    promoVideo: 'https://www.youtube.com/watch?v=J-s3C_v641Y',
    videoAspectRatio: '16:9',
    category: 'Design',
    level: 'Intermediate',
    description: 'Learn the art of storytelling through video editing using Premiere Pro and DaVinci Resolve.',
    curriculum: ['Storytelling Basics', 'Cuts & Transitions', 'Color Grading', 'Sound Design', 'Exporting'],
    tags: ['Video', 'Editing', 'Creative'],
    policies: DEFAULT_POLICIES,
    faqs: DEFAULT_FAQS,
    guarantee: "30-Day Money-Back Guarantee",
    features: DEFAULT_FEATURES,
    bonuses: DEFAULT_BONUSES,
    bonusTotalValue: "₹10,000+"
  }
];

export const CATEGORIES = ['All', 'Development', 'Design', 'Data Science', 'Marketing', 'Cyber Security', 'Ethical Hacker', 'Hacking'];
