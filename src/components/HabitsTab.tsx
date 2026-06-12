import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, CheckCircle, Flame, Calendar, Sparkles, TrendingUp, Award, Activity } from "lucide-react";

export const HabitsTab: React.FC = () => {
  const { habits, addHabit, toggleHabitDate, deleteHabit, isCircadian } = useApp();
  const [newHabit, setNewHabit] = useState("");
  const [hoveredDay, setHoveredDay] = useState<{ habitId: string; date: string; isCompleted: boolean } | null>(null);
  const [hoveredGlobalDay, setHoveredGlobalDay] = useState<{ date: string; completedCount: number; totalCount: number; percent: number } | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.trim()) {
      addHabit(newHabit.trim());
      setNewHabit("");
    }
  };

  // Generate the last 30 calendar days dynamically for the heat-map matrix
  const last30Days = useMemo(() => {
    return [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
  }, []);

  // Compute overall habit streaks and 30-day aggregate statistics
  const heatmapStats = useMemo(() => {
    if (habits.length === 0) {
      return { currentStreak: 0, maxStreak: 0, consistency: 0, totalCompletions: 0 };
    }

    let totalPossible = habits.length * 30;
    let totalCompleted = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Check streak of days with AT LEAST one habit completed in the last 30 days
    last30Days.forEach(day => {
      const dayCompletions = habits.filter(h => h.completedDates.includes(day)).length;
      if (dayCompletions > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
      totalCompleted += dayCompletions;
    });

    // Calculate current running streak backwards from today
    const reverseDays = [...last30Days].reverse();
    const todayCompleted = habits.filter(h => h.completedDates.includes(todayStr)).length > 0;
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
    const yesterdayCompleted = habits.filter(h => h.completedDates.includes(yesterdayStr)).length > 0;

    if (todayCompleted || yesterdayCompleted) {
      for (const day of reverseDays) {
        // Skip today in streak checking if it is empty but yesterday was completed (protects running streak)
        if (day === todayStr && !todayCompleted) {
          continue;
        }
        const dayCompletions = habits.filter(h => h.completedDates.includes(day)).length;
        if (dayCompletions > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const consistency = Math.round((totalCompleted / totalPossible) * 100);

    return { currentStreak, maxStreak, consistency, totalCompletions: totalCompleted };
  }, [habits, last30Days, todayStr]);

  // Helper function to return intensity scale level for a specific date
  const getDayIntensityInfo = (date: string) => {
    if (habits.length === 0) return { percent: 0, completedCount: 0, level: 0 };
    const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
    const totalCount = habits.length;
    const percent = Math.round((completedCount / totalCount) * 100);
    
    let level = 0;
    if (percent > 0 && percent <= 25) level = 1;
    else if (percent > 25 && percent <= 50) level = 2;
    else if (percent > 50 && percent <= 75) level = 3;
    else if (percent > 75) level = 4;

    return { percent, completedCount, totalCount, level };
  };

  // Class style maps for color-coded intensity scale
  const intensityStylesLight = [
    "bg-slate-100 hover:bg-slate-200 border-slate-200/40 text-slate-400", // Level 0
    "bg-teal-100/80 hover:bg-teal-200 border-teal-200/50 text-teal-800", // Level 1 (25% or less)
    "bg-teal-300 hover:bg-teal-400 border-teal-400/40 text-teal-905", // Level 2 (26% - 50%)
    "bg-teal-500 hover:bg-teal-600 border-teal-600/30 text-white", // Level 3 (51% - 75%)
    "bg-teal-700 hover:bg-teal-800 border-teal-800/30 text-teal-50" // Level 4 (76% - 100%)
  ];

  const intensityStylesCircadian = [
    "bg-[#070b09] hover:bg-emerald-950/20 border-emerald-950/80 text-emerald-950", // Level 0
    "bg-emerald-950/40 hover:bg-emerald-950/60 border-emerald-900/30 text-emerald-500", // Level 1 (25% or less)
    "bg-emerald-900/60 hover:bg-emerald-900/80 border-emerald-800/30 text-emerald-300", // Level 2 (26% - 50%)
    "bg-emerald-700/80 hover:bg-emerald-700 border-emerald-600/30 text-emerald-100", // Level 3 (51% - 75%)
    "bg-emerald-500 hover:bg-emerald-400 border-emerald-400/30 text-[#0c1612] shadow-[0_0_8px_rgba(16,185,129,0.25)]" // Level 4 (76% - 100%)
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-teal-500 to-cyan-600 rounded-xl text-white">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Habit routine builder</h2>
          <p className="text-xs text-slate-500 font-medium">Lock down robust habits, maintain streaks, and trigger routines</p>
        </div>
      </div>

      {/* Add new habit */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-3 flex gap-2 items-center shadow-sm text-sm">
        <input 
          type="text" 
          placeholder="New daily habit choice..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          required
          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
        <button 
          type="submit"
          className="bg-gradient-to-tr from-teal-500 to-cyan-600 hover:opacity-95 text-white p-2.5 rounded-xl flex items-center justify-center font-bold active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Test reminder card */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between shadow-sm text-xs text-slate-700">
        <div>
          <h4 className="font-bold text-amber-800">Habit Alert Verification</h4>
          <p className="text-[10px] text-slate-500 mt-0.5">Tests the Web Notification system (by simulating 8:00 PM status)</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && "Notification" in window) {
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  const todayStr = new Date().toLocaleDateString("sv");
                  const incomplete = habits.filter(h => !h.completedDates.includes(todayStr));
                  if (incomplete.length > 0) {
                    new Notification("Habit Reminder (Simulated)", {
                      body: `You still have ${incomplete.length} pending habits to complete today! Log them now.`,
                      icon: "/favicon.ico"
                    });
                  } else {
                    new Notification("Habit Reminder (Simulated)", {
                      body: "All habits completed for today! Keep up the brilliant work.",
                      icon: "/favicon.ico"
                    });
                  }
                } else {
                  alert("Please authorize browser notifications first!");
                }
              });
            }
          }}
          className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2.5 py-1.5 rounded-xl transition-all border border-amber-300 text-[10.5px] cursor-pointer"
        >
          Simulate Alert
        </button>
      </div>

      {/* 30-Day Heatmap & Analytics Block */}
      <div className={`border rounded-2xl p-4 space-y-4 shadow-sm ${
        isCircadian 
          ? "bg-[#0b120f] border-emerald-950/60" 
          : "bg-white border-slate-150"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-500 animate-pulse" />
            <h3 className={`text-xs font-mono font-black uppercase tracking-wider ${
              isCircadian ? "text-emerald-400" : "text-slate-800"
            }`}>
              30-Day Habits Heatmap &amp; Analytics
            </h3>
          </div>
          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
            isCircadian 
              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
              : "bg-slate-50 border-slate-150 text-slate-500"
          }`}>
            Frequencies Mapping
          </span>
        </div>

        {/* Aggregate statistics row */}
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isCircadian 
              ? "bg-[#070b09] border-emerald-950/50" 
              : "bg-slate-50 border-slate-150"
          }`}>
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wide">Current Streak</span>
            <div className="flex items-baseline gap-1 mt-1">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
              <span className={`text-lg font-mono font-black ${isCircadian ? "text-emerald-400" : "text-slate-850"}`}>
                {heatmapStats.currentStreak}d
              </span>
            </div>
            <span className="text-[7.5px] text-slate-400 font-semibold block mt-1">Day completions</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isCircadian 
              ? "bg-[#070b09] border-emerald-950/50" 
              : "bg-slate-50 border-slate-150"
          }`}>
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wide">Max Streak (30d)</span>
            <div className="flex items-baseline gap-1 mt-1 font-bold">
              <Award className="w-4 h-4 text-yellow-500 shrink-0" />
              <span className={`text-lg font-mono font-black ${isCircadian ? "text-emerald-400" : "text-slate-850"}`}>
                {heatmapStats.maxStreak}d
              </span>
            </div>
            <span className="text-[7.5px] text-slate-400 font-semibold block mt-1 font-sans">Record level</span>
          </div>

          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isCircadian 
              ? "bg-[#070b09] border-emerald-950/50" 
              : "bg-slate-50 border-slate-150"
          }`}>
            <span className="text-[8px] font-bold text-slate-400 block uppercase tracking-wide">Frequency Rate</span>
            <div className="flex items-baseline gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-cyan-500 shrink-0" />
              <span className={`text-lg font-mono font-black ${isCircadian ? "text-emerald-400" : "text-slate-850"}`}>
                {heatmapStats.consistency}%
              </span>
            </div>
            <span className="text-[7.5px] text-slate-400 font-semibold block mt-1">Total consistency</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className={`p-3 rounded-xl border ${
          isCircadian 
            ? "bg-[#070b09] border-emerald-950/50" 
            : "bg-slate-50 border-slate-150"
        }`}>
          <div className="flex justify-between items-center text-[8px] font-bold font-mono text-slate-400 mb-2.5">
            <span>30 DAYS AGO</span>
            <span>TODAY</span>
          </div>

          {/* Grid Container */}
          {habits.length === 0 ? (
            <p className="text-center text-[10px] text-slate-400 py-4 italic font-sans font-medium">Declared habits are empty. Add a habit choice below to load frequency heatmap.</p>
          ) : (
            <div className="flex flex-wrap gap-[5px] items-center justify-between py-1">
              {last30Days.map(date => {
                const info = getDayIntensityInfo(date);
                const styleClass = isCircadian 
                  ? intensityStylesCircadian[info.level] 
                  : intensityStylesLight[info.level];

                return (
                  <div
                    key={date}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] border ${styleClass} transition-all duration-150 cursor-pointer relative`}
                    onMouseEnter={() => setHoveredGlobalDay({
                      date,
                      completedCount: info.completedCount,
                      totalCount: info.totalCount || 0,
                      percent: info.percent
                    })}
                    onMouseLeave={() => setHoveredGlobalDay(null)}
                  />
                );
              })}
            </div>
          )}

          {/* Legend row */}
          {habits.length > 0 && (
            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100 dark:border-emerald-950/30">
              {/* Dynamic hover details */}
              <div className="h-4 flex items-center justify-start text-[8.5px] font-mono text-slate-400">
                {hoveredGlobalDay ? (
                  <span className="bg-white dark:bg-[#0b120f] px-2 py-0.5 rounded border border-slate-200/40 dark:border-emerald-950 flex items-center gap-1.5 select-none animate-in fade-in duration-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-emerald-400" />
                    <strong>{new Date(hoveredGlobalDay.date).toLocaleDateString(undefined, {month: "short", day: "numeric"})}</strong>:
                    <span>{hoveredGlobalDay.completedCount}/{hoveredGlobalDay.totalCount} completed ({hoveredGlobalDay.percent}%)</span>
                  </span>
                ) : (
                  <span className="text-[7.5px] italic text-slate-400 select-none flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-500 inline" /> Hover over tiles to explore daily completion percent
                  </span>
                )}
              </div>

              {/* Intensity Scale Keys */}
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-mono text-slate-400 uppercase font-black mr-1">Less</span>
                {[0, 1, 2, 3, 4].map(level => {
                  const demoClass = isCircadian 
                    ? intensityStylesCircadian[level] 
                    : intensityStylesLight[level];
                  return (
                    <div 
                      key={level} 
                      className={`w-2.5 h-2.5 rounded-[2px] border ${demoClass}`} 
                      title={`Level ${level}`}
                    />
                  );
                })}
                <span className="text-[7px] font-mono text-slate-400 uppercase font-black ml-1">More</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">YOUR DECLARED HABITS</span>

        <div className="space-y-3">
          {habits.length === 0 ? (
            <p className={`text-xs text-center py-6 border rounded-2xl italic ${isCircadian ? "bg-[#0b120f] border-emerald-950 text-slate-500" : "bg-slate-50 border-slate-150 text-slate-400"}`}>Create robust habits to start tracking.</p>
          ) : (
            habits.map(habit => {
              const isDoneToday = habit.completedDates.includes(todayStr);

              return (
                <div 
                  key={habit.id} 
                  className={`border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all duration-305 ${
                    isCircadian 
                      ? "bg-[#0e1411] border-emerald-950/60 hover:border-emerald-800/40" 
                      : "bg-white border-slate-150 hover:border-slate-350"
                  }`}
                >
                  {/* Top: Details & Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2.5 items-center">
                      <button
                        onClick={() => toggleHabitDate(habit.id, todayStr)}
                        className={`w-6.5 h-6.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                          isDoneToday 
                            ? (isCircadian ? "bg-emerald-500 border-emerald-600 text-[#0c1612] scale-105 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-teal-500 border-teal-600 text-white scale-105 shadow-sm")
                            : (isCircadian ? "border-emerald-900 bg-[#070b09] hover:border-emerald-600 text-emerald-800" : "border-slate-300 bg-white hover:border-teal-500 text-slate-300")
                        }`}
                        title="Tick today?"
                      >
                        {isDoneToday && <CheckCircle className={`w-4 h-4 ${isCircadian ? "text-slate-900" : "text-white"}`} />}
                      </button>

                      <div className="text-left">
                        <h4 className={`text-xs font-black ${
                          isDoneToday 
                            ? 'line-through text-slate-450' 
                            : (isCircadian ? 'text-emerald-100' : 'text-slate-800')
                        }`}>
                          {habit.name}
                        </h4>
                        <p className={`text-[9.5px] font-semibold ${isCircadian ? "text-emerald-600/80" : "text-slate-450"}`}>
                          Completions: <span className="font-mono">{habit.completedDates.length}</span> total logs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 border rounded-full px-2 py-0.5 ${
                        isCircadian 
                          ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
                          : "bg-slate-50 border-slate-150 text-slate-700"
                      }`}>
                        <Flame className={`w-3 h-3 ${habit.streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-450"}`} />
                        <span className="text-[9.5px] font-black font-mono leading-none">{habit.streak}d streak</span>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Do you wish to delete habit "${habit.name}"? This will erase all historic completion logs.`)) {
                            deleteHabit(habit.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remove Habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className={`border-t ${isCircadian ? "border-emerald-950/50" : "border-slate-100"}`} />

                  {/* Bottom: The GitHub-Style Habit Grid */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-[8.5px] font-bold uppercase tracking-wider font-mono text-slate-400">
                      <span>30-Day Completion Matrix</span>
                      <span className="text-[7.5px] font-semibold text-slate-450 text-right">Lately →</span>
                    </div>

                    {/* Matrix blocks flex timeline */}
                    <div className="flex flex-wrap gap-1.5 items-center justify-between bg-slate-50/40 dark:bg-emerald-950/5 p-1.5 border border-slate-100/50 dark:border-emerald-950/20 rounded-xl">
                      {last30Days.map(date => {
                        const isCompleted = habit.completedDates.includes(date);
                        const isHovered = hoveredDay?.habitId === habit.id && hoveredDay?.date === date;

                        return (
                          <div
                            key={date}
                            onMouseEnter={() => setHoveredDay({ habitId: habit.id, date, isCompleted })}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[3px] transition-all cursor-pointer relative ${
                              isCompleted
                                ? (isCircadian 
                                    ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)] scale-102" 
                                    : "bg-teal-500 shadow-[0_0_4px_rgba(20,184,166,0.3)] scale-102")
                                : (isCircadian
                                    ? "bg-[#070b09] border border-emerald-950 hover:bg-emerald-950/30"
                                    : "bg-slate-100 border border-slate-200/50 hover:bg-slate-200/80")
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Interactive hover tooltip display */}
                    <div className="h-4 flex items-center justify-start text-[8.5px] font-mono font-medium text-slate-400">
                      {hoveredDay?.habitId === habit.id ? (
                        <span className="bg-slate-100 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-slate-200/50 dark:border-emerald-900/10 flex items-center gap-1 select-none animate-in fade-in duration-100">
                          <span className={`w-1 h-1 rounded-full ${hoveredDay.isCompleted ? "bg-emerald-400" : "bg-slate-400"}`} />
                          {new Date(hoveredDay.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                          <span className="mx-0.5">•</span>
                          <span className={hoveredDay.isCompleted ? "text-emerald-400 font-extrabold" : "text-slate-500"}>
                            {hoveredDay.isCompleted ? "ACHIEVED ✨" : "PENDING 🛡️"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[7.5px] italic text-slate-400 select-none">Hover over dots to review calendar completion logs</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
