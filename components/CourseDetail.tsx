
import React, { useState } from 'react';
import { Star, Play, Award, CheckSquare, Mail, Plus, Minus, CheckCircle2, Phone } from 'lucide-react';
import { Course } from '../types';
import { Button } from './ui/Button';
import { formatCurrency, getYouTubeEmbedUrl } from '../utils';

interface CourseDetailProps {
  course: Course;
  onBuyNow: (course: Course) => void;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBuyNow }) => {
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);

  const togglePolicy = (policy: string) => {
    setOpenPolicy(openPolicy === policy ? null : policy);
  };

  // Strict check: Only get URL if promoVideo exists and is not just whitespace
  const promoVideoUrl = (course.promoVideo && course.promoVideo.trim() !== "") 
    ? getYouTubeEmbedUrl(course.promoVideo) 
    : null;

  // Calculate Discount
  const originalPrice = course.originalPrice || (course.price * 5); // Fallback for legacy data
  const discountPercentage = Math.round(((originalPrice - course.price) / originalPrice) * 100);

  return (
    <div className="bg-black min-h-screen font-sans text-gray-100 pb-24">
      
      {/* 1. HERO IMAGE (Always Top) */}
      <div className="w-full aspect-square md:aspect-video bg-zinc-900 relative">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-6 relative z-10">
        
        {/* 2. TITLE & PRICE */}
        <div className="mb-6">
           <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2 leading-tight drop-shadow-md">
             {course.title}
           </h1>
           <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <span className="bg-zinc-800 px-2 py-0.5 rounded text-white">{course.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-yellow-500">
                 {course.rating} <Star size={12} fill="currentColor"/>
              </span>
              <span>•</span>
              <span>{(course.students || 0).toLocaleString()} enrolled</span>
           </div>

           <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-black text-white">{formatCurrency(course.price)}</span>
              {discountPercentage > 0 && (
                 <>
                    <span className="text-lg text-gray-500 line-through decoration-gray-600 mb-1">{formatCurrency(originalPrice)}</span>
                    <span className="text-xs font-bold text-green-500 mb-2 bg-green-500/10 px-2 py-0.5 rounded">{discountPercentage}% OFF</span>
                 </>
              )}
           </div>
           
           {/* Desktop Buy Button (Hidden on mobile, uses sticky bar) */}
           <div className="hidden md:block mb-6">
              <Button size="lg" className="w-full md:w-auto px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12" onClick={() => onBuyNow(course)}>
                 Enroll Now
              </Button>
           </div>
        </div>

        {/* 3. VIDEO PREVIEW SECTION (Only renders if promoVideoUrl is valid) */}
        {promoVideoUrl && (
           <div className="mb-8 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
                 <Play className="text-red-500" size={18} />
                 <span className="font-bold text-sm text-gray-300">Course Preview</span>
              </div>
              <div className="aspect-video">
                 <iframe 
                   className="w-full h-full" 
                   src={promoVideoUrl} 
                   title="Preview" 
                   allowFullScreen
                 ></iframe>
              </div>
           </div>
        )}

        {/* 4. COURSE CURRICULUM */}
        <div className="mb-8">
           <h2 className="text-xl font-bold text-indigo-400 mb-4 border-l-4 border-indigo-500 pl-3">
              Course Curriculum
           </h2>
           <div className="space-y-2">
              {course.curriculum && course.curriculum.length > 0 ? (
                course.curriculum.map((item, idx) => (
                    <div key={idx} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex items-center gap-3">
                        <div className="bg-zinc-800 p-2 rounded-full text-indigo-400">
                        <Play size={14} fill="currentColor" />
                        </div>
                        <span className="text-gray-200 font-medium text-sm">{typeof item === 'string' ? item : (item as any).title}</span>
                    </div>
                ))
              ) : (
                <p className="text-gray-500 italic text-sm">No curriculum modules added yet.</p>
              )}
           </div>
        </div>

        {/* 5. BONUSES (Gold Section) */}
        {course.bonuses && course.bonuses.length > 0 && (
           <div className="mb-8 bg-gradient-to-b from-yellow-900/20 to-black border-2 border-yellow-600/50 rounded-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-yellow-600 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  LIMITED TIME OFFER
               </div>
               
               <h2 className="text-xl font-bold text-yellow-400 mb-1 flex items-center gap-2">
                  <Award className="text-yellow-500"/> {course.bonuses.length} FREE BONUSES
               </h2>
               <p className="text-yellow-200/60 text-xs mb-6 uppercase tracking-wider">
                  Total Value: {course.bonusTotalValue}
               </p>

               <div className="space-y-4">
                  {course.bonuses.map((bonus, idx) => (
                     <div key={idx} className="flex items-start gap-3">
                        <CheckSquare className="text-green-500 shrink-0 mt-1" size={18} />
                        <div>
                           <h3 className="font-bold text-white text-base">{bonus.title}</h3>
                           <p className="text-xs text-gray-400">{bonus.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
               
               <div className="mt-6 pt-4 border-t border-yellow-600/30">
                   <p className="text-center text-sm font-bold text-yellow-200">
                      Get all of this for FREE when you enroll today!
                   </p>
               </div>
           </div>
        )}

        {/* 6. WHAT YOU GET (Features - Small Text) */}
        <div className="mb-8">
           <h2 className="text-lg font-bold text-gray-300 mb-3">What You Get Inside:</h2>
           <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {(course.features || ["Lifetime Access"]).map((feature, i) => (
                 <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-gray-500" />
                    <span className="text-xs text-gray-400">{feature}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* 7. DESCRIPTION */}
        <div className="mb-8">
           <h2 className="text-xl font-bold text-white mb-3">About This Course</h2>
           <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
              {course.description}
           </p>
        </div>

        {/* 8. REVIEWS (Dynamic) */}
        <div className="mb-8">
           <h2 className="text-xl font-bold text-white mb-4">Student Reviews</h2>
           <div className="space-y-4">
              {course.reviews && course.reviews.length > 0 ? (
                 course.reviews.map((review, i) => (
                    <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-gray-400 text-xs">
                                {(review.studentName || "S").charAt(0)}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white">{review.studentName || "Student"}</p>
                                <div className="flex text-yellow-500 text-[10px]">
                                   {'★'.repeat(Math.round(review.rating))}
                                </div>
                             </div>
                          </div>
                          <span className="text-[10px] text-gray-600">{review.timeAgo}</span>
                       </div>
                       <p className="text-xs text-gray-400 leading-relaxed">"{review.comment}"</p>
                    </div>
                 ))
              ) : (
                 <p className="text-gray-500 text-sm italic">No reviews yet.</p>
              )}
           </div>
        </div>

        {/* 10. POLICIES & SUPPORT (Footer) */}
        <div className="border-t border-zinc-800 pt-8 pb-8">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Support & Legal</h3>
           
           {/* Contact */}
           <div className="mb-6 space-y-2">
              {course.supportEmail && (
                 <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail size={16} className="text-indigo-500"/> {course.supportEmail}
                 </div>
              )}
              {course.supportPhone && (
                 <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Phone size={16} className="text-indigo-500"/> {course.supportPhone}
                 </div>
              )}
           </div>

           {/* Expandable Policies */}
           <div className="space-y-1">
              {['Refund Policy', 'Terms and Conditions', 'Privacy Policy'].map((policyTitle) => {
                 const key = policyTitle.split(' ')[0].toLowerCase();
                 const policyKey = key as keyof NonNullable<Course['policies']>;
                 const isOpen = openPolicy === key;
                 
                 return (
                    <div key={key} className="bg-zinc-900 rounded-lg overflow-hidden">
                       <button 
                         onClick={() => togglePolicy(key)}
                         className="w-full flex justify-between items-center p-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                       >
                          {policyTitle}
                          {isOpen ? <Minus size={14}/> : <Plus size={14}/>}
                       </button>
                       {isOpen && (
                          <div className="p-3 pt-0 text-[10px] text-gray-500 leading-relaxed border-t border-zinc-800/50">
                             {course.policies?.[policyKey] || "No specific policy text provided."}
                          </div>
                       )}
                    </div>
                 );
              })}
           </div>
           
           <div className="mt-8 text-center">
              <p className="text-[10px] text-gray-600">
                 © {new Date().getFullYear()} {course.instructor || 'OmniLearn'}. All rights reserved.
              </p>
           </div>
        </div>

      </div>

      {/* MOBILE STICKY BUY BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#18181b] border-t border-white/10 p-3 md:hidden z-50 flex items-center justify-between pb-safe shadow-2xl">
         <div className="flex flex-col">
            {discountPercentage > 0 && <span className="text-[10px] text-gray-400 line-through">{formatCurrency(originalPrice)}</span>}
            <span className="text-xl font-black text-white">{formatCurrency(course.price)}</span>
         </div>
         <Button className="bg-indigo-600 text-white font-bold px-8 h-12 rounded-lg shadow-lg shadow-indigo-900/50 animate-pulse" onClick={() => onBuyNow(course)}>
            Enroll Now
         </Button>
      </div>
    </div>
  );
};
