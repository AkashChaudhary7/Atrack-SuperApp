import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, CheckCircle, Flame, Calendar } from "lucide-react";

export const HabitsTab: React.FC = () => {
  const { habits, addHabit, toggleHabitDate, deleteHabit } = useApp();
  const [newHabit, setNewHabit] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.trim()) {
      addHabit(newHabit.trim());
      setNewHabit("");
    }
  };

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

      {/* Habit List */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">YOUR DECLARED HABITS</span>

        <div className="space-y-2">
          {habits.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">Create robust habits to start tracking.</p>
          ) : (
            habits.map(habit => {
              const isDoneToday = habit.completedDates.includes(todayStr);

              return (
                <div key={habit.id} className="bg-white border border-slate-150 rounded-2xl p-3.5 flex items-center justify-between shadow-sm hover:border-slate-350 transition-all">
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => toggleHabitDate(habit.id, todayStr)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isDoneToday 
                          ? "bg-teal-500 border-teal-600 text-white scale-105 shadow-sm" 
                          : "border-slate-300 bg-white hover:border-teal-500"
                      }`}
                      title="Done today?"
                    >
                      {isDoneToday && <CheckCircle className="w-4 h-4 text-white hover:opacity-90" />}
                    </button>

                    <div>
                      <h4 className={`text-xs font-bold ${isDoneToday ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {habit.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Completed: {habit.completedDates.length} times
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 rounded-full px-2.5 py-0.5">
                      <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? "text-orange-500" : "text-slate-400"}`} />
                      <span className="text-[10px] font-bold text-slate-700 font-mono">{habit.streak}d</span>
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
