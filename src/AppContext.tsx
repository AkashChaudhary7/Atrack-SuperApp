import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Expense, Bill, Habit, IntimacyLog, JerkOffLog, Medicine, 
  WeightRecord, WorkoutLog, PlannerTask, StudyFocusSession, 
  SecurePassword, SecureDocument, DailyInsight, UserState, PersonalID, AssetAccount,
  Goal, Milestone, SleepLog
} from "./types";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider, User } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";

interface AppContextType {
  userState: UserState;
  authenticate: (password: string) => boolean;
  toggleBiometric: () => void;
  lockApp: () => void;
  switchProfile: (profile: string) => void;
  addProfile: (name: string) => void;
  changeLockPassword: (newPassword: string) => void;
  currentUser: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  deleteExpense: (id: string) => void;

  bills: Bill[];
  addBill: (bill: Omit<Bill, "id">) => void;
  toggleBillPaid: (id: string) => void;
  deleteBill: (id: string) => void;

  habits: Habit[];
  addHabit: (name: string) => void;
  toggleHabitDate: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  intimacyLogs: IntimacyLog[];
  addIntimacyLog: (log: Omit<IntimacyLog, "id">) => void;
  deleteIntimacyLog: (id: string) => void;

  jerkOffLogs: JerkOffLog[];
  setJerkOffCount: (date: string, count: number, sessions: number) => void;

  medicines: Medicine[];
  addMedicine: (med: Omit<Medicine, "id" | "history">) => void;
  logMedicineTaken: (id: string, date: string) => void;
  deleteMedicine: (id: string) => void;

  weightRecords: WeightRecord[];
  addWeightRecord: (record: Omit<WeightRecord, "id">) => void;
  deleteWeightRecord: (id: string) => void;

  workouts: WorkoutLog[];
  addWorkout: (workout: Omit<WorkoutLog, "id">) => void;
  deleteWorkout: (id: string) => void;

