import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Course, ViewState } from '../types';
import { CourseCard } from './CourseCard';
import { CATEGORIES } from '../constants';

interface CourseListProps {
  courses: Course[];
  initialCategory?: string;
  onCourseClick: (id: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ courses, initialCategory = 'All', onCourseClick }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            course.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [courses, activeCategory, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Explore Courses</h2>
          <p className="text-gray-500">Find the perfect path to your new career.</p>
        </div>
        
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
           <input 
             type="text" 
             placeholder="Search for courses..." 
             className="pl-10 pr-4 py-2.5 w-full md:w-80 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === category 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course.id} 
              course={course} 
              onClick={onCourseClick} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-gray-400 mb-4">No courses found matching your criteria.</div>
          <button 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="text-indigo-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
