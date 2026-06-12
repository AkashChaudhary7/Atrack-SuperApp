import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, Scale, Calendar, Sparkles } from "lucide-react";

export const WeightTab: React.FC = () => {
  const { weightRecords, addWeightRecord, deleteWeightRecord } = useApp();
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && parseFloat(weight) > 0) {
      addWeightRecord({
        weight: parseFloat(weight),
        date
      });
      setWeight("");
    }
  };

  // Render a simple lightweight canvas chart for mobile performance
  useEffect(() => {
    if (!canvasRef.current || weightRecords.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI display pixel density
    const width = canvas.parentElement?.clientWidth || 320;
    const height = 180;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = 30;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    const weights = weightRecords.map(w => w.weight);
    const maxWeight = Math.max(...weights) + 1;
    const minWeight = Math.max(0, Math.min(...weights) - 1);
    const range = maxWeight - minWeight || 1;

    // Draw grid lines
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.font = "9px monospace";
    ctx.fillStyle = "#64748b";

    for (let i = 0; i <= 3; i++) {
      const y = padding + (graphHeight / 3) * i;
      const wVal = maxWeight - (range / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.fillText(`${wVal.toFixed(1)}kg`, 5, y + 3);
    }

    // Draw line
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    weightRecords.forEach((rec, idx) => {
      const x = padding + (idx / (weightRecords.length - 1 || 1)) * graphWidth;
      const y = height - padding - ((rec.weight - minWeight) / range) * graphHeight;
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw dots
    weightRecords.forEach((rec, idx) => {
      const x = padding + (idx / (weightRecords.length - 1 || 1)) * graphWidth;
      const y = height - padding - ((rec.weight - minWeight) / range) * graphHeight;
      
      // Draw point circle
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label date at last point or simple spacing
      if (idx === 0 || idx === weightRecords.length - 1 || idx === Math.floor(weightRecords.length / 2)) {
        ctx.fillStyle = "#64748b";
        ctx.fillText(rec.date.substring(5), x - 10, height - 8);
      }
    });

  }, [weightRecords]);

  // Gain metric calculation
  const getGainProgress = () => {
    if (weightRecords.length < 2) return 0;
    const initial = weightRecords[0].weight;
    const current = weightRecords[weightRecords.length - 1].weight;
    return current - initial;
  };

  const gainValue = getGainProgress();

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-purple-500 to-pink-600 rounded-xl text-white">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Weight Gain Monitor</h2>
          <p className="text-xs text-slate-500 font-medium font-sans">Track calorie retention, bulk programs, and muscle target milestones</p>
        </div>
      </div>

      {/* Progress Canvas Map */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px]">Trend Analysis</span>
          <span className="font-mono text-purple-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Bulk: {gainValue >= 0 ? `+${gainValue.toFixed(1)}kg` : `${gainValue.toFixed(1)}kg`} Total
          </span>
        </div>

        {weightRecords.length > 0 ? (
          <div className="w-full h-[180px]">
            <canvas ref={canvasRef} className="block w-full h-full" />
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-10">Add weights to generate the Bulk Trend Graph.</p>
        )}
      </div>

      {/* Log weight Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-850">
        <h3 className="font-bold text-slate-700">Register Current Weight</h3>

        <div className="grid grid-cols-2 gap-3 pb-1">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Weight Value (kg)</label>
            <input 
              type="number" 
              step="any"
              placeholder="e.g. 72.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Log Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
        >
          <Plus className="w-4 h-4" /> Save Weight Record
        </button>
      </form>

      {/* Weight History list */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">WEIGHT HISTORIC LOGS</span>

        <div className="space-y-2 max-h-56 overflow-y-auto">
          {weightRecords.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl">No weight records logged.</p>
          ) : (
            [...weightRecords].reverse().map(rec => (
              <div key={rec.id} className="bg-white border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs text-slate-600 shadow-sm">
                <span className="font-mono font-bold text-slate-500">{rec.date}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-800 font-mono">{rec.weight} kg</span>
                  <button
                    onClick={() => deleteWeightRecord(rec.id)}
                    className="text-slate-450 hover:text-rose-600 p-1"
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
