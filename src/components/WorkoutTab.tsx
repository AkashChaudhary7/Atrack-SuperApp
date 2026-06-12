import React, { useState, useMemo } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, Dumbbell, Award, Sparkles, TrendingUp, Zap, Target } from "lucide-react";
import { motion } from "motion/react";

export const WorkoutTab: React.FC = () => {
  const { workouts, addWorkout, deleteWorkout, weightRecords, isCircadian } = useApp();
  const [type, setType] = useState<"Squat" | "Kegel">("Squat");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("3");
  const [weight, setWeight] = useState(""); // working weight for Squat
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reps && parseInt(reps) > 0) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(100);
      }
      addWorkout({
        type,
        reps: parseInt(reps),
        sets: parseInt(sets) || 3,
        date,
        weight: type === "Squat" && weight ? parseFloat(weight) : undefined
      });
      setReps("");
      setWeight("");
    }
  };

  // Performance calculations
  const totalSquatReps = workouts.filter(w => w.type === "Squat").reduce((sum, item) => sum + (item.reps * item.sets), 0);
  const totalKegelReps = workouts.filter(w => w.type === "Kegel").reduce((sum, item) => sum + (item.reps * item.sets), 0);

  // Progressive Overload Coach Computations
  const coachData = useMemo(() => {
    const squatLogs = workouts.filter(w => w.type === "Squat");
    if (squatLogs.length === 0) return null;

    // Get latest bodyweight (defaults to 70 if no records found)
    const latestBodyweight = weightRecords.length > 0 ? weightRecords[0].weight : 70;
    // For bodyweight squats, equivalent load is estimated at 60% of body weight
    const bodyweightLoadEquiv = latestBodyweight * 0.6;

    // Calculate maximum estimated 1-Rep Max capability (1RM = load * (1 + reps/30))
    let maxOneRepMax = 0;
    let maxOneRepMaxWeighted = false;

    squatLogs.forEach(log => {
      const load = log.weight && log.weight > 0 ? log.weight : bodyweightLoadEquiv;
      const oneRepMax = load * (1 + log.reps / 30);
      if (oneRepMax > maxOneRepMax) {
        maxOneRepMax = oneRepMax;
        maxOneRepMaxWeighted = !!(log.weight && log.weight > 0);
      }
    });

    // Extract stats of the most recent squat session
    const latestLog = squatLogs[0]; // sorted reverse-chronologically in AppContext
    const lastSets = latestLog ? latestLog.sets : 3;
    const lastReps = latestLog ? latestLog.reps : 10;
    const lastWeight = latestLog && latestLog.weight ? latestLog.weight : 0;

    // Construct scientifically grounded progression suggestions
    const volumeProgression = {
      targetSets: lastSets,
      targetReps: lastReps + 1,
      targetWeight: lastWeight,
      description: `Maintain current load at ${lastWeight > 0 ? `${lastWeight} kg` : "bodyweight"} but push your reps per set from ${lastReps} to ${lastReps + 1}. This builds myofibrillar endurance.`
    };

    const loadProgression = {
      targetSets: lastSets,
      targetReps: Math.max(5, lastReps - 2),
      targetWeight: lastWeight > 0 ? Math.round(lastWeight * 1.05) : Math.round(bodyweightLoadEquiv * 1.05),
      description: lastWeight > 0
        ? `Overload stimulus: Increase working weight by +5% to ${Math.round(lastWeight * 1.05)} kg, lowering target reps down to ${Math.max(5, lastReps - 2)} to adapt neuromuscular drive.`
        : `Simulate load: Intentionally perform slower 4-second negatives, or use a loaded dumbbell/backpack with an estimated +5% burden (${Math.round(bodyweightLoadEquiv * 0.05)} kg).`
    };

    const densityProgression = {
      targetSets: lastSets + 1,
      targetReps: lastReps,
      targetWeight: lastWeight,
      description: `Complete an additional working set (from ${lastSets} to ${lastSets + 1} sets of ${lastReps} reps). This increases overall weekly tonnage by +33% for systemic stamina.`
    };

    return {
      maxOneRepMax,
      maxOneRepMaxWeighted,
      latestBodyweight,
      bodyweightLoadEquiv,
      volumeProgression,
      loadProgression,
      densityProgression,
      latestLog
    };
  }, [workouts, weightRecords]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white">
          <Dumbbell className="w-5 h-5 animate-bounce" style={{ animationDuration: "3s" }} />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 dark:text-emerald-400 uppercase tracking-tight">Stamina Workout Tracker</h2>
          <p className="text-xs text-slate-500 dark:text-emerald-500 font-medium">Boost physical stamina, pelvic floor performance, and progressive overload</p>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#0c1811] dark:border-emerald-950 border border-slate-150 rounded-2xl p-4 shadow-sm text-slate-800 dark:text-emerald-300">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase block">TOTAL SQUAT WORKOUTS</span>
          <div className="text-xl font-mono font-black text-cyan-600 dark:text-emerald-400">{totalSquatReps} Reps</div>
          <p className="text-[9px] text-slate-400 dark:text-emerald-500 font-semibold">Improves systemic blood flow</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase block">TOTAL PELVIC KEGELS</span>
          <div className="text-xl font-mono font-black text-pink-500 dark:text-rose-400">{totalKegelReps} Reps</div>
          <p className="text-[9px] text-slate-400 dark:text-emerald-500 font-semibold">Pelvic floor performance &amp; control</p>
        </div>
      </div>

      {/* Progressive Overload Coach Card */}
      {coachData ? (
        <div className="bg-gradient-to-br from-[#111827] to-[#1f2937] dark:from-[#06120a] dark:to-[#0c1e12] border border-slate-800 dark:border-emerald-950 text-slate-200 rounded-2xl p-4.5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h4 className="text-xs font-mono font-extrabold uppercase tracking-widest text-cyan-400">Progressive Overload Coach</h4>
            </div>
            <span className="text-[8px] bg-slate-800 border border-cyan-800 text-cyan-400 font-mono font-black px-2 py-0.5 rounded-md uppercase">
              1-RM capability
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3.5 items-center pb-1">
            <div className="col-span-2 text-center border-r border-slate-700/60 pr-2">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono font-bold block">1-REP MAX (1RM)</span>
              <div className="text-2xl font-mono font-black text-cyan-400">
                {Math.round(coachData.maxOneRepMax)} <span className="text-xs font-sans text-slate-400">kg</span>
              </div>
              <span className="text-[7.5px] text-slate-400 font-semibold leading-tight block mt-1">
                {coachData.maxOneRepMaxWeighted ? "✓ Loaded log capacity" : `* Est. bodyweight load (${Math.round(coachData.bodyweightLoadEquiv)}kg)`}
              </span>
            </div>

            <div className="col-span-3 text-left space-y-1 pl-1">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Latest baseline</span>
              <div className="text-xs font-black text-slate-200">
                {coachData.latestLog ? (
                  <>
                    {coachData.latestLog.sets} sets &times; {coachData.latestLog.reps} reps 
                    {coachData.latestLog.weight && coachData.latestLog.weight > 0 ? ` @ ${coachData.latestLog.weight}kg` : " (Bodyweight)"}
                  </>
                ) : (
                  "No initial squat sessions logged."
                )}
              </div>
              <p className="text-[8.5px] text-slate-400 leading-tight">
                Overload suggests targets designed to systematically break through physical stamina plateaus safely.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Tailored Progression Pathways</span>

            <div className="space-y-2">
              {/* volume pathway */}
              <div className="bg-[#1e293b]/70 dark:bg-emerald-990/40 p-2.5 rounded-xl border border-slate-700/40 dark:border-emerald-950/60 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] font-mono">
                  <TrendingUp className="w-3.5 h-3.5" /> VOLUME OVERLOAD (Accumulation)
                </div>
                <p className="text-[8.5px] text-slate-300 leading-normal font-medium pl-5">{coachData.volumeProgression.description}</p>
                <div className="text-[8px] text-cyan-300 font-mono font-bold pl-5 leading-none mt-1">
                  Target Workload: {coachData.volumeProgression.targetSets} sets &times; {coachData.volumeProgression.targetReps} reps
                </div>
              </div>

              {/* load pathway */}
              <div className="bg-[#1e293b]/70 dark:bg-emerald-990/40 p-2.5 rounded-xl border border-slate-700/40 dark:border-emerald-950/60 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] font-mono">
                  <Zap className="w-3.5 h-3.5" /> LOAD OVERLOAD (Intensification)
                </div>
                <p className="text-[8.5px] text-slate-300 leading-normal font-medium pl-5">{coachData.loadProgression.description}</p>
                <div className="text-[8px] text-cyan-300 font-mono font-bold pl-5 leading-none mt-1">
                  Target Workload: {coachData.loadProgression.targetSets} sets &times; {coachData.loadProgression.targetReps} reps @ {coachData.loadProgression.targetWeight} kg
                </div>
              </div>

              {/* density pathway */}
              <div className="bg-[#1e293b]/70 dark:bg-emerald-990/40 p-2.5 rounded-xl border border-slate-700/40 dark:border-emerald-950/60 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] font-mono">
                  <Target className="w-3.5 h-3.5" /> TONNAGE OVERLOAD (Density)
                </div>
                <p className="text-[8.5px] text-slate-300 leading-normal font-medium pl-5">{coachData.densityProgression.description}</p>
                <div className="text-[8px] text-cyan-300 font-mono font-bold pl-5 leading-none mt-1">
                  Target Workload: {coachData.densityProgression.targetSets} sets &times; {coachData.densityProgression.targetReps} reps
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-emerald-950/20 border border-slate-150 rounded-2xl p-4.5 flex items-start gap-3">
          <Sparkles className="w-4.5 h-4.5 text-cyan-500 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-emerald-400">Unlock Overload Coach</h4>
            <p className="text-[10px] text-slate-500 dark:text-emerald-500 leading-relaxed font-sans">
              Log at least 1 Squat workout today to unlock automatic 1-Rep Max calculations and scientific progression recommendations designed by the coach.
            </p>
          </div>
        </div>
      )}

      {/* Workout creation form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-[#0c1811] dark:border-emerald-950 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
        <h3 className="font-extrabold text-slate-755 dark:text-emerald-400 text-xs font-mono uppercase tracking-wider block">Register Today&apos;s Workout</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Exercise Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-indigo-500/50"
            >
              <option value="Squat" className="text-slate-800 dark:text-emerald-400 bg-white dark:bg-black">Squat (Stamina)</option>
              <option value="Kegel" className="text-slate-800 dark:text-emerald-400 bg-white dark:bg-black">Kegel (Pelvic Floor)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Date Logged</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Reps Per Set</label>
            <input 
              type="number" 
              placeholder="e.g. 15 or 30"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-2 text-slate-850 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Total Sets</label>
            <input 
              type="number" 
              placeholder="3"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-2 text-slate-850 text-xs focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {type === "Squat" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1">
            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase tracking-wider font-mono">Weight load (optional, kg / empty for bodyweight)</label>
            <input 
              type="number" 
              placeholder="e.g., 20 or 50"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-white dark:bg-black dark:text-emerald-400 border border-slate-200 dark:border-emerald-950 rounded-xl px-3 py-2 text-slate-800 dark:text-emerald-300 text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
          </motion.div>
        )}

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Save Workout
        </button>
      </form>

      {/* Historic Logs list */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">ACTIVITY HISTORY</span>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {workouts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 dark:bg-emerald-950/20 border border-slate-150 rounded-2xl italic">No workouts completed yet.</p>
          ) : (
            workouts.map(wk => (
              <div key={wk.id} className="bg-white dark:bg-[#0a0f0d] dark:border-emerald-950 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs shadow-sm">
                <div className="flex gap-2.5 items-center">
                  <div className={`p-1.5 rounded-md ${wk.type === "Squat" ? "bg-cyan-50 dark:bg-emerald-950 text-cyan-600 dark:text-emerald-400" : "bg-pink-50 dark:bg-pink-950 text-pink-600 dark:text-pink-400"}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-850 dark:text-emerald-300">{wk.type} Session</h4>
                    <span className="text-[9px] text-slate-500 dark:text-emerald-500 font-semibold font-mono">{wk.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right leading-tight">
                    <span className="font-mono font-bold text-slate-700 dark:text-emerald-400 block">{wk.sets} sets &times; {wk.reps} reps</span>
                    {wk.type === "Squat" && (
                      <span className="text-[8px] text-slate-450 dark:text-emerald-500 font-semibold uppercase font-mono block">
                        {wk.weight && wk.weight > 0 ? `${wk.weight} kg load` : "bodyweight"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteWorkout(wk.id)}
                    className="text-slate-440 hover:text-rose-600 p-1 cursor-pointer"
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
