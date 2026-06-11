import React, { useState } from "react";
import { useApp } from "../AppContext";
import { TrendingUp, Activity, Sparkles } from "lucide-react";

export const PerformanceTab: React.FC = () => {
  const { jerkOffLogs, setJerkOffCount } = useApp();
  
  const [joDate, setJoDate] = useState(new Date().toISOString().split("T")[0]);

  // Safe checks for selected date jerk stats
  const activeLog = jerkOffLogs.find(l => l.date === joDate);
  const currentCount = activeLog ? activeLog.count : 0;
  const currentSessions = activeLog ? (activeLog.sessions !== undefined ? activeLog.sessions : activeLog.count) : 0;

  const handleIncrementCount = (amount: number) => {
    const nextVal = Math.max(0, currentCount + amount);
    setJerkOffCount(joDate, nextVal, currentSessions);
  };

  const handleIncrementSessions = (amount: number) => {
    const nextVal = Math.max(0, currentSessions + amount);
    setJerkOffCount(joDate, currentCount, nextVal);
  };

  // Real-time synced totals
  const totalSessionsAllTime = jerkOffLogs.reduce((sum, item) => sum + (item.sessions !== undefined ? item.sessions : item.count), 0);
  const totalJerkedAllTime = jerkOffLogs.reduce((sum, item) => sum + item.count, 0);

  // Calculate Streak of no Daily Fap / Jerk-off
  const fapFreeStreak = () => {
    let streak = 0;
    const check = new Date();
    for (let i = 0; i < 30; i++) {
      const checkStr = check.toISOString().split("T")[0];
      const match = jerkOffLogs.find(l => l.date === checkStr);
      if (!match || match.count === 0) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-xl text-white shadow-md shadow-rose-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase">Retention Tracker</h2>
            <p className="text-[11px] text-slate-500 font-medium">Monitor physical wellness, self-discipline and semen retention streaks</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Fap Control Console */}
        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
              Increment Your Day Logs
            </h3>
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-mono font-bold border border-rose-100 uppercase animate-pulse">
              Real-Time Synced
            </span>
          </div>

          <div className="space-y-4">
            {/* Select log Date */}
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Logger Calendar Date</label>
              <input 
                type="date" 
                value={joDate}
                onChange={(e) => setJoDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-rose-300"
              />
            </div>

            {/* Dual Counter Increments */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* 1. Track Sessions */}
              <div className="bg-white p-3 border border-slate-150 rounded-xl space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center font-mono">Sessions Today</span>
                <div className="flex items-center justify-between gap-1">
                  <button 
                    onClick={() => handleIncrementSessions(-1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors active:scale-95 cursor-pointer flex items-center justify-center select-none"
                  >
                    －
                  </button>
                  <span className="font-mono text-lg font-black text-slate-800">{currentSessions}</span>
                  <button 
                    onClick={() => handleIncrementSessions(1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors active:scale-95 cursor-pointer flex items-center justify-center select-none"
                  >
                    ＋
                  </button>
                </div>
              </div>

              {/* 2. Track Releases / Jerk count */}
              <div className="bg-white p-3 border border-slate-150 rounded-xl space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center font-mono">Times Jerked</span>
                <div className="flex items-center justify-between gap-1">
                  <button 
                    onClick={() => handleIncrementCount(-1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors active:scale-95 cursor-pointer flex items-center justify-center select-none"
                  >
                    －
                  </button>
                  <span className="font-mono text-lg font-black text-slate-800">{currentCount}</span>
                  <button 
                    onClick={() => handleIncrementCount(1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors active:scale-95 cursor-pointer flex items-center justify-center select-none"
                  >
                    ＋
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Summary Display inside logger card */}
          <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-center">
            <div>
              <span className="text-[9px] font-mono text-slate-450 block font-semibold uppercase">Total Sessions</span>
              <span className="text-base font-mono font-black text-indigo-650 text-indigo-600 block mt-0.5">{totalSessionsAllTime}</span>
            </div>
            <div className="border-l border-slate-150">
              <span className="text-[9px] font-mono text-slate-450 block font-semibold uppercase">Total Release Count</span>
              <span className="text-base font-mono font-black text-rose-650 text-rose-600 block mt-0.5">{totalJerkedAllTime}</span>
            </div>
          </div>
        </div>

        {/* Retention streak statistics */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Semen Retention Streak</h4>
              <p className="text-[10px] text-slate-500 font-medium">Reboot progression state</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono font-black text-xl text-emerald-600">{fapFreeStreak()} Days</span>
          </div>
        </div>

        {/* Recent History Table */}
        <div className="bg-slate-51 col bg-white border border-slate-150 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between pb-3.5 mb-2.5 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">WEEKLY HISTORIC ARCHIVE</span>
            <span className="text-[9px] font-sans text-slate-400 font-semibold italic">Showing last 7 updates</span>
          </div>

          <div className="space-y-2">
            {jerkOffLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">Semen retention spotless. Go champion!</p>
            ) : (
              [...jerkOffLogs]
                .sort((a,b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-2 px-1 hover:bg-slate-50 rounded-xl transition-colors border-b border-dashed border-slate-100 last:border-0">
                    <span className="font-mono font-bold text-slate-600">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.sessions !== undefined ? `${item.sessions} sessions` : `${item.count} sessions`} / {item.count} jerks
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase font-mono border ${
                        item.count === 0 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {item.count === 0 ? "Clean Day" : "Logged"}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
