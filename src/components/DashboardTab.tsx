import React, { useState, useEffect } from "react";
import { useApp } from "../AppContext";
import { GeminiAdvisor } from "./GeminiAdvisor";
import { 
  Wallet, ClipboardList, Flame, HeartHandshake, Dumbbell, Pill, Scale, 
  GraduationCap, Sparkles, Plus, Check, ArrowRight, Zap, Shield, Minus, CheckCircle,
  Clock, Coffee, Droplets, Coins, LayoutGrid, Landmark, Activity, Target, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const DashboardTab: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { 
    expenses, bills, habits, jerkOffLogs, medicines, weightRecords,
    studySessions, userState, addWorkout, logMedicineTaken,
    toggleHabitDate, addExpense, toggleBillPaid, addWeightRecord, addStudySession,
    assetAccounts, isCircadian,
    tasks, toggleTaskCompleted
  } = useApp();

  // Highlight message triggers
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-hide alerts
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Calculations for dynamic dashboard states
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const pendingBillsCount = bills.filter(b => !b.isPaid).length;
  
  const averageStreak = habits.length > 0 
    ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length) 
    : 0;

  const currentWeight = weightRecords.length > 0 
    ? weightRecords[weightRecords.length - 1].weight 
    : 70.0;

  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const activeMedicinesCount = medicines.filter(m => m.totalPillsLeft > 0).length;

  // Habits completed today out of total habits
  const habitsCompletedToday = habits.filter(h => h.completedDates.includes(todayStr)).length;
  const totalHabitsCount = habits.length;
  const habitCompletionPercent = totalHabitsCount > 0 
    ? Math.round((habitsCompletedToday / totalHabitsCount) * 100) 
    : 0;

  // Budget spent percentage of ₹500 monthly placeholder
  const monthlyBudgetLimit = 500;
  const budgetPercentSpent = Math.min(100, Math.round((totalExpenses / monthlyBudgetLimit) * 100));

  // Remaining safe-to-spend logic based on liquid assets and average daily spend over last 30 days
  const liquidAssets = assetAccounts
    .filter(acc => acc.type === "liquid")
    .reduce((sum, acc) => sum + acc.balance, 0);

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const last30DaysExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return !isNaN(expenseDate.getTime()) && expenseDate >= thirtyDaysAgo;
  });

  const totalLast30DaysSpend = last30DaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDailySpend = parseFloat((totalLast30DaysSpend / 30).toFixed(2));

  // Compute today's total spend to find remaining safe-to-spend for the rest of today
  const todaysSpend = expenses
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // Remaining daily safe-to-spend: (Liquid Assets / 30) - today's spend
  const safeToSpendToday = Math.max(0, parseFloat(((liquidAssets / 30) - todaysSpend).toFixed(2)));

  // Calculate Semen Retention Streak
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

  const currentRetentionStreak = fapFreeStreak();

  // 1. Expense Quick-Log
  const handleQuickExpense = () => {
    addExpense({
      amount: 15.00,
      category: "Food",
      description: "Quick Meal Log ☕",
      date: todayStr
    });
    setSuccessMessage("Logged ₹15 quick snack expense! ☕");
  };

  // 2. Bill Quick-Pay
  const handleQuickPayBill = () => {
    const oldestUnpaid = bills.find(b => !b.isPaid);
    if (oldestUnpaid) {
      toggleBillPaid(oldestUnpaid.id);
      setSuccessMessage(`Marked "${oldestUnpaid.title}" as paid! 💳`);
    } else {
      setSuccessMessage("All current bills are already paid up! ✨");
    }
  };

  // 3. Habit Quick Check-off
  const handleQuickHabitToggle = () => {
    const incompleteHabit = habits.find(h => !h.completedDates.includes(todayStr));
    if (incompleteHabit) {
      toggleHabitDate(incompleteHabit.id, todayStr);
      setSuccessMessage(`Checked habit: "${incompleteHabit.name}"! 🌟`);
    } else if (habits.length > 0) {
      toggleHabitDate(habits[0].id, todayStr);
      setSuccessMessage(`Toggled: "${habits[0].name}" state.`);
    } else {
      setSuccessMessage("Please add a habit first in the Habits suite! 🏃");
    }
  };

  // 4. Semen Retention Quick Reset / Confirm Clean
  const handleQuickRetentionConfirm = () => {
    setSuccessMessage(`Discipline maintained! Clean day lock affirmed. 🛡️`);
  };

  // 5. Workout Quick-Log Squats
  const handleQuickWorkout = () => {
    addWorkout({
      type: "Squat",
      reps: 15,
      sets: 1,
      date: todayStr
    });
    setSuccessMessage("Logged +15 squat reps under workouts! 🏋️");
  };

  // 6. Medicine Quick Dosing
  const handleQuickMedicine = () => {
    const nextDoseMed = medicines.find(m => m.totalPillsLeft > 0);
    if (nextDoseMed) {
      logMedicineTaken(nextDoseMed.id, todayStr);
      setSuccessMessage(`Administered dosage of ${nextDoseMed.name}! 💊`);
    } else {
      setSuccessMessage("No active medicines with remaining stock found.");
    }
  };

  // 7. Weight Quick Fine-adjuster
  const handleAdjustWeight = (diff: number) => {
    const nextWeight = Math.round((currentWeight + diff) * 10) / 10;
    addWeightRecord({
      weight: nextWeight,
      date: todayStr
    });
    setSuccessMessage(`Weight logged & adjusted to ${nextWeight} kg! ⚖️`);
  };

  // 8. Study Focus Quick 30m Log
  const handleQuickStudy = () => {
    addStudySession({
      date: todayStr,
      durationMinutes: 30,
      subject: "Deep Focus Session"
    });
    setSuccessMessage("Logged +30 minutes focus sprint! ⏱️");
  };

  return (
    <div className="space-y-5 font-sans">
      
      {/* 1. Header & Greeting */}
      <div className={`rounded-2xl p-4.5 border relative overflow-hidden flex flex-col gap-3 shadow-md transition-colors duration-300 ${
        isCircadian 
          ? "bg-[#0b120f] border-emerald-950/40 text-emerald-100" 
          : "bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border-slate-800"
      }`}>
        <div className="absolute right-[-45px] top-[-35px] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isCircadian ? "bg-emerald-400" : "bg-emerald-500"}`} />
              <span className={`text-[9px] font-mono tracking-widest font-bold uppercase ${isCircadian ? "text-emerald-500" : "text-indigo-300"}`}>Biometric Protected</span>
            </div>
            <h2 className="text-lg font-black tracking-tight mt-0.5 font-display">
              <span className={isCircadian ? "text-emerald-400 font-extrabold" : "bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 font-extrabold"}>Hi,Akash Chaudhary</span>
            </h2>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
            isCircadian 
              ? "bg-emerald-950/40 border-emerald-800/20 text-emerald-300" 
              : "bg-white/5 border-white/10 text-slate-300"
          }`}>
            <span className="text-emerald-400 font-black">●</span>
            <span>{userState.currentProfile}</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Bento-Grid Dashboard */}
      <div className="grid grid-cols-2 gap-3 z-10 relative">
        
        {/* Bento Card 1: Asset Vault (Spans 2 columns) */}
        <motion.div 
          whileHover={{ scale: 1.015, y: -2 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={() => setActiveTab("assets")}
          className={`col-span-2 border rounded-2xl p-3.5 flex items-center justify-between cursor-pointer group shadow-3xs transition-all ${
            isCircadian 
              ? "bg-[#0c1612] border-emerald-900/35 hover:border-emerald-600/50 hover:shadow-emerald-950/20" 
              : "bg-white border-slate-150 hover:border-indigo-400/40 hover:shadow-indigo-100/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${
              isCircadian 
                ? "bg-[#11241a] text-emerald-450 group-hover:bg-emerald-900/40" 
                : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
            }`}>
              <Coins className={`w-5 h-5 ${isCircadian ? "text-emerald-400" : "text-indigo-600"}`} />
            </div>
            <div className="text-left">
              <span className={`text-[8.5px] font-bold uppercase tracking-wider block font-mono ${isCircadian ? "text-emerald-500" : "text-indigo-600/80"}`}>Net Asset Balances</span>
              <span className={`text-base font-black font-mono block leading-none mt-0.5 ${isCircadian ? "text-emerald-300" : "text-slate-800"}`}>
                ₹{assetAccounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 font-mono text-[8px] font-bold">
            <span className={`px-1.5 py-0.5 rounded border uppercase tracking-wide leading-none ${
              isCircadian 
                ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-400" 
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              Liquid: ₹{assetAccounts.filter(a => a.type === "liquid").reduce((sum, a) => sum + a.balance, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Unified Pending Task Board */}
      <div className={`border rounded-2xl p-4.5 space-y-3.5 shadow-sm text-left transition-colors ${
        isCircadian 
          ? "bg-[#0b120f] border-emerald-950/50" 
          : "bg-white border-slate-150"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ClipboardList className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className={`text-xs font-mono font-black uppercase tracking-wider ${
              isCircadian ? "text-emerald-400" : "text-slate-800"
            }`}>
              Tasks &amp; Reminders
            </h3>
          </div>
          <span className={`text-[8.5px] font-mono font-black px-2 py-0.5 rounded border uppercase transition-colors ${
            isCircadian 
              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400" 
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            Priority
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
          {/* 1. Custom To-Do planner lists */}
          {tasks.filter(t => !t.isCompleted).length === 0 && 
           bills.filter(b => !b.isPaid).length === 0 && 
           medicines.filter(m => m.totalPillsLeft > 0).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center space-y-4">
              {/* Modern Engaging Vector Illustration */}
              <div className="relative flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse ${
                  isCircadian ? "bg-emerald-500" : "bg-indigo-500"
                }`} style={{ width: '120px', height: '120px', margin: 'auto' }}></div>
                <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border shadow-md transition-all ${
                  isCircadian 
                    ? "bg-[#0f1d18] border-emerald-950/80 text-emerald-400" 
                    : "bg-indigo-50/50 border-indigo-100 text-indigo-600"
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${
                    isCircadian ? "bg-emerald-500 text-black font-black" : "bg-indigo-650 text-white"
                  }`}>
                    ✨
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <h4 className={`text-sm font-black tracking-tight ${
                  isCircadian ? "text-emerald-300" : "text-slate-800"
                }`}>
                  No Task
                </h4>
               
              </div>

              <button
                onClick={() => setActiveTab("goals")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-sm cursor-pointer transform hover:scale-103 active:scale-97 ${
                  isCircadian 
                    ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                Set a New Goal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* Custom To-Dos */}
              {tasks.filter(t => !t.isCompleted).map(t => (
                <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-50/50 dark:bg-emerald-950/10 border border-slate-100 dark:border-emerald-950/30 rounded-xl hover:border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => {
                        toggleTaskCompleted(t.id);
                        setSuccessMessage(`Checked off "${t.title}"! ✅`);
                      }}
                      className="w-4.5 h-4.5 rounded-full border border-slate-300 hover:border-indigo-500 flex items-center justify-center shrink-0 cursor-pointer text-transparent hover:text-indigo-500 bg-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div>
                      <span className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">{t.title}</span>
                      <div className="flex gap-1.5 items-center mt-0.5">
                        <span className="text-[7.5px] font-mono font-black uppercase px-1 bg-indigo-50 dark:bg-emerald-950 text-[#4f46e5] dark:text-emerald-450 rounded border">
                          {t.type} Task
                        </span>
                        <span className="text-[7.5px] font-mono text-slate-400 font-bold">{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase">Custom Tracker</span>
                </div>
              ))}

              {/* Unpaid Bills / EMI */}
              {bills.filter(b => !b.isPaid).map(b => (
                <div key={b.id} className="flex items-center justify-between p-2.5 bg-rose-50/30 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-950/20 rounded-xl hover:border-rose-250">
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => {
                        toggleBillPaid(b.id);
                        setSuccessMessage(`Paid bill "${b.title}"! 💳`);
                      }}
                      className="w-4.5 h-4.5 rounded-full border border-rose-350 hover:border-rose-500 flex items-center justify-center shrink-0 cursor-pointer text-transparent hover:text-rose-500 bg-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div>
                      <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-250">{b.title}</span>
                      <div className="flex gap-1.5 items-center mt-0.5">
                        <span className="text-[7.5px] font-mono font-black uppercase px-1 bg-rose-50 text-rose-750 rounded border border-rose-200">
                          ₹{b.amount} due
                        </span>
                        <span className="text-[7.5px] font-mono text-rose-500 font-bold font-mono">Due: {b.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-rose-500 uppercase">EMI / Bill</span>
                </div>
              ))}

              {/* Medicines Stock alerts */}
              {medicines.filter(m => m.totalPillsLeft > 0).map(m => (
                <div key={m.id} className="flex items-center justify-between p-2.5 bg-cyan-50/30 dark:bg-[#070d0a] border border-cyan-150/40 dark:border-emerald-950/30 rounded-xl hover:border-cyan-250">
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => {
                        logMedicineTaken(m.id, todayStr);
                        setSuccessMessage(`Dose taken: ${m.name}! 💊`);
                      }}
                      className="w-4.5 h-4.5 rounded-full border border-cyan-350 hover:border-cyan-500 flex items-center justify-center shrink-0 cursor-pointer text-transparent hover:text-cyan-500 bg-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div>
                      <span className="text-[11.5px] font-bold text-slate-850 dark:text-slate-250">{m.name}</span>
                      <div className="flex gap-1.5 items-center mt-0.5">
                        <span className="text-[7.5px] font-mono font-black uppercase px-1 bg-cyan-50 text-cyan-755 rounded border border-cyan-200">
                          {m.totalPillsLeft} left
                        </span>
                        <span className="text-[7.5px] font-mono text-cyan-600 font-bold font-mono">Time: {m.reminderTime}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-cyan-600 uppercase">Medicine Dose</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Gemini AI Advisor Block */}
      <GeminiAdvisor />

      {/* Dynamic Alert Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-indigo-600 text-white rounded-xl py-2 px-3 text-[11px] font-black text-center shadow-lg flex items-center justify-center gap-2 z-50 relative"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Tactile Direct Logging Centre */}
      <div className="bg-gradient-to-br from-[#1a1c29] via-[#2d1b4e] to-[#1f1e33] rounded-2xl p-4 shadow-2xl shadow-purple-900/20 border border-[#482880]/50 relative overflow-hidden group/tactile">
        {/* Gemini glowing orb effect */}
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[conic-gradient(from_90deg_at_50%_0%,#00000000_50%,#7a22ff_100%)] opacity-20 blur-[80px] group-hover/tactile:opacity-40 transition-opacity duration-1000"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/20 blur-3xl"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg shadow-lg shadow-purple-500/30">
              <Zap className="w-4 h-4 text-white fill-white animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 uppercase tracking-[0.15em] block font-mono">Intelligence Actions</span>
              <h3 className="text-sm font-black text-white tracking-tight">Tactile Logging</h3>
            </div>
          </div>
          <span className="text-[8px] font-mono bg-white/10 border border-white/20 text-white backdrop-blur-md px-2 py-0.5 rounded-full uppercase font-black tracking-wider shadow-[0_0_10px_rgba(120,0,255,0.3)]">Haptic Sync</span>
        </div>

        <div className="grid grid-cols-3 gap-3 relative z-10">
          {/* Dose Taken Pill */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickMedicine}
            className="bg-[#1e1b4b]/60 hover:bg-[#2e1065]/80 border border-[#4c1d95]/50 hover:border-purple-400/60 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner backdrop-blur-xl group"
          >
            <Pill className="w-5 h-5 text-cyan-400 mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all" />
            <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">Take Dose</span>
            <span className="text-[7.5px] text-indigo-300 font-mono mt-0.5">Meds Taken</span>
          </motion.button>

          {/* Hydration quick tap */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickHabitToggle}
            className="bg-[#1e1b4b]/60 hover:bg-[#2e1065]/80 border border-[#4c1d95]/50 hover:border-purple-400/60 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner backdrop-blur-xl group"
          >
            <Droplets className="w-5 h-5 text-blue-400 mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all" />
            <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">Hit Habit</span>
            <span className="text-[7.5px] text-indigo-300 font-mono mt-0.5">Rapid Habit</span>
          </motion.button>

          {/* Gym reps */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickWorkout}
            className="bg-[#1e1b4b]/60 hover:bg-[#2e1065]/80 border border-[#4c1d95]/50 hover:border-purple-400/60 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner backdrop-blur-xl group"
          >
            <Dumbbell className="w-5 h-5 text-purple-400 mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] transition-all" />
            <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">+15 Squat</span>
            <span className="text-[7.5px] text-indigo-300 font-mono mt-0.5">Log Workout</span>
          </motion.button>

          {/* Retention Protect lock */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickRetentionConfirm}
            className="bg-[#1e1b4b]/60 hover:bg-[#2e1065]/80 border border-[#4c1d95]/50 hover:border-purple-400/60 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner backdrop-blur-xl group"
          >
            <Shield className="w-5 h-5 text-pink-400 mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] transition-all" />
            <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">Lock Clean</span>
            <span className="text-[7.5px] text-indigo-300 font-mono mt-0.5">Retention Day</span>
          </motion.button>

          {/* Quick snack expense */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickExpense}
            className="bg-[#1e1b4b]/60 hover:bg-[#2e1065]/80 border border-[#4c1d95]/50 hover:border-purple-400/60 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner backdrop-blur-xl group"
          >
            <Coffee className="w-5 h-5 text-amber-400 mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-all" />
            <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">Log ₹15</span>
            <span className="text-[7.5px] text-indigo-300 font-mono mt-0.5">Quick Snack</span>
          </motion.button>

          {/* Study sprint */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickStudy}
            className="bg-[#1e1b4b]/60 hover:bg-[#2e1065]/80 border border-[#4c1d95]/50 hover:border-purple-400/60 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-inner backdrop-blur-xl group"
          >
            <Clock className="w-5 h-5 text-indigo-300 mb-1.5 group-hover:drop-shadow-[0_0_8px_rgba(165,180,252,0.8)] transition-all" />
            <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">+30m Focus</span>
            <span className="text-[7.5px] text-indigo-300 font-mono mt-0.5">Study Sprint</span>
          </motion.button>
        </div>
      </div>

      {/* 4. Small & Highly Compact Biometric Suites Grid */}
      <div className="space-y-4">
        {/* --- All Functions Direct Shortcuts --- */}
        <div className="bg-[#0f111a] border border-[#2d2f3d] rounded-2xl p-4 shadow-xl relative overflow-hidden group/dir">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-rose-500/5 opacity-50 group-hover/dir:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-[50px] flex items-center justify-center pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4 justify-center relative z-10 text-white">
            <LayoutGrid className="w-4 h-4 text-indigo-400" />
            <h3 className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 tracking-[0.2em] font-mono uppercase">Full Platform Directory</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2.5 relative z-10">
            {[
              { id: "assets", icon: Landmark, label: "Assets" },
              { id: "expenses", icon: Wallet, label: "Expenses" },
              { id: "bills", icon: Clock, label: "Bills" },
              { id: "habits", icon: Flame, label: "Habits" },
              { id: "performance", icon: Activity, label: "Retention" },
              { id: "workout", icon: Dumbbell, label: "Workout" },
              { id: "medicine", icon: Pill, label: "Medicine" },
              { id: "weight", icon: Scale, label: "Weight" },
              { id: "study", icon: GraduationCap, label: "Study" },
              { id: "sleep", icon: Moon, label: "Sleep" },
              { id: "goals", icon: Target, label: "Goals" },
              { id: "safe", icon: Shield, label: "Vault" },
            ].map(tab => (
               <motion.button
                 key={tab.id}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#161821] border border-[#2d2f3d] hover:bg-[#1a1c29] hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all cursor-pointer group`}
               >
                 <div className={`p-1.5 rounded-lg border border-[#2d2f3d] bg-gradient-to-b from-[#1a1c29] to-[#161821] mb-2 shadow-sm text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/50 group-hover:scale-110 transition-all`}>
                   <tab.icon className="w-5 h-5" />
                 </div>
                 <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center leading-tight truncate w-full group-hover:text-indigo-200 transition-colors">{tab.label}</span>
               </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
