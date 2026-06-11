import React, { useState, useEffect } from "react";
import { useApp } from "../AppContext";
import { GeminiAdvisor } from "./GeminiAdvisor";
import { 
  Wallet, ClipboardList, Flame, HeartHandshake, Dumbbell, Pill, Scale, 
  GraduationCap, Sparkles, Plus, Check, ArrowRight, Zap, Shield, Minus, CheckCircle,
  Clock, Coffee, Droplets, Coins
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const DashboardTab: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { 
    expenses, bills, habits, jerkOffLogs, medicines, weightRecords,
    studySessions, userState, addWorkout, logMedicineTaken,
    toggleHabitDate, addExpense, toggleBillPaid, addWeightRecord, addStudySession,
    assetAccounts
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
      
      {/* 1. Header & Greeting (Simplified active profile buttons removed) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-2xl p-4.5 border border-slate-800/80 shadow-md relative overflow-hidden text-white flex flex-col gap-3.5">
        <div className="absolute right-[-40px] top-[-30px] w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-[-20px] bottom-[-20px] w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between z-10 relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono tracking-widest text-indigo-300 font-bold uppercase">Biometric Protected</span>
            </div>
            <h2 className="text-lg font-black tracking-tight mt-0.5 font-display">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">Akash Chaudhary</span>
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-lg px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-mono">
            <span className="text-emerald-400 font-black">●</span>
            <span className="text-slate-300">{userState.currentProfile}</span>
          </div>
        </div>

        {/* Card: TOTAL ASSETS VAULT */}
        <motion.div 
          whileHover={{ scale: 1.015 }}
          onClick={() => setActiveTab("assets")}
          className="bg-white/10 backdrop-blur-md border border-white/10 hover:border-indigo-400/35 text-white rounded-xl p-3 flex items-center justify-between cursor-pointer group transition-all shadow-sm z-10 relative"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 text-indigo-300 rounded-xl group-hover:bg-white/20 transition-all">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-[8px] font-bold text-indigo-300 uppercase tracking-widest block font-mono">Net Valuation Assets</span>
              <span className="text-sm font-black font-mono block leading-tight">
                ₹{assetAccounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-right font-mono text-[8.5px]">
            <span className="bg-emerald-500/20 border border-emerald-400/20 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
              Liquid: ₹{assetAccounts.filter(a => a.type === "liquid").reduce((sum, a) => sum + a.balance, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
            <ArrowRight className="w-3 text-white/80 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.div>
      </div>

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

      {/* 2. Beautiful SVG Progress Rings & Metrics */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Habit Completion Progress Ring */}
        <div className="bg-white border border-slate-150 p-3.5 rounded-2xl flex flex-col items-center text-center justify-between shadow-3xs">
          <div className="w-full flex justify-between items-center mb-0.5">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider font-mono uppercase">Habits Today</span>
            <span className="text-[9px] font-mono text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">{habitsCompletedToday}/{totalHabitsCount}</span>
          </div>

          <div className="relative my-2 flex items-center justify-center cursor-pointer group" onClick={() => setActiveTab("habits")}>
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="27"
                className="stroke-slate-100"
                strokeWidth="5"
                fill="transparent"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="27"
                className="stroke-rose-500"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 27}
                initial={{ strokeDashoffset: 2 * Math.PI * 27 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 27 * (1 - habitCompletionPercent / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-slate-800 leading-none">{habitCompletionPercent}%</span>
              <span className="text-[6px] text-slate-400 font-mono mt-0.5 group-hover:text-indigo-600 transition-colors uppercase leading-none">View</span>
            </div>
          </div>

          <span className="text-[9px] font-medium text-slate-450 leading-tight">
            {habitCompletionPercent === 100 ? "Perfect score achieved! 🎉" : "Maintain your streak"}
          </span>
        </div>

        {/* Financial Safe Budget Thermometer */}
        <div className="bg-white border border-slate-150 p-3.5 rounded-2xl flex flex-col justify-between shadow-3xs">
          <div className="w-full flex justify-between items-center mb-0.5">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider font-mono uppercase">Budget Safe</span>
            <span className="text-[9px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">Cap: ₹500</span>
          </div>

          <div className="my-auto py-1">
            <div className="text-[10px] text-slate-400 font-mono">Spent this Month</div>
            <div className="text-[18px] font-black text-slate-800 font-mono tracking-tight leading-none mb-1">
              ₹{totalExpenses}
            </div>
            
            {/* Linear Thermometer */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  budgetPercentSpent > 80 ? "bg-amber-500" : budgetPercentSpent > 95 ? "bg-rose-500" : "bg-indigo-600"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${budgetPercentSpent}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between items-center mt-1 text-[7px] font-mono text-slate-400">
              <span>{budgetPercentSpent}% spent</span>
              <span>Rem: ₹{Math.max(0, monthlyBudgetLimit - totalExpenses)}</span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab("expenses")} 
            className="w-full py-1 text-[8px] font-bold text-indigo-600 hover:text-indigo-850 hover:bg-indigo-50 border border-slate-100 bg-slate-50/50 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <span>Track Expenses</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* 3. Tactile Direct Logging Centre */}
      <div className="bg-gradient-to-b from-slate-50 to-slate-100/40 border border-slate-250/70 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <h3 className="text-[10px] font-black tracking-wider text-slate-500 uppercase font-mono">Tactile Direct Logging Centre</h3>
          </div>
          <span className="text-[8px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full uppercase font-black">Haptic Fast Link</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Dose Taken Pill */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickMedicine}
            className="bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-3xs"
          >
            <Pill className="w-4.5 h-4.5 text-teal-500 mb-1" />
            <span className="text-[10px] font-extrabold text-slate-700 leading-none">Take Dose</span>
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Meds Taken</span>
          </motion.button>

          {/* Hydration quick tap */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickHabitToggle}
            className="bg-white hover:bg-rose-50/40 border border-slate-200 hover:border-rose-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-3xs"
          >
            <Droplets className="w-4.5 h-4.5 text-rose-550 text-rose-500 mb-1" />
            <span className="text-[10px] font-extrabold text-slate-700 leading-none">Hit Habit</span>
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Rapid Habit</span>
          </motion.button>

          {/* Gym reps */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickWorkout}
            className="bg-white hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-3xs"
          >
            <Dumbbell className="w-4.5 h-4.5 text-indigo-500 mb-1" />
            <span className="text-[10px] font-extrabold text-slate-700 leading-none">+15 Squat</span>
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Log Workout</span>
          </motion.button>

          {/* Retention Protect lock */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickRetentionConfirm}
            className="bg-white hover:bg-pink-50/40 border border-slate-200 hover:border-pink-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-3xs"
          >
            <Shield className="w-4.5 h-4.5 text-pink-500 mb-1" />
            <span className="text-[10px] font-extrabold text-slate-700 leading-none">Lock Clean</span>
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Retention Day</span>
          </motion.button>

          {/* Quick snack expense */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickExpense}
            className="bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-3xs"
          >
            <Coffee className="w-4.5 h-4.5 text-amber-500 mb-1" />
            <span className="text-[10px] font-extrabold text-slate-700 leading-none">Log ₹15</span>
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Quick Snack</span>
          </motion.button>

          {/* Study sprint */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickStudy}
            className="bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-3xs"
          >
            <Clock className="w-4.5 h-4.5 text-blue-550 text-blue-500 mb-1" />
            <span className="text-[10px] font-extrabold text-slate-700 leading-none">+30m Focus</span>
            <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">Study Sprint</span>
          </motion.button>
        </div>
      </div>

      {/* 4. Small & Highly Compact Biometric Suites Grid */}
      <div className="space-y-3">
        {/* Gemini AI Advisor Block */}
        <GeminiAdvisor />
      </div>
    </div>
  );
};
