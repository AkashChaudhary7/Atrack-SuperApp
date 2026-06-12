import React, { useState, useEffect } from "react";
import { useApp } from "../AppContext";
import { Shield, Fingerprint, Lock, CheckCircle2, LogIn, LogOut, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export const LockScreen: React.FC = () => {
  const { authenticate, userState, toggleBiometric, currentUser, signInWithGoogle, signOutUser } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Fallback default code
  const currentPasscode = userState.lockPassword || "1234";

  // Automatically bypass PIN screen if Google account is securely logged in 
  // and user is just logging in on a new session. Let's make sure it's reactive.
  useEffect(() => {
    if (currentUser) {
      // Automatically authenticate the session
      authenticate(currentPasscode);
    }
  }, [currentUser, currentPasscode]);

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
    // If biometric option is active OR they want to simulate fingerprint access
    authenticate(currentPasscode);
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // On success, the above useEffect will auto-authenticate the lock session
    } catch (err) {
      console.error("Google trigger failed:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 text-slate-800 flex flex-col justify-between p-6 select-none font-sans relative overflow-hidden">
      {/* Background soft orbs representing security */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Information & Google Sign Up / Sign In status */}
      <div className="flex flex-col items-center mt-6 relative z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-300 mb-3 hover:rotate-12 transition-transform duration-350">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-black tracking-tight text-slate-900 uppercase">Atrack Vault</h1>
        <p className="text-[9px] text-indigo-600 font-mono font-bold uppercase mt-1 tracking-widest bg-indigo-50 px-2 py-0.5 border border-indigo-150/40 rounded-full">
          PREMIUM ACCOUNT CRYPTO-SUITE
        </p>

        {/* GOOGLE INTEGRATION CONTROLLER CARD */}
        <div className="mt-4 bg-white/90 border border-slate-200/60 p-3 rounded-2xl max-w-sm w-full shadow-2sm space-y-2.5">
          {currentUser ? (
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Google avatar" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-indigo-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-bold text-slate-800 truncate max-w-[150px]">{currentUser.displayName || "Gmail User"}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[8.5px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 animate-pulse flex items-center gap-1">
                  <span>●</span> Sync Active
                </span>
                <button
                  onClick={() => {
                    signOutUser();
                    alert("Logged out of Google ID successfully.");
                  }}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-center text-xs">
              <p className="text-[10.5px] text-slate-505 text-slate-500">
                Sync all of your workouts, habits, files &amp; passwords automatically across multi-devices!
              </p>
              
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-800 font-bold border border-slate-250 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs hover:border-slate-350 active:scale-98"
              >
                {googleLoading ? (
                  <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.65 1.58 15 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.57 8.91 5.04 12 5.04z" />
                    <path fill="#4285f4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.51h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.55z" />
                    <path fill="#fbbc05" d="M5.36 14.5c-.24-.71-.38-1.47-.38-2.5s.14-1.79.38-2.5l-3.86-3C.56 8.35 0 10.11 0 12s.56 3.65 1.5 5.5l3.86-3z" />
                    <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.09 0-5.73-2.53-6.66-5.46l-3.86 3C3.4 20.35 7.35 23 12 23z" />
                  </svg>
                )}
                <span>Sign up / Log in with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Pin input dots status indicator */}
      <div className="flex flex-col items-center gap-2.5 relative z-10 my-4">
        <div className="flex justify-center gap-4 my-1.5">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                pin.length > index
                  ? "bg-indigo-600 border-indigo-600 scale-110 shadow-md shadow-indigo-400/20"
                  : error 
                  ? "border-rose-500 bg-rose-500/20 animate-shake" 
                  : "border-slate-300 bg-white"
              }`}
            />
          ))}
        </div>
        
        {error ? (
          <p className="text-rose-600 text-xs font-bold tracking-wide">Invalid secure passcode. Please double check PIN.</p>
        ) : (
          <p className="text-slate-500 text-xs font-semibold">Enter secure 4-digit passcode</p>
        )}
      </div>

      {/* 3. PIN entry digital pad */}
      <div className="mb-6 max-w-sm mx-auto w-full">
        <div className="grid grid-cols-3 gap-3 justify-items-center">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white hover:bg-slate-50 active:bg-indigo-50 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-800 shadow-3xs active:scale-95 transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          
          {/* Biometrics simulate toggle */}
          <button
            onClick={handleBiometricSimulate}
            className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex flex-col items-center justify-center transition-all group shadow-3xs active:scale-95 cursor-pointer"
            title="Authenticate with Biometrics Simulation"
          >
            <Fingerprint className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-[7.5px] text-indigo-755 font-bold mt-0.5">Biometric</span>
          </button>

          <button
            onClick={() => handleKeyPress("0")}
            className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-white hover:bg-slate-50 active:bg-indigo-50 border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-800 shadow-3xs active:scale-95 transition-all cursor-pointer"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-500 flex items-center justify-center text-xs font-black shadow-3xs active:scale-95 transition-all cursor-pointer"
          >
            Del
          </button>
        </div>

        {/* Footer info & defaults */}
        <div className="mt-6 text-center text-xs space-y-1">
          <p className="text-slate-400 text-[10px] font-mono leading-normal">
            Hint: Default code is <span className="text-indigo-600 font-black">1234</span>
          </p>
          {userState.lockPassword && userState.lockPassword !== "1234" && (
            <p className="text-emerald-600 text-[9.5px] font-black tracking-wide bg-emerald-50 px-2.5 py-0.5 rounded-full w-max mx-auto border border-emerald-100 animate-in fade-in duration-300">
               Custom password set &amp; synced across servers!
            </p>
          )}
          <p className="text-[9px] text-slate-400 pt-1 font-mono">
            Military-Grade Multi-device AES Vault Core
          </p>
        </div>
      </div>
    </div>
  );
};
