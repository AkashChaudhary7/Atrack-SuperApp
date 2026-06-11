import React, { useState } from "react";
import { Plus, Target, CheckCircle2, Circle, Trash2, TrendingUp, Calendar, ChevronRight, ChevronDown } from "lucide-react";
import { useApp } from "../AppContext";
import { Goal, Milestone } from "../types";

export const GoalsTab: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("Financial");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");
  
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedGoals(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetValue || !unit || !targetDate) return;

    const parsedMilestones = milestonesInput
      .split(",")
      .map(m => m.trim())
      .filter(m => m)
      .map(title => ({
        id: crypto.randomUUID(),
        title,
        isCompleted: false
      }));

    addGoal({
      title,
      category,
      targetValue: Number(targetValue),
      currentValue: 0,
      unit,
      targetDate,
      milestones: parsedMilestones,
    });

    setTitle("");
    setTargetValue("");
    setUnit("");
    setTargetDate("");
    setMilestonesInput("");
    setShowAddForm(false);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
    );

    updateGoal(goalId, { milestones: updatedMilestones });
  };

  const updateCurrentValue = (goalId: string, newValue: number) => {
    updateGoal(goalId, { currentValue: newValue });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 p-5 rounded-3xl text-white shadow-xl">
        <div>
          <h2 className="text-xl font-black tracking-tight" style={{ fontWeight: 800 }}>OBJECTIVES & MILESTONES</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Macro planning and progression</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-full transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer"
        >
          <Plus className={`w-5 h-5 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddGoal} className="bg-white border rounded-3xl p-5 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Build $10k Emergency Fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b border-slate-200 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border-b border-slate-200 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors bg-transparent"
                required
              >
                <option value="Financial">Financial</option>
                <option value="Skill Mastery">Skill Mastery</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border-b border-slate-200 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors bg-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Target Value</label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full border-b border-slate-200 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Unit</label>
              <input
                type="text"
                placeholder="e.g. USD, Hours, %"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border-b border-slate-200 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Milestones (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Open Savings Account, Deposit $5k"
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              className="w-full border-b border-slate-200 py-2 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 pt-3.5 rounded-xl text-sm transition-transform active:scale-[0.98] mt-2 cursor-pointer"
          >
            INITIALIZE OBJECTIVE
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-10 bg-white border border-dashed rounded-3xl">
          <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500">No long-term objectives configured.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const progress = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
            const completedMilestones = g.milestones.filter(m => m.isCompleted).length;
            const isExpanded = expandedGoals[g.id];
            
            return (
              <div key={g.id} className="bg-white border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start gap-4 cursor-pointer" onClick={() => toggleExpand(g.id)}>
                  <div className="flex bg-slate-100 p-3 rounded-2xl items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-[15px]">{g.title}</h3>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-indigo-600 mt-0.5">{g.category}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border">
                        <Calendar className="w-3 h-3" />
                        {g.targetDate}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress Base</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input 
                            type="number"
                            value={g.currentValue}
                            onChange={(e) => updateCurrentValue(g.id, Number(e.target.value))}
                            className="w-16 text-right text-sm font-bold bg-slate-50 border-b border-indigo-200 focus:border-indigo-500 outline-none pb-0.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-xs font-medium text-slate-400">/ {g.targetValue} {g.unit}</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 items-center">
                         <span className="text-[10px] font-bold text-slate-500">{progress}% Completed</span>
                         {g.milestones.length > 0 && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              Milestones: {completedMilestones}/{g.milestones.length}
                            </span>
                         )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => toggleExpand(g.id)}
                    className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {isExpanded ? "Hide Milestones" : "Manage"}
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGoal(g.id);
                    }}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {isExpanded && g.milestones.length > 0 && (
                  <div className="pl-14 pr-2 pb-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {g.milestones.map((m) => (
                      <div 
                        key={m.id} 
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => toggleMilestone(g.id, m.id)}
                      >
                        {m.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 transition-colors" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        )}
                        <span className={`text-xs ${m.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
