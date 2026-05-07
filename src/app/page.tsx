import { supabase } from '@/lib/supabase';
import { LayoutDashboard, Target, Briefcase, FileText } from 'lucide-react';
import KanbanBoard from '@/components/KanbanBoard';
import AddTargetButton from '@/components/AddTargetButton'; 

async function getJobs() {
  const { data: jobs, error } = await supabase
    .from('job_postings')
    .select('*, target_urls(company_name)')
    .order('date_posted', { ascending: false });

  if (error) console.error("Error fetching jobs:", error);
  return jobs || [];
}

export default async function ReconBoard() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-[#0b1014] text-white flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-teal-900/30 bg-[#0f161b] p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
            <Target size={18} className="text-[#0b1014]" />
          </div>
          <h1 className="text-xl font-bold tracking-wider">ReconBoard</h1>
        </div>

        <nav className="flex flex-col gap-4 text-gray-400">
          <a href="#" className="flex items-center gap-3 text-teal-400 bg-teal-900/10 p-3 rounded-xl border border-teal-500/20">
            <LayoutDashboard size={18} /> Command Center
          </a>
          <a href="#" className="flex items-center gap-3 p-3 hover:text-white transition-colors">
            <Briefcase size={18} /> Active Pipeline
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-900/10 via-[#0b1014] to-[#0b1014]">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Application Pipeline</h2>
            <p className="text-gray-400 text-sm mt-1">
              {jobs.length} total targets identified by Recon Engine
            </p>
          </div>
          <AddTargetButton />
        </header>

        {/* THE KANBAN BOARD */}
        <KanbanBoard initialJobs={jobs} />

      </main>
    </div>
  );
}