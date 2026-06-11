import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, GraduationCap, ClipboardCheck, Calendar } from "lucide-react";

export const StudyTab: React.FC = () => {
  const { tasks, addTask, toggleTaskCompleted, deleteTask, studySessions } = useApp();

  // Study Planner Task States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate] = useState(new Date().toISOString().split("T")[0]);
  const [taskType, setTaskType] = useState<"Study" | "Personal" | "Financial" | "Other">("Study");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      addTask({
        title: taskTitle.trim(),
        date: taskDate,
        isCompleted: false,
        type: taskType
      });
      setTaskTitle("");
    }
  };

  const currentStudyMinutes = studySessions.reduce((sum, item) => sum + item.durationMinutes, 0);

  // Generate last 28 days for grid calendar view
  const getCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push(d);
    }
    return days;
  };

  const getMinutesForDate = (dateStr: string) => {
    return studySessions
      .filter(s => s.date === dateStr)
      .reduce((sum, item) => sum + item.durationMinutes, 0);
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white font-black">
          <GraduationCap className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Focus &amp; Study Planner</h2>
          <p className="text-xs text-slate-500 font-medium">Boost academic performance and track offline concentration sessions</p>
        </div>
      </div>

      {/* Calendar Grid View component */}
      <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono uppercase tracking-wide">
          <Calendar className="w-4 h-4 text-blue-500" />
          Focus Calendar Grid View
        </h3>
        
        <p className="text-[10px] text-slate-400 font-medium">
          Visualizing your consecutive concentration levels over the last 4 weeks. Light/dark shades reflect session metrics.
        </p>

        {/* Calendar visual board */}
        <div className="grid grid-cols-7 gap-2 shadow-inner bg-slate-50 p-3 rounded-xl border border-slate-100">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, ix) => (
            <span key={day + ix} className="text-[9px] font-black text-slate-400 uppercase font-mono">{day}</span>
          ))}

          {calendarDays.map((day, ix) => {
            const dateStr = day.toISOString().split("T")[0];
            const minutes = getMinutesForDate(dateStr);
            
            // Map shades of blue based on concentration density
            let densityClass = "bg-slate-100 text-slate-400 hover:bg-slate-200";
            if (minutes > 0 && minutes <= 15) densityClass = "bg-blue-100 text-blue-700 border border-blue-200 font-bold";
            else if (minutes > 15 && minutes <= 45) densityClass = "bg-blue-300 text-blue-900 border border-blue-400 font-bold";
            else if (minutes > 45) densityClass = "bg-blue-600 text-white border border-blue-700 font-extrabold";

            return (
              <div 
                key={dateStr} 
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs transition-colors cursor-default select-none relative group ${densityClass}`}
              >
                <span>{day.getDate()}</span>
                {minutes > 0 && (
                  <span className="text-[7px] tracking-tighter opacity-85 font-mono font-bold mt-0.5">{minutes}m</span>
                )}
                
                {/* Tooltip on mouse hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-[9px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {dateStr}: {minutes} minutes
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Planner Tasks Section */}
      <div className="space-y-4">
        {/* Task Creator form */}
        <form onSubmit={handleAddTask} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
          <h3 className="font-bold text-slate-700">Register Target Goal</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Target Description</label>
              <input 
                type="text" 
                placeholder="Physics homework, Read, etc."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Goal Domain</label>
              <select 
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="Study" className="text-slate-800">Study Target</option>
                <option value="Financial" className="text-slate-800">Financial Target</option>
                <option value="Personal" className="text-slate-800">Personal Routine</option>
                <option value="Other" className="text-slate-800">Other Category</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-650 hover:bg-indigo-700 font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Save Planner Task
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">ONBOARD LONG-TERM GOALS</span>

          <div className="space-y-2">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No planned targets logged.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-3 border rounded-xl shadow-sm ${
                  task.isCompleted ? "bg-slate-50/50 border-slate-200 opacity-60" : "bg-white border-slate-150 hover:border-slate-300 transition-colors"
                }`}>
                  <div className="flex gap-2.5 items-center">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                        task.isCompleted
                          ? "bg-indigo-500 border-indigo-500 text-white"
                          : "border-slate-300 bg-white hover:border-indigo-505"
                      }`}
                    >
                      {task.isCompleted && <ClipboardCheck className="w-3 h-3 stroke-[3px]" />}
                    </button>

                    <div>
                      <h4 className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <span className="text-[9px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono mt-1 block w-max uppercase font-bold text-slate-500">
                        {task.type}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
