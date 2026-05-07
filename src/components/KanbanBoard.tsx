"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { supabase } from "@/lib/supabase";

// Define the columns we want on the board
const COLUMNS = ["To Apply", "Applied", "Interviewing", "Rejected"];

export default function KanbanBoard({ initialJobs }: { initialJobs: any[] }) {
  const [jobs, setJobs] = useState(initialJobs);

  // Function to handle the drop action
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a column, do nothing
    if (!destination) return;

    // If dropped in the exact same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the job we are moving
    const movedJob = jobs.find((j) => j.id === draggableId);
    if (!movedJob) return;

    // Optimistically update the UI instantly
    const newStatus = destination.droppableId;
    const updatedJobs = jobs.map((job) =>
      job.id === draggableId ? { ...job, application_status: newStatus } : job
    );
    setJobs(updatedJobs);

    // Silently update the database in the background
    const { error } = await supabase
      .from("job_postings")
      .update({ application_status: newStatus })
      .eq("id", draggableId);

    if (error) {
      console.error("Failed to update status in database", error);
      // Revert UI if DB fails (optional but good practice)
      setJobs(jobs); 
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {COLUMNS.map((columnStatus) => {
          // Filter jobs that belong in this specific column
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
                  <h3 className="text-gray-400 font-semibold mb-4 pb-2 border-b border-white/5 flex justify-between">
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
                            } p-4 rounded-xl cursor-grab active:cursor-grabbing shadow-lg`}
                          >
                            <h4 className="font-medium text-teal-50 mb-1">{job.title}</h4>
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