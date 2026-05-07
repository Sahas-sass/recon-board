import { Target, Activity } from 'lucide-react';

export default function CommandCenter() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-900/10 via-[#0b1014] to-[#0b1014]">
      
      <header className="mb-8">
        <h2 className="text-2xl font-bold">Command Center</h2>
        <p className="text-gray-400 text-sm mt-1">System Overview and Engine Status</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Engine Status Card */}
        <div className="bg-[#131b22] border border-teal-900/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">Recon Engine</h3>
            <Activity size={18} className="text-teal-500" />
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
            </span>
            <p className="text-teal-400 text-3xl font-bold tracking-wider">ONLINE</p>
          </div>
          
          <p className="text-xs text-gray-500 mt-6 border-t border-teal-900/30 pt-4">
            Next automated sweep at 02:00 UTC
          </p>
        </div>

        {/* Quick Link Card */}
        <div className="bg-[#131b22] border border-teal-900/30 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
           <div>
             <div className="flex justify-between items-start mb-4">
               <h3 className="text-gray-400 font-medium">Active Pipeline</h3>
               <Target size={18} className="text-teal-500" />
             </div>
             <p className="text-white text-sm">Track and manage your intercepted job targets.</p>
           </div>
           
           <a href="/pipeline" className="mt-6 block text-center w-full bg-teal-900/20 hover:bg-teal-900/40 border border-teal-500/20 text-teal-400 py-2 rounded-lg text-sm transition-colors">
             Open Pipeline
           </a>
        </div>

      </div>
    </main>
  );
}