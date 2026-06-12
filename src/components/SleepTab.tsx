import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, Moon, Sun, Zap, TrendingUp, Sparkles, Award } from "lucide-react";
import { motion } from "motion/react";

export const SleepTab: React.FC = () => {
  const { sleepLogs, addSleepLog, deleteSleepLog, studySessions, isCircadian } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("7.5");
  const [efficiency, setEfficiency] = useState("85");
  const [wakeUpTime, setWakeUpTime] = useState("06:30");
  const [energy, setEnergy] = useState("7");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(duration) > 0 && parseInt(efficiency) > 0) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100);
      }
      addSleepLog({
        date,
        sleepDuration: parseFloat(duration),
        sleepScore: parseInt(efficiency),
        wakeUpTime,
        energyLevel: parseInt(energy),
        notes: notes.trim() || undefined,
      });
      setNotes("");
    }
  };

  // 1. Core Sleep Stats
  const stats = useMemo(() => {
    if (sleepLogs.length === 0) {
      return { avgDuration: 0, avgScore: 0, avgEnergy: 0, sleepDebt: 0, consistencyScore: 100 };
    }
    const sumDuration = sleepLogs.reduce((sum, item) => sum + item.sleepDuration, 0);
    const sumScore = sleepLogs.reduce((sum, item) => sum + item.sleepScore, 0);
    const sumEnergy = sleepLogs.reduce((sum, item) => sum + item.energyLevel, 0);

    const avgDuration = sumDuration / sleepLogs.length;
    const avgScore = sumScore / sleepLogs.length;
    const avgEnergy = sumEnergy / sleepLogs.length;

    // Calculate sleep debt against a standard of 8 hours per day
    const idealHours = 8;
    const totalIdeal = sleepLogs.length * idealHours;
    const totalSlept = sumDuration;
    const sleepDebt = Math.max(0, totalIdeal - totalSlept);

    // Calculate wake-up consistency
    // Simple consistency scoring: parse each HH:MM wakeUp into minutes from midnight
    const wakeMinutes = sleepLogs.map(log => {
      const [h, m] = log.wakeUpTime.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    });
    const avgMinutes = wakeMinutes.reduce((a, b) => a + b, 0) / wakeMinutes.length;
    const variance = wakeMinutes.reduce((acc, val) => acc + Math.pow(val - avgMinutes, 2), 0) / wakeMinutes.length;
    const stdDev = Math.sqrt(variance); // variance in minutes
    // Score out of 100 (decrease by 1.5 points for every minute of deviation above 15 mins)
    const consistencyScore = Math.max(30, Math.min(100, Math.round(100 - Math.max(0, stdDev - 15) * 1.2)));

    return { avgDuration, avgScore, avgEnergy, sleepDebt, consistencyScore };
  }, [sleepLogs]);

  // 2. Correlation of Sleep Duration vs. Study Focus (Focus stats)
  const correlationData = useMemo(() => {
    // Collect last 10 days of sleep entries, sorted chronologically
    const sortedSleep = [...sleepLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    return sortedSleep.map(sleep => {
      // Find sum of study sessions corresponding to this sleep date
      const daysStudy = studySessions
        .filter(s => s.date === sleep.date)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      return {
        date: sleep.date,
        sleepHours: sleep.sleepDuration,
        sleepScore: sleep.sleepScore,
        focusMins: daysStudy,
        energy: sleep.energyLevel,
      };
    });
  }, [sleepLogs, studySessions]);

  // Dynamic Insight generation
  const correlationInsight = useMemo(() => {
    if (sleepLogs.length === 0) return "Add your sleep logs to map focus correlations.";
    
    // Bin sleep durations: Low Sleep (< 7h) vs. High Sleep (>= 7h)
    const shortSleepDays = sleepLogs.filter(s => s.sleepDuration < 7);
    const healthySleepDays = sleepLogs.filter(s => s.sleepDuration >= 7);

    const calcAvgFocus = (sleepRecords: typeof sleepLogs) => {
      if (sleepRecords.length === 0) return 0;
      let totalFocus = 0;
      sleepRecords.forEach(rec => {
        const matchingFocus = studySessions
          .filter(s => s.date === rec.date)
          .reduce((sum, s) => sum + s.durationMinutes, 0);
        totalFocus += matchingFocus;
      });
      return totalFocus / sleepRecords.length;
    };

    const avgFocusShort = calcAvgFocus(shortSleepDays);
    const avgFocusHealthy = calcAvgFocus(healthySleepDays);

    if (healthySleepDays.length === 0) {
      return "Log a sleep session of 7.0+ hours to see how it shapes your focus state.";
    }
    if (shortSleepDays.length === 0) {
      return "Fantastic discipline! Your sleep is consistently above 7.0 hours. You're operating in peak focus efficiency.";
    }

    const diff = Math.round(avgFocusHealthy - avgFocusShort);
    if (diff > 0) {
      return `Positive Correlation: Waking up with 7.0+ hours of sleep results in +${diff} mins average daily focus time compared to short sleep days.`;
    } else if (diff < 0) {
      return "Stable Energy Curve: Focus durations are consistent. Ensure sleep score stays above 80% to protect cognitive reserve.";
    } else {
      return "Baseline established. Keep logging both sleep and focus intervals to trace fine-grained correlations.";
    }
  }, [sleepLogs, studySessions]);

  // Circadian Schedule Coach Prediction
  const circadianSchedule = useMemo(() => {
    if (sleepLogs.length === 0) {
      return { peak: "09:00 AM", slump: "02:00 PM", wind: "06:00 PM", bedtime: "10:30 PM" };
    }
    // Read the most recent wakeUpTime
    const latestSleep = [...sleepLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
    const [h, m] = latestSleep.wakeUpTime.split(":").map(Number);
    
    // Helper to calculate time offsets and format to HH:MM AM/PM
    const formatOffset = (hoursToAdd: number) => {
      let targetH = (h + hoursToAdd) % 24;
      const ampm = targetH >= 12 ? "PM" : "AM";
      const displayH = targetH % 12 === 0 ? 12 : targetH % 12;
      const displayM = m < 10 ? `0${m}` : m;
      return `${displayH}:${displayM} ${ampm}`;
    };

    return {
      peak: formatOffset(3),       // 3 hours after wake up
      slump: formatOffset(7.5),    // 7.5 hours after wake up
      wind: formatOffset(11),      // 11 hours after wake up
      bedtime: formatOffset(15.5),  // 15.5 hours after wake up
    };
  }, [sleepLogs]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header section */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-xl text-white">
          <Moon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 dark:text-emerald-400 uppercase tracking-tight">Circadian &amp; Sleep Tracker</h2>
          <p className="text-xs text-slate-500 dark:text-emerald-500 font-medium font-sans">Map resting states, wake cycles, energy peaks, and study focus</p>
        </div>
      </div>

      {/* Analytics Card Group (Efficiency metrics & Sleep Debt) */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-slate-50 dark:bg-[#0c1811] dark:border-emerald-950 border border-slate-150 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] text-slate-400 font-bold tracking-wide uppercase font-mono block">Sleep Efficiency</span>
          <div className="text-lg font-mono font-black text-violet-600 dark:text-emerald-400">{stats.avgScore.toFixed(0)}% Score</div>
          <span className="text-[9px] text-slate-500 block font-semibold">Wake-Up consistency: {stats.consistencyScore}%</span>
        </div>

        <div className="bg-slate-50 dark:bg-[#0c1811] dark:border-emerald-950 border border-slate-150 rounded-2xl p-4 space-y-1">
          <span className="text-[9px] text-slate-400 font-bold tracking-wide uppercase font-mono block">Sleep Debt (Ideal 8h)</span>
          <div className="text-lg font-mono font-black text-[#f43f5e] dark:text-rose-400">{stats.sleepDebt.toFixed(1)} hrs</div>
          <span className="text-[9px] text-slate-500 block font-semibold">Avg rest: {stats.avgDuration.toFixed(1)} hrs/night</span>
        </div>
      </div>

      {/* Sleep Duration vs Study Focus Minutes Correlation Chart (SVG-based) */}
      <div className="bg-white dark:bg-[#0a0f0d] dark:border-emerald-950 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 dark:text-emerald-300 uppercase tracking-wider text-[10px]">Dual Focus Correlation Curve</span>
          <span className="text-[9px] bg-indigo-50 dark:bg-emerald-950/40 text-indigo-600 dark:text-emerald-400 border border-indigo-100 dark:border-emerald-800 px-2 py-0.5 rounded-md font-mono font-black uppercase">
            Active mapping
          </span>
        </div>

        {correlationData.length > 1 ? (
          <div className="relative pt-2">
            {/* Custom SVG Line Chart */}
            <svg viewBox="0 0 400 160" className="w-full h-40 overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1="70" x2="380" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="30" y1="120" x2="380" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Render dynamic Bezier paths */}
              {(() => {
                const pointsCount = correlationData.length;
                const stepX = (380 - 30) / (pointsCount - 1 || 1);

                // Math bounds sleep (4h to 10h scale)
                const sMin = 4;
                const sMax = 10;
                const sRange = sMax - sMin;

                // Math bounds focus (0 to 180 mins scale, or max registered)
                const maxFocusVal = Math.max(120, ...correlationData.map(d => d.focusMins)) + 15;
                const fMax = maxFocusVal;
                const fMin = 0;
                const fRange = fMax - fMin;

                // Create path commands
                let sleepPath = "";
                let focusPath = "";

                correlationData.forEach((d, idx) => {
                  const x = 30 + idx * stepX;
                  
                  // Normalize Sleep Y (normalized 20 to 130)
                  const sleepNormY = 130 - ((d.sleepHours - sMin) / sRange) * 110;
                  const sY = Math.min(130, Math.max(20, sleepNormY));

                  // Normalize Focus Y (normalized 20 to 130)
                  const focusNormY = 130 - ((d.focusMins - fMin) / fRange) * 110;
                  const fY = Math.min(130, Math.max(20, focusNormY));

                  if (idx === 0) {
                    sleepPath = `M ${x} ${sY}`;
                    focusPath = `M ${x} ${fY}`;
                  } else {
                    sleepPath += ` L ${x} ${sY}`;
                    focusPath += ` L ${x} ${fY}`;
                  }
                });

                return (
                  <>
                    {/* Shadow fills under trails */}
                    <path d={`${sleepPath} L ${30 + (pointsCount - 1) * stepX} 130 L 30 130 Z`} fill="url(#sleepGlow)" opacity="0.1" />
                    <path d={`${focusPath} L ${30 + (pointsCount - 1) * stepX} 130 L 30 130 Z`} fill="url(#focusGlow)" opacity="0.1" />

                    {/* Glowing strokes */}
                    <path d={sleepPath} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]" />
                    <path d={focusPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_8px_rgba(6,182,212,0.3)]" />

                    {/* Data dots on Sleep path */}
                    {correlationData.map((d, idx) => {
                      const x = 30 + idx * stepX;
                      const sY = Math.min(130, Math.max(20, 130 - ((d.sleepHours - sMin) / sRange) * 110));
                      const fY = Math.min(130, Math.max(20, 130 - ((d.focusMins - fMin) / fRange) * 110));

                      return (
                        <g key={idx}>
                          {/* Sleep Node */}
                          <circle cx={x} cy={sY} r="4" fill="#ffffff" stroke="#8b5cf6" strokeWidth="2" />
                          {/* Focus Node */}
                          <circle cx={x} cy={fY} r="4" fill="#ffffff" stroke="#06b6d4" strokeWidth="2" />

                          {/* Chart Labels */}
                          <text x={x} y="148" textAnchor="middle" fontSize="7" fill="#64748b" className="font-mono">
                            {d.date.substring(5)}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}

              {/* Linear Gradient definitions for glowing charts */}
              <defs>
                <linearGradient id="sleepGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="focusGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Legend indicators */}
            <div className="flex justify-center gap-6 pt-2 text-[9px] font-mono font-bold">
              <span className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block"></span> Sleep Hours (Left Axis)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Study Focus Mins (Right Axis)
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-8 bg-slate-50 dark:bg-[#0c1811] dark:border-emerald-950 border border-slate-100 rounded-2xl">
            Sufficient data points not met. Log sleep &amp; study sessions on overlapping days to render interactive correlation trails.
          </p>
        )}

        {/* Dynamic correlation text insight */}
        <div className="bg-indigo-50/50 dark:bg-emerald-950/20 border border-indigo-100/40 dark:border-emerald-950 rounded-xl p-3 flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-semibold text-slate-700 dark:text-emerald-300 leading-relaxed font-sans">
            {correlationInsight}
          </p>
        </div>
      </div>

      {/* Circadian Schedule Predictor (Sleep Rhythm coach) */}
      <div className="bg-gradient-to-br from-[#0c0f1d] to-[#121528] dark:from-[#07130b] dark:to-[#040805] text-slate-300 rounded-2xl p-4.5 border border-[#1e2343] dark:border-emerald-950 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4.5 h-4.5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
            <h4 className="text-xs font-mono tracking-wider font-extrabold uppercase text-amber-400">Circadian Optimization Engine</h4>
          </div>
          <span className="text-[8px] bg-[#1e2343] border border-indigo-500/30 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded-md uppercase">
            Rhythm Coach
          </span>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-emerald-500/80 font-medium">
          Based on your last logged wake cycle, your body&apos;s natural energy and cognitive curves align to these specific diurnal milestones:
        </p>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-none">
          <div className="bg-[#15182a] dark:bg-[#08120c] p-3 rounded-xl border border-indigo-950 dark:border-emerald-950 space-y-1.5 shadow-sm">
            <span className="text-[8px] text-slate-500 uppercase block font-black">PEAK FOCUS HOUR</span>
            <span className="text-xs text-emerald-400 font-black block">{circadianSchedule.peak}</span>
            <p className="text-[7.5px] text-slate-400 leading-tight">Excellent for technical workouts and complex concepts</p>
          </div>

          <div className="bg-[#15182a] dark:bg-[#08120c] p-3 rounded-xl border border-indigo-950 dark:border-emerald-950 space-y-1.5 shadow-sm">
            <span className="text-[8px] text-slate-500 uppercase block font-black">POSTPRANDIAL SLUMP</span>
            <span className="text-xs text-amber-500 font-black block">{circadianSchedule.slump}</span>
            <p className="text-[7.5px] text-slate-400 leading-tight">Take a brisk 15m walk. Avoid large simple carb meals</p>
          </div>

          <div className="bg-[#15182a] dark:bg-[#08120c] p-3 rounded-xl border border-indigo-950 dark:border-emerald-950 space-y-1.5 shadow-sm">
            <span className="text-[8px] text-slate-500 uppercase block font-black">SECOND COGNITIVE WIND</span>
            <span className="text-xs text-[#38bdf8] font-black block">{circadianSchedule.wind}</span>
            <p className="text-[7.5px] text-slate-400 leading-tight">Peak physical strength; optimal squat session window</p>
          </div>

          <div className="bg-[#15182a] dark:bg-[#08120c] p-3 rounded-xl border border-indigo-950 dark:border-emerald-950 space-y-1.5 shadow-sm">
            <span className="text-[8px] text-slate-500 uppercase block font-black">MELATONIN ONSET</span>
            <span className="text-xs text-rose-400 font-black block">{circadianSchedule.bedtime}</span>
            <p className="text-[7.5px] text-slate-400 leading-tight">Shut down screens, cool down your room for restorative sleep</p>
          </div>
        </div>
      </div>

      {/* Sleep Log Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-[#0c1811] dark:border-emerald-950 border border-slate-150 rounded-2xl p-4.5 space-y-3.5 shadow-sm text-sm text-slate-800">
        <h3 className="font-extrabold text-[#111827] dark:text-emerald-400 text-xs uppercase tracking-wider font-mono">Register Resting Cycle</h3>

        <div className="grid grid-cols-2 gap-3 pb-1">
          <div>
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Rest duration (Hours)</label>
            <input 
              type="number" 
              step="0.1" 
              placeholder="e.g. 7.5 or 8.0"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono font-bold">Sleep Efficiency (%)</label>
            <input 
              type="number" 
              placeholder="e.g. 85"
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              required
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Wake-Up Time</label>
            <input 
              type="time" 
              value={wakeUpTime}
              onChange={(e) => setWakeUpTime(e.target.value)}
              required
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          <div className="col-span-1">
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Energy Cycle (1-10)</label>
            <select
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(v => (
                <option key={v} value={v} className="dark:text-emerald-400 text-slate-800">{v} / 10</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Calendar Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-2 py-1.5 text-[10px] text-slate-850 font-bold text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-[9px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Rhythm logger notes / feedback</label>
          <input 
            type="text" 
            placeholder="e.g. slept late, groggy wake up cycle, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none placeholder-slate-400"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow"
        >
          <Plus className="w-4 h-4" /> Save circadian sleep log
        </button>
      </form>

      {/* History log lists */}
      <div className="space-y-2">
        <span className="text-[9px] font-bold text-slate-400 tracking-wider font-mono uppercase block">Historic Sleep Logs</span>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {sleepLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 dark:bg-emerald-950/20 border border-slate-150 rounded-2xl">No sleep logs registered yet.</p>
          ) : (
            [...sleepLogs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(rec => (
                <div key={rec.id} className="bg-white dark:bg-[#0a0f0d] dark:border-emerald-950 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-amber-50 dark:bg-emerald-950 text-amber-500 dark:text-emerald-400">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-850 dark:text-emerald-300">Woke up at {rec.wakeUpTime}</h4>
                      <span className="text-[9px] text-slate-400 dark:text-emerald-500 font-semibold font-mono">{rec.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right leading-tight">
                      <span className="font-mono font-bold text-slate-700 dark:text-emerald-400 block">{rec.sleepDuration} hrs</span>
                      <span className="text-[8px] text-slate-400 dark:text-emerald-500 font-bold uppercase font-mono">energy {rec.energyLevel}/10</span>
                    </div>
                    <button
                      onClick={() => deleteSleepLog(rec.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};
