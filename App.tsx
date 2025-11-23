
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CourseList } from './components/CourseList';
import { CourseDetail } from './components/CourseDetail';
import { CartDrawer } from './components/CartDrawer';
import { AIAdvisor } from './components/AIAdvisor';
import { AddCourseModal } from './components/AddCourseModal';
import { ShareModal } from './components/ShareModal';
import { Checkout } from './components/Checkout';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminLogin } from './components/AdminLogin';
import { Course, CartItem, ViewState, Transaction } from './types';
import { MOCK_COURSES } from './constants';
import { Button } from './components/ui/Button';
import { ArrowRight, MonitorPlay, CheckCircle2, Zap, Briefcase, Fingerprint, Users, Globe2, Loader2 } from 'lucide-react';
import { formatCurrency } from './utils';
import { fetchCourses, fetchTransactions, saveCourseToDb, deleteCourseFromDb, saveTransactionToDb, seedInitialCourses, resolveShortLink } from './services/firebase';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ type: 'HOME' });
  
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

      if (normalId) {
        // Direct link
        const found = fetchedCourses.find(c => c.id === normalId);
        if (found) {
          setView({ type: 'COURSE_DETAIL', courseId: normalId });
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else if (shortCode) {
        // Short link resolution
        const resolvedId = await resolveShortLink(shortCode);
        if (resolvedId) {
           const found = fetchedCourses.find(c => c.id === resolvedId);
           if (found) {
             setView({ type: 'COURSE_DETAIL', courseId: resolvedId });
             // Clean URL
             window.history.replaceState({}, '', window.location.pathname);
           }
        }
      }

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
    // Update Local State
    setTransactions(prev => [...newTransactions, ...prev]);
    
    // Save to Firebase
    for (const txn of newTransactions) {
      // Wait for Firebase to return the new key
      const firebaseKey = await saveTransactionToDb(txn);
      
      // Update the local transaction object with the firebaseKey immediately
      // This ensures we can approve/reject it without refreshing
      const txnIndex = newTransactions.indexOf(txn);
      if (txnIndex !== -1 && firebaseKey) {
          newTransactions[txnIndex].firebaseKey = firebaseKey;
      }
    }

    // Force update local transactions with the keys
    setTransactions(prev => {
        // We need to merge the new transactions (now with keys) into the state
        // Removing duplicate IDs if any, though ID generation should be unique enough for session
        const combined = [...newTransactions, ...prev];
        return combined;
    });

    // Only clear cart if successful or pending (since we moved past payment step)
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
      // Save to Firebase
      const savedId = await saveCourseToDb(courseData);
      
      // Refresh Data
      const updatedCourses = await fetchCourses();
      setCourses(updatedCourses);

      // Auto-open Share Modal if it's a new course or just saved
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
    // Confirmation handled in Dashboard UI
    try {
      await deleteCourseFromDb(id);
      // Refresh Data
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert("Failed to delete course.");
    }
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('omnilearn_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('omnilearn_admin_auth');
    setView({ type: 'HOME' });
  };

  // Render content based on current view
  const renderContent = () => {
    if (isLoadingData && courses.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
             <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4"/>
             <p className="text-gray-500 font-medium">Connecting to Database...</p>
          </div>
        </div>
      );
    }

    switch (view.type) {
      case 'HOME':
        return (
          <>
            <Hero onExplore={() => setView({ type: 'CATALOG' })} />
            
            {/* Professional Marquee Trust Section */}
            <div className="py-8 bg-[#0B0F19] border-y border-white/5 overflow-hidden">
              <div className="container mx-auto px-4">
                <p className="text-[10px] md:text-xs font-bold text-center text-gray-500 uppercase tracking-widest mb-6">Trusted by engineering teams at</p>
                <div className="relative flex overflow-x-hidden group">
                  <div className="animate-marquee whitespace-nowrap flex items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['GOOGLE', 'MICROSOFT', 'SPOTIFY', 'AMAZON', 'NETFLIX', 'META', 'UBER', 'AIRBNB', 'STRIPE', 'OPENAI'].map((brand, idx) => (
                      <span key={`orig-${idx}`} className="text-xl md:text-2xl font-black text-white cursor-default">{brand}</span>
                    ))}
                     {['GOOGLE', 'MICROSOFT', 'SPOTIFY', 'AMAZON', 'NETFLIX', 'META', 'UBER', 'AIRBNB', 'STRIPE', 'OPENAI'].map((brand, idx) => (
                      <span key={`dup-${idx}`} className="text-xl md:text-2xl font-black text-white cursor-default">{brand}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Grid Features Section */}
            <div className="py-16 md:py-24 bg-slate-50 relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                  <h2 className="text-xs md:text-sm font-bold text-indigo-600 tracking-wide uppercase mb-3 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">Platform Features</h2>
                  <h3 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight">Everything you need to <br/> become an expert.</h3>
                  <p className="text-lg md:text-xl text-gray-500 leading-relaxed">
                    A complete ecosystem designed for serious learners.
                  </p>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 max-w-6xl mx-auto">
                  
                  {/* Large Box 1 */}
                  <div className="md:col-span-2 md:row-span-2 bg-white rounded-3xl p-6 md:p-12 shadow-lg shadow-gray-200/50 border border-gray-100 relative overflow-hidden group hover:border-indigo-200 transition-all duration-300">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-16 -mt-16"></div>
                     <div className="relative z-10">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 md:mb-8 shadow-xl shadow-indigo-200">
                           <MonitorPlay size={24} className="md:w-7 md:h-7" />
                        </div>
                        <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Project-Based Learning</h4>
                        <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-6 md:mb-8 max-w-md">
                           Stop watching endless tutorials. Our curriculum is built around building real, production-ready applications. You will ship code from day one.
                        </p>
                        <ul className="space-y-3 mb-8">
                           <li className="flex items-center gap-3 text-gray-700 font-medium text-sm md:text-base"><CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0"/> Build Fullstack Apps</li>
                           <li className="flex items-center gap-3 text-gray-700 font-medium text-sm md:text-base"><CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0"/> Deploy to Cloud</li>
                           <li className="flex items-center gap-3 text-gray-700 font-medium text-sm md:text-base"><CheckCircle2 size={18} className="text-indigo-500 flex-shrink-0"/> Code Reviews Included</li>
                        </ul>
                        <Button onClick={() => setView({ type: 'CATALOG' })}>Browse Catalog</Button>
                     </div>
                  </div>

                  {/* Small Box 2 */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 group hover:border-purple-200 transition-all duration-300">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Zap size={20} className="md:w-6 md:h-6" />
                     </div>
                     <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">AI Mentorship</h4>
                     <p className="text-gray-500 text-sm">Get instant answers to your coding questions 24/7 with our integrated Gemini AI tutor.</p>
                  </div>

                  {/* Small Box 3 */}
                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg shadow-gray-200/50 border border-gray-100 group hover:border-amber-200 transition-all duration-300">
                     <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <Briefcase size={20} className="md:w-6 md:h-6" />
                     </div>
                     <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Career Support</h4>
                     <p className="text-gray-500 text-sm">Resume reviews, mock interviews, and direct referrals to our hiring partners.</p>
                  </div>

                  {/* Wide Box Bottom */}
                  <div className="md:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-10 shadow-xl text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                         <div className="text-center md:text-left">
                            <h4 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-3"><Fingerprint className="text-indigo-400"/> Validated Certificates</h4>
                            <p className="text-gray-400 text-sm md:text-base">Earn industry-recognized credentials to boost your LinkedIn profile.</p>
                         </div>
                         <div className="flex -space-x-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-800 bg-gray-600"></div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-800 bg-gray-500"></div>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-800 bg-gray-400 flex items-center justify-center text-xs font-bold text-slate-900">+12</div>
                         </div>
                      </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Modern Stats Section */}
            <div className="bg-white py-12 md:py-16 border-y border-gray-100">
               <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row md:justify-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                     <div className="px-12 py-6 md:py-4 text-center">
                        <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">50K+</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Students</div>
                     </div>
                     <div className="px-12 py-6 md:py-4 text-center">
                        <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">120+</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expert Instructors</div>
                     </div>
                     <div className="px-12 py-6 md:py-4 text-center">
                        <div className="text-3xl md:text-4xl font-black text-gray-900 mb-1">4.9/5</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Average Rating</div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Featured Courses Preview */}
            <div className="bg-slate-50 py-16 md:py-24">
               <div className="container mx-auto px-4">
                 <div className="text-center mb-12 md:mb-16">
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Featured Curriculums</h2>
                   <p className="text-gray-500">Hand-picked tracks to start your journey.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                    {courses.slice(0, 3).map(c => (
                      <div 
                        key={c.id} 
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden flex flex-col" 
                        onClick={() => setView({ type: 'COURSE_DETAIL', courseId: c.id })}
                      >
                        {/* CHANGED FROM h-48 TO aspect-square FOR POSTER LOOK */}
                        <div className="relative aspect-square overflow-hidden">
                          <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded text-xs font-bold shadow-sm">
                            {c.level}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{c.title}</h3>
                          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{c.description}</p>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">{c.category}</span>
                             <span className="font-bold text-gray-900">{formatCurrency(c.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 <div className="text-center mt-12">
                    <Button variant="outline" onClick={() => setView({ type: 'CATALOG' })}>
                      View All Courses <ArrowRight size={16} className="ml-2"/>
                    </Button>
                 </div>
               </div>
            </div>

            {/* Bottom CTA */}
            <div className="py-12 md:py-20 bg-white">
              <div className="container mx-auto px-4">
                <div className="bg-[#0B0F19] rounded-3xl p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
                   {/* Decorative Glows */}
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none"></div>
                   
                   <div className="relative z-10 max-w-2xl mx-auto">
                      <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">Ready to launch your career?</h2>
                      <p className="text-gray-400 text-base md:text-lg mb-8 md:mb-10">Join the community of developers building the future.</p>
                      <Button size="lg" onClick={() => setView({ type: 'CATALOG' })} className="w-full md:w-auto h-12 md:h-14 px-10 text-lg font-bold border-none shadow-lg shadow-indigo-900/50">
                        Get Started Now
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'CATALOG':
        return (
          <div className="bg-slate-50 min-h-screen">
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
          <div className="pb-20 min-h-screen bg-slate-50">
            <Checkout 
              items={cartItems} 
              onComplete={handleTransactionComplete}
              onCancel={() => {
                // If there's an item in the cart, go back to its detail page
                if (cartItems.length > 0) {
                  setView({ type: 'COURSE_DETAIL', courseId: cartItems[0].id });
                } else {
                  // Fallback
                  setView({ type: 'CATALOG' });
                }
              }}
            />
          </div>
        );

      case 'SELLER_DASHBOARD':
        // Gate: Check if logged in
        if (!isAdminLoggedIn) {
          return (
             <AdminLogin 
               onLogin={handleAdminLogin}
               onCancel={() => setView({ type: 'HOME' })}
             />
          );
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
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      {/* SHOW HEADER ONLY ON HOME PAGE */}
      {view.type === 'HOME' && (
        <Header 
          cartCount={cartItems.length} 
          onOpenCart={() => setIsCartOpen(true)} 
          onChangeView={setView}
        />
      )}
      
      <main>
        {renderContent()}
      </main>

      {/* Global Footer - Only rendered on HOME view */}
      {view.type === 'HOME' && (
        <footer className="bg-[#0B0F19] text-gray-400 py-16 border-t border-gray-800">
          <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-4 gap-12 mb-12">
               <div className="col-span-1 md:col-span-2">
                 <div className="flex items-center gap-2 mb-6 text-white">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/50">
                      <span className="font-bold text-lg">O</span>
                    </div>
                    <span className="text-xl font-bold">OmniLearn Pro</span>
                 </div>
                 <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                   The elite platform for technical education. We don't just teach; we transform careers through rigorous project-based curriculums.
                 </p>
               </div>
               <div>
                 <h4 className="text-white font-bold mb-6">Platform</h4>
                 <ul className="space-y-4 text-sm">
                   <li><button className="hover:text-white transition-colors">All Courses</button></li>
                   <li><button className="hover:text-white transition-colors">Pricing</button></li>
                   <li><button className="hover:text-white transition-colors">For Business</button></li>
                 </ul>
               </div>
               <div>
                 <h4 className="text-white font-bold mb-6">Legal</h4>
                 <ul className="space-y-4 text-sm">
                   <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
                   <li><button className="hover:text-white transition-colors">Terms of Service</button></li>
                 </ul>
               </div>
             </div>
             
             <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
               <div>&copy; {new Date().getFullYear()} OmniLearn Inc. All rights reserved.</div>
               <div className="flex gap-6">
                 <Globe2 size={18} className="hover:text-white cursor-pointer"/>
                 <Users size={18} className="hover:text-white cursor-pointer"/>
               </div>
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

      <AIAdvisor courses={courses} />
    </div>
  );
};

export default App;
