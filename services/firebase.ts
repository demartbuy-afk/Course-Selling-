import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  remove,
  child,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import {
  Course,
  Transaction,
  MerchantSettings,
  Coupon,
  PaymentLink,
} from "../types";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHSv6PWzBN0_pDVKNoWhXLIb8_i81lsdc",
  authDomain: "payment-ebcee.firebaseapp.com",
  databaseURL: "https://payment-ebcee-default-rtdb.firebaseio.com",
  projectId: "payment-ebcee",
  storageBucket: "payment-ebcee.firebasestorage.app",
  messagingSenderId: "313780591402",
  appId: "1:313780591402:web:363749b452ac075a47dc53",
  measurementId: "G-G9LV8KVJLS",
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

      return Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
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

    // If it's a new course with a temporary ID, use push to generate a new ID
    if (
      !sanitizedCourse.id ||
      sanitizedCourse.id.startsWith("new-")
    ) {
      const newCourseRef = push(ref(db, "courses"));

      const { id, ...courseData } = sanitizedCourse;

      await set(newCourseRef, courseData);

      return newCourseRef.key;
    } else {
      // If it has a specific ID (like 'hacking-bundle-1'), use that ID
      const courseRef = ref(
        db,
        `courses/${sanitizedCourse.id}`
      );

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
export const saveTransactionToDb = async (
  transaction: Transaction
) => {
  try {
    const sanitizedTxn = JSON.parse(
      JSON.stringify(transaction)
    );

    const newTxnRef = push(ref(db, "transactions"));

    await set(newTxnRef, sanitizedTxn);

    return newTxnRef.key;
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
};

// 5. Fetch Transactions
export const fetchTransactions = async (): Promise<
  Transaction[]
> => {
  try {
    const dbRef = ref(db);

    const snapshot = await get(
      child(dbRef, `transactions`)
    );

    if (snapshot.exists()) {
      const data = snapshot.val();

      return Object.keys(data).map((key) => ({
        ...data[key],
        firebaseKey: key,
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
export const updateTransactionStatus = async (
  transaction: Transaction,
  newStatus: "approved" | "rejected"
) => {
  try {
    // Method 1: Direct Update using firebaseKey
    if (transaction.firebaseKey) {
      await update(
        ref(
          db,
          `transactions/${transaction.firebaseKey}`
        ),
        {
          status:
            newStatus === "approved"
              ? "success"
              : "failed",

          approvalStatus: newStatus,
        }
      );

      return true;
    }

    // Method 2: Fallback
    const dbRef = ref(db);

    const snapshot = await get(
      child(dbRef, `transactions`)
    );

    if (snapshot.exists()) {
      const data = snapshot.val();

      const firebaseKey = Object.keys(data).find(
        (key) => data[key].id === transaction.id
      );

      if (firebaseKey) {
        await update(
          ref(db, `transactions/${firebaseKey}`),
          {
            status:
              newStatus === "approved"
                ? "success"
                : "failed",

            approvalStatus: newStatus,
          }
        );

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(
      "Error updating transaction:",
      error
    );

    throw error;
  }
};

// 7. Merchant Settings
export const fetchMerchantSettings =
  async (): Promise<MerchantSettings | null> => {
    try {
      const snapshot = await get(
        child(ref(db), `merchantSettings`)
      );

      if (snapshot.exists()) {
        return snapshot.val();
      }

      return null;
    } catch (error) {
      return null;
    }
  };

export const saveMerchantSettings = async (
  settings: MerchantSettings
) => {
  try {
    const sanitizedSettings = JSON.parse(
      JSON.stringify(settings)
    );

    await set(
      ref(db, "merchantSettings"),
      sanitizedSettings
    );
  } catch (error) {
    console.error(
      "Error saving settings:",
      error
    );

    throw error;
  }
};

// 7b. Payment Links
export const fetchPaymentLinks = async (): Promise<
  PaymentLink[]
> => {
  try {
    const snapshot = await get(
      child(ref(db), `paymentLinks`)
    );

    if (snapshot.exists()) {
      const val = snapshot.val();

      return Object.keys(val).map((key) => ({
        id: key,
        ...val[key],
      }));
    }

    return [];
  } catch (error) {
    return [];
  }
};

export const savePaymentLinks = async (
  links: PaymentLink[]
) => {
  try {
    const obj: Record<
      string,
      {
        amount: number;
        url: string;
        label: string;
      }
    > = {};

    links.forEach((link) => {
      obj[link.id] = {
        amount: link.amount,
        url: link.url,
        label: link.label || "",
      };
    });

    await set(
      ref(db, "paymentLinks"),
      obj
    );
  } catch (error) {
    console.error(
      "Error saving payment links:",
      error
    );

    throw error;
  }
};

// --- 8. COUPON SYSTEM ---

export const saveCouponToDb = async (
  coupon: Coupon
) => {
  try {
    const sanitizedCoupon = JSON.parse(
      JSON.stringify(coupon)
    );

    if (!sanitizedCoupon.id) {
      const newRef = push(ref(db, "coupons"));

      const { id, ...data } =
        sanitizedCoupon;

      await set(newRef, data);
    } else {
      const { id, ...data } =
        sanitizedCoupon;

      await set(
        ref(db, `coupons/${id}`),
        data
      );
    }
  } catch (error) {
    console.error(
      "Error saving coupon:",
      error
    );

    throw error;
  }
};

export const fetchCoupons = async (): Promise<
  Coupon[]
> => {
  try {
    const snapshot = await get(
      child(ref(db), "coupons")
    );

    if (snapshot.exists()) {
      const data = snapshot.val();

      return Object.keys(data).map((key) => ({
        ...data[key],
        id: key,
      }));
    }

    return [];
  } catch (error) {
    return [];
  }
};

export const deleteCouponFromDb = async (
  couponId: string
) => {
  try {
    await remove(
      ref(db, `coupons/${couponId}`)
    );
  } catch (error) {
    console.error(
      "Error deleting coupon:",
      error
    );

    throw error;
  }
};

export const validateCouponCode = async (
  code: string
): Promise<Coupon | null> => {
  try {
    const coupons = await fetchCoupons();

    const found = coupons.find(
      (c) =>
        c.code.toUpperCase() ===
          code.toUpperCase() &&
        c.isActive
    );

    return found || null;
  } catch (error) {
    return null;
  }
};

// 9. Seed Initial Data
export const seedInitialCourses = async (
  mockCourses: Course[]
) => {
  try {
    const dbRef = ref(db);

    const updates: any = {};
    let needsUpdate = false;

    // Check specifically for the Hacking Course
    const hackingCourse = mockCourses.find(
      (c) => c.id === "hacking-bundle-1"
    );

    if (hackingCourse) {
      const snapshot = await get(
        child(
          dbRef,
          `courses/hacking-bundle-1`
        )
      );

      if (!snapshot.exists()) {
        console.log(
          "Seeding Hacking Course..."
        );

        const { id, ...data } =
          hackingCourse;

        const cleanData = JSON.parse(
          JSON.stringify(data)
        );

        updates[`courses/${id}`] =
          cleanData;

        needsUpdate = true;
      }
    }

    // Check if DB is completely empty
    const rootSnapshot = await get(
      child(dbRef, `courses`)
    );

    if (!rootSnapshot.exists()) {
      console.log(
        "Seeding Full Database..."
      );

      mockCourses.forEach((c) => {
        const { id, ...data } = c;

        const cleanData = JSON.parse(
          JSON.stringify(data)
        );

        if (
          id &&
          !id.startsWith("new-")
        ) {
          updates[`courses/${id}`] =
            cleanData;
        } else {
          const newKey = push(
            child(dbRef, "courses")
          ).key;

          if (newKey) {
            updates[
              `courses/${newKey}`
            ] = cleanData;
          }
        }
      });

      needsUpdate = true;
    }

    if (needsUpdate) {
      await update(
        ref(db),
        updates
      );

      return true;
    }

    return false;
  } catch (e) {
    console.error(
      "Seeding Error:",
      e
    );

    return false;
  }
};

// --- 10. SHORT LINK SYSTEM ---

const generateRandomCode = (
  length: number
) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(
        Math.random() *
          chars.length
      )
    );
  }

  return result;
};

export const createShortLink = async (
  courseId: string
): Promise<string> => {
  try {
    const dbRef = ref(db);

    const shortLinksQuery = query(
      ref(db, "shortLinks"),
      orderByChild("target"),
      equalTo(courseId)
    );

    let code =
      generateRandomCode(6);

    let attempts = 0;

    // Ensure uniqueness
    while (attempts < 5) {
      const snapshot = await get(
        child(
          dbRef,
          `shortLinks/${code}`
        )
      );

      if (!snapshot.exists()) {
        break;
      }

      code =
        generateRandomCode(6);

      attempts++;
    }

    await set(
      ref(db, `shortLinks/${code}`),
      courseId
    );

    return code;
  } catch (error) {
    console.error(
      "Error creating short link:",
      error
    );

    return "";
  }
};

export const resolveShortLink = async (
  code: string
): Promise<string | null> => {
  try {
    const snapshot = await get(
      child(
        ref(db),
        `shortLinks/${code}`
      )
    );

    if (snapshot.exists()) {
      return snapshot.val();
    }

    return null;
  } catch (error) {
    console.error(
      "Error resolving short link:",
      error
    );

    return null;
  }
};
