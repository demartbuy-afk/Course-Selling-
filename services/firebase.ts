
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, set, push, remove, child, update, query, orderByChild, equalTo } from "firebase/database";
import { Course, Transaction, MerchantSettings, Coupon } from "../types";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHSv6PWzBN0_pDVKNoWhXLIb8_i81lsdc",
  authDomain: "payment-ebcee.firebaseapp.com",
  databaseURL: "https://payment-ebcee-default-rtdb.firebaseio.com",
  projectId: "payment-ebcee",
  storageBucket: "payment-ebcee.firebasestorage.app",
  messagingSenderId: "313780591402",
  appId: "1:313780591402:web:363749b452ac075a47dc53",
  measurementId: "G-G9LV8KVJLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// --- HELPER FUNCTIONS ---

// 1. Fetch all courses
export const fetchCourses = async (): Promise<Course[]> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `courses`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        ...data[key],
        id: key
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

// 2. Save a course (Create or Update)
export const saveCourseToDb = async (course: Course) => {
  try {
    const sanitizedCourse = JSON.parse(JSON.stringify(course));

    if (!sanitizedCourse.id || sanitizedCourse.id.startsWith('new-') || sanitizedCourse.id.startsWith('c')) {
      const newCourseRef = push(ref(db, 'courses'));
      const { id, ...courseData } = sanitizedCourse; 
      await set(newCourseRef, courseData);
      return newCourseRef.key;
    } else {
      const courseRef = ref(db, `courses/${sanitizedCourse.id}`);
      const { id, ...courseData } = sanitizedCourse;
      await set(courseRef, courseData);
      return sanitizedCourse.id;
    }
  } catch (error) {
    console.error("Error saving course:", error);
    throw error;
  }
};

// 3. Delete a course
export const deleteCourseFromDb = async (courseId: string) => {
  try {
    await remove(ref(db, `courses/${courseId}`));
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
};

// 4. Save Transactions
export const saveTransactionToDb = async (transaction: Transaction) => {
  try {
    const sanitizedTxn = JSON.parse(JSON.stringify(transaction));
    const newTxnRef = push(ref(db, 'transactions'));
    await set(newTxnRef, sanitizedTxn);
    return newTxnRef.key;
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
};

// 5. Fetch Transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `transactions`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        ...data[key],
        firebaseKey: key // CRITICAL: This allows us to update the specific record
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// 6. Update Transaction Status
export const updateTransactionStatus = async (transaction: Transaction, newStatus: 'approved' | 'rejected') => {
  try {
    // Method 1: Direct Update using firebaseKey (Fast & Reliable)
    if (transaction.firebaseKey) {
      await update(ref(db, `transactions/${transaction.firebaseKey}`), {
        status: newStatus === 'approved' ? 'success' : 'failed',
        approvalStatus: newStatus
      });
      return true;
    }

    // Method 2: Fallback (Search by internal ID if firebaseKey is missing)
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `transactions`));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const firebaseKey = Object.keys(data).find(key => data[key].id === transaction.id);
      
      if (firebaseKey) {
        await update(ref(db, `transactions/${firebaseKey}`), {
          status: newStatus === 'approved' ? 'success' : 'failed',
          approvalStatus: newStatus
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};

// 7. Merchant Settings
export const fetchMerchantSettings = async (): Promise<MerchantSettings | null> => {
  try {
    const snapshot = await get(child(ref(db), `merchantSettings`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const saveMerchantSettings = async (settings: MerchantSettings) => {
  try {
    const sanitizedSettings = JSON.parse(JSON.stringify(settings));
    await set(ref(db, 'merchantSettings'), sanitizedSettings);
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
};

// --- 8. COUPON SYSTEM ---

export const saveCouponToDb = async (coupon: Coupon) => {
  try {
    const sanitizedCoupon = JSON.parse(JSON.stringify(coupon));
    if (!sanitizedCoupon.id) {
       const newRef = push(ref(db, 'coupons'));
       const { id, ...data } = sanitizedCoupon;
       await set(newRef, data);
    } else {
       // Update logic if needed, usually we just create/delete for simplicity
       const { id, ...data } = sanitizedCoupon;
       await set(ref(db, `coupons/${id}`), data);
    }
  } catch (error) {
    console.error("Error saving coupon:", error);
    throw error;
  }
};

export const fetchCoupons = async (): Promise<Coupon[]> => {
  try {
    const snapshot = await get(child(ref(db), 'coupons'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], id: key }));
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const deleteCouponFromDb = async (couponId: string) => {
  try {
    await remove(ref(db, `coupons/${couponId}`));
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

export const validateCouponCode = async (code: string): Promise<Coupon | null> => {
  try {
    // In a real app with many coupons, use a query. 
    // Since we have few, fetching all is fine for now, or use equalTo query
    const coupons = await fetchCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    return found || null;
  } catch (error) {
    return null;
  }
};


// 9. Seed Initial Data
export const seedInitialCourses = async (mockCourses: Course[]) => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `courses`));
    if (!snapshot.exists()) {
      console.log("Seeding Database...");
      mockCourses.forEach(async (c) => {
        const { id, ...data } = c;
        const cleanData = JSON.parse(JSON.stringify(data));
        await push(ref(db, 'courses'), cleanData);
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
};

// --- 10. SHORT LINK SYSTEM ---

const generateRandomCode = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const createShortLink = async (courseId: string): Promise<string> => {
  try {
    // 1. Check if course already has a short link assigned in DB (optimization)
    // For simplicity, we'll check the 'shortLinks' node for this courseId inverse lookup 
    // OR we just generate a new one if not stored on the course object.
    
    // We will query the shortLinks node to see if any value equals courseId
    const dbRef = ref(db);
    const shortLinksQuery = query(ref(db, 'shortLinks'), orderByChild('target'), equalTo(courseId));
    
    // Note: 'equalTo' query on value requires index, simpler to just generate new one or store on course.
    // Let's generate a new one, collisions are rare with 6 chars.
    
    let code = generateRandomCode(6);
    let attempts = 0;
    
    // Ensure uniqueness
    while (attempts < 5) {
      const snapshot = await get(child(dbRef, `shortLinks/${code}`));
      if (!snapshot.exists()) {
        break; 
      }
      code = generateRandomCode(6);
      attempts++;
    }

    await set(ref(db, `shortLinks/${code}`), courseId);
    return code;
  } catch (error) {
    console.error("Error creating short link:", error);
    return "";
  }
};

export const resolveShortLink = async (code: string): Promise<string | null> => {
  try {
    const snapshot = await get(child(ref(db), `shortLinks/${code}`));
    if (snapshot.exists()) {
      return snapshot.val(); // Returns the courseId
    }
    return null;
  } catch (error) {
    console.error("Error resolving short link:", error);
    return null;
  }
};
