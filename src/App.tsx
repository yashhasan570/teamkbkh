import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Mail, ShieldCheck, Upload, X, Camera, LockIcon, 
  Users, BrainCircuit, BarChart3, UserCheck, Sun, Moon, ArrowRight,
  Download, Edit, CheckCircle, XCircle, Award, Pause, ShieldAlert, Trash2
} from 'lucide-react';

const APP_TITLE = "KBKh Hub";
const TEAMS = ['KBKh', 'BKLN', 'Bigganneshi'];
const API_BASE_URL = "/api";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('login'); 
  const [viewingUserId, setViewingUserId] = useState(null); 
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ 
    type: 'general', email: '', password: '', nameEn: '', nameBn: '', 
    mobile: '', dob: '', presentAddress: '', permanentAddress: '', team: 'KBKh' 
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [otpInput, setOtpInput] = useState('');
  
  const [authSubMode, setAuthSubMode] = useState('login'); 

  const profileUser = viewingUserId ? users.find(u => u.id === viewingUserId) : currentUser;
  const isOwnProfile = profileUser?.id === currentUser?.id;
  const isAdmin = currentUser?.role === 'admin';

  const theme = {
    bg: isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-50',
    panelBg: isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white',
    panelBgAlt: isDarkMode ? 'bg-[#252525]' : 'bg-gray-100',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    border: isDarkMode ? 'border-gray-800' : 'border-gray-200',
    inputBg: isDarkMode ? 'bg-[#252525]' : 'bg-white',
  };

  useEffect(() => {
    if (currentUser) {
      fetchLiveWorkspaceData();
    }
  }, [currentUser]);

  const fetchLiveWorkspaceData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-users.php`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Database sync error:", err);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (attachments.length + newFiles.length > 5) {
        alert("You can only upload up to 5 attachments in total.");
        return;
      }
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setActiveTab(data.user.role === 'general' ? 'intro' : 'profile');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server connection failed. Please ensure the API files are active.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterInitiate = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData();
    Object.keys(regForm).forEach(key => formData.append(key, regForm[key]));
    attachments.forEach((file, index) => formData.append(`attachment_${index}`, file));

    try {
      const res = await fetch(`${API_BASE_URL}/register-initiate.php`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setAuthSubMode('verify_otp');
        alert("A 6-digit secure code has been sent to your email inbox.");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Verification server connection failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpCode = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register-verify.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regForm.email, otp: otpInput })
      });
      const data = await res.json();
      if (data.success) {
        alert("Verification successful! Account state updated.");
        setAuthSubMode('login');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Verification submission error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await fetch(`${API_BASE_URL}/update-avatar.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profileUser.id, image: base64String })
          });
          setUsers(users.map(u => u.id === profileUser.id ? { ...u, profilePic: base64String } : u));
          if (isOwnProfile) setCurrentUser({ ...currentUser, profilePic: base64String });
        } catch (err) {
          alert("Failed to sync profile picture to server.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewingUserId(null);
    setAuthSubMode('login');
    setActiveTab('login');
  };

  const renderAuthView = () => (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className={`${theme.panelBg} border ${theme.border} w-full max-w-xl rounded-3xl p-8 shadow-2xl`}>
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/30"><ShieldCheck className="text-white" size={32} /></div>
        </div>
        
        {authSubMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className={`text-2xl font-bold text-center mb-6 ${theme.text}`}>Welcome Back</h2>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3.5 ${theme.textMuted}`} size={18} />
                <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} pl-10 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm ${theme.text}`} placeholder="Enter your email" />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3.5 ${theme.textMuted}`} size={18} />
                <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} pl-10 p-3 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm ${theme.text}`} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-500 transition-all mt-4">Sign In</button>
            <p className={`text-center text-sm ${theme.textMuted} mt-4`}>Don't have an account? <button type="button" onClick={() => setAuthSubMode('register')} className="text-indigo-500 font-bold">Register</button></p>
          </form>
        )}

        {authSubMode === 'register' && (
          <form onSubmit={handleRegisterInitiate} className="space-y-4">
            <h2 className={`text-2xl font-bold text-center mb-6 ${theme.text}`}>Create an Account</h2>
            
            <div className="flex bg-gray-800/20 p-1 rounded-xl mb-6">
              <button type="button" onClick={() => setRegForm({...regForm, type: 'general'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${regForm.type === 'general' ? 'bg-indigo-600 text-white' : theme.textMuted}`}>General Member</button>
              <button type="button" onClick={() => setRegForm({...regForm, type: 'team'})} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${regForm.type === 'team' ? 'bg-indigo-600 text-white' : theme.textMuted}`}>Team Application</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" required placeholder="Full Name [English]" value={regForm.nameEn} onChange={e => setRegForm({...regForm, nameEn: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text}`} />
              <input type="text" required placeholder="Full Name [Bangla]" value={regForm.nameBn} onChange={e => setRegForm({...regForm, nameBn: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text}`} />
            </div>
            
            <input type="email" required placeholder="Email Address" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text}`} />
            <input type="password" required placeholder="Password" value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text}`} />

            {regForm.type === 'team' && (
              <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl space-y-4 mt-2">
                <p className="text-xs text-indigo-400 font-bold flex items-center gap-2 border-b border-indigo-500/30 pb-2"><LockIcon size={14}/> <span>Confidential Team Records (Admin Only)</span></p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={`text-[10px] uppercase font-bold ${theme.textMuted} mb-1 block`}>Mobile Number</label><input type="tel" required placeholder="e.g. 017..." value={regForm.mobile} onChange={e => setRegForm({...regForm, mobile: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text}`} /></div>
                  <div><label className={`text-[10px] uppercase font-bold ${theme.textMuted} mb-1 block`}>Date of Birth</label><input type="date" required value={regForm.dob} onChange={e => setRegForm({...regForm, dob: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text} [color-scheme:dark]`} /></div>
                </div>

                <div>
                  <label className={`text-[10px] uppercase font-bold ${theme.textMuted} mb-1 block`}>Present Address (Detailed: Division &gt; District &gt; Upazila &gt; House)</label>
                  <textarea required rows={2} value={regForm.presentAddress} onChange={e => setRegForm({...regForm, presentAddress: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text} resize-none`} placeholder="Enter full present address..." />
                </div>

                <div>
                  <label className={`text-[10px] uppercase font-bold ${theme.textMuted} mb-1 block`}>Permanent Address (Detailed)</label>
                  <textarea required rows={2} value={regForm.permanentAddress} onChange={e => setRegForm({...regForm, permanentAddress: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text} resize-none`} placeholder="Enter full permanent address..." />
                </div>

                <div>
                   <label className={`text-[10px] uppercase font-bold ${theme.textMuted} mb-1 block`}>Select Team (Can be changed by Admin later)</label>
                   <select value={regForm.team} onChange={e => setRegForm({...regForm, team: e.target.value})} className={`w-full ${theme.inputBg} border ${theme.border} p-3 rounded-xl text-sm outline-none focus:border-indigo-500 ${theme.text}`}>
                     {TEAMS.map(t => <option key={t} value={t}>Team {t}</option>)}
                   </select>
                </div>

                <div className="pt-2 border-t border-indigo-500/20">
                  <label className={`flex justify-between text-[10px] uppercase font-bold ${theme.textMuted} mb-2`}>
                    <span>Attachments (Birth Certificate &amp; Picture MUST)</span>
                    <span className={attachments.length === 5 ? 'text-rose-500' : 'text-indigo-400'}>{attachments.length}/5 Files</span>
                  </label>
                  
                  <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${attachments.length >= 5 ? 'border-rose-500/50 bg-rose-500/5 cursor-not-allowed' : `border-indigo-500/50 hover:bg-indigo-500/5 ${theme.inputBg}`}`}>
                     <div className="flex flex-col items-center justify-center pt-2">
                         <Upload className={`w-6 h-6 mb-1 ${attachments.length >= 5 ? 'text-rose-500/50' : 'text-indigo-500'}`} />
                         <p className={`text-xs ${theme.textMuted}`}>{attachments.length >= 5 ? 'Max limit reached' : 'Click to select files'}</p>
                     </div>
                     <input type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleAttachmentChange} disabled={attachments.length >= 5} />
                  </label>

                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40 border border-gray-800 text-xs text-white">
                          <span className="truncate max-w-[250px]">{file.name}</span>
                          <button type="button" onClick={() => removeAttachment(index)} className="text-rose-400 hover:text-rose-300"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-500 transition-all mt-6 shadow-lg shadow-indigo-600/20">Verify &amp; Register</button>
            <p className={`text-center text-sm ${theme.textMuted} mt-4`}><button type="button" onClick={() => setAuthSubMode('login')} className="text-indigo-500 font-bold">Return to Sign In</button></p>
          </form>
        )}

        {authSubMode === 'verify_otp' && (
          <form onSubmit={handleVerifyOtpCode} className="space-y-5">
            <div className="text-center mb-2">
              <h3 className={`text-lg font-bold ${theme.text}`}>Enter Security OTP</h3>
              <p className={`text-xs ${theme.textMuted} mt-1`}>Please check your secure email inbox for the registration verification code.</p>
            </div>
            <div>
              <input type="text" required value={otpInput} onChange={e => setOtpInput(e.target.value)} className={`w-full text-center tracking-widest font-mono font-bold text-lg ${theme.inputBg} border ${theme.border} p-3 rounded-xl outline-none focus:border-indigo-500 ${theme.text}`} placeholder="6-Digit OTP" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold hover:bg-emerald-500 transition-all mt-2">Complete Verification</button>
          </form>
        )}
      </div>
    </div>
  );

  const renderProfileView = () => {
    if (!profileUser) return null;
    const displayName = profileUser.nameEn || profileUser.name || 'User';

    return (
      <div key={profileUser.id} className="max-w-4xl mx-auto space-y-8">
        <div className={`${theme.panelBg} border ${theme.border} rounded-3xl p-8 relative overflow-hidden shadow-xl`}>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>
          <div className="relative z-10 pt-16 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-indigo-600 text-white flex items-center justify-center font-bold text-5xl shadow-xl border-4 border-[#0f0f0f] overflow-hidden">
                  {profileUser.profilePic ? (
                    <img src={profileUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayName[0] || 'U'
                  )}
                </div>
                {(isOwnProfile || isAdmin) && (
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl backdrop-blur-sm cursor-pointer text-white">
                    <Camera size={32} />
                    <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <h1 className={`text-3xl font-bold ${theme.text}`}>{displayName}</h1>
                  <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase px-2 py-0.5 rounded tracking-wider">{profileUser.status || 'active'}</span>
                </div>
                <p className={`text-lg ${theme.textMuted} mt-1`}>{profileUser.role === 'admin' ? 'System Administrator' : `${profileUser.uniqueCode || 'PENDING'} • Team ${profileUser.team || 'None'}`}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`md:col-span-1 space-y-6 ${theme.panelBg} border ${theme.border} rounded-3xl p-6 h-fit`}>
             <h3 className={`font-bold uppercase tracking-widest text-xs ${theme.textMuted} mb-4`}>Standard Contact</h3>
             <div className="space-y-4 text-sm">
               <div><span className={`block ${theme.textMuted} text-xs`}>Email</span><span className={theme.text}>{profileUser.email}</span></div>
               <div><span className={`block ${theme.textMuted} text-xs`}>Mobile Contact</span><span className={theme.text}>{profileUser.mobile || 'Not specified'}</span></div>
               <div><span className={`block ${theme.textMuted} text-xs`}>Role Classification</span><span className="uppercase font-bold text-indigo-500">{profileUser.role}</span></div>
             </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            {profileUser.role !== 'general' && (
              <div className={`${theme.panelBg} border ${theme.border} rounded-3xl p-6`}>
                <h3 className={`font-bold uppercase tracking-widest text-xs ${theme.textMuted} mb-6 flex items-center space-x-2`}>
                   <LockIcon size={14} className="text-indigo-500" />
                   <span>Confidential Documentation Portfolio</span>
                </h3>

                {isAdmin || isOwnProfile ? (
                  <div className="grid grid-cols-1 gap-4 text-xs">
                    <div className={`${theme.panelBgAlt} p-3 rounded-xl border border-gray-800`}><span className={`block ${theme.textMuted} mb-1 uppercase tracking-wider font-bold text-[10px]`}>Name [Bangla]</span><span className={`font-semibold ${theme.text}`}>{profileUser.nameBn || 'Missing'}</span></div>
                    <div className={`${theme.panelBgAlt} p-3 rounded-xl border border-gray-800`}><span className={`block ${theme.textMuted} mb-1 uppercase tracking-wider font-bold text-[10px]`}>Present Address</span><span className={`font-semibold ${theme.text}`}>{profileUser.presentAddress || 'Missing'}</span></div>
                    <div className={`${theme.panelBgAlt} p-3 rounded-xl border border-gray-800`}><span className={`block ${theme.textMuted} mb-1 uppercase tracking-wider font-bold text-[10px]`}>Permanent Address</span><span className={`font-semibold ${theme.text}`}>{profileUser.permanentAddress || 'Missing'}</span></div>
                    <div className={`${theme.panelBgAlt} p-3 rounded-xl border border-gray-800`}><span className={`block ${theme.textMuted} mb-1 uppercase tracking-wider font-bold text-[10px]`}>Date of Birth</span><span className={`font-semibold ${theme.text}`}>{profileUser.dob || 'Missing'}</span></div>
                    <div className="p-3 border border-dashed border-gray-700 rounded-xl text-indigo-400 font-bold">Secure attachments are vault-sealed. Available in system pipeline downloads.</div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-700 rounded-2xl text-center bg-gray-950/20">
                     <LockIcon size={24} className="mx-auto text-emerald-500 mb-2" />
                     <p className="text-xs text-emerald-400 font-bold">Identity Vault Sealed</p>
                     <p className="text-[11px] text-gray-500 mt-1">Your detailed verification criteria, addresses, and 5 matrix attachments are securely locked for Admin review.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSidebarItem = (id, Icon, label) => (
    <button key={id} onClick={() => { setActiveTab(id); if (id === 'profile') setViewingUserId(null); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeTab === id && !viewingUserId ? 'bg-indigo-600 text-white shadow-lg' : `${theme.textMuted} hover:${theme.panelBgAlt}`}`}>
      <div className="flex items-center space-x-3"><Icon size={20} /><span className="font-medium text-sm">{label}</span></div>
    </button>
  );

  return (
    <div className={`flex h-screen ${theme.bg} ${theme.text} font-sans overflow-hidden transition-colors`}>
      {currentUser && (
        <aside className={`w-64 border-r p-6 flex flex-col ${theme.panelBg} ${theme.border} flex-shrink-0 z-20`}>
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="bg-indigo-600 p-2 rounded-xl"><ShieldCheck className="text-white" size={24} /></div>
            <div>
              <h1 className="text-lg font-bold leading-none">KBKh Hub</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Management Suite</p>
            </div>
          </div>
          <nav className="flex-1 space-y-2 overflow-y-auto">
            {renderSidebarItem('profile', User, 'My Profile')}
          </nav>
          <div className={`mt-auto pt-6 border-t ${theme.border} space-y-2`}>
            <button onClick={() => handleLogout()} className="w-full flex items-center justify-center p-3 rounded-xl bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500/20 transition-all text-sm">Sign Out</button>
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-y-auto relative">
        {currentUser ? (
          <div className="max-w-6xl mx-auto p-8">{activeTab === 'profile' ? renderProfileView() : null}</div>
        ) : (
          renderAuthView()
        )}
      </main>
    </div>
  );
}