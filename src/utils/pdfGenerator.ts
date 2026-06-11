import { jsPDF } from "jspdf";
import { Expense, Bill, Habit, IntimacyLog, JerkOffLog, Medicine, WeightRecord, WorkoutLog, PlannerTask, StudyFocusSession, AssetAccount } from "../types";

interface ReportData {
  profile: string;
  expenses: Expense[];
  bills: Bill[];
  habits: Habit[];
  intimacyLogs: IntimacyLog[];
  jerkOffLogs: JerkOffLog[];
  medicines: Medicine[];
  weightRecords: WeightRecord[];
  workouts: WorkoutLog[];
  tasks: PlannerTask[];
  studySessions: StudyFocusSession[];
  assetAccounts: AssetAccount[];
}

export const generatePDFReport = (
  timeframe: "daily" | "weekly" | "monthly" | "yearly",
  data: ReportData
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate filtering threshold in days
  const getThresholdDays = () => {
    switch (timeframe) {
      case "daily": return 1;
      case "weekly": return 7;
      case "monthly": return 30;
      case "yearly": return 365;
    }
  };

  const thresholdDays = getThresholdDays();

  // Helper inside PDF generator to filter items based on daily/weekly/monthly/yearly rules
  const isWithinTimeframe = (dateInput: string) => {
    const itemDate = new Date(dateInput);
    if (isNaN(itemDate.getTime())) return true; // Default fallback if bad date
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= -0.5 && diffDays <= thresholdDays; // Allow a small buffer for timezone shifts
  };

  const filteredExpenses = data.expenses.filter(e => isWithinTimeframe(e.date));
  const filteredWorkouts = data.workouts.filter(w => isWithinTimeframe(w.date));
  const filteredStudies = data.studySessions.filter(s => isWithinTimeframe(s.date));
  const filteredIntimacy = data.intimacyLogs.filter(i => isWithinTimeframe(i.date));
  
  // Header section
  let y = 18;

  // Add a neat primary border and dark accent band
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 8, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900 (ultra elite dark text)
  doc.text("ATRACK • PREMIUM HEALTH & FINANCE LEDGER", 14, y);
  y += 7;

  // Metadata block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Scope: ${timeframe.toUpperCase()} TELEMETRY (Last ${thresholdDays} Day${thresholdDays > 1 ? "s" : ""})`, 14, y);
  doc.text(`Generated: ${dateStr}`, 130, y);
  y += 5;

  doc.text(`Profile Partition: ${data.profile.toUpperCase()} • Verified Owner: AKASH CHAUDHARY`, 14, y);
  y += 6;

  // Horizontal line divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 8;

  // SECTION 1: ASSETS SUMMARY (USER'S NEW REQUEST)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text("1. TOTAL ASSETS VALUATION", 14, y);
  y += 5;

  // Calculators
  const totalAssetsVal = data.assetAccounts.reduce((sum, aa) => sum + aa.balance, 0);
  const liquidAssetsVal = data.assetAccounts
    .filter(aa => aa.type === "liquid")
    .reduce((sum, aa) => sum + aa.balance, 0);
  const fixedAssetsVal = data.assetAccounts
    .filter(aa => aa.type === "fixed")
    .reduce((sum, aa) => sum + aa.balance, 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Combined Net Worth: `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${totalAssetsVal.toLocaleString("en-IN")}`, 56, y);

  doc.setFont("helvetica", "normal");
  doc.text(`Liquid Assets (Savings/Cash): `, 115, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129); // emerald-550
  doc.text(`INR ${liquidAssetsVal.toLocaleString("en-IN")}`, 160, y);
  doc.setTextColor(51, 65, 85);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.text(`Fixed Assets (Stocks/MF/FD): `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${fixedAssetsVal.toLocaleString("en-IN")}`, 56, y);
  y += 7;

  // Accounts Detail List (Aesthetic compact grid)
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y - 1, 182, 30, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Account Name", 18, y + 3);
  doc.text("Category", 75, y + 3);
  doc.text("Liquidity", 115, y + 3);
  doc.text("Balance", 160, y + 3);
  
  doc.line(14, y + 5, 196, y + 5);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  
  // Show up to top 4 accounts to keep the first page super polished
  const topAccounts = data.assetAccounts.slice(0, 4);
  topAccounts.forEach((acc, i) => {
    doc.setFont("helvetica", "medium");
    doc.setTextColor(51, 65, 85);
    doc.text(acc.name, 18, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(acc.category, 75, y);
    doc.text(acc.type.toUpperCase(), 115, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(`INR ${acc.balance.toLocaleString("en-IN")}`, 160, y);
    y += 4.5;
  });
  y += 4;

  // SECTION 2: EXPENDITURES FILTERED BY TIMEFRAME
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("2. EXPENSES REPORT SUMMARY", 14, y);
  y += 5;

  const totalTimeframeSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Period Expenses Logged: `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${totalTimeframeSpent.toFixed(2)}`, 62, y);
  y += 6;

  if (filteredExpenses.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No expense logs recorded in this period range.", 18, y);
    y += 6;
  } else {
    // Mini table of expenses
    doc.setFillColor(254, 243, 199); // yellow-100 placeholder background
    doc.rect(14, y - 1, 182, 18, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9); // amber-800
    doc.text("Description", 18, y + 3);
    doc.text("Category", 75, y + 3);
    doc.text("Date Logged", 120, y + 3);
    doc.text("Amount", 165, y + 3);
    
    doc.line(14, y + 5, 196, y + 5);
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    
    // Print first 3 expenses
    filteredExpenses.slice(0, 3).forEach(e => {
      doc.text(e.description.length > 30 ? e.description.substring(0, 28) + "..." : e.description, 18, y);
      doc.text(e.category, 75, y);
      doc.text(e.date, 120, y);
      doc.setFont("helvetica", "bold");
      doc.text(`INR ${e.amount}`, 165, y);
      doc.setFont("helvetica", "normal");
      y += 4.5;
    });

    if (filteredExpenses.length > 3) {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text(`... and ${filteredExpenses.length - 3} other record(s) on the safe database.`, 18, y);
      y += 4.5;
    }
    y += 2;
  }

  // FORCE PAGE BREAK OR SECURE CONTINUATION
  // In jsPDF, check of remaining y height
  if (y > 175) {
    doc.addPage();
    y = 20;
    // Top banner for Page 2
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 5, "F");
  }

  // SECTION 3: BILLS & EMI TELEMETRY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("3. CURRENT BILLS & EMI SUMMARY", 14, y);
  y += 5;

  const unpaidBills = data.bills.filter(b => !b.isPaid);
  const paidBills = data.bills.filter(b => b.isPaid);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Pending EMIs/Bills: `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(239, 68, 68); // Red-550
  doc.text(`${unpaidBills.length} Bill(s)`, 50, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(`Paid: `, 115, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text(`${paidBills.length} Bill(s)`, 130, y);
  doc.setTextColor(51, 65, 85);
  y += 7;

  // SECTION 4: HEALTH, HABITS & PRODUCTIVITY STREAM
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text("4. HEALTH, HABITS & STUDY TELEMETRY", 14, y);
  y += 5;

  // Details
  const totalStudyTime = filteredStudies.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalWorkouts = filteredWorkouts.length;
  const averageStreak = data.habits.length > 0
    ? (data.habits.reduce((sum, h) => sum + h.streak, 0) / data.habits.length).toFixed(1)
    : "0";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`• Study Focus Sessions: `, 16, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalStudyTime} focused minute(s) in this period`, 56, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.text(`• Discipline Workouts: `, 16, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${totalWorkouts} Core Squats/Kegels recorded`, 56, y);
  y += 4.5;

  doc.setFont("helvetica", "normal");
  doc.text(`• Habits Average Streak: `, 16, y);
  doc.setFont("helvetica", "bold");
  doc.text(`${averageStreak} steady complete days`, 56, y);
  y += 10;

  // Footer band
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 12, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229); // Premium Indigo-600
  doc.text("ATRACK VAULT • SECURE ANALYTICS INTELLIGENCE CORE", 18, y + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Compiled locally on-device. Zero external network cloud residue recorded. Hand-crafted exclusively for Akash Chaudhary.", 18, y + 9);

  // Trigger browser download and return
  doc.save(`Atrack_${timeframe.toUpperCase()}_Telemetry_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};
