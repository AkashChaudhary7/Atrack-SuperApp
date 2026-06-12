import React, { useState, useEffect } from "react";
import { useApp } from "../AppContext";
import { 
  Plus, Trash2, GraduationCap, ClipboardCheck, Calendar, 
  Play, Pause, Square, Timer, BookOpen, Award, CheckCircle2 
} from "lucide-react";

export const StudyTab: React.FC = () => {
  const { tasks, addTask, toggleTaskCompleted, deleteTask, studySessions, addStudySession, deleteStudySession } = useApp();

  // Study Planner Task States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate] = useState(new Date().toISOString().split("T")[0]);
  const [taskType, setTaskType] = useState<"Study" | "Personal" | "Financial" | "Other">("Study");

  // Timer States
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState("General Focus");
  const [customSubject, setCustomSubject] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toLocaleTimeString("en-US", { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setSecondsElapsed(0);
    setSessionStartTime(null);
  };

  const handleSaveTimerSession = () => {
    setIsTimerRunning(false);
    if (secondsElapsed < 5) {
      alert("Session too brief to log! Focus for at least 5 seconds.");
      return;
    }
    
    const minutesToLog = Math.max(1, Math.round(secondsElapsed / 60));
    const finalSubject = customSubject.trim() || selectedSubject;
    const finalStartTime = sessionStartTime || new Date().toLocaleTimeString("en-US", { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    addStudySession({
      date: new Date().toISOString().split("T")[0],
      durationMinutes: minutesToLog,
      subject: finalSubject,
      startTime: finalStartTime
    });

    // Reset
    setSecondsElapsed(0);
    setCustomSubject("");
    setSessionStartTime(null);
    alert(`Successfully logged ${minutesToLog} minute(s) of "${finalSubject}" focus session! (Started at ${finalStartTime})`);
  };

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

  // Calculations
  const totalMinutes = studySessions.reduce((sum, item) => sum + item.durationMinutes, 0);
  const formattedHours = Math.floor(totalMinutes / 60);
  const formattedRemainingMinutes = totalMinutes % 60;

  const formatTimerString = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, "0") : null,
      String(mins).padStart(2, "0"),
      String(secs).padStart(2, "0")
    ].filter(Boolean).join(":");
  };

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
    <div className="space-y-6 font-sans text-left">
      {/* HEADER BANNER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl text-white font-black">
            <GraduationCap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Active study tab</h2>
            <p className="text-xs text-slate-505 text-slate-500 font-medium">Configure focused metrics and monitor continuous revision durations</p>
          </div>
        </div>
      </div>

      {/* OVERALL STUDY TIME CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Time Overall Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-md md:col-span-1 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 blur-sm">
            <GraduationCap className="w-32 h-32" />
          </div>
          <div className="z-10">
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest font-mono"> Focus Time</span>
            <h3 className="text-2xl font-black mt-1 font-mono tracking-tight text-white">
              {formattedHours}h {formattedRemainingMinutes}m
            </h3>
          </div>
          <div className="mt-4 pt-3.5 border-t border-indigo-800/40 flex justify-between items-center text-[10px] font-semibold text-indigo-200">
            <span>Total sessions:</span>
            <span className="font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/50">{studySessions.length} </span>
          </div>
        </div>

        {/* STUDY STOPWATCH & TIMER COMPONENT */}
        <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-sm md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              <Timer className="w-4 h-4 text-blue-500" />
              <span>Real-Time Revision Stopwatch</span>
            </div>
            {isTimerRunning && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* The Digital Clock */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-center items-center py-5">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Elapsed focus duration</span>
              <span className="text-3xl font-black font-mono tracking-tight text-indigo-600">
                {formatTimerString(secondsElapsed)}
              </span>
              {sessionStartTime && (
                <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-2 animate-pulse animate-in fade-in slide-in-from-top-1">
                  Started at: {sessionStartTime}
                </span>
              )}
            </div>

            {/* Config & Controls */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-mono font-black text-slate-400 uppercase mb-1 block">Subject category</label>
                <div className="flex gap-1.5 flex-wrap">
                  {["Physics", "Chemistry", "Math", "General Focus"].map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => { setSelectedSubject(subj); setCustomSubject(""); }}
                      className={`px-2 py-1 rounded-md text-[10px] font-black border transition-all cursor-pointer ${
                        selectedSubject === subj && !customSubject
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Or enter custom topic name..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            {!isTimerRunning ? (
              <button
                type="button"
                onClick={handleStartTimer}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Start
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePauseTimer}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" /> Hold / Pause
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveTimerSession}
              disabled={secondsElapsed === 0}
              className={`px-3.5 py-2 rounded-xl border font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                secondsElapsed > 0
                  ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-505"
                  : "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Revision 
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              disabled={secondsElapsed === 0}
              className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 cursor-pointer disabled:opacity-50"
              title="Reset timer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* FOCUS CALENDAR GRID VIEW */}
      <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-sm space-y-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-mono uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-blue-500" />
             Revision Calendar
          </h3>
          <span className="text-[8px] font-mono font-bold bg-slate-50 border text-slate-400 px-2 py-0.5 rounded-md uppercase"></span>
        </div>
        
        <p className="text-[10px] text-slate-400 font-medium leading-normal">
        
        </p>

        {/* calendar grids */}
        <div className="grid grid-cols-7 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, ix) => (
            <span key={day + ix} className="text-[9px] font-black text-slate-400 uppercase font-mono">{day}</span>
          ))}

          {calendarDays.map((day, ix) => {
            const dateStr = day.toISOString().split("T")[0];
            const minutes = getMinutesForDate(dateStr);
            
            // Shading
            let densityClass = "bg-slate-100 text-slate-400 hover:bg-slate-200";
            if (minutes > 0 && minutes <= 15) densityClass = "bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold";
            else if (minutes > 15 && minutes <= 45) densityClass = "bg-indigo-200 text-indigo-900 border border-indigo-300 font-extrabold";
            else if (minutes > 45) densityClass = "bg-indigo-600 text-white border border-indigo-700 font-black shadow-inner";

            return (
              <div 
                key={dateStr} 
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs transition-colors cursor-default select-none relative group ${densityClass}`}
              >
                <span>{day.getDate()}</span>
                {minutes > 0 && (
                  <span className="text-[7.5px] tracking-tighter opacity-85 font-mono font-bold mt-0.5">{minutes}m</span>
                )}
                
                {/* Tooltip on mouse hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 bg-slate-900 text-white text-[9px] font-mono px-2 py-1 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {dateStr}: {minutes} minutes focused
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORIC SESSIONS LOG AND RECORD REMOVAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Study Planner Tasks section */}
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm text-xs space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
            <ClipboardCheck className="w-4 h-4 text-blue-500" /> Tracked target lists
          </h3>
          
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. Solve Calculus, Revise Chemistry..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              required
            />
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-505 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center justify-center"
            >
              Add
            </button>
          </form>

          {/* list targets */}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-center text-slate-400 italic py-4">No planner items logged.</p>
            ) : (
              tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 border border-slate-100 rounded-lg hover:bg-slate-50/55 transition-colors">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                        task.isCompleted
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 bg-white hover:border-indigo-505"
                      }`}
                    >
                      {task.isCompleted && <ClipboardCheck className="w-3 h-3 stroke-[3px]" />}
                    </button>
                    <span className={`text-[11px] font-bold ${task.isCompleted ? 'line-through text-slate-350' : 'text-slate-700'}`}>
                      {task.title}
                    </span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* focus sessions ledger with delete */}
        <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm text-xs space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono">
            <BookOpen className="w-4 h-4 text-indigo-500" /> Focus Sessions Ledger
          </h3>
          
          <p className="text-[10px] text-slate-400 leading-normal mb-2">
          
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {studySessions.length === 0 ? (
              <p className="text-center text-slate-400 italic py-4">No focus sessions logged yet.</p>
            ) : (
              [...studySessions].reverse().map((session) => (
                <div key={session.id} className="flex justify-between items-center p-2.5 bg-slate-50/60 rounded-xl border border-slate-100">
                  <div className="text-left">
                    <h4 className="text-[11px] font-black text-slate-800 leading-tight">{session.subject}</h4>
                    <span className="text-[9px] text-slate-450 font-mono flex items-center gap-1.5 mt-1 font-bold">
                      {session.date} • {session.durationMinutes} min(s)
                      {session.startTime && (
                        <span className="px-1.5 py-0.25 bg-indigo-50 border border-indigo-150/40 text-indigo-600 rounded text-[7.5px] uppercase">
                          Started: {session.startTime}
                        </span>
                      )}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm(`Do you wish to delete this logged session for "${session.subject}"?`)) {
                        deleteStudySession(session.id);
                      }
                    }} 
                    className="text-slate-300 hover:text-rose-600 transition-colors p-1"
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
