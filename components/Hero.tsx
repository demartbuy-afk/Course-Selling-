import React from 'react';
import { ArrowRight, Play, Sparkles, Terminal, Code2, Cpu, BarChart3, Globe } from 'lucide-react';
import { Button } from './ui/Button';

interface HeroProps {
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  return (
    <div className="relative pt-24 pb-16 lg:pt-48 lg:pb-40 overflow-hidden bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white">
      {/* Advanced Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] md:text-xs font-bold tracking-wide uppercase mb-6 md:mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>New: AI-Powered Curriculum</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              Master the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Future of Tech.
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 mb-8 md:mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-6 duration-700 px-4 lg:px-0">
              An elite learning ecosystem for developers, designers, and data scientists. 
              Project-based learning with real-time AI mentorship.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-7 duration-700 w-full sm:w-auto">
              <Button 
                size="lg" 
                onClick={onExplore} 
                className="w-full sm:w-auto h-12 md:h-14 px-8 text-base font-semibold bg-white text-slate-900 hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] border-none"
              >
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto h-12 md:h-14 px-8 text-base font-semibold border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Play className="mr-2 w-4 h-4 fill-current" />
                Watch Showreel
              </Button>
            </div>

            <div className="mt-8 md:mt-10 flex items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm text-gray-500 animate-in fade-in slide-in-from-bottom-8 duration-700">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0B0F19] bg-gray-800 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${10+i}`} alt="User" />
                    </div>
                  ))}
               </div>
               <div className="flex flex-col text-left">
                 <div className="flex text-amber-400 text-xs">★★★★★</div>
                 <span className="text-xs font-medium">Trusted by 50k+ pro learners</span>
               </div>
            </div>
          </div>

          {/* Right Visual - 3D Floating Interface (POSTER FORMAT) */}
          <div className="flex-1 w-full relative perspective-1000 group hidden lg:block animate-in fade-in slide-in-from-right-8 duration-1000">
             {/* Main Glass Panel - Square/Poster Aspect Ratio */}
             <div className="relative z-20 bg-[#131b2e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transform rotate-y-[-12deg] rotate-x-[5deg] group-hover:rotate-y-[-5deg] group-hover:rotate-x-[2deg] transition-transform duration-700 ease-out max-w-md mx-auto aspect-[4/5] flex flex-col">
                
                {/* Header of Mockup */}
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                   <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                   </div>
                   <div className="h-4 w-24 bg-white/5 rounded-full"></div>
                </div>
                
                {/* Poster Content */}
                <div className="flex-1 flex flex-col gap-4">
                   
                   {/* Top Stats Row */}
                   <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                         <div className="flex items-center gap-2 mb-2 text-indigo-400">
                            <Code2 size={18}/>
                            <span className="text-xs font-bold text-white/50">Modules</span>
                         </div>
                         <div className="text-2xl font-bold text-white">42</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                         <div className="flex items-center gap-2 mb-2 text-purple-400">
                            <Globe size={18}/>
                            <span className="text-xs font-bold text-white/50">Projects</span>
                         </div>
                         <div className="text-2xl font-bold text-white">15+</div>
                      </div>
                   </div>

                   {/* Main Code Block - Taller */}
                   <div className="flex-1 bg-black/40 rounded-xl p-5 font-mono text-xs text-gray-400 leading-loose border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2">
                         <div className="bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20">Active</div>
                      </div>
                      <span className="text-pink-400">class</span> <span className="text-yellow-300">Student</span> <span className="text-white">{`{`}</span><br/>
                      &nbsp;&nbsp;<span className="text-blue-400">constructor</span>() <span className="text-white">{`{`}</span><br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">this</span>.skills = [];<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">this</span>.certified = <span className="text-orange-400">true</span>;<br/>
                      &nbsp;&nbsp;<span className="text-white">{`}`}</span><br/>
                      <br/>
                      &nbsp;&nbsp;<span className="text-blue-400">master</span>(<span className="text-orange-300">topic</span>) <span className="text-white">{`{`}</span><br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// Loading AI modules...</span><br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-green-300">"Expert"</span>;<br/>
                      &nbsp;&nbsp;<span className="text-white">{`}`}</span><br/>
                      <span className="text-white">{`}`}</span>
                   </div>

                   {/* Bottom Progress */}
                   <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-gray-400">Learning Path Progress</span>
                         <span className="text-xs font-bold text-indigo-400">85%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[85%] rounded-full"></div>
                      </div>
                   </div>

                </div>

                {/* Floating Element 1 - Badge */}
                <div className="absolute -right-8 top-12 bg-[#1E293B] p-3 rounded-xl border border-white/10 shadow-xl animate-bounce duration-[3000ms]">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                         <Sparkles size={18}/>
                      </div>
                      <div>
                         <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
                         <p className="text-xs font-bold text-white">Pro Member</p>
                      </div>
                   </div>
                </div>

                 {/* Floating Element 2 - Chart */}
                 <div className="absolute -left-8 bottom-24 bg-[#1E293B] p-3 rounded-xl border border-white/10 shadow-xl animate-pulse duration-[4000ms]">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                         <BarChart3 size={18}/>
                      </div>
                      <div>
                         <p className="text-[10px] text-gray-400 uppercase font-bold">Placement</p>
                         <p className="text-xs font-bold text-white">Top 1%</p>
                      </div>
                   </div>
                </div>
             </div>
             
             {/* Back Glow */}
             <div className="absolute top-10 left-10 right-10 bottom-10 bg-indigo-500 rounded-2xl blur-[60px] opacity-20 transform rotate-y-[-12deg] -z-10"></div>
          </div>

        </div>
      </div>
    </div>
  );
};
