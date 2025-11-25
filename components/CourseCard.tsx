
import React from 'react';
import { Star, Users, BookOpen, PlayCircle } from 'lucide-react';
import { Course } from '../types';
import { formatCurrency } from '../utils';

interface CourseCardProps {
  course: Course;
  onClick: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  // Calculate discount percentage if original price is present
  const discountPercentage = course.originalPrice && course.originalPrice > course.price 
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div 
      onClick={() => onClick(course.id)}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative"
    >
      {/* Discount Badge */}
      {discountPercentage > 0 && (
         <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-20">
            {discountPercentage}% OFF
         </div>
      )}

      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img 
          src={course.image || 'https://via.placeholder.com/300'} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
          {course.level || 'Beginner'}
        </div>
        
        {/* Video Indicator - Only show if video URL exists */}
        {course.promoVideo && course.promoVideo.trim() !== '' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur text-red-600 flex items-center justify-center shadow-lg transform scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
              <PlayCircle size={24} fill="currentColor" />
            </div>
            <div className="absolute bottom-3 left-3 text-white/90 drop-shadow-md opacity-100 group-hover:opacity-0 transition-opacity">
               <PlayCircle size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {course.category || 'General'}
          </span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-medium text-gray-700">{course.rating || 0}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
             <Users size={14} />
             <span>{(course.students || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
             <BookOpen size={14} />
             <span>{course.curriculum?.length || 0} Modules</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                {(course.instructor || "O").charAt(0)}
             </div>
             <span className="text-sm text-gray-600 truncate max-w-[100px]">{course.instructor || 'OmniLearn'}</span>
           </div>
           
           <div className="flex flex-col items-end">
             {course.originalPrice && course.originalPrice > course.price && (
               <span className="text-xs text-gray-400 line-through decoration-gray-400">{formatCurrency(course.originalPrice)}</span>
             )}
             <span className="text-xl font-bold text-gray-900 leading-none">{formatCurrency(course.price || 0)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
