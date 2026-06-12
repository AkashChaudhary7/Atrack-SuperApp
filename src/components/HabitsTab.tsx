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
import { motion, AnimatePresence } from "motion/react";

import { 
  Sparkles, Shield, User, Wallet, ClipboardList, Flame, 
  HeartHandshake, Dumbbell, Pill, Scale, GraduationCap, Lock, LockOpen, FolderLock, FileSpreadsheet,
  FileDown, Coins, Target, Download, Eye, Sun, Moon, Bell, BellOff
} from "lucide-react";

export default function App() {
  const { userState, expenses, bills, habits, intimacyLogs, jerkOffLogs, medicines, weightRecords, workouts, tasks, studySessions, assetAccounts, currentUser, signInWithGoogle, signOutUser, isCircadian, toggleCircadian } = useApp();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(() => {
    return typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported";
  });

  const handleCloudSyncClick = async () => {
    setSyncError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Cloud Sync Error caught:", err);
      let errMsg = "Google authentication popup could not be established.";
      if (typeof window !== "undefined" && window.self !== window.top) {
        errMsg = "Security policies inside this preview iframe prevent Google Sign-in popups from opening directly.";
      } else if (err?.code === "auth/popup-blocked") {
        errMsg = "The Google login popup was blocked by your browser. Please allow popups for this site.";
      } else if (err?.message) {
        errMsg = err.message;
      }
      setSyncError(errMsg);
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
        if (res === "granted") {
          setShowNotificationModal(false);
        }
      } catch (err) {
        console.error("Failed requesting permission:", err);
      }
    }
  };

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
              onClick={handleCloudSyncClick}
              className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] text-slate-700 font-bold px-2.5 py-1 rounded-xl transition-all shadow-sm cursor-pointer animate-pulse"
              title="Authenticate with Google to activate multi-device cloud synchronization"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Cloud Sync</span>
            </button>
          )}

          {/* Browser Notification Status Indicator */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all cursor-pointer relative ${
              notificationPermission === "granted"
                ? (isCircadian ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-450 hover:bg-emerald-950/60" : "bg-emerald-50 border-emerald-150 text-emerald-600 hover:bg-emerald-100/50")
                : (isCircadian ? "bg-[#1a1011] border-rose-950/60 text-rose-400 hover:bg-[#231517]" : "bg-rose-50/50 border-rose-150 text-rose-600 hover:bg-rose-100")
            }`}
            title={`Habit alarms setting (Permission: ${notificationPermission})`}
          >
            {notificationPermission === "granted" ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
            {notificationPermission !== "granted" && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

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

      {/* Cloud Sync Failure / Cross-Origin Iframe Help Dialog */}
      <AnimatePresence>
        {syncError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs" id="sync-error-backdrop">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`w-full max-w-sm border rounded-3xl p-5 shadow-2xl relative ${
                isCircadian 
                  ? "bg-[#0a0f0d] border-emerald-900/60 text-emerald-100" 
                  : "bg-white border-slate-150 text-slate-800"
              }`}
              id="sync-error-card"
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                  isCircadian ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                }`} id="sync-error-icon-box">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">
                    Cloud Sync Auth Restricted
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-normal px-2">
                    {syncError}
                  </p>
                </div>

                <div className={`text-[10px] p-3 rounded-2xl border text-left leading-normal font-medium ${
                  isCircadian 
                    ? "bg-emerald-950/10 border-emerald-900/20 text-emerald-300" 
                    : "bg-indigo-50/50 border-indigo-100 text-indigo-700"
                }`} id="sync-error-tip">
                  💡 **Pro Tip:** Google Sign-in popups are often blocked by standard browser sandbox policies inside preview iframes. Open this app in a **new standalone browser tab** to sync without restriction!
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5" id="sync-error-actions">
                <button
                  onClick={() => setSyncError(null)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center cursor-pointer ${
                    isCircadian 
                      ? "bg-transparent hover:bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                  id="btn-dismiss-sync-error"
                >
                  Dismiss
                </button>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setSyncError(null)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer flex items-center justify-center ${
                    isCircadian 
                      ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-955" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                  id="btn-tab-sync-error"
                >
                  Open in New Tab
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Habits & Alarms Notification Help Dialog */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs" id="notif-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`w-full max-w-sm border rounded-3xl p-5 shadow-2xl relative ${
                isCircadian 
                  ? "bg-[#0a0f0d] border-emerald-900/60 text-emerald-100" 
                  : "bg-white border-slate-150 text-slate-800"
              }`}
              id="notif-modal-card"
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                  notificationPermission === "granted"
                    ? (isCircadian ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600")
                    : (isCircadian ? "bg-rose-950/15 border-rose-900/30 text-rose-450" : "bg-rose-50 border-rose-100 text-rose-600")
                }`} id="notif-modal-icon-box">
                  {notificationPermission === "granted" ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider">
                    Reminders &amp; Alerts Status
                  </h3>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">Status:</span>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider py-0.5 px-2 rounded-md ${
                      notificationPermission === "granted" 
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                    }`}>
                      {notificationPermission}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 leading-normal px-2 text-center font-medium">
                  {notificationPermission === "granted" ? (
                    "Excellent! Your browser supports native desktop push alerts. You will receive active 8:00 PM habits reminders and secure telemetry diagnostics automatically."
                  ) : (
                    "To send automatic daily wellness logs, habit trackers, and safe security alarms, Atrack requires standard browser push permissions."
                  )}
                </div>

                {notificationPermission !== "granted" && (
                  <div className={`text-[10px] p-3 rounded-2xl border text-left leading-normal font-medium ${
                    isCircadian 
                      ? "bg-[#0b1411] border-emerald-950 text-emerald-405" 
                      : "bg-indigo-50/50 border-indigo-100 text-indigo-700"
                  }`} id="notif-modal-help-tip">
                    ℹ️ **Important:** Because Atrack is loaded inside a sandboxed iframe, your browser blocks permission requests by default. Open the app in a **new tab** to grant permissions safely!
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-5" id="notif-modal-actions">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center cursor-pointer ${
                    isCircadian 
                      ? "bg-transparent hover:bg-emerald-950/20 border-emerald-900/40 text-emerald-400" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                  id="btn-dismiss-notif"
                >
                  Close
                </button>
                
                {notificationPermission !== "granted" ? (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowNotificationModal(false)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer flex items-center justify-center ${
                      isCircadian 
                        ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-955" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                    id="btn-tab-notif"
                  >
                    Open in New Tab
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined" && "Notification" in window) {
                        try {
                          new Notification("Atrack reminders Active", {
                            body: "Atrack push notification alerts are locked and ready!",
                            icon: "/favicon.ico"
                          });
                        } catch (e) {
                          console.error("Native notification constructor call failed:", e);
                        }
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer ${
                      isCircadian 
                        ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-955" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                    id="btn-test-notif"
                  >
                    Send Test Alert
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
