
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Plus, Youtube, Image as ImageIcon, Save, Trash2, FileText, HelpCircle, Layout, CheckCircle, Gift, Phone, Mail, Star, Bot, ChevronRight, DollarSign, Sparkles, List, GripVertical, Check, ArrowLeft, Eye, MonitorPlay, Settings, Shield, MessageSquare, IndianRupee, Tag, Link } from 'lucide-react';
import { Button } from './ui/Button';
import { CATEGORIES } from '../constants';
import { Course, Review, Coupon } from '../types';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialData?: Course | null; // If present, we are editing
}

type Tab = 'overview' | 'content' | 'pricing' | 'social' | 'settings' | 'ai';

export const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [previewImage, setPreviewImage] = useState<string>('');
  
  // State to toggle between File Upload and URL Input
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('upload');
  
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    category: 'Development',
    price: 0,
    rating: 4.8, 
    students: 1200, 
    level: 'Beginner',
    description: '',
    image: '', 
    promoVideo: '',
    videoAspectRatio: '16:9',
    curriculum: [],
    tags: [],
    policies: {
      refund: "30-day money-back guarantee. If you're unsatisfied, request a full refund within 30 days.",
      privacy: "Your data is encrypted. By enrolling, you agree to our Terms of Service.",
      license: "Single-user license. Content cannot be redistributed or resold.",
      terms: "By enrolling, you agree to complete assignments and respect intellectual property."
    },
    faqs: [],
    guarantee: "30-Day Money-Back Guarantee",
    features: ["Lifetime Access", "Access on Mobile & TV", "Certificate of completion", "Secure Payment"],
    bonuses: [],
    bonusTotalValue: "₹12,000+",
    supportEmail: '',
    supportPhone: '',
    reviews: [],
    aiContext: '',
    coupons: []
  });

  // Curriculum Builder State
  const [newModuleInput, setNewModuleInput] = useState('');

  // New Review State
  const [newReview, setNewReview] = useState<Partial<Review>>({
    studentName: '',
    timeAgo: '',
    rating: 5,
    comment: ''
  });

  // New Coupon State (Local to modal)
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    type: 'percent',
    value: 10,
    isActive: true
  });

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Basic Details', icon: Layout },
    { id: 'content', label: 'Curriculum', icon: List },
    { id: 'pricing', label: 'Pricing & Coupons', icon: IndianRupee },
    { id: 'social', label: 'Reviews', icon: Star },
    { id: 'ai', label: 'AI Tutor', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setPreviewImage(initialData.image);
    } else {
      // Reset for new course
      setFormData({
        title: '',
        category: 'Development',
        price: 0,
        rating: 4.8, 
        students: 1250,
        level: 'Beginner',
        description: '',
        image: 'https://picsum.photos/id/1/1200/600', 
        promoVideo: '',
        videoAspectRatio: '16:9',
        curriculum: [],
        tags: [],
        policies: {
          refund: "30-day money-back guarantee. If you're unsatisfied, request a full refund within 30 days.",
          privacy: "Your data is encrypted. By enrolling, you agree to our Terms of Service.",
          license: "Single-user license. Content cannot be redistributed or resold.",
          terms: "By enrolling, you agree to complete assignments and respect intellectual property."
        },
        faqs: [],
        guarantee: "30-Day Money-Back Guarantee",
        features: ["Lifetime Access", "Access on Mobile & TV", "Certificate of completion", "Secure Payment"],
        bonuses: [
           { title: "Software & Lab Tools", description: "Worth ₹8,000" },
           { title: "Live Workshop Pass", description: "Worth ₹1,399" }
        ],
        bonusTotalValue: "₹12,000+",
        supportEmail: '',
        supportPhone: '',
        reviews: [],
        aiContext: '',
        coupons: []
      });
      setPreviewImage('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check size (Limit to 1MB to prevent DB issues)
      if (file.size > 1024 * 1024) {
        alert("Image is too large! Please select an image under 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, image: base64String }));
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setPreviewImage(url);
  };

  // --- Handlers (Same as before) ---
  const handleAddModule = () => {
    if (!newModuleInput.trim()) return;
    setFormData(prev => ({ ...prev, curriculum: [...(prev.curriculum || []), newModuleInput] }));
    setNewModuleInput('');
  };

  const handleRemoveModule = (index: number) => {
    const newCurriculum = [...(formData.curriculum || [])];
    newCurriculum.splice(index, 1);
    setFormData(prev => ({ ...prev, curriculum: newCurriculum }));
  };

  const handleAddFaq = () => {
    setFormData(prev => ({ ...prev, faqs: [...(prev.faqs || []), { question: '', answer: '' }] }));
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs[index][field] = value;
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...(formData.faqs || [])];
    newFaqs.splice(index, 1);
    setFormData(prev => ({ ...prev, faqs: newFaqs }));
  };

  const handleAddFeature = () => {
    setFormData(prev => ({ ...prev, features: [...(prev.features || []), ""] }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleAddBonus = () => {
    setFormData(prev => ({ ...prev, bonuses: [...(prev.bonuses || []), { title: '', description: '' }] }));
  };

  const handleBonusChange = (index: number, field: 'title' | 'description', value: string) => {
    const newBonuses = [...(formData.bonuses || [])];
    newBonuses[index][field] = value;
    setFormData(prev => ({ ...prev, bonuses: newBonuses }));
  };

  const handleRemoveBonus = (index: number) => {
    const newBonuses = [...(formData.bonuses || [])];
    newBonuses.splice(index, 1);
    setFormData(prev => ({ ...prev, bonuses: newBonuses }));
  };

  const handleAddReview = () => {
    if (!newReview.studentName || !newReview.comment) return;
    const reviewToAdd: Review = {
       id: Date.now().toString(),
       studentName: newReview.studentName || 'Student',
       timeAgo: newReview.timeAgo || 'Recently',
       rating: newReview.rating || 5,
       comment: newReview.comment || ''
    };
    setFormData(prev => ({ ...prev, reviews: [...(prev.reviews || []), reviewToAdd] }));
    setNewReview({ studentName: '', timeAgo: '', rating: 5, comment: '' });
  };

  const handleRemoveReview = (index: number) => {
    const newReviews = [...(formData.reviews || [])];
    newReviews.splice(index, 1);
    setFormData(prev => ({ ...prev, reviews: newReviews }));
  };

  const handleAddCoupon = () => {
    if (!newCoupon.code || !newCoupon.value) return;
    const couponToAdd: Coupon = {
       id: Date.now().toString(),
       code: newCoupon.code.toUpperCase().trim(),
       type: newCoupon.type as 'percent' | 'flat',
       value: Number(newCoupon.value),
       isActive: true
    };
    setFormData(prev => ({ ...prev, coupons: [...(prev.coupons || []), couponToAdd] }));
    setNewCoupon({ code: '', type: 'percent', value: 10, isActive: true });
  };

  const handleRemoveCoupon = (index: number) => {
    const newCoupons = [...(formData.coupons || [])];
    newCoupons.splice(index, 1);
    setFormData(prev => ({ ...prev, coupons: newCoupons }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourse: Course = {
      id: initialData?.id || `new-${Date.now()}`,
      title: formData.title || 'Untitled Course',
      instructor: initialData?.instructor || 'OmniLearn Academy',
      price: Number(formData.price) || 0,
      rating: Number(formData.rating) || 4.5, 
      students: Number(formData.students) || 0,
      image: formData.image || 'https://picsum.photos/id/1/1200/600',
      promoVideo: formData.promoVideo?.trim() ? formData.promoVideo : undefined,
      videoAspectRatio: formData.videoAspectRatio as '16:9' | '9:16',
      category: formData.category || 'Development',
      level: (formData.level as 'Beginner' | 'Intermediate' | 'Advanced') || 'Beginner',
      description: formData.description || '',
      curriculum: (formData.curriculum && formData.curriculum.length > 0) ? formData.curriculum : ['Module 1: Intro'], 
      tags: [formData.category || 'General', 'New'],
      policies: formData.policies,
      faqs: formData.faqs,
      guarantee: formData.guarantee,
      features: formData.features,
      bonuses: formData.bonuses,
      bonusTotalValue: formData.bonusTotalValue,
      supportEmail: formData.supportEmail,
      supportPhone: formData.supportPhone,
      reviews: formData.reviews,
      aiContext: formData.aiContext,
      coupons: formData.coupons
    };
    onSave(finalCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-in fade-in duration-200">
      
      {/* 1. Creator Studio Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div className="hidden md:block">
             <h1 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Course' : 'Create New Course'}</h1>
             <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-gray-500">Draft Mode</span>
             </div>
          </div>
          <div className="md:hidden">
            <h1 className="text-sm font-bold text-gray-900">{initialData ? 'Edit' : 'Create'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" className="hidden md:flex">
             <Eye size={16} className="mr-2"/> Preview
           </Button>
           <Button onClick={(e) => handleSubmit(e as any)} size="sm">
             <Save size={16} className="md:mr-2"/> <span className="hidden md:inline">Save & Publish</span> <span className="md:hidden">Save</span>
           </Button>
        </div>
      </div>

      {/* 2. Mobile Navigation (Visible only on small screens) */}
      <div className="md:hidden bg-white border-b border-gray-200 flex overflow-x-auto scrollbar-hide shrink-0">
         {TABS.map((item) => (
            <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`flex-none px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === item.id 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500'
               }`}
            >
               <item.icon size={16} />
               {item.label}
            </button>
         ))}
      </div>

      {/* 3. Main Studio Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation (Desktop) */}
        <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0">
           <div className="p-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Course Setup</p>
              <nav className="space-y-1">
                 {TABS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === item.id 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                       <item.icon size={18} />
                       {item.label}
                    </button>
                 ))}
              </nav>
           </div>
           
           <div className="mt-auto p-6 border-t border-gray-100">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
                 <p className="text-xs font-medium opacity-80 mb-1">Pro Tip</p>
                 <p className="text-xs">Add a "Promo Video" to increase conversion by 40%.</p>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
           <div className="max-w-3xl mx-auto space-y-8 pb-20">
              
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Details</h2>
                      <p className="text-gray-500 text-sm">This is the first thing students will see.</p>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <div className="mb-4">
                           <label className="block text-sm font-bold text-gray-900 mb-2">Course Title</label>
                           <input 
                              className="w-full text-lg px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300 font-medium"
                              placeholder="e.g. The Ultimate Web Development Bootcamp"
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                           />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                               <select 
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none bg-white"
                                  value={formData.category}
                                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                               >
                                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                            </div>
                            <div>
                               <label className="block text-sm font-bold text-gray-900 mb-2">Difficulty Level</label>
                               <select 
                                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none bg-white"
                                  value={formData.level}
                                  onChange={(e) => setFormData({...formData, level: e.target.value as any})}
                               >
                                  <option>Beginner</option>
                                  <option>Intermediate</option>
                                  <option>Advanced</option>
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                         <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                            {/* Fake Toolbar */}
                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex gap-2">
                               <div className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 font-bold text-xs">B</div>
                               <div className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 italic text-xs">I</div>
                               <div className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500 underline text-xs">U</div>
                               <div className="w-px h-6 bg-gray-300 mx-1"></div>
                               <div className="w-6 h-6 rounded hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-500"><List size={14}/></div>
                            </div>
                            <textarea 
                              className="w-full p-4 h-40 outline-none resize-y"
                              placeholder="Describe what students will learn..."
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                            ></textarea>
                         </div>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                         <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-gray-900">Cover Media</label>
                            <span className="text-xs text-gray-400">16:9 Aspect Ratio recommended</span>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Image Upload Area */}
                            <div className="md:col-span-1">
                               <div className="mb-2 flex gap-2">
                                  <button onClick={() => setImageInputType('upload')} className={`text-xs px-2 py-1 rounded ${imageInputType === 'upload' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-500'}`}>Upload</button>
                                  <button onClick={() => setImageInputType('url')} className={`text-xs px-2 py-1 rounded ${imageInputType === 'url' ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-500'}`}>Link</button>
                               </div>

                               {imageInputType === 'upload' ? (
                                  <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
                                  >
                                     {previewImage ? (
                                        <>
                                           <img src={previewImage} className="w-full h-full object-cover" alt="Preview"/>
                                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <p className="text-white text-xs font-bold">Change Image</p>
                                           </div>
                                        </>
                                     ) : (
                                        <>
                                           <ImageIcon className="text-gray-300 mb-2" size={24} />
                                           <span className="text-xs font-bold text-gray-500">Upload (Max 1MB)</span>
                                        </>
                                     )}
                                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*"/>
                                  </div>
                               ) : (
                                  <div className="space-y-2">
                                    <input 
                                       type="text"
                                       className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-indigo-500"
                                       placeholder="Paste Image URL"
                                       value={formData.image || ''}
                                       onChange={(e) => handleImageUrlChange(e.target.value)}
                                    />
                                    <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                                       {previewImage && <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />}
                                    </div>
                                  </div>
                               )}
                            </div>

                            {/* Video URL */}
                            <div className="md:col-span-2 space-y-4">
                               <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Promo Video URL (Optional)</label>
                                  <div className="flex items-center relative">
                                     <Youtube className="absolute left-3 text-red-500" size={18}/>
                                     <input 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                                        placeholder="https://youtube.com/watch?v=..."
                                        value={formData.promoVideo || ''}
                                        onChange={(e) => setFormData({...formData, promoVideo: e.target.value})}
                                     />
                                  </div>
                               </div>
                               <div className="flex gap-3">
                                  <button type="button" onClick={() => setFormData({...formData, videoAspectRatio: '16:9'})} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${formData.videoAspectRatio === '16:9' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>Landscape (16:9)</button>
                                  <button type="button" onClick={() => setFormData({...formData, videoAspectRatio: '9:16'})} className={`flex-1 py-2 text-xs font-bold rounded-lg border ${formData.videoAspectRatio === '9:16' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>Portrait (9:16)</button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {/* TAB: CONTENT / CURRICULUM */}
              {activeTab === 'content' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Curriculum</h2>
                      <p className="text-gray-500 text-sm">Add modules and topics to your course.</p>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex gap-3 mb-6">
                         <input 
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 outline-none"
                            placeholder="Type module name (e.g. Introduction to React)"
                            value={newModuleInput}
                            onChange={(e) => setNewModuleInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                         />
                         <Button onClick={handleAddModule} size="lg"><Plus size={18} className="mr-2"/> Add</Button>
                      </div>

                      <div className="space-y-3">
                         {formData.curriculum?.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                               <List size={40} className="mx-auto text-gray-300 mb-2" />
                               <p className="text-gray-400 text-sm">No modules added yet.</p>
                            </div>
                         )}
                         {formData.curriculum?.map((module, idx) => (
                            <div key={idx} className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                               <div className="cursor-grab text-gray-400 hover:text-gray-600"><GripVertical size={20}/></div>
                               <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                                  {idx + 1}
                               </div>
                               <span className="flex-1 font-medium text-gray-800">{module}</span>
                               <button onClick={() => handleRemoveModule(idx)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                  <Trash2 size={18} />
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Features Section */}
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900">Course Highlights</h3>
                         <Button variant="secondary" size="sm" onClick={handleAddFeature}>+ Add Feature</Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {formData.features?.map((f, i) => (
                            <div key={i} className="flex gap-2">
                               <input 
                                  className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
                                  value={f}
                                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                               />
                               <button onClick={() => handleRemoveFeature(i)} className="text-red-400 hover:text-red-600"><X size={16}/></button>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Bonuses Section */}
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900">Free Bonuses</h3>
                         <Button variant="secondary" size="sm" onClick={handleAddBonus}>+ Add Bonus</Button>
                      </div>
                      <div className="mb-4">
                         <label className="text-xs font-bold text-gray-500">Total Value Label</label>
                         <input className="w-full px-3 py-2 border rounded-lg text-sm mt-1" value={formData.bonusTotalValue} onChange={e => setFormData({...formData, bonusTotalValue: e.target.value})} />
                      </div>
                      <div className="space-y-3">
                         {formData.bonuses?.map((b, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                               <Gift size={18} className="text-indigo-500 mt-2"/>
                               <div className="flex-1 space-y-2">
                                  <input className="w-full px-3 py-1 border rounded text-sm font-bold" placeholder="Bonus Title" value={b.title} onChange={(e) => handleBonusChange(i, 'title', e.target.value)}/>
                                  <input className="w-full px-3 py-1 border rounded text-xs text-gray-500" placeholder="Description / Value" value={b.description} onChange={(e) => handleBonusChange(i, 'description', e.target.value)}/>
                                </div>
                               <button onClick={() => handleRemoveBonus(i)} className="text-red-400"><X size={16}/></button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* TAB: PRICING */}
              {activeTab === 'pricing' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Coupons</h2>
                      <p className="text-gray-500 text-sm">Set your course price and discount strategy.</p>
                   </div>

                   {/* Base Price */}
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Selling Price (₹)</label>
                            <div className="relative">
                               <span className="absolute left-4 top-3.5 text-gray-400 font-bold">₹</span>
                               <input 
                                 type="number" 
                                 className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none text-xl font-bold text-gray-900"
                                 value={formData.price}
                                 onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                               />
                            </div>
                         </div>
                         
                         <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Fake Rating</label>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="number" step="0.1" max="5"
                                 className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none"
                                 value={formData.rating}
                                 onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                               />
                               <Star className="text-yellow-400" fill="currentColor" />
                            </div>
                         </div>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-100">
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Students (Fake)</label>
                               <input 
                                 type="number" 
                                 className="w-full px-4 py-2 border rounded-lg"
                                 value={formData.students}
                                 onChange={(e) => setFormData({...formData, students: parseInt(e.target.value)})}
                               />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Money Back Guarantee</label>
                               <input 
                                 className="w-full px-4 py-2 border rounded-lg"
                                 value={formData.guarantee}
                                 onChange={(e) => setFormData({...formData, guarantee: e.target.value})}
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Course Specific Coupons */}
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Tag size={20} className="text-indigo-600"/> Course Coupons</h3>
                      
                      {/* Add Coupon Form */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl mb-4">
                         <div className="md:col-span-1">
                            <input 
                              className="w-full px-3 py-2 border rounded-lg text-sm uppercase font-bold"
                              placeholder="CODE (e.g. JAVA50)"
                              value={newCoupon.code}
                              onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                            />
                         </div>
                         <div className="md:col-span-1">
                            <select 
                              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                              value={newCoupon.type}
                              onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                            >
                               <option value="percent">Percent (%)</option>
                               <option value="flat">Flat (₹)</option>
                            </select>
                         </div>
                         <div className="md:col-span-1">
                            <input 
                              type="number"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                              placeholder="Value"
                              value={newCoupon.value}
                              onChange={e => setNewCoupon({...newCoupon, value: parseFloat(e.target.value)})}
                            />
                         </div>
                         <div className="md:col-span-1">
                            <Button size="sm" onClick={handleAddCoupon} className="w-full h-full">Add Coupon</Button>
                         </div>
                      </div>

                      {/* Coupon List */}
                      <div className="space-y-2">
                         {formData.coupons?.length === 0 && <p className="text-sm text-gray-500 italic text-center py-2">No coupons created for this course yet.</p>}
                         {formData.coupons?.map((c, i) => (
                            <div key={i} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-lg">
                               <div className="flex items-center gap-3">
                                  <div className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-xs">{c.code}</div>
                                  <span className="text-sm font-medium">
                                     {c.type === 'percent' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                                  </span>
                               </div>
                               <button onClick={() => handleRemoveCoupon(i)} className="text-red-400 hover:text-red-600">
                                  <Trash2 size={16}/>
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {/* TAB: SOCIAL PROOF */}
              {activeTab === 'social' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Reviews</h2>
                      <p className="text-gray-500 text-sm">Add manual reviews to build trust.</p>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-xl">
                          <input className="px-3 py-2 border rounded-lg" placeholder="Student Name" value={newReview.studentName} onChange={e => setNewReview({...newReview, studentName: e.target.value})}/>
                          <input className="px-3 py-2 border rounded-lg" placeholder="Time Ago (e.g. 2 days ago)" value={newReview.timeAgo} onChange={e => setNewReview({...newReview, timeAgo: e.target.value})}/>
                          <div className="col-span-2">
                             <textarea className="w-full px-3 py-2 border rounded-lg" placeholder="Review Comment" rows={2} value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})}/>
                          </div>
                          <Button onClick={handleAddReview} className="col-span-2">Add Review</Button>
                       </div>

                       <div className="space-y-3">
                          {formData.reviews?.map((r, i) => (
                             <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">{r.studentName.charAt(0)}</div>
                                <div className="flex-1">
                                   <div className="flex justify-between">
                                      <h4 className="font-bold">{r.studentName}</h4>
                                      <span className="text-xs text-gray-400">{r.timeAgo}</span>
                                   </div>
                                   <div className="text-yellow-400 text-xs mb-1">{'★'.repeat(Math.round(r.rating))}</div>
                                   <p className="text-sm text-gray-600">{r.comment}</p>
                                </div>
                                <button onClick={() => handleRemoveReview(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                             </div>
                          ))}
                       </div>
                   </div>
                </div>
              )}

              {/* TAB: SETTINGS (Policies) */}
              {activeTab === 'settings' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                   <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings & Support</h2>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Phone size={18}/> Support Info</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input className="px-4 py-3 border rounded-xl" placeholder="Support Phone" value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})}/>
                         <input className="px-4 py-3 border rounded-xl" placeholder="Support Email" value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})}/>
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Shield size={18}/> Policies</h3>
                      <div className="space-y-4">
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">Refund Policy</label>
                            <textarea className="w-full border rounded-lg p-3 text-sm" rows={2} value={formData.policies?.refund} onChange={e => setFormData({...formData, policies: {...formData.policies, refund: e.target.value}})} />
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500">Terms & Conditions</label>
                            <textarea className="w-full border rounded-lg p-3 text-sm" rows={2} value={formData.policies?.terms} onChange={e => setFormData({...formData, policies: {...formData.policies, terms: e.target.value}})} />
                         </div>
                      </div>
                   </div>

                   {/* FAQs */}
                   <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2"><HelpCircle size={18}/> FAQs</h3>
                          <Button variant="secondary" size="sm" onClick={handleAddFaq}>+ Add FAQ</Button>
                       </div>
                       <div className="space-y-3">
                          {formData.faqs?.map((f, i) => (
                             <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                                <div className="flex-1 space-y-2">
                                   <input className="w-full px-3 py-1 border rounded text-sm font-bold" placeholder="Question" value={f.question} onChange={e => handleFaqChange(i, 'question', e.target.value)} />
                                   <textarea className="w-full px-3 py-1 border rounded text-sm" placeholder="Answer" rows={2} value={f.answer} onChange={e => handleFaqChange(i, 'answer', e.target.value)} />
                                </div>
                                <button onClick={() => handleRemoveFaq(i)} className="text-red-400"><X size={16}/></button>
                             </div>
                          ))}
                       </div>
                   </div>
                </div>
              )}

              {/* TAB: AI TUTOR */}
              {activeTab === 'ai' && (
                 <div className="animate-in slide-in-from-bottom-4">
                    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl min-h-[600px] flex flex-col">
                       <div className="p-6 border-b border-slate-800">
                          <h2 className="text-xl font-bold flex items-center gap-2"><Bot className="text-indigo-400"/> AI Tutor Configuration</h2>
                          <p className="text-slate-400 text-sm mt-1">Train your course-specific chatbot.</p>
                       </div>
                       <div className="flex-1 p-6 flex flex-col">
                          <textarea 
                             className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6 font-mono text-sm text-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed h-[500px]"
                             placeholder="// Paste your course knowledge base here..."
                             value={formData.aiContext || ''}
                             onChange={(e) => setFormData({...formData, aiContext: e.target.value})}
                          />
                          <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono">
                             <span>{(formData.aiContext || '').length} characters</span>
                             <span>Supports Markdown</span>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};
