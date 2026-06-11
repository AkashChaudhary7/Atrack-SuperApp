import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, Pill, Activity, Calendar, Heart } from "lucide-react";

export const MedicineTab: React.FC = () => {
  const { medicines, addMedicine, logMedicineTaken, deleteMedicine } = useApp();
  const [name, setName] = useState("");
  const [dosageDaily, setDosageDaily] = useState("1");
  const [totalPillsLeft, setTotalPillsLeft] = useState("30");
  const [reminderTime, setReminderTime] = useState("08:00");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && dosageDaily && totalPillsLeft) {
      addMedicine({
        name: name.trim(),
        dosageDaily: parseInt(dosageDaily) || 1,
        totalPillsLeft: parseInt(totalPillsLeft) || 30,
        reminderTime
      });
      setName("");
      setDosageDaily("1");
      setTotalPillsLeft("30");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-xl text-white">
          <Pill className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Medicine Intake</h2>
          <p className="text-xs text-slate-500 font-medium">Pills count, daily requirements, dosages, and push alerts</p>
        </div>
      </div>

      {/* Quick Add Medicine form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
        <h3 className="font-bold text-slate-700">Declare Medication</h3>

        <div>
          <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Medication Name</label>
          <input 
            type="text" 
            placeholder="e.g. Multivitamin, Finasteride..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500/50"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Daily Dosage</label>
            <input 
              type="number" 
              placeholder="1"
              value={dosageDaily}
              onChange={(e) => setDosageDaily(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Stock Left</label>
            <input 
              type="number" 
              placeholder="30"
              value={totalPillsLeft}
              onChange={(e) => setTotalPillsLeft(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Alert Time</label>
            <input 
              type="time" 
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-sky-400 to-indigo-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
        >
          <Plus className="w-4 h-4" /> Save Medicine
        </button>
      </form>

      {/* Medicine inventory list */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">ONBOARD MEDICATIONS</span>

        <div className="space-y-3">
          {medicines.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No medication tracked yet.</p>
          ) : (
            medicines.map(med => {
              const takenToday = med.history[todayStr] || 0;
              const isPerfect = takenToday >= med.dosageDaily;

              return (
                <div key={med.id} className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2.5 items-center">
                      <div className="p-2 bg-sky-50 text-indigo-600 rounded-xl">
                        <Pill className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{med.name}</h4>
                        <div className="flex gap-2 items-center mt-1 text-[10px] text-slate-500 font-medium">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">Alert: {med.reminderTime}</span>
                          <span className={`${med.totalPillsLeft < 7 ? 'text-rose-600 font-bold' : 'text-slate-500 font-semibold'}`}>
                            {med.totalPillsLeft} Pills left
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Log dosage status bar */}
                  <div className="flex items-center justify-between border-t border-slate-150 pt-2 text-xs font-semibold">
                    <span className="text-[10px] text-slate-500">Dose: {takenToday} / {med.dosageDaily} today</span>
                    <button
                      disabled={med.totalPillsLeft <= 0}
                      onClick={() => logMedicineTaken(med.id, todayStr)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                        isPerfect 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-50"
                      }`}
                    >
                      {isPerfect ? "Completed dosage!" : "Take Dosage"}
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
