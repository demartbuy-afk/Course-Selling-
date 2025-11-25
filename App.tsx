
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { CartDrawer } from './components/CartDrawer';
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
  // DEFAULT VIEW IS NOW CATALOG (Student View)
  const [view, setView] = useState<ViewState>({ type: 'CATALOG' });
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // UI State
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
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
      
      // SECRET ADMIN KEY - This is the "Hard URL" logic
      const adminAccess = params.get('access'); 
      const SECRET_ADMIN_KEY = "secure-admin-panel-99"; 

      if (adminAccess === SECRET_ADMIN_KEY) {
        // If the secret is in URL, Go to Admin Login immediately
        setView({ type: 'ADMIN_LOGIN' });
        // Clean URL to hide the secret, but stay in the view
        window.history.replaceState({}, '', window.location.pathname);
      } 
      else if (normalId) {
        // Direct link
        const found = fetchedCourses.find(c => c.id === normalId);
        if (found) {
          setView({ type: 'COURSE_DETAIL', courseId: normalId });
          window.history.replaceState({}, '', window.location.pathname);
        }
      } 
      else if (shortCode) {
        // Short link resolution
        const resolvedId = await resolveShortLink(shortCode);
        if (resolvedId) {
           const found = fetchedCourses.find(c => c.id === resolvedId);
           if (found) {
             setView({ type: 'COURSE_DETAIL', courseId: resolvedId });
             window.history.replaceState({}, '', window.location.pathname);
           }
        }
      }
      // If no params, it stays on 'CATALOG' (Default)
    };

    loadData();
  }, []);

  // Save Cart to Local Storage
  useEffect(() => {
    localStorage.setItem('omnilearn_cart', JSON.stringify(cartItems));
  }, [cartItems]);
  

  const addToCart = (course: Course) => {
    const newItem: CartItem = { ...course, cartId: Date.now().toString() };
    setCartItems(prev => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleBuyNow = (course: Course) => {
     const newItem: CartItem = { ...course, cartId: Date.now().toString() };
     setCartItems([newItem]);
     setView({ type: 'CHECKOUT' });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleCheckout = () => {
    setView({ type: 'CHECKOUT' });
    setIsCartOpen(false);
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
    setTransactions(prev => {
        const combined = [...newTransactions, ...prev];
        return combined;
    });
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
      setCourses(prev => prev.filter(c => c.id !== id));
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
    setView({ type: 'CATALOG' });
  };

  // Render content based on current view
  const renderContent = () => {
    if (isLoadingData && courses.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
             <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4"/>
             <p className="text-gray-500 font-medium">Loading Catalog...</p>
          </div>
        </div>
      );
    }

    switch (view.type) {
      case 'CATALOG':
        return (
          <div className="bg-slate-50 min-h-screen pt-16">
            <CourseList 
              courses={courses} 
              initialCategory={view.category}
              onCourseClick={(id) => setView({ type: 'COURSE_DETAIL', courseId: id })}
            />
          </div>
        );

      case 'COURSE_DETAIL':
        const course = courses.find(c => c.id === view.courseId);
        if (!course) return <div className="pt-32 text-center">Course not found. <button onClick={() => setView({type: 'CATALOG'})} className="text-indigo-600 underline">Browse All</button></div>;
        return (
          <div className="bg-black min-h-screen">
             <CourseDetail 
                course={course} 
                onBuyNow={handleBuyNow}
             />
          </div>
        );

      case 'CHECKOUT':
        return (
          <div className="pb-20 min-h-screen bg-slate-50 pt-16">
            <Checkout 
              items={cartItems} 
              onComplete={handleTransactionComplete}
              onCancel={() => {
                if (cartItems.length > 0) {
                  setView({ type: 'COURSE_DETAIL', courseId: cartItems[0].id });
                } else {
                  setView({ type: 'CATALOG' });
                }
              }}
            />
          </div>
        );

      case 'ADMIN_LOGIN':
        return (
            <AdminLogin 
               onLogin={handleAdminLogin}
               onCancel={() => setView({ type: 'CATALOG' })}
            />
        );

      case 'SELLER_DASHBOARD':
        if (!isAdminLoggedIn) {
            // Safety Check
            return <AdminLogin onLogin={handleAdminLogin} onCancel={() => setView({ type: 'CATALOG' })} />;
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
          />
        );
        
      default:
        // Fallback
        return (
            <div className="bg-slate-50 min-h-screen pt-16">
            <CourseList 
              courses={courses} 
              onCourseClick={(id) => setView({ type: 'COURSE_DETAIL', courseId: id })}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header Logic: Show ONLY on CATALOG (Home) */}
      {view.type === 'CATALOG' && (
        <Header 
          cartCount={cartItems.length} 
          onOpenCart={() => setIsCartOpen(true)} 
          onChangeView={setView}
        />
      )}
      
      <main>
        {renderContent()}
      </main>

      {/* Global Footer - Only on Catalog */}
      {view.type === 'CATALOG' && (
        <footer className="bg-[#0B0F19] text-gray-400 py-12 border-t border-gray-800">
          <div className="container mx-auto px-4 text-center">
             <div className="flex items-center justify-center gap-2 mb-4 text-white">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
                  <span className="font-bold text-lg">O</span>
                </div>
                <span className="text-xl font-bold">OmniLearn Pro</span>
             </div>
             <p className="text-sm text-gray-500 mb-6">
                Professional Education Platform.
             </p>
             <div className="text-xs text-gray-600">
               &copy; {new Date().getFullYear()} OmniLearn Inc.
             </div>
          </div>
        </footer>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        items={cartItems} 
        onClose={() => setIsCartOpen(false)} 
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />

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
