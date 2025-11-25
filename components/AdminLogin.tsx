
import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel?: () => void; // Made optional
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded Credentials as requested
  const ADMIN_CREDS = {
    email: "yuvrajsingh11171@gmail.com",
    password: "Yuvraj@1203#₹__"
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      if (email === ADMIN_CREDS.email && password === ADMIN_CREDS.password) {
        onLogin();
      } else {
        setError('Invalid Email or Password. Access Denied.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-white/50 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform rotate-3">
              <ShieldCheck className="text-white w-8 h-8" />
           </div>
           <h1 className="text-2xl font-black text-gray-900">Admin Access</h1>
           <p className="text-gray-500 text-sm mt-1">Enter your secure credentials to manage courses.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           
           {/* Email Field */}
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Admin ID</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 </div>
                 <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="admin@omnilearn.com"
                 />
              </div>
           </div>

           {/* Password Field */}
           <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                 </div>
                 <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                 />
                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                       {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                 </div>
              </div>
           </div>

           {/* Error Message */}
           {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
                 <AlertCircle size={16} />
                 {error}
              </div>
           )}

           <Button 
             type="submit" 
             className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-200 mt-2"
             disabled={isLoading}
           >
             {isLoading ? 'Verifying...' : 'Login to Dashboard'} 
             {!isLoading && <ArrowRight size={18} className="ml-2" />}
           </Button>

           {/* Removed the "Return to Home" button since this IS the home page now */}
        </form>
      </div>
    </div>
  );
};
