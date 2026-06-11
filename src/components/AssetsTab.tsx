import React, { useState } from "react";
import { useApp } from "../AppContext";
import { 
  Plus, Trash2, Coins, Landmark, TrendingUp, PiggyBank, ArrowDownRight, 
  ArrowUpRight, HelpCircle, AlertCircle, RefreshCw, Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AssetsTab: React.FC = () => {
  const { assetAccounts, addAssetAccount, deleteAssetAccount, updateAssetBalance, expenses } = useApp();

  // Dialog & form states
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"liquid" | "fixed">("liquid");
  const [newCategory, setNewCategory] = useState("Savings Account");
  const [newBalance, setNewBalance] = useState("");

  // Quick transaction state (Salary / Transfers & Deposits)
  const [showQuickTransfer, setShowQuickTransfer] = useState(false);
  const [transferAccountId, setTransferAccountId] = useState(() => {
    return assetAccounts.length > 0 ? assetAccounts[0].id : "";
  });
  const [transferType, setTransferType] = useState<"salary" | "transfer_in" | "transfer_out">("salary");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferSuccessMessage, setTransferSuccessMessage] = useState<string | null>(null);

  // inline balance modification
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState("");

  // Categories helper
  const categories = [
    "Savings Account",
    "Cash",
    "Stocks",
    "Mutual Fund",
    "Fixed Deposit",
    "Bonds",
    "Loan Given",
    "Other"
  ];

  // Totals calculations
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const liquidAssets = assetAccounts
    .filter(acc => acc.type === "liquid")
    .reduce((sum, acc) => sum + acc.balance, 0);
  const fixedAssets = assetAccounts
    .filter(acc => acc.type === "fixed")
    .reduce((sum, acc) => sum + acc.balance, 0);

  // Handle Account Addition
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBalance) return;

    addAssetAccount({
      name: newName.trim(),
      type: newType,
      category: newCategory,
      balance: parseFloat(newBalance) || 0
    });

    setNewName("");
    setNewBalance("");
    setShowAddAccount(false);
  };

  // Handle Quick Transfer adjustment (Salary / Inward Transfer)
  const handleQuickTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAccountId || !transferAmount) return;

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;

    // determine multiplier
    const change = (transferType === "salary" || transferType === "transfer_in") ? amount : -amount;
    updateAssetBalance(transferAccountId, change);

    // success flag
    const chosenAcc = assetAccounts.find(a => a.id === transferAccountId);
    const textLabel = transferType === "salary" 
      ? `Salary of ₹${amount.toLocaleString("en-IN")} credited! 💼` 
      : transferType === "transfer_in" 
        ? `Inward transfer of ₹${amount.toLocaleString("en-IN")} processed! 📥`
        : `Outward transfer of ₹${amount.toLocaleString("en-IN")} adjusted! 📤`;

    setTransferSuccessMessage(textLabel);
    setTransferAmount("");
    setTimeout(() => setTransferSuccessMessage(null), 3000);
  };

  const handleStartEditBalance = (id: string, currentBalance: number) => {
    setEditingId(id);
    setEditingBalance(currentBalance.toString());
  };

  const handleSaveEditBalance = (id: string) => {
    const val = parseFloat(editingBalance);
    if (!isNaN(val)) {
      const diff = val - (assetAccounts.find(a => a.id === id)?.balance || 0);
      updateAssetBalance(id, diff);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-xl text-white shadow-sm shadow-indigo-200">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Total Assets Suite</h2>
            <p className="text-xs text-slate-500 font-medium">Verify your liquid savings and custom investments</p>
          </div>
        </div>

        <button 
          onClick={() => setShowAddAccount(!showAddAccount)}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all shadow-3xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Account
        </button>
      </div>

      {/* Success notification banner */}
      <AnimatePresence>
        {transferSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-emerald-600 text-white rounded-xl py-2 px-3 text-[11px] font-black text-center shadow-lg flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
            <span>{transferSuccessMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI stats blocks */}
      <div className="grid grid-cols-3 gap-2">
        
        {/* KPI 1 : Total Combined */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-3 border border-slate-800 shadow-md">
          <span className="text-[7.5px] uppercase tracking-wider font-bold text-indigo-200 block">Total Net Worth</span>
          <span className="text-sm font-black font-mono block mt-1 tracking-tight">
            ₹{totalAssets.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-0.5 mt-1 text-[7px] text-indigo-300 font-medium.">
            <TrendingUp className="w-2 h-2 text-emerald-400" />
            <span>Comprehensive</span>
          </div>
        </div>

        {/* KPI 2 : Liquid Assets */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[7.5px] uppercase tracking-wider font-bold text-slate-400 block">Liquid Assets</span>
            <span className="text-sm font-black font-mono text-slate-850 block mt-1 tracking-tight">
              ₹{liquidAssets.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-[6.5px] font-mono text-emerald-600 font-black tracking-wide bg-emerald-50 border border-emerald-100 rounded px-1 w-max">
            SAVINGS & CASH
          </span>
        </div>

        {/* KPI 3 : Fixed Assets */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 shadow-3xs flex flex-col justify-between">
          <div>
            <span className="text-[7.5px] uppercase tracking-wider font-bold text-slate-400 block">Fixed Assets</span>
            <span className="text-sm font-black font-mono text-slate-850 block mt-1 tracking-tight">
              ₹{fixedAssets.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-[6.5px] font-mono text-slate-500 font-black tracking-wide bg-slate-100 border border-slate-200 rounded px-1 w-max">
            STOCKS & DEPOSITS
          </span>
        </div>

      </div>

      {/* QUICK INWARD ACTIONS PANEL: SALARY / TRANSFER */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/30 border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowQuickTransfer(!showQuickTransfer)}>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4.5 h-4.5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-xs text-slate-800">Salary & Capital Deposit Adjustment</h3>
              <p className="text-[10px] text-slate-550">Instantly credit salary or record outward bank transfers</p>
            </div>
          </div>
          <button className="text-[10px] font-extrabold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg">
            {showQuickTransfer ? "Collapse" : "Adjust"}
          </button>
        </div>

        {showQuickTransfer && (
          <form onSubmit={handleQuickTransferSubmit} className="space-y-3.5 pt-2 text-xs text-slate-800 border-t border-emerald-150/50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Target Account</label>
                <select 
                  value={transferAccountId}
                  onChange={(e) => setTransferAccountId(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 font-medium"
                >
                  <option value="">-- Choose Account --</option>
                  {assetAccounts.map(aa => (
                    <option key={aa.id} value={aa.id}>{aa.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Transaction Link</label>
                <select 
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 font-medium"
                >
                  <option value="salary">Salary Credit 💼</option>
                  <option value="transfer_in">Inward Transfer / Deposit 📥</option>
                  <option value="transfer_out">Capital Outward Adjustment 📤</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 font-bold block mb-1">Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  step="any"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 font-mono font-bold"
                />
              </div>

              <div className="pt-5.5">
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-1.5 rounded-xl cursor-pointer shadow-3xs transition-all text-xs"
                >
                  Apply Impact
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* RENDER DYNAMIC NEW ACCOUNT FORM OVERLAY / IN-SECTION */}
      {showAddAccount && (
        <form onSubmit={handleAddAccountSubmit} className="bg-slate-50 border border-slate-250 rounded-2xl p-4 space-y-3.5 shadow-sm text-xs text-slate-800">
          <h3 className="font-bold text-sm text-slate-700">Configure New Asset Account</h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Account / Instrument Name</label>
              <input 
                type="text" 
                placeholder="e.g., SBI Savings"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">liquidity Bracket</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewType("liquid")}
                  className={`py-1.5 rounded-lg border font-bold text-center ${
                    newType === "liquid"
                      ? "bg-indigo-550 bg-indigo-600 text-white border-indigo-600"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  Liquid (Sav/Cash)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType("fixed")}
                  className={`py-1.5 rounded-lg border font-bold text-center ${
                    newType === "fixed"
                      ? "bg-indigo-550 bg-indigo-600 text-white border-indigo-600"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  Fixed (MF/FD/Stocks)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Specific Category</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">Primary Balance (₹)</label>
              <input 
                type="number" 
                step="any"
                placeholder="0.00"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddAccount(false)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold px-4 py-1.5 rounded-lg shadow-3xs cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </form>
      )}

      {/* LIQUID ASSETS GROUP */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <PiggyBank className="w-4 h-4 text-slate-450" />
          <h3 className="text-[10px] font-black text-slate-450 tracking-wider font-mono uppercase block">Liquid Balance Accounts</h3>
        </div>

        <div className="space-y-2.5">
          {assetAccounts.filter(acc => acc.type === "liquid").length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 px-1">No active liquid accounts found.</p>
          ) : (
            assetAccounts
              .filter(acc => acc.type === "liquid")
              .map(acc => (
                <div key={acc.id} className="bg-white border border-slate-150 p-3.5 rounded-2xl flex items-center justify-between shadow-3xs hover:shadow-2xs transition-shadow">
                  <div className="flex items-start gap-2.5 text-left">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{acc.name}</h4>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5 font-bold uppercase tracking-wide bg-slate-50 px-1 py-0.5 border border-slate-100 rounded w-max">
                        {acc.category}
                      </p>
                      <span className="text-[8px] text-slate-400 block mt-1">Updated {acc.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {editingId === acc.id ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          step="any"
                          value={editingBalance}
                          onChange={(e) => setEditingBalance(e.target.value)}
                          className="bg-slate-50 border border-slate-250 w-24 px-1.5 py-0.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 font-mono rounded"
                        />
                        <button 
                          onClick={() => handleSaveEditBalance(acc.id)}
                          className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => handleStartEditBalance(acc.id, acc.balance)}>
                        <span className="font-bold font-mono text-xs text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg group-hover:bg-indigo-50/50 group-hover:text-indigo-600 transition-colors">
                          ₹{acc.balance.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[8px] text-slate-400 group-hover:text-indigo-600 font-mono uppercase font-bold text-slate-350 select-none">edit</span>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (confirm(`Do you wish to delete account "${acc.name}"? This is irreversible.`)) {
                          deleteAssetAccount(acc.id);
                        }
                      }}
                      className="text-slate-350 hover:text-rose-600 transition-colors p-1"
                      title="Remove Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* FIXED ASSETS GROUP (STOCKS, MF, FD, BONDS, ETC) */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 px-1">
          <Layers className="w-4 h-4 text-slate-450" />
          <h3 className="text-[10px] font-black text-slate-450 tracking-wider font-mono uppercase block">Fixed & Investment Wealth</h3>
        </div>

        <div className="space-y-2.5">
          {assetAccounts.filter(acc => acc.type === "fixed").length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 px-1">No active fixed asset accounts found.</p>
          ) : (
            assetAccounts
              .filter(acc => acc.type === "fixed")
              .map(acc => (
                <div key={acc.id} className="bg-white border border-slate-150 p-3.5 rounded-2xl flex items-center justify-between shadow-3xs hover:shadow-2xs transition-shadow">
                  <div className="flex items-start gap-2.5 text-left">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{acc.name}</h4>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5 font-bold uppercase tracking-wide bg-slate-50 px-1 py-0.5 border border-slate-100 rounded w-max">
                        {acc.category}
                      </p>
                      <span className="text-[8px] text-slate-400 block mt-1">Updated {acc.updatedAt}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {editingId === acc.id ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number"
                          step="any"
                          value={editingBalance}
                          onChange={(e) => setEditingBalance(e.target.value)}
                          className="bg-slate-50 border border-slate-250 w-24 px-1.5 py-0.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500 font-mono rounded"
                        />
                        <button 
                          onClick={() => handleSaveEditBalance(acc.id)}
                          className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => handleStartEditBalance(acc.id, acc.balance)}>
                        <span className="font-bold font-mono text-xs text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg group-hover:bg-indigo-50/50 group-hover:text-indigo-600 transition-colors">
                          ₹{acc.balance.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[8px] text-slate-450 group-hover:text-indigo-600 font-mono uppercase font-bold text-slate-350 select-none">edit</span>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        if (confirm(`Do you wish to delete account "${acc.name}"? This is irreversible.`)) {
                          deleteAssetAccount(acc.id);
                        }
                      }}
                      className="text-slate-350 hover:text-rose-600 transition-colors p-1"
                      title="Remove Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

    </div>
  );
};

// Simple Icon fallback
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