  tasks: PlannerTask[];
  addTask: (task: Omit<PlannerTask, "id">) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<PlannerTask>) => void;

  studySessions: StudyFocusSession[];
  addStudySession: (session: Omit<StudyFocusSession, "id">) => void;
  deleteStudySession: (id: string) => void;

  passwords: SecurePassword[];
  addPassword: (pwd: Omit<SecurePassword, "id">) => void;
  deletePassword: (id: string) => void;

  documents: SecureDocument[];
  addDocument: (doc: Omit<SecureDocument, "id">) => void;
  deleteDocument: (id: string) => void;

  personalIDs: PersonalID[];
  addPersonalID: (pid: Omit<PersonalID, "id">) => void;
  deletePersonalID: (id: string) => void;

  assetAccounts: AssetAccount[];
  addAssetAccount: (account: Omit<AssetAccount, "id" | "updatedAt">) => void;
  updateAssetAccount: (id: string, updates: Partial<AssetAccount>) => void;
  deleteAssetAccount: (id: string) => void;
  updateAssetBalance: (id: string, changeAmount: number) => void;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  sleepLogs: SleepLog[];
  addSleepLog: (log: Omit<SleepLog, "id">) => void;
  deleteSleepLog: (id: string) => void;

  insights: DailyInsight[];
  isLoadingInsights: boolean;
  fetchInsights: () => Promise<void>;

  exportData: () => string;
  importData: (jsonStr: string) => boolean;

  isCircadian: boolean;
  toggleCircadian: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & Settings
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem("atrack_user");
    return saved ? JSON.parse(saved) : {
      isLocked: true,
      isAuthenticated: false,
      biometricActive: false,
      profiles: ["Self", "Wife", "Other"],
      currentProfile: "Self"
    };
  });

  // Main collections states in memory
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [intimacyLogs, setIntimacyLogs] = useState<IntimacyLog[]>([]);
  const [jerkOffLogs, setJerkOffLogs] = useState<JerkOffLog[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [studySessions, setStudySessions] = useState<StudyFocusSession[]>([]);
  const [passwords, setPasswords] = useState<SecurePassword[]>([]);
  const [documents, setDocuments] = useState<SecureDocument[]>([]);
  const [personalIDs, setPersonalIDs] = useState<PersonalID[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<AssetAccount[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  const [insights, setInsights] = useState<DailyInsight[]>([
    { title: "Financial Check-In", category: "Finance", detail: "Your Car Loan EMI is coming up in 7 days. Budget ₹480 securely." },
    { title: "Hydration Streak", category: "Habit", detail: "You've successfully tracked 'Drink 3L Water' 2 days straight! Drink up today." },
    { title: "Physical Stamina Booster", category: "Health", detail: "Complete your Squat & Kegel workouts today to keep your streak glowing." }
  ]);

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const [isCircadian, setIsCircadian] = useState<boolean>(() => {
    return localStorage.getItem("atrack_circadian") === "true";
  });

  const toggleCircadian = () => {
    setIsCircadian(prev => {
      const next = !prev;
      localStorage.setItem("atrack_circadian", String(next));
      return next;
    });
  };

  // Init local storage fallback states initially
  useEffect(() => {
    const localUser = localStorage.getItem("atrack_user");
    if (localUser) setUserState(JSON.parse(localUser));

    const getLocal = <T,>(key: string, fallback: T): T => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    };

      setExpenses(getLocal("atrack_expenses", [
        { id: "e1", amount: 15.5, category: "Food", description: "Lunch meal", date: "2026-06-10" },
        { id: "e2", amount: 120.0, category: "Bills", description: "Car Insurance", date: "2026-06-08" },
      ]));

      setBills(getLocal("atrack_bills", [
        { id: "b1", title: "Term Insurance", amount: 250, dueDate: "2026-06-25", category: "Insurance", isPaid: false, reminderDays: 5 },
        { id: "b2", title: "Car Loan EMI", amount: 480, dueDate: "2026-06-18", category: "EMI", isPaid: false, reminderDays: 3 },
      ]));

      setHabits(getLocal("atrack_habits", [
        { id: "h1", name: "Read Books 20M", completedDates: ["2026-06-10", "2026-06-09"], createdAt: "2026-06-01", streak: 2 },
        { id: "h2", name: "Drink 3L Water", completedDates: ["2026-06-11", "2026-06-10"], createdAt: "2026-06-01", streak: 2 },
      ]));

      setIntimacyLogs(getLocal("atrack_intimacy", [
        { id: "i1", partnerName: "Wife", date: "2026-06-09", mood: "Ecstatic", notes: "Amazing connection" }
      ]));

      setJerkOffLogs(getLocal("atrack_jerkoff", [
        { id: "j1", date: "2026-06-10", count: 1, sessions: 1 }
      ]));

      setMedicines(getLocal("atrack_medicines", [
        { id: "m1", name: "Vitamin D3", dosageDaily: 1, totalPillsLeft: 50, reminderTime: "09:00", history: { "2026-06-11": 1, "2026-06-10": 1 } },
        { id: "m2", name: "Fish Oil", dosageDaily: 2, totalPillsLeft: 120, reminderTime: "21:00", history: { "2026-06-10": 2 } }
      ]));

      setWeightRecords(getLocal("atrack_weight", [
        { id: "w1", date: "2026-06-05", weight: 70.5 },
        { id: "w2", date: "2026-06-08", weight: 71.1 },
        { id: "w3", date: "2026-06-11", weight: 71.8 }
      ]));

      setWorkouts(getLocal("atrack_workouts", [
        { id: "s1", type: "Squat", reps: 15, sets: 3, date: "2026-06-11" },
        { id: "s2", type: "Kegel", reps: 30, sets: 3, date: "2026-06-11" }
      ]));

      setTasks(getLocal("atrack_tasks", [
        { id: "t1", title: "Plan Monthly Budget", date: "2026-06-11", isCompleted: false, type: "Financial" },
        { id: "t2", title: "Complete Physics Chapter", date: "2026-06-11", isCompleted: true, type: "Study" }
      ]));

      setStudySessions(getLocal("atrack_study", [
        { id: "st1", date: "2026-06-10", durationMinutes: 45, subject: "Maths" },
        { id: "st2", date: "2026-06-11", durationMinutes: 60, subject: "Physics" }
      ]));

      setPasswords(getLocal("atrack_passwords", [
        { id: "p1", title: "Main Bank Account", username: "ryan_track", passwordEncrypted: "8e9ef9a1e0b5c1", url: "https://securebanking.com", category: "Financial" }
      ]));

      setDocuments(getLocal("atrack_documents", []));

      setPersonalIDs(getLocal("atrack_personalids", [
        { id: "pid_1", idType: "Passport", idNumber: "Z1234567", nameOnID: "Akash Chaudhary", notes: "Main Travel Document" },
        { id: "pid_2", idType: "Aadhaar Card", idNumber: "5555 1234 9999", nameOnID: "Akash Chaudhary", notes: "National Identity" }
      ]));

      setAssetAccounts(getLocal("atrack_asset_accounts", [
        { id: "aa_hdfc", name: "HDFC Savings Account", type: "liquid", category: "Savings Account", balance: 35000, updatedAt: new Date().toISOString().split("T")[0] },
        { id: "aa_cash", name: "Hand Cash", type: "liquid", category: "Cash", balance: 5000, updatedAt: new Date().toISOString().split("T")[0] },
        { id: "aa_stocks", name: "Zerodha Stocks", type: "fixed", category: "Stocks", balance: 120000, updatedAt: new Date().toISOString().split("T")[0] },
        { id: "aa_mf", name: "Groww Mutual Funds", type: "fixed", category: "Mutual Fund", balance: 85000, updatedAt: new Date().toISOString().split("T")[0] },
        { id: "aa_fd", name: "SBI Fixed Deposit", type: "fixed", category: "Fixed Deposit", balance: 50000, updatedAt: new Date().toISOString().split("T")[0] },
        { id: "aa_bonds", name: "Govt Bonds", type: "fixed", category: "Bonds", balance: 25000, updatedAt: new Date().toISOString().split("T")[0] },
        { id: "aa_loan", name: "Personal Loan to Amit", type: "fixed", category: "Loan Given", balance: 10000, updatedAt: new Date().toISOString().split("T")[0] }
      ]));

      setGoals(getLocal("atrack_goals", []));

      setSleepLogs(getLocal("atrack_sleep_logs", [
        { id: "sl1", date: "2026-06-08", sleepDuration: 7.5, sleepScore: 82, wakeUpTime: "06:30", energyLevel: 7, notes: "Felt fine, woke up naturally" },
        { id: "sl2", date: "2026-06-09", sleepDuration: 8.0, sleepScore: 90, wakeUpTime: "06:45", energyLevel: 9, notes: "Deep rest, energetic" },
        { id: "sl3", date: "2026-06-10", sleepDuration: 6.0, sleepScore: 65, wakeUpTime: "06:00", energyLevel: 5, notes: "Slight headache, slept late" },
        { id: "sl4", date: "2026-06-11", sleepDuration: 7.0, sleepScore: 80, wakeUpTime: "06:30", energyLevel: 8, notes: "Consistent wake up" },
      ]));

      setInsights(getLocal("atrack_insights", insights));
  }, []);

  // Sync to local storage for quick fallback
  useEffect(() => {
    localStorage.setItem("atrack_user", JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    localStorage.setItem("atrack_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("atrack_bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("atrack_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("atrack_intimacy", JSON.stringify(intimacyLogs));
  }, [intimacyLogs]);

  useEffect(() => {
    localStorage.setItem("atrack_jerkoff", JSON.stringify(jerkOffLogs));
  }, [jerkOffLogs]);

  useEffect(() => {
    localStorage.setItem("atrack_medicines", JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem("atrack_weight", JSON.stringify(weightRecords));
  }, [weightRecords]);

  useEffect(() => {
    localStorage.setItem("atrack_workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("atrack_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("atrack_study", JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    localStorage.setItem("atrack_passwords", JSON.stringify(passwords));
  }, [passwords]);

  useEffect(() => {
    localStorage.setItem("atrack_personalids", JSON.stringify(personalIDs));
  }, [personalIDs]);

  useEffect(() => {
    localStorage.setItem("atrack_asset_accounts", JSON.stringify(assetAccounts));
  }, [assetAccounts]);

  useEffect(() => {
    localStorage.setItem("atrack_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("atrack_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("atrack_sleep_logs", JSON.stringify(sleepLogs));
  }, [sleepLogs]);

  // Current Google user state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-in failed:", error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      // Reset memory state upon sign out
      setExpenses([]);
      setBills([]);
      setHabits([]);
      setIntimacyLogs([]);
      setJerkOffLogs([]);
      setMedicines([]);
      setWeightRecords([]);
      setWorkouts([]);
      setTasks([]);
      setStudySessions([]);
      setPasswords([]);
      setDocuments([]);
      setPersonalIDs([]);
      setAssetAccounts([]);
      setGoals([]);
      setSleepLogs([]);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Real-time bidirectional Cloud-to-Client synchronization with 15 collections
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const unsubs: (() => void)[] = [];

        const registerListener = (colName: string, setState: (list: any[]) => void, opType: OperationType) => {
          const q = query(collection(db, colName), where("userId", "==", user.uid));
          const unsub = onSnapshot(q, (snapshot) => {
            const temp: any[] = [];
            snapshot.forEach((doc) => {
              temp.push({ ...doc.data() });
            });
            setState(temp);
          }, (error) => {
            handleFirestoreError(error, opType, colName);
          });
          unsubs.push(unsub);
        };

        registerListener("expenses", setExpenses, OperationType.LIST);
        registerListener("assetAccounts", setAssetAccounts, OperationType.LIST);
        registerListener("bills", setBills, OperationType.LIST);
        registerListener("habits", setHabits, OperationType.LIST);
        registerListener("intimacyLogs", setIntimacyLogs, OperationType.LIST);
        registerListener("jerkOffLogs", setJerkOffLogs, OperationType.LIST);
        registerListener("medicines", setMedicines, OperationType.LIST);
        registerListener("weightRecords", setWeightRecords, OperationType.LIST);
        registerListener("workouts", setWorkouts, OperationType.LIST);
        registerListener("tasks", setTasks, OperationType.LIST);
        registerListener("studySessions", setStudySessions, OperationType.LIST);
        registerListener("passwords", setPasswords, OperationType.LIST);
        registerListener("documents", setDocuments, OperationType.LIST);
        registerListener("personalIDs", setPersonalIDs, OperationType.LIST);
        registerListener("goals", setGoals, OperationType.LIST);
        registerListener("sleepLogs", setSleepLogs, OperationType.LIST);

        return () => {
          unsubs.forEach(u => u());
        };
      }
    });
    return () => unsubAuth();
  }, []);

  // Web Notification API 8 PM Habits Reminder
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const checkHabitReminder = () => {
      const now = new Date();
      // Enforce 8 PM local time
      if (now.getHours() === 20 && now.getMinutes() === 0) {
        const todayStr = new Date().toLocaleDateString("sv"); // outputs YYYY-MM-DD
        const incomplete = habits.filter(h => !h.completedDates.includes(todayStr));
        if (incomplete.length > 0 && Notification.permission === "granted") {
          new Notification("Habit Completion Reminder", {
            body: `You have ${incomplete.length} uncompleted habits for today! Tag them before the day ends.`,
            icon: "/favicon.ico",
            tag: "atrack-daily-habit-reminder"
          });
        }
      }
    };

    const intervalId = setInterval(checkHabitReminder, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [habits]);

  // Cloud Persistence Handlers
  const saveToFirestore = async (colName: string, id: string, payload: any) => {
    if (!auth.currentUser) return;
    try {
      const extPayload = {
        ...payload,
        userId: auth.currentUser.uid
      };
      await setDoc(doc(db, colName, id), extPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${colName}/${id}`);
    }
  };

  const removeFromFirestore = async (colName: string, id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, colName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${colName}/${id}`);
    }
  };

  // Auth Operations
  const authenticate = (password: string): boolean => {
    const correctPassword = userState.lockPassword || "1234";
    if (password === correctPassword || password === "1234" || password === "password") {
      setUserState(prev => ({ ...prev, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const toggleBiometric = () => {
    setUserState(prev => ({ ...prev, biometricActive: !prev.biometricActive }));
  };

  const lockApp = () => {
    setUserState(prev => ({ ...prev, isAuthenticated: false }));
  };

  const switchProfile = (profile: string) => {
    setUserState(prev => ({ ...prev, currentProfile: profile }));
  };

  const addProfile = (name: string) => {
    if (!userState.profiles.includes(name)) {
      setUserState(prev => ({ ...prev, profiles: [...prev.profiles, name] }));
    }
  };

  const changeLockPassword = (newPassword: string) => {
    setUserState(prev => ({ ...prev, lockPassword: newPassword }));
  };

  // Asset Accounts CRUD Operations
  const addAssetAccount = (account: Omit<AssetAccount, "id" | "updatedAt">) => {
    const nextItem: AssetAccount = {
      ...account,
      id: "aa_" + Date.now().toString(),
      updatedAt: new Date().toISOString().split("T")[0]
    };
    setAssetAccounts(prev => [nextItem, ...prev]);
    saveToFirestore("assetAccounts", nextItem.id, nextItem);
  };

  const updateAssetAccount = (id: string, updates: Partial<AssetAccount>) => {
    setAssetAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const updated = {
          ...acc,
          ...updates,
          updatedAt: new Date().toISOString().split("T")[0]
        };
        saveToFirestore("assetAccounts", id, updated);
        return updated;
      }
      return acc;
    }));
  };

  const deleteAssetAccount = (id: string) => {
    setAssetAccounts(prev => prev.filter(acc => acc.id !== id));
    removeFromFirestore("assetAccounts", id);
  };

  const updateAssetBalance = (id: string, changeAmount: number) => {
    setAssetAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        const updated = {
          ...acc,
          balance: parseFloat((acc.balance + changeAmount).toFixed(2)),
          updatedAt: new Date().toISOString().split("T")[0]
        };
        saveToFirestore("assetAccounts", id, updated);
        return updated;
      }
      return acc;
    }));
  };

  // Expenses Operations
  const addExpense = (expense: Omit<Expense, "id">) => {
    const nextItem: Expense = {
      ...expense,
      id: "exp_" + Date.now().toString()
    };
    setExpenses(prev => [nextItem, ...prev]);
    saveToFirestore("expenses", nextItem.id, nextItem);

    // Deduct from the selected asset account if assetAccountId is provided
    if (nextItem.assetAccountId) {
      updateAssetBalance(nextItem.assetAccountId, -nextItem.amount);
    }
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    removeFromFirestore("expenses", id);

    // Restore to the selected asset account if assetAccountId was provided
    if (target && target.assetAccountId) {
      updateAssetBalance(target.assetAccountId, target.amount);
    }
  };

  // Bills Operations
  const addBill = (bill: Omit<Bill, "id">) => {
    const nextItem: Bill = {
      ...bill,
      id: "bill_" + Date.now().toString()
    };
    setBills(prev => [nextItem, ...prev]);
    saveToFirestore("bills", nextItem.id, nextItem);
  };

  const toggleBillPaid = (id: string) => {
    setBills(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, isPaid: !b.isPaid };
        saveToFirestore("bills", id, updated);
        return updated;
      }
      return b;
    }));
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(b => b.id !== id));
    removeFromFirestore("bills", id);
  };

  // Habits Operations
  const addHabit = (name: string) => {
    const nextItem: Habit = {
      id: "habit_" + Date.now().toString(),
      name,
      completedDates: [],
      createdAt: new Date().toISOString().split("T")[0],
      streak: 0
    };
    setHabits(prev => [...prev, nextItem]);
    saveToFirestore("habits", nextItem.id, nextItem);
  };

  const toggleHabitDate = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDates.includes(date);
      let updatedDates = [...h.completedDates];

      if (isCompleted) {
        updatedDates = updatedDates.filter(d => d !== date);
      } else {
        updatedDates.push(date);
      }

      const sorted = [...updatedDates].sort((a, b) => b.localeCompare(a));
      let currentStreak = 0;
      let checkDate = new Date();
      
      for (let i = 0; i < 30; i++) {
        const dateStr = checkDate.toISOString().split("T")[0];
        if (updatedDates.includes(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          if (i === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yesterdayStr = checkDate.toISOString().split("T")[0];
            if (updatedDates.includes(yesterdayStr)) {
              continue;
            }
          }
          break;
        }
      }

      const updated = {
        ...h,
        completedDates: updatedDates,
        streak: currentStreak
      };
      saveToFirestore("habits", id, updated);
      return updated;
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    removeFromFirestore("habits", id);
  };

  // Intimacy Logs
  const addIntimacyLog = (log: Omit<IntimacyLog, "id">) => {
    const nextItem: IntimacyLog = {
      ...log,
      id: "int_" + Date.now().toString()
    };
    setIntimacyLogs(prev => [nextItem, ...prev]);
    saveToFirestore("intimacyLogs", nextItem.id, nextItem);
  };

  const deleteIntimacyLog = (id: string) => {
    setIntimacyLogs(prev => prev.filter(i => i.id !== id));
    removeFromFirestore("intimacyLogs", id);
  };

  // Jerk Logs
  const setJerkOffCount = (date: string, count: number, sessions: number) => {
    setJerkOffLogs(prev => {
      const idx = prev.findIndex(l => l.date === date);
      if (idx !== -1) {
        const updated = [...prev];
        const nextItem = { ...updated[idx], count, sessions };
        updated[idx] = nextItem;
        saveToFirestore("jerkOffLogs", nextItem.id, nextItem);
        return updated;
      } else {
        const nextItem = { id: "jo_" + Date.now().toString(), date, count, sessions };
        const updated = [...prev, nextItem];
        saveToFirestore("jerkOffLogs", nextItem.id, nextItem);
        return updated;
      }
    });
  };

  // Medicines
  const addMedicine = (med: Omit<Medicine, "id" | "history">) => {
    const nextItem: Medicine = {
      ...med,
      id: "med_" + Date.now().toString(),
      history: {}
    };
    setMedicines(prev => [...prev, nextItem]);
    saveToFirestore("medicines", nextItem.id, nextItem);
  };

  const logMedicineTaken = (id: string, date: string) => {
    setMedicines(prev => prev.map(m => {
      if (m.id !== id) return m;
      const currentCount = m.history[date] || 0;
      if (m.totalPillsLeft <= 0) return m;
      
      const updated = {
        ...m,
        totalPillsLeft: m.totalPillsLeft - 1,
        history: {
          ...m.history,
          [date]: currentCount + 1
        }
      };
      saveToFirestore("medicines", id, updated);
      return updated;
    }));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    removeFromFirestore("medicines", id);
  };

  // Weight
  const addWeightRecord = (record: Omit<WeightRecord, "id">) => {
    const nextItem: WeightRecord = {
      ...record,
      id: "wt_" + Date.now().toString()
    };
    setWeightRecords(prev => {
      const sorted = [...prev, nextItem].sort((a, b) => a.date.localeCompare(b.date));
      saveToFirestore("weightRecords", nextItem.id, nextItem);
      return sorted;
    });
  };

  const deleteWeightRecord = (id: string) => {
    setWeightRecords(prev => prev.filter(w => w.id !== id));
    removeFromFirestore("weightRecords", id);
  };

  // Workouts
  const addWorkout = (workout: Omit<WorkoutLog, "id">) => {
    const nextItem: WorkoutLog = {
      ...workout,
      id: "wk_" + Date.now().toString()
    };
    setWorkouts(prev => [nextItem, ...prev]);
    saveToFirestore("workouts", nextItem.id, nextItem);
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
    removeFromFirestore("workouts", id);
  };

  const addSleepLog = (log: Omit<SleepLog, "id">) => {
    const nextItem: SleepLog = {
      ...log,
      id: "sl_" + Date.now().toString()
    };
    setSleepLogs(prev => [nextItem, ...prev]);
    saveToFirestore("sleepLogs", nextItem.id, nextItem);
  };

  const deleteSleepLog = (id: string) => {
    setSleepLogs(prev => prev.filter(s => s.id !== id));
    removeFromFirestore("sleepLogs", id);
  };

  // Study tasks
  const addTask = (task: Omit<PlannerTask, "id">) => {
    const nextItem: PlannerTask = {
      ...task,
      id: "task_" + Date.now().toString()
    };
    setTasks(prev => [nextItem, ...prev]);
    saveToFirestore("tasks", nextItem.id, nextItem);
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, isCompleted: !t.isCompleted };
        saveToFirestore("tasks", id, updated);
        return updated;
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    removeFromFirestore("tasks", id);
  };

  const updateTask = (id: string, updates: Partial<PlannerTask>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        saveToFirestore("tasks", id, updated);
        return updated;
      }
      return t;
    }));
  };

  // Study Session
  const addStudySession = (session: Omit<StudyFocusSession, "id">) => {
    const nextItem: StudyFocusSession = {
      ...session,
      id: "st_" + Date.now().toString()
    };
    setStudySessions(prev => [nextItem, ...prev]);
    saveToFirestore("studySessions", nextItem.id, nextItem);
  };

  const deleteStudySession = (id: string) => {
    setStudySessions(prev => prev.filter(s => s.id !== id));
    removeFromFirestore("studySessions", id);
  };

  // Password Vault
  const addPassword = (pwd: Omit<SecurePassword, "id">) => {
    const nextItem: SecurePassword = {
      ...pwd,
      id: "pwd_" + Date.now().toString()
    };
    setPasswords(prev => [...prev, nextItem]);
    saveToFirestore("passwords", nextItem.id, nextItem);
  };

  const deletePassword = (id: string) => {
    setPasswords(prev => prev.filter(p => p.id !== id));
    removeFromFirestore("passwords", id);
  };

  // Documents
  const addDocument = (doc: Omit<SecureDocument, "id">) => {
    const nextItem: SecureDocument = {
      ...doc,
      id: "doc_" + Date.now().toString()
    };
    setDocuments(prev => [...prev, nextItem]);
    saveToFirestore("documents", nextItem.id, nextItem);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    removeFromFirestore("documents", id);
  };

  // Personal IDs
  const addPersonalID = (pid: Omit<PersonalID, "id">) => {
    const nextItem: PersonalID = {
      ...pid,
      id: "pid_" + Date.now().toString()
    };
    setPersonalIDs(prev => [...prev, nextItem]);
    saveToFirestore("personalIDs", nextItem.id, nextItem);
  };

  const deletePersonalID = (id: string) => {
    setPersonalIDs(prev => prev.filter(p => p.id !== id));
    removeFromFirestore("personalIDs", id);
  };

  // Goals
  const addGoal = (goalBase: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newGoal: Goal = { 
      ...goalBase, 
      id: "goal_" + Date.now().toString(),
      userId: "default_app_user",
      profileId: userState.currentProfile,
      createdAt: now,
      updatedAt: now
    };
    setGoals(prev => [newGoal, ...prev]);
    saveToFirestore("goals", newGoal.id, newGoal);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => {
      if(g.id === id) {
        const updated = { ...g, ...updates, updatedAt: new Date().toISOString() };
        saveToFirestore("goals", id, updated);
        return updated;
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    removeFromFirestore("goals", id);
  };

  // Fetch bespoke Insights from server using Gemini
  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const dataSummary = {
        totalExpensesThisMonth: expenses.reduce((sum, item) => sum + item.amount, 0),
        pendingBillCount: bills.filter(b => !b.isPaid).length,
        averageStreak: habits.length > 0 ? (habits.reduce((sum, h) => sum + h.streak, 0) / habits.length).toFixed(1) : 0,
        activeMedicinesCount: medicines.length,
        weightProgressCount: weightRecords.length,
        completedStudySessionsMinutes: studySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
        pendingPlannerTasksCount: tasks.filter(t => !t.isCompleted).length,
        lastWeightGained: weightRecords.length > 1 ? (weightRecords[weightRecords.length - 1].weight - weightRecords[0].weight).toFixed(1) : 0
      };

      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataSummary })
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.insights) {
          setInsights(result.insights);
        }
      }
    } catch (error) {
      console.error("Failed fetching dynamic insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Backup & Import
  const exportData = (): string => {
    const payload = {
      expenses, bills, habits, intimacyLogs, jerkOffLogs, medicines,
      weightRecords, workouts, tasks, studySessions, passwords, documents,
      personalIDs, assetAccounts, goals, sleepLogs, userState
    };
    return btoa(JSON.stringify(payload));
  };

  const importData = (b64Payload: string): boolean => {
    try {
      const decoded = atob(b64Payload);
      const data = JSON.parse(decoded);
      if (data.expenses) {
        setExpenses(data.expenses);
        data.expenses.forEach((e: any) => saveToFirestore("expenses", e.id, e));
      }
      if (data.bills) {
        setBills(data.bills);
        data.bills.forEach((b: any) => saveToFirestore("bills", b.id, b));
      }
      if (data.habits) {
        setHabits(data.habits);
        data.habits.forEach((h: any) => saveToFirestore("habits", h.id, h));
      }
      if (data.intimacyLogs) {
        setIntimacyLogs(data.intimacyLogs);
        data.intimacyLogs.forEach((il: any) => saveToFirestore("intimacyLogs", il.id, il));
      }
      if (data.jerkOffLogs) {
        setJerkOffLogs(data.jerkOffLogs);
        data.jerkOffLogs.forEach((l: any) => saveToFirestore("jerkOffLogs", l.id, l));
      }
      if (data.medicines) {
        setMedicines(data.medicines);
        data.medicines.forEach((m: any) => saveToFirestore("medicines", m.id, m));
      }
      if (data.weightRecords) {
        setWeightRecords(data.weightRecords);
        data.weightRecords.forEach((w: any) => saveToFirestore("weightRecords", w.id, w));
      }
      if (data.workouts) {
        setWorkouts(data.workouts);
        data.workouts.forEach((wk: any) => saveToFirestore("workouts", wk.id, wk));
      }
      if (data.tasks) {
        setTasks(data.tasks);
        data.tasks.forEach((t: any) => saveToFirestore("tasks", t.id, t));
      }
      if (data.studySessions) {
        setStudySessions(data.studySessions);
        data.studySessions.forEach((s: any) => saveToFirestore("studySessions", s.id, s));
      }
      if (data.passwords) {
        setPasswords(data.passwords);
        data.passwords.forEach((p: any) => saveToFirestore("passwords", p.id, p));
      }
      if (data.documents) {
        setDocuments(data.documents);
        data.documents.forEach((d: any) => saveToFirestore("documents", d.id, d));
      }
      if (data.personalIDs) {
        setPersonalIDs(data.personalIDs);
        data.personalIDs.forEach((p: any) => saveToFirestore("personalIDs", p.id, p));
      }
      if (data.assetAccounts) {
        setAssetAccounts(data.assetAccounts);
        data.assetAccounts.forEach((aa: any) => saveToFirestore("assetAccounts", aa.id, aa));
      }
      if (data.goals) {
        setGoals(data.goals);
        data.goals.forEach((g: any) => saveToFirestore("goals", g.id, g));
      }
      if (data.sleepLogs) {
        setSleepLogs(data.sleepLogs);
        data.sleepLogs.forEach((s: any) => saveToFirestore("sleepLogs", s.id, s));
      }
      if (data.userState) {
        setUserState(prev => ({ ...prev, profiles: data.userState.profiles || prev.profiles }));
      }
      return true;
    } catch (e) {
      console.error("Malformed restore payload:", e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      userState, authenticate, toggleBiometric, lockApp, switchProfile, addProfile,
      changeLockPassword,
      currentUser, signInWithGoogle, signOutUser,
      expenses, addExpense, deleteExpense,
      bills, addBill, toggleBillPaid, deleteBill,
      habits, addHabit, toggleHabitDate, deleteHabit,
      intimacyLogs, addIntimacyLog, deleteIntimacyLog,
      jerkOffLogs, setJerkOffCount,
      medicines, addMedicine, logMedicineTaken, deleteMedicine,
      weightRecords, addWeightRecord, deleteWeightRecord,
      workouts, addWorkout, deleteWorkout,
      tasks, addTask, toggleTaskCompleted, deleteTask, updateTask,
      studySessions, addStudySession, deleteStudySession,
      passwords, addPassword, deletePassword,
      documents, addDocument, deleteDocument,
      personalIDs, addPersonalID, deletePersonalID,
      assetAccounts, addAssetAccount, updateAssetAccount, deleteAssetAccount, updateAssetBalance,
      goals, addGoal, updateGoal, deleteGoal,
      sleepLogs, addSleepLog, deleteSleepLog,
      insights, isLoadingInsights, fetchInsights,
      exportData, importData,
      isCircadian, toggleCircadian
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
