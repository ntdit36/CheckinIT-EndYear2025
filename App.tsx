import React, { useState, useEffect, useCallback } from 'react';
import { PLAYING_TEAMS, ALL_TEAMS, TEAM_CAPACITIES, TOTAL_CAPACITY, TeamLabel, Guest, AppState } from './types';
import { generateTeamSlogan } from './services/geminiService';
import { AdminDashboard } from './components/AdminDashboard';
import { GuestResult } from './components/GuestResult';
import { Settings, Sparkles, UserPlus, QrCode, Lock, X, ShieldCheck } from 'lucide-react';

// --- Constants ---
const STORAGE_KEY = 'team-allocator-v3-numbers'; 
const ADMIN_PIN = '2026'; 

// --- Helper Functions ---
const getInitialState = (): AppState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Lỗi đọc dữ liệu cũ, reset về mặc định:", error);
    localStorage.removeItem(STORAGE_KEY);
  }
  
  // Default State
  return {
    guests: [],
    availableNumbers: Array.from({ length: TOTAL_CAPACITY }, (_, i) => i + 1),
    teamCounts: ALL_TEAMS.reduce((acc, team) => ({ ...acc, [team]: 0 }), {} as Record<TeamLabel, number>),
  };
};

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(getInitialState);
  const [view, setView] = useState<'INPUT' | 'RESULT' | 'ADMIN'>('INPUT');
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [inputName, setInputName] = useState('');
  const [isAdminCheckin, setIsAdminCheckin] = useState(false);
  const [error, setError] = useState('');

  // Admin Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState(false);

  // Persist State
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }, [appState]);

  // Logic: Assign Team and Number
  const assignSlot = useCallback((name: string, isForAdmin: boolean) => {
    if (appState.guests.length >= TOTAL_CAPACITY) {
      setError("Xin lỗi, chương trình đã đủ 47 người!");
      return null;
    }

    let assignedTeam: TeamLabel;

    if (isForAdmin) {
      if (appState.teamCounts[TeamLabel.ADMIN] >= TEAM_CAPACITIES[TeamLabel.ADMIN]) {
        setError("Đã đủ 3 thành viên Ban Tổ Chức!");
        return null;
      }
      assignedTeam = TeamLabel.ADMIN;
    } else {
      const availableTeams = PLAYING_TEAMS.filter(t => appState.teamCounts[t] < TEAM_CAPACITIES[t]);
      
      if (availableTeams.length === 0) {
        setError("Hệ thống lỗi: Các đội chơi đã đầy (hãy kiểm tra xem còn slot BTC không).");
        return null;
      }

      const randomTeamIndex = Math.floor(Math.random() * availableTeams.length);
      assignedTeam = availableTeams[randomTeamIndex];
    }

    const numIndex = Math.floor(Math.random() * appState.availableNumbers.length);
    const assignedNumber = appState.availableNumbers[numIndex];

    const newGuest: Guest = {
      id: Date.now().toString(),
      name: name.trim(),
      team: assignedTeam,
      raffleNumber: assignedNumber,
      timestamp: Date.now(),
    };

    return newGuest;
  }, [appState]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = inputName.trim();
    if (!cleanName) return;

    setError('');

    const isDuplicate = appState.guests.some(
      g => g.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (isDuplicate) {
      setError(`Tên "${cleanName}" đã được check-in rồi! Vui lòng dùng tên khác.`);
      return;
    }

    const newGuest = assignSlot(cleanName, isAdminCheckin);
    
    if (newGuest) {
      // Simple random slogan (No API Call)
      const slogan = generateTeamSlogan(newGuest.name, newGuest.team, newGuest.raffleNumber);
      const guestWithSlogan = { ...newGuest, aiSlogan: slogan };

      setAppState(prev => {
        const newCounts = { ...prev.teamCounts };
        newCounts[guestWithSlogan.team] += 1;
        
        return {
          guests: [guestWithSlogan, ...prev.guests],
          availableNumbers: prev.availableNumbers.filter(n => n !== guestWithSlogan.raffleNumber),
          teamCounts: newCounts
        };
      });

      setCurrentGuest(guestWithSlogan);
      setView('RESULT');
      setInputName('');
      setIsAdminCheckin(false); 
    }
  };

  const handleResetData = () => {
    setAppState({
      guests: [],
      availableNumbers: Array.from({ length: TOTAL_CAPACITY }, (_, i) => i + 1),
      teamCounts: ALL_TEAMS.reduce((acc, team) => ({ ...acc, [team]: 0 }), {} as Record<TeamLabel, number>),
    });
    setCurrentGuest(null);
    setView('INPUT');
  };

  const handleDeleteGuest = (guestId: string) => {
    setAppState(prev => {
      const guestToDelete = prev.guests.find(g => g.id === guestId);
      if (!guestToDelete) return prev;

      const newCounts = { ...prev.teamCounts };
      if (newCounts[guestToDelete.team] > 0) {
        newCounts[guestToDelete.team] -= 1;
      }

      const newAvailableNumbers = [...prev.availableNumbers, guestToDelete.raffleNumber].sort((a, b) => a - b);

      return {
        guests: prev.guests.filter(g => g.id !== guestId),
        availableNumbers: newAvailableNumbers,
        teamCounts: newCounts
      };
    });
  };

  const handleUpdateGuest = (guestId: string, newName: string, newTeam: TeamLabel, newRaffleNumber: number) => {
    setAppState(prev => {
      const guestToUpdate = prev.guests.find(g => g.id === guestId);
      if (!guestToUpdate) return prev;

      const newCounts = { ...prev.teamCounts };
      let newAvailableNumbers = [...prev.availableNumbers];
      
      if (guestToUpdate.team !== newTeam) {
        newCounts[guestToUpdate.team] -= 1;
        newCounts[newTeam] += 1;
      }

      let finalNumber = guestToUpdate.raffleNumber;
      if (newRaffleNumber !== guestToUpdate.raffleNumber) {
        if (newAvailableNumbers.includes(newRaffleNumber)) {
           newAvailableNumbers = newAvailableNumbers.filter(n => n !== newRaffleNumber);
           newAvailableNumbers.push(guestToUpdate.raffleNumber);
           newAvailableNumbers.sort((a, b) => a - b);
           finalNumber = newRaffleNumber;
        }
      }

      const updatedGuests = prev.guests.map(g => {
        if (g.id === guestId) {
          return { ...g, name: newName, team: newTeam, raffleNumber: finalNumber };
        }
        return g;
      });

      return {
        ...prev,
        guests: updatedGuests,
        teamCounts: newCounts,
        availableNumbers: newAvailableNumbers
      };
    });
  };

  const handleNextGuest = () => {
    setCurrentGuest(null);
    setView('INPUT');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPin === ADMIN_PIN) {
      setShowAuthModal(false);
      setAuthPin('');
      setAuthError(false);
      setView('ADMIN');
    } else {
      setAuthError(true);
      setAuthPin('');
    }
  };

  if (view === 'ADMIN') {
    return (
      <AdminDashboard 
        guests={appState.guests} 
        availableNumbers={appState.availableNumbers}
        onReset={handleResetData}
        onBack={() => setView('INPUT')}
        onDeleteGuest={handleDeleteGuest}
        onUpdateGuest={handleUpdateGuest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] flex flex-col">
      
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <QrCode className="text-blue-500" />
          <h1 className="text-xl font-bold text-white tracking-tight">Team Allocator</h1>
        </div>
        <button 
          onClick={() => setShowAuthModal(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-800 rounded-full"
          title="Admin Panel"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {view === 'INPUT' && (
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <div className={`inline-block p-3 rounded-full mb-4 transition-colors ${isAdminCheckin ? 'bg-red-500/20' : 'bg-blue-500/10'}`}>
                {isAdminCheckin ? <ShieldCheck className="text-red-400 w-8 h-8" /> : <Sparkles className="text-blue-400 w-8 h-8" />}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {isAdminCheckin ? 'Check-in Ban Tổ Chức' : 'CHECK-IN THAM GIA TEAM NHẬN QUÀ'}
              </h2>
              <p className="text-slate-400">
                {isAdminCheckin 
                  ? 'Dành cho thành viên BTC nhận thẻ và số.' 
                  : 'Nhập tên của bạn để nhận số thứ tự và Team ngẫu nhiên.'}
              </p>
              <div className="mt-4 inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                Đã tham gia: <span className="text-white font-bold">{appState.guests.length}</span> / {TOTAL_CAPACITY}
              </div>
            </div>

            <form onSubmit={handleJoin} className={`backdrop-blur-xl border rounded-2xl p-6 shadow-2xl transition-colors ${isAdminCheckin ? 'bg-red-900/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">Tên của bạn</label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder={isAdminCheckin ? "Tên thành viên BTC" : "Ví dụ: KAKA"}
                  className="w-full px-4 py-4 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm animate-pulse">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!inputName.trim() || appState.guests.length >= TOTAL_CAPACITY}
                className={`w-full py-4 font-bold rounded-xl text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group ${
                  isAdminCheckin 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 hover:shadow-red-500/25' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'
                }`}
              >
                <UserPlus className="group-hover:scale-110 transition-transform" />
                {isAdminCheckin ? 'Xác Nhận BTC' : 'XÁC NHẬN'}
              </button>

              <div className="mt-4 flex justify-center">
                 <button 
                  type="button"
                  onClick={() => { setIsAdminCheckin(!isAdminCheckin); setError(''); }}
                  className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
                 >
                   {isAdminCheckin ? 'Quay lại Check-in Khách mời' : 'Check-in dành cho Ban Tổ Chức'}
                 </button>
              </div>
            </form>
          </div>
        )}

        {view === 'RESULT' && currentGuest && (
          <GuestResult guest={currentGuest} onReset={handleNextGuest} />
        )}

      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} Team Allocator. 47 Slots System.
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xs p-6 shadow-2xl relative">
            <button 
              onClick={() => { setShowAuthModal(false); setAuthError(false); setAuthPin(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-slate-700 rounded-full mb-3">
                <Lock className="text-blue-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Xác Thực Admin</h3>
            </div>

            <form onSubmit={handleAdminLogin}>
              <input 
                type="password" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={authPin}
                onChange={(e) => setAuthPin(e.target.value)}
                className={`w-full bg-slate-900 border ${authError ? 'border-red-500' : 'border-slate-600'} rounded-lg px-4 py-3 text-center text-2xl tracking-widest text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••"
                autoFocus
              />
              {authError && (
                <p className="text-red-400 text-xs text-center mb-4 font-medium">Mã PIN không đúng. Thử lại.</p>
              )}
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
              >
                Mở Khóa
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;