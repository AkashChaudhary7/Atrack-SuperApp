import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Plus, Trash2, Check, Clock, AlertCircle, FileSpreadsheet } from "lucide-react";

export const BillsTab: React.FC = () => {
  const { bills, addBill, toggleBillPaid, deleteBill } = useApp();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<"EMI" | "Insurance" | "Utility" | "Other">("EMI");
  const [reminderDays, setReminderDays] = useState("5");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && amount && dueDate) {
      addBill({
        title,
        amount: parseFloat(amount),
        dueDate,
        category,
        isPaid: false,
        reminderDays: parseInt(reminderDays) || 5
      });
      setTitle("");
      setAmount("");
      setDueDate("");
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    // Normalize times
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white animate-pulse">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">Bills &amp; EMI Tracker</h2>
          <p className="text-xs text-slate-500 font-medium">Timely warnings on insurance policies, utilities, and auto-debit payments</p>
        </div>
      </div>

      {/* Bill creation form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
        <h3 className="font-bold text-slate-700">Schedule Due Event</h3>

        <div>
          <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Due Title (e.g. Car EMI, Life Insurance)</label>
          <input 
            type="text" 
            placeholder="Term Insurance Premium..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Amount (₹)</label>
            <input 
              type="number" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Event Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="EMI" className="text-slate-850">EMI Payment</option>
              <option value="Insurance" className="text-slate-850">Insurance Policy</option>
              <option value="Utility" className="text-slate-850">Utility Bills</option>
              <option value="Other" className="text-slate-850">Other Expiry</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Due Date</label>
            <input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Reminder (Days Prior)</label>
            <input 
              type="number" 
              placeholder="5"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs"
        >
          <Plus className="w-4 h-4" /> Schedule Reminder
        </button>
      </form>

      {/* Bill list */}
      <div className="space-y-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase">DUE EVENTS & REMINDERS</span>

        <div className="space-y-2">
          {bills.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No upcoming bill expiry tracked.</p>
          ) : (
            bills.map(bill => {
              const remaining = getDaysRemaining(bill.dueDate);
              const isOverdue = remaining < 0 && !bill.isPaid;
              const isWarning = remaining >= 0 && remaining <= bill.reminderDays && !bill.isPaid;

              return (
                <div key={bill.id} className={`flex items-center justify-between p-3.5 border rounded-2xl transition-all shadow-sm ${
                  bill.isPaid 
                    ? "bg-slate-50/50 border-slate-200 opacity-60" 
                    : isOverdue 
                    ? "bg-rose-50 border-rose-200/80" 
                    : isWarning 
                    ? "bg-amber-50 border-amber-200/80" 
                    : "bg-white border-slate-150"
                }`}>
                  <div className="flex gap-3 items-start">
                    <button
                      onClick={() => toggleBillPaid(bill.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-0.5 ${
                        bill.isPaid
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-slate-300 bg-white hover:border-emerald-500"
                      }`}
                      title={bill.isPaid ? "Mark Unpaid" : "Mark Paid"}
                    >
                      {bill.isPaid && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </button>

                    <div>
                      <h4 className={`text-xs font-bold ${bill.isPaid ? 'line-through text-slate-400' : 'text-slate-800'}`}>{bill.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-200 font-bold uppercase">{bill.category}</span>
                        <span className="text-[10px] text-slate-500 font-medium">Due: {bill.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800 font-mono">₹{bill.amount}</div>
                      {!bill.isPaid && (
                        <div className={`text-[9px] font-bold mt-0.5 ${
                          isOverdue ? "text-rose-600" : isWarning ? "text-amber-600 animate-pulse" : "text-slate-500"
                        }`}>
                          {isOverdue ? "Overdue" : remaining === 0 ? "Due Today" : `${remaining} days left`}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteBill(bill.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
