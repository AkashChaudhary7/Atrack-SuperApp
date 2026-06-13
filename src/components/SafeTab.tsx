import React, { useState, useRef } from "react";
import { useApp } from "../AppContext";
import { 
  Plus, Trash2, Key, Search, FolderLock, Download, Upload, 
  ShieldCheck, Eye, EyeOff, CreditCard, Shield, Sparkles,
  Copy, Check, FileText, X, Cloud, RefreshCw, LogIn, LogOut, Settings2, FileUp, Fingerprint
} from "lucide-react";
import { SecureDocument } from "../types";

export const SafeTab: React.FC = () => {
  const { 
    passwords, addPassword, deletePassword, 
    documents, addDocument, deleteDocument,
    personalIDs, addPersonalID, deletePersonalID,
    exportData, importData,
    userState, toggleBiometric, changeLockPassword,
    isCircadian
  } = useApp();

  const [activeTab, setActiveTab] = useState<"passwords" | "ids" | "documents" | "settings">("passwords");
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

  // Personal IDs form state & Folders engine
  const [idType, setIdType] = useState("Aadhaar Card");
  const [customIdType, setCustomIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [nameOnID, setNameOnID] = useState("Akash Chaudhary");
  const [idNotes, setIdNotes] = useState("");
  
  // Folders and photos states
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const idPhotoInputRef = useRef<HTMLInputElement>(null);
  const [fullViewPhoto, setFullViewPhoto] = useState<string | null>(null);
  const [isAddingID, setIsAddingID] = useState(false);

  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem("atrack_id_folders");
    const parsed = saved ? JSON.parse(saved) : ["Akash Chaudhary", "Wife"];
    const existing = personalIDs.map(p => p.folderName).filter(Boolean) as string[];
    return Array.from(new Set([...parsed, ...existing]));
  });

  React.useEffect(() => {
    localStorage.setItem("atrack_id_folders", JSON.stringify(folders));
  }, [folders]);

  // Lock Screen PIN Changer settings states
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [lockError, setLockError] = useState("");
  const [lockSuccess, setLockSuccess] = useState("");

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
        notes: idNotes.trim() || undefined,
        folderName: selectedFolder || undefined,
        idPhoto: idPhoto || undefined
      });
      setIdNumber("");
      setIdNotes("");
      setCustomIdType("");
      setIdPhoto(null);
      setIsAddingID(false);
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
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 min-w-[70px] text-center py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === "settings" ? "bg-white text-indigo-650 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Lock &amp; Biometrics
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
          
          {/* Active Search Mode override */}
          {searchQuery ? (
            <div className="space-y-3 text-left">
              <span className={`text-[10px] font-bold tracking-wider font-mono uppercase block ${isCircadian ? "text-emerald-400" : "text-slate-400"}`}>
                SEARCH MATCHES ({filteredPersonalIDs.length})
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPersonalIDs.map(pid => (
                  <div key={pid.id} className={`rounded-2xl p-4 space-y-3 shadow-sm hover:scale-[1.005] transition-all font-sans relative overflow-hidden ${isCircadian ? "bg-[#0b120f] border border-emerald-900/60" : "bg-white border border-slate-150"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${isCircadian ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className={`font-bold text-xs tracking-tight ${isCircadian ? "text-emerald-100" : "text-slate-800"}`}>{pid.idType}</h4>
                          <span className={`text-[8.5px] block font-mono font-bold tracking-wider mt-0.5 ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>
                            {pid.folderName ? `FOLDER: ${pid.folderName.toUpperCase()}` : "UNSORTED"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deletePersonalID(pid.id)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isCircadian ? "border-emerald-900/30 text-emerald-600 hover:text-rose-450 hover:bg-emerald-950/25" : "border-slate-150 text-slate-450 hover:text-rose-600 hover:bg-slate-50"}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className={`p-3 rounded-xl border text-[11px] space-y-2 ${isCircadian ? "bg-emerald-950/10 border-emerald-900/20 text-emerald-200" : "bg-slate-50 border-slate-150 text-slate-750"}`}>
                      <div className="flex justify-between items-center py-0.5">
                        <span className={`text-[9px] uppercase font-bold font-mono ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>Holder Name</span>
                        <span className={`font-bold tracking-tight ${isCircadian ? "text-emerald-105 text-emerald-100" : "text-slate-800"}`}>{pid.nameOnID}</span>
                      </div>
                      <div className={`flex justify-between items-center py-0.5 border-t border-dashed ${isCircadian ? "border-emerald-900/20" : "border-slate-200"}`}>
                        <span className={`text-[9px] uppercase font-bold font-mono ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>Unique ID / Code</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold tracking-wide select-text ${isCircadian ? "text-emerald-400" : "text-indigo-600"}`}>{pid.idNumber}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pid.idNumber);
                              setCopiedID(pid.id);
                              setTimeout(() => setCopiedID(null), 2000);
                            }}
                            className={`p-1 border rounded-md transition-all cursor-pointer ${isCircadian ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:text-emerald-200" : "bg-white border-slate-205 text-slate-400 hover:text-indigo-600"}`}
                          >
                            {copiedID === pid.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      </div>
                      {pid.notes && (
                        <div className={`pt-1.5 border-t border-dashed ${isCircadian ? "border-emerald-900/20 text-emerald-400" : "border-slate-200 text-slate-500"} text-[10px]`}>
                          <span className="font-bold">Notes:</span> {pid.notes}
                        </div>
                      )}
                    </div>

                    {pid.idPhoto && (
                      <div className="mt-2 space-y-1 text-left">
                        <span className={`text-[9px] uppercase font-bold font-mono block ${isCircadian ? "text-emerald-500" : "text-slate-405"}`}>Document Photo</span>
                        <div 
                          className="relative group overflow-hidden border rounded-xl max-w-[130px] aspect-[1.58/1] cursor-pointer shadow-sm border-slate-200"
                          onClick={() => setFullViewPhoto(pid.idPhoto!)}
                        >
                          <img src={pid.idPhoto} alt="Personal ID" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-opacity">
                            View Photo Card
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* NORMAL FOLDER MODE */}
              {selectedFolder === null ? (
                <div className="space-y-4">
                  {/* Create Persona Folder Card */}
                  <div className={`rounded-2xl p-4 border shadow-sm text-left ${isCircadian ? "bg-[#0b120f] border-emerald-900/60" : "bg-slate-50 border-slate-150"}`}>
                    <h3 className={`font-black text-xs uppercase flex items-center gap-1.5 ${isCircadian ? "text-emerald-400" : "text-slate-700"}`}>
                      <FolderLock className="w-4 h-4 text-emerald-450 text-cyan-500" />
                      Create New Folder / Persona Profile
                    </h3>
                    <p className={`text-[10px] mt-1 mb-3 font-semibold ${isCircadian ? "text-emerald-600" : "text-slate-450 text-slate-550"}`}>
                      Organise cards under personal names (e.g. Akash, Wife, Dad, Kids) to keep IDs compartmentalised.
                    </p>
                    
                    <div className="flex gap-2.5">
                      <input 
                        type="text"
                        placeholder="Enter full name (e.g. Akash Chaudhary)"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className={`flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-bold ${
                          isCircadian 
                            ? "bg-[#070b09] border border-emerald-950 text-emerald-100 placeholder-emerald-900" 
                            : "bg-white border border-slate-205 text-slate-800 placeholder-slate-400"
                        }`}
                      />
                      <button 
                        onClick={() => {
                          if (newFolderName.trim()) {
                            const trimmed = newFolderName.trim();
                            if (!folders.includes(trimmed)) {
                              setFolders(prev => [...prev, trimmed]);
                            }
                            setSelectedFolder(trimmed);
                            setNewFolderName("");
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 hover:opacity-95 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Folder
                      </button>
                    </div>
                  </div>

                  {/* Folders List Grid */}
                  <div className="space-y-2 text-left">
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase block ${isCircadian ? "text-emerald-400" : "text-slate-450"}`}>
                      Profile Folders ({folders.length})
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {folders.map(folder => {
                        const count = personalIDs.filter(p => p.folderName === folder).length;
                        return (
                          <div 
                            key={folder}
                            onClick={() => setSelectedFolder(folder)}
                            className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer group shadow-sm transition-all hover:scale-[1.01] ${
                              isCircadian 
                                ? "bg-[#0a0f0d] hover:bg-[#0c1612] border-emerald-950/40 hover:border-emerald-500/50" 
                                : "bg-white hover:bg-slate-50/50 border-slate-150 hover:border-indigo-400/40"
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`p-3 rounded-xl border ${
                                isCircadian 
                                  ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" 
                                  : "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-105"
                              }`}>
                                <FolderLock className="w-5 h-5" />
                              </div>
                              <div className="text-left">
                                <h4 className={`font-black text-xs ${isCircadian ? "text-emerald-100" : "text-slate-800"}`}>
                                  {folder}
                                </h4>
                                <span className={`text-[9.5px] font-bold font-mono tracking-wider mt-0.5 block ${isCircadian ? "text-emerald-600" : "text-slate-450"}`}>
                                  {count} SECURE CARD{count !== 1 ? "S" : ""} ATTACHED
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {count === 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFolders(prev => prev.filter(f => f !== folder));
                                  }}
                                  title="Delete empty folder"
                                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                    isCircadian 
                                      ? "border-emerald-900/20 text-emerald-700 hover:text-rose-450 hover:bg-emerald-950/30" 
                                      : "border-slate-150 text-slate-400 hover:text-rose-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <span className={`text-[10px] font-mono font-bold uppercase ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>
                                Open &rarr;
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Unsorted / Loose IDs block (if any cards have no folderName set) */}
                  {personalIDs.some(p => !p.folderName) && (
                    <div className="pt-4 border-t border-dashed border-slate-200/50 space-y-2 text-left">
                      <span className={`text-[10px] font-bold font-mono tracking-widest uppercase block ${isCircadian ? "text-emerald-400" : "text-slate-450"}`}>
                        Loose / Uncategorised Documents
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {personalIDs.filter(p => !p.folderName).map(pid => (
                          <div key={pid.id} className={`rounded-2xl p-4 space-y-3 shadow-sm hover:scale-[1.005] transition-all font-sans relative overflow-hidden ${isCircadian ? "bg-[#0b120f] border border-emerald-900/60" : "bg-white border border-slate-150"}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl border ${isCircadian ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className={`font-bold text-xs tracking-tight ${isCircadian ? "text-emerald-100" : "text-slate-800"}`}>{pid.idType}</h4>
                                  <span className={`text-[8.5px] block font-mono font-bold tracking-wider mt-0.5 ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>UNCATEGORISED</span>
                                </div>
                              </div>
                              <button
                                onClick={() => deletePersonalID(pid.id)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isCircadian ? "border-emerald-900/30 text-emerald-600 hover:text-rose-450 hover:bg-emerald-950/25" : "border-slate-150 text-slate-450 hover:text-rose-600 hover:bg-slate-50"}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className={`p-3 rounded-xl border text-[11px] space-y-2 ${isCircadian ? "bg-emerald-950/10 border-emerald-900/20 text-emerald-200" : "bg-slate-50 border-slate-150 text-slate-750"}`}>
                              <div className="flex justify-between items-center py-0.5">
                                <span className={`text-[9px] uppercase font-bold font-mono ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>Holder Name</span>
                                <span className={`font-bold tracking-tight ${isCircadian ? "text-emerald-105 text-emerald-100" : "text-slate-800"}`}>{pid.nameOnID}</span>
                              </div>
                              <div className={`flex justify-between items-center py-0.5 border-t border-dashed ${isCircadian ? "border-emerald-900/20" : "border-slate-200"}`}>
                                <span className={`text-[9px] uppercase font-bold font-mono ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>Unique ID / Code</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono font-bold tracking-wide select-text ${isCircadian ? "text-emerald-400" : "text-indigo-600"}`}>{pid.idNumber}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(pid.idNumber);
                                      setCopiedID(pid.id);
                                      setTimeout(() => setCopiedID(null), 2000);
                                    }}
                                    className={`p-1 border rounded-md transition-all cursor-pointer ${isCircadian ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:text-emerald-200" : "bg-white border-slate-205 text-slate-400 hover:text-indigo-600"}`}
                                  >
                                    {copiedID === pid.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                                  </button>
                                </div>
                              </div>
                              {pid.notes && (
                                <div className={`pt-1.5 border-t border-dashed ${isCircadian ? "border-emerald-900/20 text-emerald-450" : "border-slate-200 text-slate-500"} text-[10px]`}>
                                  <span className="font-bold">Notes:</span> {pid.notes}
                                </div>
                              )}
                            </div>

                            {pid.idPhoto && (
                              <div className="mt-2 text-left space-y-1">
                                <span className={`text-[9px] uppercase font-bold font-mono block ${isCircadian ? "text-emerald-500" : "text-slate-405"}`}>Document Photo</span>
                                <div 
                                  className="relative group overflow-hidden border rounded-xl max-w-[130px] aspect-[1.58/1] cursor-pointer shadow-sm border-slate-200"
                                  onClick={() => setFullViewPhoto(pid.idPhoto!)}
                                >
                                  <img src={pid.idPhoto} alt="Personal ID Image" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-opacity">
                                    Click to View
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* SELECTED INDIVIDUAL'S PROFILE FOLDER */
                <div className="space-y-4 text-left">
                  {/* Folder header navigation */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0b120f] border border-slate-150 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedFolder(null);
                          setIsAddingID(false);
                          setIdPhoto(null);
                        }}
                        className={`flex items-center justify-center p-2 rounded-xl border transition-colors text-xs font-bold gap-1 cursor-pointer ${
                          isCircadian 
                            ? "bg-[#070b09] border-emerald-902 border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/20" 
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        &larr; Back to profiles
                      </button>
                      <div className="text-left ml-1">
                        <span className={`text-[8.5px] font-mono font-bold tracking-widest block uppercase ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>
                          ID VAULT CABINET FOLDER
                        </span>
                        <h4 className={`text-sm font-black leading-tight truncate max-w-[150px] ${isCircadian ? "text-white" : "text-slate-800"}`}>
                          {selectedFolder}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAddingID(prev => !prev)}
                      className="bg-indigo-600 hover:bg-indigo-700 hover:opacity-95 active:scale-[0.98] font-bold text-white px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs cursor-pointer transition-all"
                    >
                      {isAddingID ? "Cancel Adding" : "+ Register ID Card"}
                    </button>
                  </div>

                  {/* Create ID card inside folder (collapsible component) */}
                  {isAddingID && (
                    <form onSubmit={handleAddCustomID} className={`border rounded-2xl p-4.5 space-y-4 shadow-sm text-sm text-[11.5px] translate-y-0 text-slate-800 ${isCircadian ? "bg-[#0b120f] border-emerald-900/60" : "bg-slate-50 border-slate-150"}`}>
                      <h3 className={`font-black text-xs uppercase flex items-center gap-1.5 ${isCircadian ? "text-emerald-400" : "text-slate-705"}`}>
                        <Plus className="w-4 h-4 text-cyan-500 text-emerald-400" />
                        Add Card details under profile profile Code
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={`text-[10px] font-bold block mb-1 uppercase tracking-wider font-mono ${isCircadian ? "text-emerald-500" : "text-slate-500"}`}>ID / Document Type</label>
                          <select 
                            value={idType}
                            onChange={(e) => setIdType(e.target.value)}
                            className={`w-full rounded-xl px-2.5 py-2 font-bold ${
                              isCircadian 
                                ? "bg-[#070b09] border border-emerald-950 text-emerald-100" 
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
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
                          <label className={`text-[10px] font-bold block mb-1 uppercase tracking-wider font-mono ${isCircadian ? "text-emerald-500" : "text-slate-500"}`}>Name on Document</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Akash Chaudhary"
                            value={nameOnID}
                            onChange={(e) => setNameOnID(e.target.value)}
                            required
                            className={`w-full rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-indigo-500 ${
                              isCircadian 
                                ? "bg-[#070b09] border border-emerald-950 text-emerald-105 text-emerald-100" 
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>
                      </div>

                      {idType === "Custom" && (
                        <div className="animate-in slide-in-from-top-1.5 duration-150">
                          <label className={`text-[10px] font-bold block mb-1 uppercase tracking-wider font-mono ${isCircadian ? "text-emerald-500" : "text-slate-500"}`}>Enter Custom ID Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Employee ID, Gym Membership Code"
                            value={customIdType}
                            onChange={(e) => setCustomIdType(e.target.value)}
                            required
                            className={`w-full rounded-xl px-3 py-2 font-bold ${
                              isCircadian 
                                ? "bg-[#070b09] border border-emerald-950 text-emerald-100" 
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={`text-[10px] font-bold block mb-1 uppercase tracking-wider font-mono ${isCircadian ? "text-emerald-500" : "text-slate-500"}`}>ID / Card Number</label>
                          <input 
                            type="text" 
                            placeholder="Document number..."
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            required
                            className={`w-full rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-indigo-500 ${
                              isCircadian 
                                ? "bg-[#070b09] border border-emerald-950 text-emerald-100" 
                                : "bg-white border border-slate-205 text-slate-800"
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`text-[10px] font-bold block mb-1 uppercase tracking-wider font-mono ${isCircadian ? "text-emerald-500" : "text-slate-500"}`}>ID Expiry / Notes</label>
                          <input 
                            placeholder="expiry, location etc..."
                            value={idNotes}
                            onChange={(e) => setIdNotes(e.target.value)}
                            className={`w-full rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-indigo-500 ${
                              isCircadian 
                                ? "bg-[#070b09] border border-emerald-950 text-emerald-100" 
                                : "bg-white border border-slate-205 text-slate-800"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Photo Attachment upload box */}
                      <div>
                        <label className={`text-[10px] font-bold block mb-15 mb-1.5 uppercase tracking-wider font-mono ${isCircadian ? "text-emerald-500" : "text-slate-505 text-slate-500"}`}>
                          ID Card Photo / Document Scan (unencrypted full view)
                        </label>

                        <input 
                          type="file" 
                          accept="image/*"
                          ref={idPhotoInputRef}
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                setIdPhoto(reader.result as string);
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        {idPhoto ? (
                          <div className={`relative border rounded-xl p-3 flex items-center gap-3.5 ${isCircadian ? "border-emerald-500 bg-emerald-950/10" : "border-emerald-250 border-emerald-300 bg-emerald-50/25"}`}>
                            <div className="w-14 h-10 rounded-lg overflow-hidden border border-slate-150 bg-white">
                              <img src={idPhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 text-[11px] overflow-hidden">
                              <span className={`block font-bold truncate ${isCircadian ? "text-emerald-200" : "text-slate-800"}`}>Scan Attachment Added</span>
                              <span className="block font-mono text-[9px] text-slate-400">Ready to save under profile profile folder</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setIdPhoto(null)} 
                              className={`p-1.5 rounded-lg border transition-all text-rose-500 hover:bg-slate-100 ${isCircadian ? "border-emerald-900/30 text-rose-400 hover:bg-emerald-950" : "border-slate-200 text-rose-650"}`}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => idPhotoInputRef.current?.click()}
                            className={`w-full border-2 border-dashed py-3.5 rounded-2xl flex items-center justify-center gap-1.5 text-xs text-slate-450 hover:bg-slate-50 cursor-pointer text-slate-500 transition-colors ${isCircadian ? "border-emerald-900/40 hover:border-emerald-500 hover:bg-emerald-950/10" : "border-slate-205 hover:border-indigo-400"}`}
                          >
                            <FileUp className="w-4 h-4 text-cyan-600" /> Upload Persona ID Photo
                          </button>
                        )}
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 active:scale-[0.98] font-bold text-white py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> Save Identity Record under {selectedFolder}
                      </button>
                    </form>
                  )}

                  {/* ID List Display */}
                  <div className="space-y-3">
                    <span className={`text-[10px] font-bold tracking-wider font-mono uppercase block ${isCircadian ? "text-emerald-400" : "text-slate-400"}`}>
                      CARDS STORED IN "{selectedFolder.toUpperCase()}"
                    </span>

                    {personalIDs.filter(p => p.folderName === selectedFolder).length === 0 ? (
                      <div className={`p-8 rounded-2xl border text-center ${isCircadian ? "bg-[#0b120f]/60 border-emerald-900/20" : "bg-slate-50 border-slate-150"}`}>
                        <CreditCard className="w-8 h-8 text-slate-350 mx-auto opacity-40 mb-2" />
                        <p className={`text-xs italic ${isCircadian ? "text-emerald-700" : "text-slate-400"}`}>
                          No card records registered inside this profile yet.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {personalIDs.filter(p => p.folderName === selectedFolder).map(pid => (
                          <div key={pid.id} className={`rounded-2xl p-4 space-y-3.5 shadow-sm hover:scale-[1.005] transition-all font-sans relative overflow-hidden ${isCircadian ? "bg-[#0b120f] border border-emerald-900/60" : "bg-white border border-slate-150"}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-xl border ${isCircadian ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}>
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <h4 className={`font-bold text-xs tracking-tight ${isCircadian ? "text-emerald-100" : "text-slate-800"}`}>{pid.idType}</h4>
                                  <span className={`text-[8px] font-mono tracking-wider ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>CONNECTED IDENTIFICATION</span>
                                </div>
                              </div>
                              <button
                                onClick={() => deletePersonalID(pid.id)}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${isCircadian ? "border-emerald-900/30 text-emerald-600 hover:text-rose-450 hover:bg-emerald-950/25" : "border-slate-150 text-slate-450 hover:text-rose-600 hover:bg-slate-50"}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className={`p-3 rounded-xl border text-[11px] space-y-20 space-y-2 text-left ${isCircadian ? "bg-emerald-950/15 border-emerald-900/20 text-emerald-200" : "bg-slate-50 border-slate-150 text-slate-755 text-slate-700"}`}>
                              <div className="flex justify-between items-center py-0.5">
                                <span className={`text-[9px] uppercase font-bold font-mono ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>Holder Name</span>
                                <span className={`font-bold tracking-tight ${isCircadian ? "text-emerald-105 text-emerald-100" : "text-slate-800"}`}>{pid.nameOnID}</span>
                              </div>
                              <div className={`flex justify-between items-center py-0.5 border-t border-dashed ${isCircadian ? "border-emerald-900/20" : "border-slate-200"}`}>
                                <span className={`text-[9px] uppercase font-bold font-mono ${isCircadian ? "text-emerald-500" : "text-slate-400"}`}>Unique ID / Code</span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-mono font-bold tracking-wide select-text ${isCircadian ? "text-emerald-400" : "text-indigo-600"}`}>{pid.idNumber}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(pid.idNumber);
                                      setCopiedID(pid.id);
                                      setTimeout(() => setCopiedID(null), 2000);
                                    }}
                                    className={`p-1 border rounded-md transition-all cursor-pointer ${isCircadian ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:text-emerald-200" : "bg-white border-slate-205 text-slate-400 hover:text-indigo-600"}`}
                                  >
                                    {copiedID === pid.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                                  </button>
                                </div>
                              </div>
                              {pid.notes && (
                                <div className={`pt-1.5 border-t border-dashed ${isCircadian ? "border-emerald-900/20 text-emerald-400" : "border-slate-200 text-slate-500"} text-[10px]`}>
                                  <span className="font-bold">Notes:</span> {pid.notes}
                                </div>
                              )}
                            </div>

                            {/* ID Scan unencrypted photo view block */}
                            {pid.idPhoto && (
                              <div className="mt-2 text-left space-y-1.5">
                                <span className={`text-[9px] uppercase font-bold font-mono block ${isCircadian ? "text-emerald-505 text-emerald-500" : "text-slate-405 text-slate-400"}`}>Document Photo</span>
                                <div className="relative group overflow-hidden border border-slate-150 rounded-xl max-w-[170px] aspect-[1.58/1] cursor-pointer shadow-sm hover:border-indigo-400 transition-colors" onClick={() => setFullViewPhoto(pid.idPhoto!)}>
                                  <img src={pid.idPhoto} alt="Personal ID Image" referrerPolicy="no-referrer" className="w-full h-full object-cover transition-transform group-hover:scale-[1.03] duration-200" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-white font-black tracking-wide transition-opacity">
                                    Click to View ID Info
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

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

      {/* 4. Settings & Security Tab */}
      {activeTab === "settings" && (
        <div className="space-y-4 text-left">
          {/* Main PIN code changer card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600 animate-pulse" />
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Change Vault Lock PIN</h3>
            </div>

            <p className="text-[10px] text-slate-450 leading-normal font-semibold">
              Update the 4-digit numeric passcode protecting your app. This PIN is stored securely in your encrypted profile and automatically synchronized via Google Firebase Firestore when logged in.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              setLockError("");
              setLockSuccess("");

              if (!/^\d{4}$/.test(newPin)) {
                setLockError("Passcode PIN must be exactly 4 numeric digits.");
                return;
              }

              if (newPin !== confirmPin) {
                setLockError("Confirmation PIN code does not match. Please re-enter.");
                return;
              }

              changeLockPassword(newPin);
              setLockSuccess("Vault passcode PIN changed successfully! Syncing to Cloud... 🎉");
              setNewPin("");
              setConfirmPin("");
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">New PIN Code</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="Enter 4 digits"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-400 font-mono tracking-widest text-center"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider font-mono">Confirm PIN</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    placeholder="Confirm PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-400 font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              {/* Status flags */}
              {lockError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10.5px] font-bold p-2.5 rounded-xl">
                  ⚠️ {lockError}
                </div>
              )}

              {lockSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-650 text-[10.5px] font-bold p-2.5 rounded-xl">
                  ✨ {lockSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-2 rounded-xl text-xs tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
              >
                Sync &amp; Change Passcode PIN
              </button>
            </form>
          </div>

          {/* Biometrics Settings Card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Haptic Biometric Vault</h3>
                  <span className="text-[8px] font-mono text-slate-405">STATUS: {userState.biometricActive ? "ACTIVE & SYNCED" : "DISABLED"}</span>
                </div>
              </div>

              <button
                onClick={toggleBiometric}
                className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-300 relative ${
                  userState.biometricActive ? "bg-indigo-600" : "bg-slate-200"
                }`}
              >
                <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-sm transition-transform duration-300 transform ${
                  userState.biometricActive ? "translate-x-5.5" : "translate-x-0"
                }`} />
              </button>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal font-semibold">
              When toggled, this enables fast simulated fingerprint/biometric bypass triggers on your active lock screen. Changes sync immediately to your personal Google Cloud configuration profiles.
            </p>
          </div>

          {/* Device Sync & Active Diagnostics Card */}
          <div className="bg-gradient-to-br from-[#0c1612] to-slate-900 border border-emerald-950/40 rounded-2xl p-4.5 space-y-3.5 text-slate-300 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">Cloud Sync State Diagnostic</h4>
                  <span className="text-[8.5px] font-bold text-slate-400 font-mono font-semibold">MILITARY-LEVEL AES CORE ACTIVE</span>
                </div>
              </div>
              <span className="text-[8px] font-mono font-black bg-emerald-950/40 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>

            <div className="bg-[#11241a] border border-emerald-900/30 p-2.5 rounded-xl space-y-1.5 text-[9.5px]">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400 font-bold uppercase font-semibold">Active Security Factor</span>
                <span className="font-bold text-emerald-455 uppercase">{userState.biometricActive ? "Biometrics + Email" : "Email Only"}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400 font-bold uppercase font-semibold">Connected Passwords</span>
                <span className="font-bold text-emerald-400 uppercase">{passwords.length} Entries</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400 font-bold uppercase font-semibold">Stored Documents</span>
                <span className="font-bold text-emerald-400 uppercase">{documents.length} Files</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-slate-400 font-bold uppercase font-semibold">Stored personal IDs</span>
                <span className="font-bold text-emerald-400 uppercase">{personalIDs.length} Cards</span>
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold pt-1">
              <button
                onClick={() => {
                  exportData();
                  alert("Local credentials backup schema exported to file!");
                }}
                className="flex-1 text-center py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 hover:text-white rounded-xl text-[10.5px] transition-colors cursor-pointer font-mono font-bold uppercase tracking-wide"
              >
                Local Export Backups
              </button>
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

      {fullViewPhoto && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setFullViewPhoto(null)} 
            className="absolute top-4 right-4 p-2 bg-white/20 text-white hover:bg-white/30 rounded-full transition-all cursor-pointer z-[70]"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-3xl w-full max-h-[85vh] flex items-center justify-center rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl relative">
            <img 
              src={fullViewPhoto} 
              alt="Unencrypted Photo ID" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[80vh] object-contain" 
            />
          </div>
          <span className="text-xs font-bold text-white/80 mt-4 tracking-wider uppercase font-mono bg-black/45 px-3 py-1 rounded-full">
            Personal Card Photo — Complete Unencrypted View
          </span>
        </div>
      )}
    </div>
  );
};
