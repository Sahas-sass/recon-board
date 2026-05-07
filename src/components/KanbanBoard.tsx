"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react"; // <-- Import the trash icon

const COLUMNS = ["To Apply", "Applied", "Interviewing", "Rejected"];

export default function KanbanBoard({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs);

  // Function to handle the drop action (Moving cards)
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedJob = jobs.find((j) => j.id === draggableId);
    if (!movedJob) return;

    const newStatus = destination.droppableId;
    const updatedJobs = jobs.map((job) =>
      job.id === draggableId ? { ...job, application_status: newStatus } : job
    );
    setJobs(updatedJobs);

    const { error } = await supabase
      .from("job_postings")
      .update({ application_status: newStatus })
      .eq("id", draggableId);

    if (error) {
      console.error("Failed to update status", error);
      setJobs(jobs); 
    }
  };

  // NEW: Function to handle deleting a job card
  const handleDelete = async (jobId: string) => {
    // 1. Optimistically remove it from the UI instantly so it feels fast
    const previousJobs = [...jobs];
    setJobs(jobs.filter((job) => job.id !== jobId));

    // 2. Silently delete it from the database in the background
    const { error } = await supabase
      .from("job_postings")
      .delete()
      .eq("id", jobId);

    if (error) {
      console.error("Failed to delete job", error);
      alert("Failed to delete target. Reverting board.");
      setJobs(previousJobs); // Bring it back if the database failed
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {COLUMNS.map((columnStatus) => {
          const columnJobs = jobs.filter((job) => job.application_status === columnStatus);

          return (
            <Droppable key={columnStatus} droppableId={columnStatus}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-[#0f161b] border ${
                    snapshot.isDraggingOver ? "border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]" : "border-teal-900/30"
                  } rounded-2xl p-4 flex flex-col min-h-[500px] transition-all`}
                >
                  <h3 className="text-gray-400 font-semibold mb-4 pb-2 border-b border-white/5 flex justify-between items-center">
                    {columnStatus} 
                    <span className="bg-teal-900/30 text-teal-500 px-2 py-0.5 rounded-full text-xs">
                      {columnJobs.length}
                    </span>
                  </h3>

                  <div className="space-y-3 flex-1">
                    {columnJobs.map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-[#131b22] border ${
                              snapshot.isDragging ? "border-teal-400" : "border-white/5"
                            } p-4 rounded-xl cursor-grab active:cursor-grabbing shadow-lg group`}
                          >
                            
                            {/* Card Header with Delete Button */}
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4 className="font-medium text-teal-50 leading-tight">{job.title}</h4>
                              <button 
                                onClick={() => handleDelete(job.id)}
                                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                title="Remove Target"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            
                            <p className="text-xs text-gray-400 mb-3">{job.target_urls?.company_name}</p>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.tech_stack_string.split(', ').map((tech: string) => (
                                <span key={tech} className="bg-teal-900/20 text-teal-600 border border-teal-500/10 px-2 py-0.5 rounded text-[10px]">
                                  {tech}
                                </span>
                              ))}
                            </div>
                            
                            <a 
                              href={job.posting_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="mt-4 block text-center w-full bg-white/5 hover:bg-white/10 text-gray-300 py-1.5 rounded text-xs transition-colors"
                            >
                              View Posting
                            </a>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}