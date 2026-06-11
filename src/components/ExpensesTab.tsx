import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, ArrowRightLeft, Landmark, DollarSign, Calendar } from "lucide-react";

export const ExpensesTab: React.FC = () => {
  const { expenses, addExpense, deleteExpense, assetAccounts } = useApp();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAssetId, setSelectedAssetId] = useState(() => {
    return assetAccounts.length > 0 ? assetAccounts[0].id : "";
  });

  const [filterCategory, setFilterCategory] = useState("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      addExpense({
        amount: parseFloat(amount),
        category,
        description,
        date,
        assetAccountId: selectedAssetId || undefined
      });
      setAmount("");
      setDescription("");
    }
  };

  const categories = ["Food", "Groceries", "Bills", "Fuel", "Health", "Leisure", "Other"];

  const filteredExpenses = filterCategory === "All"
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const totalFiltered = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-xl text-white">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Expense Tracker</h2>
          <p className="text-xs text-slate-500 font-medium">Log and review your daily microtransactions</p>
        </div>
      </div>

      {/* Quick Add Form - Ultra Clean */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
        <h3 className="font-bold text-slate-700">Log New Transaction</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Amount (₹)</label>
            <input 
              type="number" 
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500/50"
            >
              {categories.map(c => (
                <option key={c} value={c} className="text-slate-800">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Expense Account (Asset Deduct)</label>
          <select 
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500/50 font-bold"
          >
            <option value="">-- No Direct Deduct --</option>
            {assetAccounts.map(acc => (
              <option key={acc.id} value={acc.id} className="text-slate-850">
                {acc.name} (Bal: ₹{acc.balance.toLocaleString("en-IN")})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Description</label>
          <input 
            type="text" 
            placeholder="What did you buy?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div>
          <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </form>

      {/* Expense History list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">HISTORY & SPLITS</span>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg text-xs text-slate-700 px-2.5 py-1 focus:outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs text-slate-500 font-semibold">Total Filtered</span>
            <span className="text-sm font-bold text-amber-600 font-mono">₹{totalFiltered.toLocaleString("en-IN")}</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">No records logged yet.</p>
            ) : (
              filteredExpenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between bg-white p-2.5 border border-slate-150 rounded-xl text-xs shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="font-bold text-slate-800">{exp.description}</div>
                      <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5 font-medium">
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">{exp.category}</span>
                        <span>{exp.date}</span>
                        {exp.assetAccountId && (
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-150 flex items-center gap-1 font-semibold">
                            <Landmark className="w-3 h-3" />
                            {assetAccounts.find(a => a.id === exp.assetAccountId)?.name || "Account Deleted"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-850 font-mono">₹{exp.amount.toLocaleString("en-IN")}</span>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete expense"
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
    </div>
  );
};
