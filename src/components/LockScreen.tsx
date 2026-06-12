import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Shield, Fingerprint, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const LockScreen: React.FC = () => {
  const { authenticate, userState, toggleBiometric } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const success = authenticate(nextPin);
        if (!success) {
          setTimeout(() => {
            setPin("");
            setError(true);
          }, 300);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleBiometricSimulate = () => {
    // Quick Simulative Biometrics
    authenticate("1234");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between p-6 select-none font-sans relative overflow-hidden">
      {/* Upper Brand Info */}
      <div className="flex flex-col items-center mt-12 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-300 mb-4 duration-550">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-display font-black tracking-tighter text-slate-900 uppercase">Atrack</h1>
        <p className="text-[10px] text-indigo-600 font-mono font-bold uppercase mt-2 tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">PREMIUM VAULT SUITE</p>
      </div>

      {/* Code Status Indicator */}
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="flex justify-center gap-4 my-2">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > index
                  ? "bg-indigo-600 border-indigo-600 scale-110 shadow-sm shadow-indigo-600/30"
                  : error 
                  ? "border-rose-500 bg-rose-500/20" 
                  : "border-slate-350 bg-white"
              }`}
            />
          ))}
        </div>
        
        {error ? (
          <p className="text-rose-500 text-xs font-semibold tracking-wide">Invalid secure passcode. Try &apos;1234&apos;</p>
        ) : (
          <p className="text-slate-500 text-xs font-medium">Enter your secure 4-digit passcode</p>
        )}
      </div>

      {/* Interactive Keypad */}
      <div className="mb-8 max-w-sm mx-auto w-full">
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-white hover:bg-slate-50 active:bg-indigo-50 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-800 shadow-sm active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          
          {/* Biometrics simulate button */}
          <button
            onClick={handleBiometricSimulate}
            className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center transition-all group shadow-sm active:scale-95"
            title="Simulate Fingerprint"
          >
            <Fingerprint className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-[8px] text-indigo-650 font-bold mt-0.5">Biometrics</span>
          </button>

          <button
            onClick={() => handleKeyPress("0")}
            className="w-16 h-16 rounded-full bg-white hover:bg-slate-50 active:bg-indigo-50 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-800 shadow-sm active:scale-95 transition-all"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            Clear
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-500">
            Hint: Default code is <span className="text-indigo-600 font-mono font-black">1234</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            End-To-End Encrypted Secure Profile Vault
          </p>
        </div>
      </div>
    </div>
  );
};
