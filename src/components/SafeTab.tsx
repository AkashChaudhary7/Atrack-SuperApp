import React, { useState, useRef } from "react";
import { useApp } from "../AppContext";
import { 
  Plus, Trash2, Key, Search, FolderLock, Download, Upload, 
  ShieldCheck, Eye, EyeOff, CreditCard, Shield, Sparkles,
  Copy, Check, FileText, X, Cloud, RefreshCw, LogIn, LogOut, Settings2, FileUp
} from "lucide-react";
import { SecureDocument } from "../types";

export const SafeTab: React.FC = () => {
  const { 
    passwords, addPassword, deletePassword, 
    documents, addDocument, deleteDocument,
    personalIDs, addPersonalID, deletePersonalID,
    exportData, importData
  } = useApp();

  const [activeTab, setActiveTab] = useState<"passwords" | "ids" | "documents">("passwords");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedID, setCopiedID] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<SecureDocument | null>(null);
  const [isDriveUploading, setIsDriveUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Credentials form state
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState<"Financial" | "Social" | "Work" | "Personal">("Financial");
  const [viewPasswordMap, setViewPasswordMap] = useState<{ [id: string]: boolean }>({});

  // Document form state
  const [docTitle, setDocTitle] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileDropdownRef = useRef<HTMLInputElement>(null);

  // Personal IDs form state
  const [idType, setIdType] = useState("Aadhaar Card");
  const [customIdType, setCustomIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [nameOnID, setNameOnID] = useState("Akash Chaudhary");
  const [idNotes, setIdNotes] = useState("");

  const handleAddSecret = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && username && password) {
      const mockHex = password.split("").map((c: string) => c.charCodeAt(0).toString(16)).join("");
      addPassword({
        title,
        username,
        passwordEncrypted: mockHex,
        category
      });
      setTitle("");
      setUsername("");
      setPassword("");
    }
  };

  const handleAddCustomID = (e: React.FormEvent) => {
    e.preventDefault();
    if (idNumber && nameOnID) {
      const finalType = idType === "Custom" ? (customIdType.trim() || "Custom ID") : idType;
      addPersonalID({
        idType: finalType,
        idNumber: idNumber.trim(),
        nameOnID: nameOnID.trim(),
        notes: idNotes.trim() || undefined
      });
      setIdNumber("");
      setIdNotes("");
      setCustomIdType("");
    }
  };

  const decryptPass = (hex: string) => {
    try {
      let str = "";
      for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      }
      return str;
    } catch {
      return "ENCRYPTED_SECRET";
    }
  };

  const togglePasswordView = (id: string) => {
    setViewPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Drag-and-Drop Handlers for File Cabinet
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileInput(e.dataTransfer.files[0]);
      if (!docTitle) {
        // Auto-populate title base on filename
        const cleanName = e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
      }
    }
  };

  const triggerFileSelect = () => {
    fileDropdownRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
      if (!docTitle) {
        const cleanName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setDocTitle(cleanName);
      }
    }
  };

  const handleDriveDownload = async (fileId: string, fileName: string) => {
    const doc = documents.find(d => d.id === fileId);
    if (!doc || !doc.fileDataEncrypted) {
      alert("Could not load file data.");
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = doc.fileDataEncrypted;
      a.download = fileName || doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      alert("Download failed: " + err.message);
    }
  };

  const handleDeleteDocument = async (docId: string, driveFileId?: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this document from your secure cabinet?");
    if (!confirmed) return;
    
    deleteDocument(docId);
  };

  const handleDocumentUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !fileInput) return;

    setIsDriveUploading(true);
    setUploadError("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;

        addDocument({
          profileId: "Self",
          title: docTitle,
          fileName: fileInput.name,
          uploadedAt: new Date().toISOString().split("T")[0],
          fileDataEncrypted: base64Data
        });

        setDocTitle("");
        setFileInput(null);
      } catch (err: any) {
        console.error(err);
        setUploadError(err.message);
        alert("Failed to upload file: " + err.message);
      } finally {
        setIsDriveUploading(false);
      }
    };
    reader.readAsDataURL(fileInput);
  };

  // Filter list matching search query
  const filteredPasswords = passwords.filter(pwd => 
    pwd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pwd.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pwd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPersonalIDs = personalIDs.filter(pid => 
    pid.idType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pid.idNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pid.nameOnID.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pid.notes && pid.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Title area */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-550 from-cyan-500 to-indigo-600 rounded-xl text-white shadow-md">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-800 uppercase">Secure Privacy Safe</h2>
            <p className="text-[11px] text-slate-500 font-medium font-mono">
              E2E Vault &amp; Cloud Sync Configuration
            </p>
          </div>
        </div>

        {/* Local Security Vault Pill */}
        <div className="flex justify-end relative">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 font-bold" />
              <span>Secured Local Vault</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Real-time Search Panel */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search credentials, personal IDs, secure documents..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-400 transition-all font-medium placeholder-slate-450 shadow-inner"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Responsive tabs */}
      <div className="flex bg-slate-100 p-1 border border-slate-200/50 rounded-xl text-[10px] sm:text-xs font-bold text-slate-800 shadow-sm gap-0.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab("passwords")}
          className={`flex-1 min-w-[70px] text-center py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "passwords" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Passwords
        </button>
        <button
          onClick={() => setActiveTab("ids")}
          className={`flex-1 min-w-[70px] text-center py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "ids" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Personal IDs
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex-1 min-w-[80px] text-center py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "documents" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          File Cabinet ({documents.length})
        </button>
      </div>

      {/* 1. Passwords Tab */}
      {activeTab === "passwords" && (
        <div className="space-y-4">
          <form onSubmit={handleAddSecret} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
            <h3 className="font-bold text-slate-700 text-xs">Register Secure Username / Passwords</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Platform / Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Google, Zerodha"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Financial">Financial Apps</option>
                  <option value="Social">Social Channels</option>
                  <option value="Work">Work Credentials</option>
                  <option value="Personal">Personal Items</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">User ID / Handle</label>
                <input 
                  type="text" 
                  placeholder="akash@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Vicious Password</label>
                <input 
                  type="text" 
                  placeholder="Raw password string..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" /> Save Cryptic Secret
            </button>
          </form>

          {/* List display */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">
              YOUR DECRYPTABLE VAULT {searchQuery ? `(FILTERED: ${filteredPasswords.length} MATCHES)` : `(${passwords.length})`}
            </span>

            <div className="space-y-2">
              {filteredPasswords.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No credentials fit your query.</p>
              ) : (
                filteredPasswords.map(pwd => {
                  const showPass = viewPasswordMap[pwd.id] || false;

                  return (
                    <div key={pwd.id} className="bg-white border border-slate-150 rounded-2xl p-3.5 space-y-2 shadow-sm hover:border-slate-350 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
                            <Key className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-xs">{pwd.title}</h4>
                            <span className="text-[9px] font-semibold text-slate-400 block uppercase font-mono font-bold mt-0.5">{pwd.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => togglePasswordView(pwd.id)}
                            className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => deletePassword(pwd.id)}
                            className="bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 border border-slate-150 rounded-xl text-xs grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-700">
                        <div className="overflow-hidden">
                          <span className="text-slate-450 block text-[9px] uppercase font-bold tracking-wide font-mono">User ID</span>
                          <span className="font-mono text-slate-800 font-bold block mt-0.5 truncate">{pwd.username}</span>
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-slate-450 block text-[9px] uppercase font-bold tracking-wide font-mono">Cipher Text</span>
                          <span className="font-mono text-indigo-650 text-indigo-600 font-bold block mt-0.5 truncate">
                            {showPass ? decryptPass(pwd.passwordEncrypted) : "••••••••••••"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Personal ID Cards Tab */}
      {activeTab === "ids" && (
        <div className="space-y-4">
          <form onSubmit={handleAddCustomID} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm text-sm text-slate-800">
            <h3 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-cyan-500" />
              Register Personal Card &amp; Identity details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">ID / Document Type</label>
                <select 
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Custom">Custom Label</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Name on Document</label>
                <input 
                  type="text" 
                  placeholder="e.g. Akash Chaudhary"
                  value={nameOnID}
                  onChange={(e) => setNameOnID(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {idType === "Custom" && (
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Enter Custom ID Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Employee ID, Gym Membership Code"
                  value={customIdType}
                  onChange={(e) => setCustomIdType(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">ID / Card Number</label>
                <input 
                  type="text" 
                  placeholder="Document number..."
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-550 text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">ID Expiry / Notes</label>
                <input 
                  placeholder="expiry, location etc..."
                  value={idNotes}
                  onChange={(e) => setIdNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Save Identity Record
            </button>
          </form>

          {/* List display */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">
              SAVED IDENTITIES {searchQuery ? `(FILTERED: ${filteredPersonalIDs.length} MATCHES)` : `(${personalIDs.length})`}
            </span>

            <div className="space-y-2">
              {filteredPersonalIDs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No saved IDs found.</p>
              ) : (
                filteredPersonalIDs.map(pid => (
                  <div key={pid.id} className="bg-white border border-slate-150 rounded-2xl p-4 space-y-3 shadow-sm hover:border-slate-350 transition-all font-sans relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xs tracking-tight">{pid.idType}</h4>
                          <span className="text-[9px] text-slate-450 block uppercase font-mono font-black tracking-wide mt-0.5">SECURE DOCUMENT PROFILE</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deletePersonalID(pid.id)}
                        className="p-1.5 rounded-lg border border-slate-150 text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-[11px] space-y-2 text-slate-700">
                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-450 font-mono">Holder Name</span>
                        <span className="font-bold text-slate-800 tracking-tight">{pid.nameOnID}</span>
                      </div>
                      <div className="flex justify-between items-center py-0.5 border-t border-dashed border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-450 font-mono">Unique ID / Code</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-indigo-600 tracking-wide select-text">{pid.idNumber}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pid.idNumber);
                              setCopiedID(pid.id);
                              setTimeout(() => setCopiedID(null), 2000);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-md transition-all cursor-pointer"
                            title="Copy Card Number"
                          >
                            {copiedID === pid.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Secure File Upload Cabinet */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <form onSubmit={handleDocumentUpload} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm text-sm text-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 text-xs flex items-center justify-between uppercase tracking-wide">
                <span className="flex items-center gap-1.5"><FileUp className="w-4 h-4 text-cyan-600" /> Private File Upload Cabinet</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-500">
                  LOCAL SECURE STORAGE ONLY
                </span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Upload receipts, certificates, or IDs. Files are securely encrypted and stored locally in your offline vault.
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                isDragActive 
                  ? "border-indigo-500 bg-indigo-50/50" 
                  : fileInput 
                    ? "border-emerald-500 bg-emerald-50/25" 
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input 
                type="file" 
                ref={fileDropdownRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept="image/*,application/pdf,text/*"
              />
              
              {fileInput ? (
                <>
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl mb-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-xs">{fileInput.name}</span>
                  <span className="text-[9px] font-mono text-slate-450 uppercase">
                    {(fileInput.size / 1024).toFixed(1)} KB — Ready to Encrypt
                  </span>
                </>
              ) : (
                <>
                  <div className="p-2.5 bg-slate-100 text-slate-500 rounded-xl group-hover:scale-110 transition-transform mb-1">
                    <Upload className="w-5 h-5 text-cyan-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Drag &amp; Drop file here context</span>
                  <span className="text-[9px] text-slate-400 font-medium">Or click to manually browse storage</span>
                </>
              )}
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Document Label / Title</label>
              <input 
                type="text" 
                placeholder="e.g. Passport Scan, Land Tax Receipt"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <button 
              type="submit"
              disabled={!fileInput || !docTitle || isDriveUploading}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed font-bold text-white py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <FileUp className={`w-3.5 h-3.5 ${isDriveUploading ? 'animate-spin' : ''}`} /> 
              {isDriveUploading ? "Encrypting & Storing..." : "Sync & Store in Private Cabinet"}
            </button>
          </form>

          {/* List display */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase block">
              SAVED CABINET FILE ATTACHMENTS {searchQuery ? `(FILTERED: ${filteredDocuments.length} MATCHES)` : `(${documents.length})`}
            </span>

            <div className="space-y-2">
              {filteredDocuments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 border border-slate-150 rounded-2xl italic">No files in your cabinet cabinet.</p>
              ) : (
                filteredDocuments.map(doc => (
                  <div key={doc.id} className="bg-white border border-slate-150 rounded-2xl p-3 flex justify-between items-center text-xs shadow-sm hover:border-slate-350 transition-all font-sans">
                    <div className="flex gap-2.5 items-center overflow-hidden">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 flex-shrink-0">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="overflow-hidden text-left">
                        <h4 className="font-bold text-slate-800 text-xs truncate">{doc.title}</h4>
                        <div className="text-[9px] text-slate-400 font-mono font-bold mt-0.5 truncate">
                          {doc.fileName} — {doc.uploadedAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded-lg border border-slate-150 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Preview Document Card"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.driveFileId)}
                        className="p-1.5 rounded-lg border border-slate-150 text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Delete Secure Document"
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
      )}

      {/* 5. Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 overflow-hidden shadow-2xl relative font-sans animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight truncate max-w-[180px]">
                  {previewDoc.title}
                </span>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5">
              {/* Image Previews if Base64 Data URI */}
              {previewDoc.fileDataEncrypted?.startsWith("data:image/") && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-slate-150 relative bg-slate-50">
                  <img 
                    src={previewDoc.fileDataEncrypted} 
                    alt={previewDoc.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Document Identity Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 relative overflow-hidden shadow-inner flex flex-col justify-between aspect-[1.58/1]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-start justify-between">
                  <div className="space-y-1 text-left">
                    <span className="text-[7px] tracking-widest font-mono text-indigo-300 font-bold uppercase block">SECURE CABINET FILE</span>
                    <h5 className="font-extrabold text-xs tracking-tight text-white leading-tight truncate max-w-[170px]">
                      {previewDoc.title}
                    </h5>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>

                {/* Simulated Scanned ID graphic */}
                <div className="my-1 border-y border-white/10 py-1 flex gap-2.5 text-[9px] items-start text-left">
                  <div className="w-7 h-9 bg-slate-800 rounded border border-white/15 flex items-center justify-center text-white/50 text-[7px] font-mono select-none">
                    ID
                  </div>
                  <div className="space-y-0.5 font-mono">
                    <div className="text-[6px] text-slate-400 uppercase">System Stamp</div>
                    <div className="font-bold text-[7px] text-slate-200 uppercase tracking-wider">{previewDoc.fileName.split('.').pop()?.toUpperCase() || "DOC"} FILE</div>
                    <div className="text-[7px] text-emerald-400 font-bold">CLIENT E2E ENCRYPTED STATUS</div>
                  </div>
                </div>

                <div className="flex justify-between items-end text-[9px]">
                  <div className="overflow-hidden max-w-[130px] text-left">
                    <span className="text-[6px] text-slate-400 font-mono block">FILE NAME</span>
                    <span className="font-mono text-[8px] text-slate-200 font-bold truncate block">
                      {previewDoc.fileName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[6px] text-slate-400 font-mono block">UPLOADED ON</span>
                    <span className="font-mono text-[8px] text-slate-200 font-bold block">
                      {previewDoc.uploadedAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure parameters information */}
              <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-2xl p-3 space-y-1 text-slate-705 text-left">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                  <Shield className="w-3.5 h-3.5" />
                  Client-Side AES Protection Verified
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                  This secure document is encrypted entirely client-side using end-to-end zero-knowledge passcodes. No raw file parameters or metadata are accessible outside this device.
                </p>
                <div className="pt-1.5 border-t border-emerald-200/40 text-[8px] font-mono text-slate-400 flex justify-between items-center">
                  <span>STORAGE MODE</span>
                  <span className="font-bold text-slate-600 font-sans uppercase">
                    Local Encrypted Data String
                  </span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2.5">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDriveDownload(previewDoc.id, previewDoc.fileName)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs tracking-wide transition-all cursor-pointer text-center block items-center flex justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download Encrypted Copy
                </button>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-full py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
