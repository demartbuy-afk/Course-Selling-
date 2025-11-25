
import React, { useState, useEffect } from 'react';
import { CourseDetail } from './components/CourseDetail';
import { AddCourseModal } from './components/AddCourseModal';
import { ShareModal } from './components/ShareModal';
import { Checkout } from './components/Checkout';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminLogin } from './components/AdminLogin';
import { Course, CartItem, ViewState, Transaction } from './types';
import { MOCK_COURSES } from './constants';
import { Loader2 } from 'lucide-react';
import { fetchCourses, fetchTransactions, saveCourseToDb, deleteCourseFromDb, saveTransactionToDb, seedInitialCourses, resolveShortLink } from './services/firebase';

const App: React.FC = () => {
  // UI State - Initial view will be determined by data loading
  const [view, setView] = useState<ViewState | null>(null);
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // UI State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  
  // Share Modal State
  const [shareModalData, setShareModalData] = useState<{isOpen: boolean, courseId: string, title: string}>({
    isOpen: false, courseId: '', title: ''
  });

  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // 1. Load Cart & Auth from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('omnilearn_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) { console.error(e); }
    }

    const savedAuth = localStorage.getItem('omnilearn_admin_auth');
    if (savedAuth === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  // 2. Load Courses & Transactions from Firebase & Handle URL Routing
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      
      // Attempt to seed first if empty
      await seedInitialCourses(MOCK_COURSES);

      // Fetch
      const [fetchedCourses, fetchedTxns] = await Promise.all([
        fetchCourses(),
        fetchTransactions()
      ]);

      setCourses(fetchedCourses);
      setTransactions(fetchedTxns);
      setIsLoadingData(false);

      // --- URL ROUTING LOGIC ---
      const params = new URLSearchParams(window.location.search);
      const normalId = params.get('c'); // ?c=courseId
      const shortCode = params.get('s'); // ?s=shortCode
      const secretAccess = params.get('access'); // ?access=secure-admin-panel-99
      
      // 1. Check for Admin Secret Access
      if (secretAccess === 'secure-admin-panel-99') {
        const savedAuth = localStorage.getItem('omnilearn_admin_auth');
        if (savedAuth === 'true') {
           setView({ type: 'SELLER_DASHBOARD' });
        } else {
           setView({ type: 'ADMIN_LOGIN' });
        }
        return;
      }

      // 2. Check for Direct Course Link
      if (normalId) {
        const found = fetchedCourses.find(c => c.id === normalId);
        if (found) {
          setView({ type: 'COURSE_DETAIL', courseId: normalId });
        } else {
           // Invalid ID, Default to Hacking Course
           setView({ type: 'COURSE_DETAIL', courseId: 'hacking-bundle-1' });
        }
      } 
      else if (shortCode) {
        const resolvedId = await resolveShortLink(shortCode);
        if (resolvedId) {
           const found = fetchedCourses.find(c => c.id === resolvedId);
           if (found) {
             setView({ type: 'COURSE_DETAIL', courseId: resolvedId });
           } else {
             setView({ type: 'COURSE_DETAIL', courseId: 'hacking-bundle-1' });
           }
        } else {
           setView({ type: 'COURSE_DETAIL', courseId: 'hacking-bundle-1' });
        }
      } else {
         // 3. DEFAULT HOME PAGE: Show the specific Hacking Course
         // ID: 'hacking-bundle-1'
         setView({ type: 'COURSE_DETAIL', courseId: 'hacking-bundle-1' });
      }
    };

    loadData();
  }, []);

  // Save Cart to Local Storage
  useEffect(() => {
    localStorage.setItem('omnilearn_cart', JSON.stringify(cartItems));
  }, [cartItems]);
  

  const handleBuyNow = (course: Course) => {
     const newItem: CartItem = { ...course, cartId: Date.now().toString() };
     setCartItems([newItem]);
     setView({ type: 'CHECKOUT' });
  };

  // Called when Checkout finishes (Success OR Pending)
  const handleTransactionComplete = async (newTransactions: Transaction[]) => {
    setTransactions(prev => [...newTransactions, ...prev]);
    for (const txn of newTransactions) {
      const firebaseKey = await saveTransactionToDb(txn);
      const txnIndex = newTransactions.indexOf(txn);
      if (txnIndex !== -1 && firebaseKey) {
          newTransactions[txnIndex].firebaseKey = firebaseKey;
      }
    }
    setCartItems([]);
  };

  // --- Seller Actions ---

  const openAddCourseModal = () => {
    setCourseToEdit(null);
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course) => {
    setCourseToEdit(course);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (courseData: Course) => {
    setIsLoadingData(true);
    try {
      const savedId = await saveCourseToDb(courseData);
      const updatedCourses = await fetchCourses();
      setCourses(updatedCourses);

      if (savedId) {
        setShareModalData({
          isOpen: true,
          courseId: savedId,
          title: courseData.title
        });
      }
      
      // Stay on Dashboard after save
      if (!view || view.type !== 'SELLER_DASHBOARD') {
         setView({ type: 'SELLER_DASHBOARD' });
      }

    } catch (error) {
      alert("Failed to save course. Please check console.");
    } finally {
      setIsLoadingData(false);
      setIsCourseModalOpen(false);
      setCourseToEdit(null);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourseFromDb(id);
      const newCourses = courses.filter(c => c.id !== id);
      setCourses(newCourses);
    } catch (error) {
      alert("Failed to delete course.");
    }
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('omnilearn_admin_auth', 'true');
    setView({ type: 'SELLER_DASHBOARD' });
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('omnilearn_admin_auth');
    setView({ type: 'ADMIN_LOGIN' }); // Will show login screen
  };

  const handleWebsitePreview = () => {
    if (courses.length > 0) {
      // Open the Hacking course or first available
      const hackingCourse = courses.find(c => c.id === 'hacking-bundle-1');
      setView({ type: 'COURSE_DETAIL', courseId: hackingCourse ? hackingCourse.id : courses[0].id });
    } else {
      alert("No courses available to preview. Please create a course first.");
    }
  };

  // Render content based on current view
  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
             <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4"/>
             <p className="text-gray-500 font-medium">Loading...</p>
          </div>
        </div>
      );
    }

    if (!view) return null;

    switch (view.type) {
      case 'COURSE_DETAIL':
        // Try to find the requested course, otherwise fall back to the Hacking Bundle
        let course = courses.find(c => c.id === view.courseId);
        if (!course) {
           course = courses.find(c => c.id === 'hacking-bundle-1');
        }
        
        if (!course) return (
             <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <p>Course not found.</p>
             </div>
        );
        return (
          <div className="bg-black min-h-screen relative">
             {/* No Header here as requested previously */}
             <CourseDetail 
                course={course} 
                onBuyNow={handleBuyNow}
             />
          </div>
        );

      case 'CHECKOUT':
        return (
          <div className="pb-20 min-h-screen bg-slate-50">
            <Checkout 
              items={cartItems} 
              onComplete={handleTransactionComplete}
              onCancel={() => {
                // Return to course detail
                if (cartItems.length > 0) {
                  setView({ type: 'COURSE_DETAIL', courseId: cartItems[0].id });
                } else {
                  setView({ type: 'COURSE_DETAIL', courseId: 'hacking-bundle-1' });
                }
              }}
            />
          </div>
        );

      case 'ADMIN_LOGIN':
        return (
            <AdminLogin 
               onLogin={handleAdminLogin}
            />
        );

      case 'SELLER_DASHBOARD':
        if (!isAdminLoggedIn) {
            return <AdminLogin onLogin={handleAdminLogin} />;
        }
        return (
          <SellerDashboard 
             courses={courses}
             transactions={transactions}
             onAddCourse={openAddCourseModal}
             onEditCourse={openEditCourseModal}
             onDeleteCourse={handleDeleteCourse}
             onLogout={handleAdminLogout}
             onShareCourse={(id, title) => setShareModalData({ isOpen: true, courseId: id, title })}
             onPreviewWebsite={handleWebsitePreview}
          />
        );
        
      default:
        // Fallback default
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      
      <main>
        {renderContent()}
      </main>

      <AddCourseModal 
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={courseToEdit}
      />

      <ShareModal 
        isOpen={shareModalData.isOpen}
        onClose={() => setShareModalData(prev => ({ ...prev, isOpen: false }))}
        courseId={shareModalData.courseId}
        courseTitle={shareModalData.title}
      />
    </div>
  );
};

export default App;
