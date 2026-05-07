import { supabase } from '@/lib/supabase';
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

export default async function PipelinePage() {
  const jobs = await getJobs();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-900/10 via-[#0b1014] to-[#0b1014]">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Application Pipeline</h2>
          <p className="text-gray-400 text-sm mt-1">
            {jobs.length} total targets identified by Recon Engine
          </p>
        </div>
        <AddTargetButton />
      </header>
      <KanbanBoard initialJobs={jobs} />
    </main>
  );
}