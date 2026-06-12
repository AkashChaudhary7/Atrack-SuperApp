import React, { useState } from "react";
import { 
  Plus, Target, CheckCircle2, Circle, Trash2, Calendar, 
  ChevronRight, ChevronDown, Check, Edit2, ClipboardList, Clock, Sparkles, X, Pencil 
} from "lucide-react";
import { useApp } from "../AppContext";
import { Goal, PlannerTask } from "../types";

export const GoalsTab: React.FC = () => {
  const { 
    goals, addGoal, updateGoal, deleteGoal,
    tasks, addTask, toggleTaskCompleted, deleteTask, updateTask,
    isCircadian 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"objectives" | "todo">("objectives");

  // --- Objectives State ---
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Goal["category"]>("Financial");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  // --- To-Do / Task Board State ---
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<"Study" | "Personal" | "Financial" | "Medicine" | "EMI" | "Exercise" | "Other">("Personal");
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split("T")[0]);

  // Editing state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<any>("Personal");
  const [editDate, setEditDate] = useState("");

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
      .map(mTitle => ({
        id: "ms_" + Math.random().toString(36).substr(2, 9),
        title: mTitle,
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

  // --- To-Do Action Handlers ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      type: taskType as any,
      date: taskDate || new Date().toISOString().split("T")[0],
      isCompleted: false
    });

    setTaskTitle("");
    setTaskType("Personal");
    setTaskDate(new Date().toISOString().split("T")[0]);
    setShowTaskForm(false);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId || !editTitle.trim()) return;

    updateTask(editingTaskId, {
      title: editTitle.trim(),
      type: editType as any,
      date: editDate
    });

    setEditingTaskId(null);
    setEditTitle("");
  };

  const startEditTask = (task: PlannerTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditType(task.type);
    setEditDate(task.date);
  };

  return (
    <div className="space-y-5 font-sans lessons-tab">
      {/* 1. Header Banner */}
      <div className={`p-4.5 rounded-2xl border flex items-center justify-between shadow-md relative overflow-hidden transition-colors ${
        isCircadian 
          ? "bg-[#0b120f] border-emerald-950/40 text-emerald-100"
          : "bg-gradient-to-r from-slate-900 to-indigo-950 border-slate-800 text-white"
      }`}>
        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="z-10 text-left">
          <h2 className="text-base font-black tracking-tight font-display uppercase">Goal &amp; Task Planning</h2>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Manage long-term macro achievements and immediate task lists.</p>
        </div>
        
        <div className="z-10">
          {activeSubTab === "objectives" ? (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all active:scale-95 shadow flex items-center justify-center cursor-pointer"
            >
              <Plus className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            </button>
          ) : (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all active:scale-95 shadow flex items-center justify-center cursor-pointer"
            >
              <Plus className={`w-4 h-4 transition-transform ${showTaskForm ? 'rotate-45' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Tab Switches */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200/50 rounded-xl text-xs font-bold text-slate-700 shadow-sm gap-1">
        <button
          onClick={() => setActiveSubTab("objectives")}
          className={`flex-1 text-center py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "objectives" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Macro Objectives ({goals.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab("todo")}
          className={`flex-1 text-center py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "todo" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>To-Do Board ({tasks.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeSubTab === "objectives" ? (
        <div className="space-y-4">
          {showAddForm && (
            <form onSubmit={handleAddGoal} className="bg-white border rounded-2xl p-4.5 space-y-3.5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 text-left text-xs">
              <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">Create New Goal Objective</h3>
              
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Build ₹50,000 Emergency Fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  >
                    <option value="Financial">Financial</option>
                    <option value="Skill Mastery">Skill Mastery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Target Value</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. INR, Hours, %"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Sub-Milestones (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Open account, Deposit first 10k, Save half"
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-650 bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2 rounded-xl transition-all text-xs cursor-pointer"
              >
                Initialize Objective
              </button>
            </form>
          )}

          {goals.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
              <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No macro objectives configured yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((g) => {
                const progress = g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0;
                const completedMilestones = g.milestones.filter(m => m.isCompleted).length;
                const isExpanded = expandedGoals[g.id];
                
                return (
                  <div key={g.id} className="bg-white border border-slate-150 rounded-2xl p-4 shadow-3xs space-y-3 hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start gap-3.5 cursor-pointer" onClick={() => toggleExpand(g.id)}>
                      <div className="flex bg-indigo-50 p-2.5 rounded-xl items-center justify-center shrink-0">
                        <Target className="w-4.5 h-4.5 text-indigo-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-xs">{g.title}</h3>
                            <p className="text-[9px] uppercase font-bold tracking-wide text-indigo-600 mt-0.5">{g.category}</p>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-500 flex items-center gap-1 bg-slate-50 border px-1.5 py-0.5 rounded-md">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            {g.targetDate}
                          </span>
                        </div>
                        
                        <div className="mt-2.5">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">Progression Status</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <input 
                                type="number"
                                value={g.currentValue}
                                onChange={(e) => updateCurrentValue(g.id, Number(e.target.value))}
                                className="w-12 text-center text-xs font-bold bg-slate-50 border-b border-indigo-200 focus:border-indigo-500 outline-none p-0.5"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="text-[10px] font-medium text-slate-405"> / {g.targetValue} {g.unit}</span>
                            </div>
                          </div>
                          
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 items-center font-mono">
                             <span className="text-[8px] font-bold text-slate-500">{progress}% Completed</span>
                             {g.milestones.length > 0 && (
                                <span className="text-[8px] text-slate-400 flex items-center gap-1 font-bold">
                                  Milestones: {completedMilestones}/{g.milestones.length}
                                </span>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <button 
                        onClick={() => toggleExpand(g.id)}
                        className="flex shrink-0 items-center gap-1 text-[8.5px] font-bold uppercase tracking-wider text-slate-450 hover:text-slate-750 transition-colors"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        {isExpanded ? "Hide Milestones" : "Manage Sub-Milestones"}
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Do you wish to delete objective "${g.title}"?`)) {
                            deleteGoal(g.id);
                          }
                        }}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {isExpanded && g.milestones.length > 0 && (
                      <div className="pl-12 pr-1.5 pb-1 space-y-1.5 animate-in slide-in-from-top-1 duration-200 border-t border-slate-50 pt-2 text-left">
                        {g.milestones.map((m) => (
                          <div 
                            key={m.id} 
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => toggleMilestone(g.id, m.id)}
                          >
                            {m.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 transition-colors" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                            )}
                            <span className={`text-[11px] ${m.isCompleted ? 'text-slate-450 line-through' : 'text-slate-600 font-semibold'}`}>
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
      ) : (
        // To Do task tracker
        <div className="space-y-4">
          {showTaskForm && (
            <form onSubmit={handleAddTask} className="bg-white border rounded-2xl p-4.5 space-y-3.5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 text-left text-xs">
              <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">Create Regular Task</h3>
              
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">What needs to be done?</label>
                <input
                  type="text"
                  placeholder="e.g. Study Physics, Pay Credit Card EMI, Kegel Workout"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Task Type / Tag</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  >
                    <option value="Study">📚 Study Session</option>
                    <option value="Medicine">💊 Medicine Dose</option>
                    <option value="EMI">💳 Bill / EMI</option>
                    <option value="Exercise">🏋️ Workout / Exercise</option>
                    <option value="Personal">🏡 Personal Task</option>
                    <option value="Financial">💰 Financial Action</option>
                    <option value="Other">📝 Other / General</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block font-mono">Target Date</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2 rounded-xl transition-all text-xs cursor-pointer capitalize"
              >
                Add To-Do Entry
              </button>
            </form>
          )}

          {/* EDITING DIALOG / OVERLAY AREA INLINE FOR MAX ACCESSIBILITY */}
          {editingTaskId && (
            <form onSubmit={handleSaveEditTask} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4.5 space-y-3 shadow-md text-left text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-800 text-[10.5px] uppercase tracking-wider font-mono">Modify Task Configuration</span>
                <button type="button" onClick={() => setEditingTaskId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block font-mono">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block font-mono">Type Tag</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  >
                    <option value="Study">📚 Study Session</option>
                    <option value="Medicine">💊 Medicine Dose</option>
                    <option value="EMI">💳 Bill / EMI</option>
                    <option value="Exercise">🏋️ Workout / Exercise</option>
                    <option value="Personal">🏡 Personal Task</option>
                    <option value="Financial">💰 Financial Action</option>
                    <option value="Other">📝 Other / General</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 block font-mono">Scheduled Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-700 transition-all cursor-pointer"
              >
                Save Modified Changes
              </button>
            </form>
          )}

          {tasks.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
              <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">Your task ledger is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const isCompleted = task.isCompleted;
                
                // Styling labels base on type
                const getLabelStyle = (type: string) => {
                  switch (type) {
                    case "Study": return "bg-blue-50 text-blue-750 border-blue-105";
                    case "Medicine": return "bg-cyan-50 text-cyan-750 border-cyan-105";
                    case "EMI": return "bg-rose-50 text-rose-750 border-rose-105";
                    case "Exercise": return "bg-purple-50 text-purple-750 border-purple-105";
                    case "Financial": return "bg-emerald-50 text-emerald-750 border-emerald-105";
                    default: return "bg-slate-50 text-slate-600 border-slate-200";
                  }
                };

                return (
                  <div key={task.id} className="bg-white border border-slate-150 rounded-2xl p-3.5 flex items-center justify-between shadow-3xs hover:border-slate-305 transition-all text-left">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-indigo-650 border-indigo-700 bg-indigo-600 text-white shadow-3xs"
                            : "bg-white border-slate-300 hover:border-indigo-500 text-slate-300 mr-0.5"
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="overflow-hidden">
                        <span className={`text-[11.5px] font-bold block truncate leading-tight ${isCompleted ? 'text-slate-400 line-through decoration-1' : 'text-slate-800'}`}>
                          {task.title}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded uppercase ${getLabelStyle(task.type)} border`}>
                            {task.type}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            {task.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        onClick={() => startEditTask(task)}
                        className="p-1.5 rounded-lg border border-slate-150 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Edit Task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Do you wish to delete task "${task.title}"?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-slate-150 text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
