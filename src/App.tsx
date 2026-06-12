/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
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
import { SleepTab } from "./components/SleepTab";
import { GeminiAdvisor } from "./components/GeminiAdvisor";
import { generatePDFReport } from "./utils/pdfGenerator";

import { 
  Sparkles, Shield, User, Wallet, ClipboardList, Flame, 
  HeartHandshake, Dumbbell, Pill, Scale, GraduationCap, Lock, LockOpen, FolderLock, FileSpreadsheet,
  FileDown, Coins, Target, Download, Eye, Sun, Moon
} from "lucide-react";

export default function App() {
  const { userState, expenses, bills, habits, intimacyLogs, jerkOffLogs, medicines, weightRecords, workouts, tasks, studySessions, assetAccounts, currentUser, signInWithGoogle, signOutUser, isCircadian, toggleCircadian } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

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
    <div className={`min-h-screen flex flex-col justify-between font-sans relative pb-20 select-none transition-colors duration-300 ${isCircadian ? "bg-[#050806] text-emerald-100" : "bg-slate-100 text-slate-800"}`}>
      {/* Upper Navigation Header */}
      <header className={`border-b sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300 ${isCircadian ? "border-emerald-950 bg-[#0a0f0d]/95 text-emerald-100" : "border-slate-100 bg-white/95"}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Shield className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-sm font-display font-black tracking-tight flex items-center gap-1.5 uppercase ${isCircadian ? "text-emerald-400" : "text-slate-800"}`}>
              Atrack <span className={`text-[9px] font-mono tracking-wider font-bold px-1.5 py-0.5 rounded border ${isCircadian ? "bg-[#0b1c12] border-emerald-800/40 text-emerald-400" : "bg-emerald-50 border-emerald-250 text-emerald-600"}`}>LOCKED</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1" title={`Cloud Synced as ${currentUser.email}`}>
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full border border-emerald-300"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</div>
              )}
              <span className="text-[10px] font-bold text-emerald-700 tracking-tight cursor-pointer" onClick={() => { if (window.confirm("Sign out from Google Cloud Sync?")) signOutUser(); }}>
                Synced
              </span>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] text-slate-700 font-bold px-2.5 py-1 rounded-xl transition-all shadow-sm cursor-pointer animate-pulse"
              title="Authenticate with Google to activate multi-device cloud synchronization"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Cloud Sync</span>
            </button>
          )}

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors uppercase tracking-wide"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
          )}

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

          {/* Circadian Eye-Care Toggle */}
          <button
            onClick={toggleCircadian}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              isCircadian 
                ? "bg-emerald-950/60 border-emerald-850/50 text-emerald-400 hover:bg-emerald-900/50" 
                : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
            title={isCircadian ? "Switch to daylight mode" : "Switch to late-night eye-care theme"}
          >
            {isCircadian ? <Moon className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-slate-505" />}
          </button>
        </div>
      </header>

      {/* Main viewport Container designed for mobile-first ratios */}
      <main className={`flex-1 p-4 max-w-md mx-auto w-full min-h-[calc(100vh-8rem)] relative transition-all duration-300 ${isCircadian ? "bg-[#0a0f0c] shadow-2xl shadow-emerald-980/40 border-x border-emerald-950" : "bg-white shadow-xl border-x border-slate-200/50"}`}>
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
        {activeTab === "sleep" && <SleepTab />}
      </main>

      {/* Modern High-contrast bottom tab bar Navigation for mobile viewports */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-2 flex justify-around shadow-lg transition-colors duration-300 ${isCircadian ? "border-emerald-950 bg-[#0a0f0d]/95 backdrop-blur-lg" : "border-slate-150 bg-white/95"}`}>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "dashboard" ? (isCircadian ? "text-emerald-400 scale-105 font-bold" : "text-indigo-600 scale-105 font-bold") : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <Shield className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("performance")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "performance" ? (isCircadian ? "text-emerald-400 scale-105 font-bold" : "text-indigo-600 scale-105 font-bold") : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <HeartHandshake className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Intimacy</span>
        </button>

        <button
          onClick={() => setActiveTab("study")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "study" ? (isCircadian ? "text-emerald-400 scale-105 font-bold" : "text-indigo-600 scale-105 font-bold") : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Study</span>
        </button>

        <button
          onClick={() => setActiveTab("goals")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "goals" ? (isCircadian ? "text-emerald-400 scale-105 font-bold" : "text-indigo-600 scale-105 font-bold") : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <Target className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Goals</span>
        </button>

        <button
          onClick={() => setActiveTab("safe")}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === "safe" ? (isCircadian ? "text-emerald-400 scale-105 font-bold" : "text-indigo-600 scale-105 font-bold") : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <FolderLock className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold">Safe</span>
        </button>
      </nav>
    </div>
  );
}
