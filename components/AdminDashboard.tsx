import React, { useMemo, useState } from 'react';
import { Guest, TeamLabel, ALL_TEAMS, TEAM_CAPACITIES } from '../types';
import { Trash2, Download, Users, ShieldCheck, Pencil, X, Save, Hash } from 'lucide-react';

interface AdminDashboardProps {
  guests: Guest[];
  availableNumbers: number[];
  onReset: () => void;
  onBack: () => void;
  onDeleteGuest: (id: string) => void;
  onUpdateGuest: (id: string, name: string, team: TeamLabel, raffleNumber: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  guests, 
  availableNumbers,
  onReset, 
  onBack,
  onDeleteGuest,
  onUpdateGuest
}) => {
  const [filterTeam, setFilterTeam] = useState<TeamLabel | 'ALL'>('ALL');
  
  // Edit State
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeam, setEditTeam] = useState<TeamLabel>(TeamLabel.T1);
  const [editNumber, setEditNumber] = useState<number>(0);

  const filteredGuests = useMemo(() => {
    if (filterTeam === 'ALL') return guests;
    return guests.filter(g => g.team === filterTeam);
  }, [guests, filterTeam]);

  const teamStats = useMemo(() => {
    const stats: Record<string, number> = {};
    ALL_TEAMS.forEach(t => stats[t] = 0);
    guests.forEach(g => {
      stats[g.team] = (stats[g.team] || 0) + 1;
    });
    return stats;
  }, [guests]);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Team,Raffle Number,Slogan,Time\n"
      + guests.map(g => `${g.name},${g.team},${g.raffleNumber},"${g.aiSlogan || ''}",${new Date(g.timestamp).toLocaleTimeString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "guest_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetConfirm = () => {
    if (window.confirm("CẢNH BÁO: Hành động này sẽ xóa toàn bộ dữ liệu khách mời. Bạn có chắc chắn không?")) {
      onReset();
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Prevent row click issues
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}" không? Số của họ sẽ được thu hồi.`)) {
      onDeleteGuest(id);
    }
  };

  const startEditing = (guest: Guest) => {
    setEditingGuest(guest);
    setEditName(guest.name);
    setEditTeam(guest.team);
    setEditNumber(guest.raffleNumber);
  };

  const saveEdit = () => {
    if (editingGuest && editName.trim()) {
      onUpdateGuest(editingGuest.id, editName, editTeam, editNumber);
      setEditingGuest(null);
    }
  };

  // List of numbers available for assignment (Current number + Available pool)
  const numbersForSelection = useMemo(() => {
    if (!editingGuest) return [];
    return [editingGuest.raffleNumber, ...availableNumbers].sort((a, b) => a - b);
  }, [editingGuest, availableNumbers]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-20 animate-fade-in relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-blue-400" />
          Quản Lý Đội & BTC
        </h2>
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white underline">
          Quay lại Game
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-2 mb-6">
        {ALL_TEAMS.map(team => {
          const count = teamStats[team] || 0;
          const limit = TEAM_CAPACITIES[team];
          const isFull = count >= limit;
          const isAdmin = team === TeamLabel.ADMIN;

          return (
            <button
              key={team}
              onClick={() => setFilterTeam(team === filterTeam ? 'ALL' : team)}
              className={`p-2 rounded-lg text-center border transition-all relative overflow-hidden ${
                filterTeam === team 
                  ? (isAdmin ? 'bg-red-900/80 border-red-400 text-white' : 'bg-blue-600 border-blue-400 text-white') 
                  : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {isAdmin && <ShieldCheck className="w-3 h-3 absolute top-1 right-1 text-red-400" />}
              <div className="text-[10px] font-bold opacity-70 uppercase">{isAdmin ? 'BTC' : 'Team'}</div>
              <div className={`text-lg font-black ${isAdmin ? 'text-red-200' : ''}`}>{isAdmin ? 'ADM' : team}</div>
              <div className={`text-xs ${isFull ? 'text-red-400 font-bold' : 'text-green-400'}`}>
                {count}/{limit}
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors"
        >
          <Download size={18} /> Xuất Excel (CSV)
        </button>
        <button 
          onClick={handleResetConfirm}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-700 rounded-lg text-red-200 font-medium transition-colors ml-auto"
        >
          <Trash2 size={18} /> Reset Dữ Liệu
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-bold">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Đội</th>
                <th className="px-4 py-3">Số</th>
                <th className="px-4 py-3 hidden md:table-cell">AI Slogan</th>
                <th className="px-4 py-3">Giờ</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                    Chưa có thành viên nào trong nhóm này.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest, idx) => (
                  <tr key={guest.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-white">{guest.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center px-2 py-1 min-w-[32px] rounded-full font-bold text-sm ${
                        guest.team === TeamLabel.ADMIN 
                        ? 'bg-red-900 text-red-200' 
                        : 'bg-blue-900 text-blue-200'
                      }`}>
                        {guest.team === TeamLabel.ADMIN ? 'BTC' : guest.team}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-yellow-400 font-bold">#{guest.raffleNumber}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm hidden md:table-cell max-w-xs truncate" title={guest.aiSlogan}>
                      {guest.aiSlogan || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(guest.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-4 py-3 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => startEditing(guest)}
                            className="p-1.5 bg-slate-700 text-blue-400 rounded hover:bg-blue-900/50 transition-colors"
                            title="Sửa"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteClick(e, guest.id, guest.name)}
                            className="p-1.5 bg-slate-700 text-red-400 rounded hover:bg-red-900/50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Sửa Thông Tin</h3>
              <button 
                onClick={() => setEditingGuest(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Tên khách mời</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 pl-9 text-white focus:outline-none focus:border-blue-500"
                />
                <Pencil className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Số Thứ Tự (Thay đổi)</label>
              <div className="relative">
                <select
                  value={editNumber}
                  onChange={(e) => setEditNumber(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 pl-9 text-white focus:outline-none focus:border-blue-500 appearance-none font-mono"
                >
                  {numbersForSelection.map(num => (
                    <option key={num} value={num}>
                      #{num} {num === editingGuest.raffleNumber ? '(Hiện tại)' : '(Trống)'}
                    </option>
                  ))}
                </select>
                <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-1">Chuyển Đội</label>
              <div className="relative">
                <select
                  value={editTeam}
                  onChange={(e) => setEditTeam(e.target.value as TeamLabel)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 pl-9 text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {ALL_TEAMS.map(t => (
                    <option key={t} value={t}>
                      {t === TeamLabel.ADMIN ? 'Ban Tổ Chức (BTC)' : `Team ${t}`}
                    </option>
                  ))}
                </select>
                <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button 
              onClick={saveEdit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} /> Lưu Thay Đổi
            </button>
          </div>
        </div>
      )}

    </div>
  );
};