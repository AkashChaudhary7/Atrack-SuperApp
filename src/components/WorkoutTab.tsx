import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, Dumbbell, Shield, Award, Sparkles } from "lucide-react";

export const WorkoutTab: React.FC = () => {
  const { workouts, addWorkout, deleteWorkout } = useApp();
  const [type, setType] = useState<"Squat" | "Kegel">("Squat");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("3");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reps && parseInt(reps) > 0) {
      addWorkout({
        type,
        reps: parseInt(reps),
        sets: parseInt(sets) || 3,
        date
      });
      setReps("");
    }
  };

  // Performance calculations
  const totalSquatReps = workouts.filter(w => w.type === "Squat").reduce((sum, item) => sum + (item.reps * item.sets), 0);
  const totalKegelReps = workouts.filter(w => w.type === "Kegel").reduce((sum, item) => sum + (item.reps * item.sets), 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white">
          <Dumbbell className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Stamina Workout Tracker</h2>
          <p className="text-xs text-slate-500 font-medium">Boost physical stamina, pelvic control, and pelvic floor strength</p>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-150 rounded-2xl p-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">TOTAL SQUAT WORKOUTS</span>
          <div className="text-xl font-mono font-black text-cyan-600">{totalSquatReps} Reps</div>
          <p className="text-[9px] text-slate-500 font-semibold">Improves systemic blood flow</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">TOTAL PELVIC KEGELS</span>
          <div className="text-xl font-mono font-black text-pink-500">{totalKegelReps} Reps</div>
          <p className="text-[9px] text-slate-500 font-semibold">Pelvic floor performance &amp; control</p>
        </div>
      </div>

      {/* Workout creation form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
        <h3 className="font-bold text-slate-705">Register Today&apos;s Workout</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Exercise Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="Squat" className="text-slate-800">Squat (Stamina)</option>
              <option value="Kegel" className="text-slate-800">Kegel (Pelvic Floor)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Date Logged</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Reps Per Set</label>
            <input 
              type="number" 
              placeholder="e.g. 15 or 30"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Total Sets</label>
            <input 
              type="number" 
              placeholder="3"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Save Workout
        </button>
      </form>

      {/* Historic Logs list */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">ACTIVITY HISTORY</span>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {workouts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No workouts completed yet.</p>
          ) : (
            workouts.map(wk => (
              <div key={wk.id} className="bg-white border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs shadow-sm">
                <div className="flex gap-2.5 items-center">
                  <div className={`p-1.5 rounded-md ${wk.type === "Squat" ? "bg-cyan-50 text-cyan-600" : "bg-pink-50 text-pink-600"}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-850">{wk.type} Session</h4>
                    <span className="text-[9px] text-slate-500 font-semibold font-mono">{wk.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-slate-700">{wk.sets} sets &times; {wk.reps} reps</span>
                  <button
                    onClick={() => deleteWorkout(wk.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
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
