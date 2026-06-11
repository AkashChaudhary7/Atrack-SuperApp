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

  const getThresholdDays = () => {
    switch (timeframe) {
      case "daily": return 1;
      case "weekly": return 7;
      case "monthly": return 30;
      case "yearly": return 365;
    }
  };

  const thresholdDays = getThresholdDays();

  const isWithinTimeframe = (dateInput: string) => {
    const itemDate = new Date(dateInput);
    if (isNaN(itemDate.getTime())) return true;
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= -0.5 && diffDays <= thresholdDays;
  };

  const filteredExpenses = data.expenses.filter(e => isWithinTimeframe(e.date));
  const filteredWorkouts = data.workouts.filter(w => isWithinTimeframe(w.date));
  const filteredStudies = data.studySessions.filter(s => isWithinTimeframe(s.date));
  const filteredIntimacy = data.intimacyLogs.filter(i => isWithinTimeframe(i.date));

  let y = 18;

  const drawHeader = () => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, 210, 8, "F");
  };

  const checkPageBreak = (heightNeeded: number) => {
    if (y + heightNeeded > 275) {
      doc.addPage();
      drawHeader();
      y = 18;
    }
  };

  drawHeader();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("ATRACK • SECURE VAULT TELEMETRY REPORT", 14, y);
  y += 7;

  // Metadata block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Timeframe: ${timeframe.toUpperCase()} REPORTING (Last ${thresholdDays} Day${thresholdDays > 1 ? "s" : ""})`, 14, y);
  doc.text(`Generated On: ${dateStr}`, 125, y);
  y += 5;

  doc.text(`Profile Segment: ${data.profile.toUpperCase()} • System Owner: AKASH CHAUDHARY`, 14, y);
  y += 6;

  // Line divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, y, 196, y);
  y += 7;

  // Helper for Section Heading
  const addSectionHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(title, 14, y);
    y += 4.5;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    y += 5;
  };

  // --- SECTION 1: ASSETS SUMMARY ---
  addSectionHeader("1. DETAILED ASSET ACCOUNTS VALUATION");
  
  const totalAssetsVal = data.assetAccounts.reduce((sum, aa) => sum + aa.balance, 0);
  const liquidAssetsVal = data.assetAccounts.filter(aa => aa.type === "liquid").reduce((sum, aa) => sum + aa.balance, 0);
  const fixedAssetsVal = data.assetAccounts.filter(aa => aa.type === "fixed").reduce((sum, aa) => sum + aa.balance, 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Valuation: `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${totalAssetsVal.toLocaleString("en-IN")}`, 45, y);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Liquid: INR ${liquidAssetsVal.toLocaleString("en-IN")}`, 105, y);
  doc.text(`Fixed: INR ${fixedAssetsVal.toLocaleString("en-IN")}`, 155, y);
  y += 5.5;

  if (data.assetAccounts.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No asset accounts logged.", 14, y);
    y += 5;
  } else {
    // Draw Account table header
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Account Name", 16, y + 2.5);
    doc.text("Category", 75, y + 2.5);
    doc.text("Liquidity", 120, y + 2.5);
    doc.text("Current Balance", 160, y + 2.5);
    y += 7;

    data.assetAccounts.forEach((acc) => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(acc.name, 16, y);
      doc.text(acc.category, 75, y);
      doc.text(acc.type.toUpperCase(), 120, y);
      doc.setFont("helvetica", "bold");
      doc.text(`INR ${acc.balance.toLocaleString("en-IN")}`, 160, y);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 2: EXPENDITURES ---
  addSectionHeader(`2. DETAILED EXPENDITURE JOURNAL (${timeframe.toUpperCase()})`);
  
  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Period Expenditure: `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.text(`INR ${totalSpent.toFixed(2)}`, 55, y);
  y += 5.5;

  if (filteredExpenses.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No expense logs recorded in this period.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(254, 243, 199); // yellow-100 placeholder background
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text("Date", 16, y + 2.5);
    doc.text("Description", 45, y + 2.5);
    doc.text("Category", 115, y + 2.5);
    doc.text("Amount (INR)", 160, y + 2.5);
    y += 7;

    filteredExpenses.forEach(e => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(e.date, 16, y);
      doc.text(e.description.length > 40 ? e.description.substring(0, 38) + "..." : e.description, 45, y);
      doc.text(e.category, 115, y);
      doc.setFont("helvetica", "bold");
      doc.text(`INR ${e.amount.toFixed(2)}`, 160, y);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 3: BILLS & EMIs ---
  addSectionHeader("3. SECURE BILLS & EMI RECURRING REGISTER");

  const unpaid = data.bills.filter(b => !b.isPaid);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total Registered Invoices: ${data.bills.length}  |  Unpaid: `, 14, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(239, 68, 68);
  doc.text(`${unpaid.length} Pending`, 75, y);
  doc.setTextColor(51, 65, 85);
  y += 5.5;

  if (data.bills.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No recurring bills recorded in the secure vault.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Bill Title", 16, y + 2.5);
    doc.text("Category", 75, y + 2.5);
    doc.text("Due Date", 115, y + 2.5);
    doc.text("Status", 145, y + 2.5);
    doc.text("Amount", 165, y + 2.5);
    y += 7;

    data.bills.forEach(b => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(b.title, 16, y);
      doc.text(b.category, 75, y);
      doc.text(b.dueDate, 115, y);
      if (b.isPaid) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text("PAID", 145, y);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68);
        doc.text("PENDING", 145, y);
      }
      doc.setTextColor(51, 65, 85);
      doc.text(`INR ${b.amount.toLocaleString("en-IN")}`, 165, y);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 4: HABITS ---
  addSectionHeader("4. HABIT DISCIPLINE TRACKER");
  
  if (data.habits.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No habits configured.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Discipline Goal", 16, y + 2.5);
    doc.text("Active Streak", 95, y + 2.5);
    doc.text("Total Check-ins Logged", 130, y + 2.5);
    y += 7;

    data.habits.forEach(h => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(h.name, 16, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`${h.streak} Day(s)`, 95, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(`${h.completedDates.length} Time(s)`, 130, y);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 5: MEDICINES ---
  addSectionHeader("5. PERSONAL MEDICINE REGISTER");

  if (data.medicines.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No medicines logged in directory.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Medicine Name", 16, y + 2.5);
    doc.text("Daily Dosage", 75, y + 2.5);
    doc.text("Daily Reminder Time", 110, y + 2.5);
    doc.text("Inventory Left", 155, y + 2.5);
    y += 7;

    data.medicines.forEach(m => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(m.name, 16, y);
      doc.text(`${m.dosageDaily} Pill(s)`, 75, y);
      doc.text(m.reminderTime || "N/A", 110, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(m.totalPillsLeft < 10 ? 239 : 51, m.totalPillsLeft < 10 ? 68 : 65, m.totalPillsLeft < 10 ? 68 : 85);
      doc.text(`${m.totalPillsLeft} Unit(s)`, 155, y);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 6: WORKOUT LOGS ---
  addSectionHeader(`6. CORE EXERCISES / DISCIPLINE WORKOUTS (${timeframe.toUpperCase()})`);

  if (filteredWorkouts.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No workout entries found for this period filter.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Date Logged", 16, y + 2.5);
    doc.text("Workout Type", 60, y + 2.5);
    doc.text("Sets Count", 110, y + 2.5);
    doc.text("Reps Count", 145, y + 2.5);
    doc.text("Calculated Vol", 170, y + 2.5);
    y += 7;

    filteredWorkouts.forEach(w => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(w.date, 16, y);
      doc.setFont("helvetica", "bold");
      doc.text(w.type, 60, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${w.sets} set(s)`, 110, y);
      doc.text(`${w.reps} rep(s)`, 145, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`${w.sets * w.reps} Reps`, 170, y);
      doc.setTextColor(51, 65, 85);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 7: INTIMACY LOGBOOK ---
  addSectionHeader(`7. PRIVATE LIFE & INTIMACY CHRONICLES (${timeframe.toUpperCase()})`);

  if (filteredIntimacy.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No records registered under intimacy logging database in this period.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Date", 16, y + 2.5);
    doc.text("Partner Label", 45, y + 2.5);
    doc.text("Mood Energy", 95, y + 2.5);
    doc.text("Vault Notes", 130, y + 2.5);
    y += 7;

    filteredIntimacy.forEach(log => {
      checkPageBreak(5.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(log.date, 16, y);
      doc.text(log.partnerName, 45, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(190, 24, 74); // pink-700
      doc.text(log.mood, 95, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const cleanNotes = log.notes ? (log.notes.length > 35 ? log.notes.substring(0, 33) + "..." : log.notes) : "N/A";
      doc.text(cleanNotes, 130, y);
      doc.setTextColor(51, 65, 85);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 8: JERK-OFF TELEMETRY ---
  addSectionHeader("8. PERSONAL JERK-OFF & CHASTITY REGISTRY");

  if (data.jerkOffLogs.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No sexual health logs configured.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Log Date", 16, y + 2.5);
    doc.text("Frequency Index", 85, y + 2.5);
    doc.text("Recorded Sessions", 145, y + 2.5);
    y += 7;

    data.jerkOffLogs.forEach(entry => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(entry.date, 16, y);
      doc.setFont("helvetica", "bold");
      doc.text(`${entry.count} Times`, 85, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${entry.sessions || entry.count} active session(s)`, 145, y);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 9: WEIGHT RECORDS ---
  addSectionHeader("9. WEIGHT FLUCTUATION DATABASES");

  if (data.weightRecords.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No weight history tracked yet.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Date Logged", 16, y + 2.5);
    doc.text("Recorded Weight", 110, y + 2.5);
    y += 7;

    data.weightRecords.forEach(w => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(w.date, 16, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(`${w.weight} KG`, 110, y);
      doc.setTextColor(51, 65, 85);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 10: FOCUS SESSIONS ---
  addSectionHeader(`10. PILOT STUDY FOCUS SESSIONS (${timeframe.toUpperCase()})`);

  if (filteredStudies.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No focus session logs registered in this timeframe.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Date", 16, y + 2.5);
    doc.text("Subject Area", 55, y + 2.5);
    doc.text("Discipline Duration", 145, y + 2.5);
    y += 7;

    filteredStudies.forEach(s => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(s.date, 16, y);
      doc.text(s.subject, 55, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`${s.durationMinutes} focus minutes`, 145, y);
      doc.setTextColor(51, 65, 85);
      y += 4.5;
    });
    y += 3;
  }

  // --- SECTION 11: PLANNER TASKS ---
  addSectionHeader("11. VAULT AGENDA & PLANNER TASKS LIFE-CYCLE");

  if (data.tasks.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("No planner agenda items scheduled.", 14, y);
    y += 5;
  } else {
    checkPageBreak(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Scheduled Date", 16, y + 2.5);
    doc.text("Task Title", 55, y + 2.5);
    doc.text("Category", 125, y + 2.5);
    doc.text("Completion Status", 155, y + 2.5);
    y += 7;

    data.tasks.forEach(t => {
      checkPageBreak(5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(t.date, 16, y);
      doc.text(t.title, 55, y);
      doc.text(t.type, 125, y);
      if (t.isCompleted) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        doc.text("COMPLETED", 155, y);
      } else {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(245, 158, 11); // amber-500
        doc.text("IN-PROGRESS", 155, y);
      }
      doc.setTextColor(51, 65, 85);
      y += 4.5;
    });
    y += 3;
  }

  // Final Intelligence Statement
  checkPageBreak(25);
  y += 5;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 12, "F");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text("ATRACK VAULT • SECURE COMPILING INTELLIGENCE ENGINE", 18, y + 5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Compiled locally on-device via zero-knowledge system protocols. Hand-crafted exclusively for Akash Chaudhary.", 18, y + 9);

  doc.save(`Atrack_${timeframe.toUpperCase()}_Detailed_Telemetry_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};
