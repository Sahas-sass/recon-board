"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { X } from "lucide-react";

export default function AddTargetButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from("target_urls")
      .insert([{ company_name: companyName, base_url: baseUrl }]);

    setIsSubmitting(false);

    if (error) {
      alert("Failed to add target. Check console.");
      console.error(error);
    } else {
      setIsOpen(false);
      setCompanyName("");
      setBaseUrl("");
      // Refresh the page to show the new target (optional, but easy)
      window.location.reload(); 
    }
  };

  return (
    <>
      {/* THE TRIGGER BUTTON */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-teal-500 text-[#0b1014] px-4 py-2 rounded-full font-semibold text-sm cursor-pointer shadow-[0_0_15px_rgba(20,184,166,0.4)] hover:scale-105 transition-transform"
      >
        + Add Target
      </button>

      {/* THE MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f161b] border border-teal-900/50 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Acquire New Target</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                <input 
                  type="text" 
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#0b1014] border border-teal-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="e.g., Netflix"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Career Page URL</label>
                <input 
                  type="url" 
                  required
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full bg-[#0b1014] border border-teal-900/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="https://jobs.netflix.com/search"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-teal-500 text-[#0b1014] px-6 py-2 rounded-lg font-semibold hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Locking on..." : "Add to Recon"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}