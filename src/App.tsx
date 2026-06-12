/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import { useApp } from "./AppContext";
import { LockScreen } from "./components/LockScreen";
import { DashboardTab } from "./components/DashboardTab";
import { ExpensesTab } from "./components/ExpensesTab";
import { BillsTab } from "./components/BillsTab";
import { HabitsTab } from "./components/HabitsTab";
import { PerformanceTab } from "./components/PerformanceTab";
import { WorkoutTab } from "./components/WorkoutTab";
import { MedicineTab } from "./components/MedicineTab";
import { WeightTab } from "./components/WeightTab";
import { StudyTab } from "./components/StudyTab";
import { SafeTab } from "./components/SafeTab";
import { AssetsTab } from "./components/AssetsTab";
import { GoalsTab } from "./components/GoalsTab";
import { GeminiAdvisor } from "./components/GeminiAdvisor";
import { generatePDFReport } from "./utils/pdfGenerator";

import { 
  Sparkles, Shield, User, Wallet, ClipboardList, Flame, 
  HeartHandshake, Dumbbell, Pill, Scale, GraduationCap, Lock, LockOpen, FolderLock, FileSpreadsheet,
  FileDown, Coins, Target
} from "lucide-react";

export default function App() {
  const { userState, expenses, bills, habits, intimacyLogs, jerkOffLogs, medicines, weightRecords, workouts, tasks, studySessions, assetAccounts } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!userState.isAuthenticated) {
    return <LockScreen />;
  }

  // Handle download of detailed reports as CSV format dynamically
  const triggerMetricsDownload = () => {
    const { expenses, bills, habits, intimacyLogs, jerkOffLogs, medicines, weightRecords, workouts, studySessions } = useApp();
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "=== ATRACK PERFORMANCE & FINANCIAL SUMMARY REPORT ===\n\n";

    // Expenses
    csvContent += "--- Expenses ---\nCategory,Description,Amount,Date\n";
    expenses.forEach(e => {
      csvContent += `"${e.category}","${e.description.replace(/"/g, '""')}",${e.amount},"${e.date}"\n`;
    });

    // Bills
    csvContent += "\n--- Bills/EMIs ---\nTitle,Category,Amount,Due Date,Status\n";
    bills.forEach(b => {
      csvContent += `"${b.title}","${b.category}",${b.amount},"${b.dueDate}","${b.isPaid ? 'Paid' : 'Pending'}"\n`;
    });

    // Habits
    csvContent += "\n--- Habits Progress ---\nHabit Title,Completed Days count,Current Streak\n";
    habits.forEach(h => {
      csvContent += `"${h.name}",${h.completedDates.length},${h.streak} Days\n`;
    });

    // Intimacy
    csvContent += "\n--- Intimacy Milestones ---\nPartner Name,Mood,Date,Notes\n";
    intimacyLogs.forEach(i => {
      csvContent += `"${i.partnerName}","${i.mood}","${i.date}","${(i.notes || '').replace(/"/g, '""')}"\n`;
    });

    // Jerk off logs
    csvContent += "\n--- Jerk Frequency Logs ---\nDate,Count\n";
    jerkOffLogs.forEach(l => {
      csvContent += `"${l.date}",${l.count}\n`;
    });

    // Weight Records
    csvContent += "\n--- Weight Monitor Trends ---\nDate,Weight (kg)\n";
    weightRecords.forEach(w => {
      csvContent += `"${w.date}",${w.weight}\n`;
    });

    // Workouts
    csvContent += "\n--- Stamina Workouts (Squat & Kegel) ---\nDate,Type,Sets,Reps\n";
    workouts.forEach(wk => {
      csvContent += `"${wk.date}","${wk.type}",${wk.sets},${wk.reps}\n`;
    });

    // Medicines
    csvContent += "\n--- Medicine Intake Inventory ---\nName,Dosage Daily,Pills Left\n";
    medicines.forEach(m => {
      csvContent += `"${m.name}",${m.dosageDaily},${m.totalPillsLeft}\n`;
    });

    // Study Sessions
    csvContent += "\n--- Study Sessions ---\nDate,Subject,Duration (Mins)\n";
    studySessions.forEach(st => {
      csvContent += `"${st.date}","${st.subject}",${st.durationMinutes}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Atrack_Metrics_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between font-sans relative pb-20 select-none">
      {/* Upper Navigation Header */}
      <header className="border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-display font-black tracking-tight text-slate-800 flex items-center gap-1.5 uppercase">
              Atrack <span className="text-[9px] font-mono tracking-wider text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-250">LOCKED</span>
            </h1>
          </div>
        </div>

        {/* Dropdown for interactive PDF timeframe */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition-all cursor-pointer" title="Compile Premium Vault PDF">
          <FileDown className="w-4 h-4 text-indigo-600" />
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                const choice = e.target.value as "daily" | "weekly" | "monthly" | "yearly";
                generatePDFReport(choice, {
                  profile: userState.currentProfile,
                  expenses, bills, habits, intimacyLogs, jerkOffLogs, medicines, weightRecords, workouts, tasks, studySessions, assetAccounts
                });
                e.target.value = ""; // Reset pick
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="" disabled>Compile Premium Report...</option>
            <option value="daily">Daily Deep Ledger PDF</option>
            <option value="weekly">Weekly Performance & Finance PDF</option>
            <option value="monthly">Monthly Combined Telemetry PDF</option>
            <option value="yearly">Yearly Ultimate Summary PDF</option>
          </select>
        </div>
      </header>

      {/* Main viewport Container designed for mobile-first ratios */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full bg-white shadow-xl border-x border-slate-200/50 min-h-[calc(100vh-8rem)] relative">
        {activeTab === "dashboard" && <DashboardTab setActiveTab={setActiveTab} />}
        {activeTab === "expenses" && <ExpensesTab />}
        {activeTab === "bills" && <BillsTab />}
        {activeTab === "habits" && <HabitsTab />}
        {activeTab === "performance" && <PerformanceTab />}
        {activeTab === "workout" && <WorkoutTab />}
        {activeTab === "medicine" && <MedicineTab />}
        {activeTab === "weight" && <WeightTab />}
        {activeTab === "study" && <StudyTab />}
        {activeTab === "safe" && <SafeTab />}
        {activeTab === "assets" && <AssetsTab />}
        {activeTab === "goals" && <GoalsTab />}
      </main>

      {/* Modern High-contrast bottom tab bar Navigation for mobile viewports */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-150 bg-white/95 backdrop-blur-lg px-2 py-2 flex justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "dashboard" ? "text-indigo-600 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <Shield className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("performance")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "performance" ? "text-indigo-600 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <HeartHandshake className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Intimacy</span>
        </button>

        <button
          onClick={() => setActiveTab("study")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "study" ? "text-indigo-600 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Study</span>
        </button>

        <button
          onClick={() => setActiveTab("goals")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "goals" ? "text-indigo-600 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <Target className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Goals</span>
        </button>

        <button
          onClick={() => setActiveTab("safe")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "safe" ? "text-indigo-600 scale-105 font-bold" : "text-slate-400"
          }`}
        >
          <FolderLock className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Safe</span>
        </button>
      </nav>
      <Analytics />
    </div>
  );
}
