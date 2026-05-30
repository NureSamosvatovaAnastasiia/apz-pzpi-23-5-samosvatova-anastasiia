import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  Users, Database, Download, Upload, Trash2, 
  Activity, MapPin, Search, Loader2, Info, Leaf, X, Settings2, Shield, Sprout, Plus, Edit2, Globe, Check
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  getAdminStatsApi, getAllUsersApi, deleteUserApi, updateUserRoleApi,
  getAllSystemGreenhousesApi, deleteSystemGreenhouseApi, getAdminGreenhouseDetailsApi,
  getSystemLogsApi, exportSystemDataApi, importSystemDataApi,
  getAdminCropsApi, createAdminCropApi, updateAdminCropApi, deleteAdminCropApi, getAdminChartsApi
} from '../../api/admin.api';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState({ totalUsers: 0, totalGreenhouses: 0, activeSensors: 0 });
  const [adminChartsData, setAdminChartsData] = useState([]);
  const [users, setUsers] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [crops, setCrops] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [infoModal, setInfoModal] = useState({ isOpen: false, data: null, isLoading: false });
  const [cropModal, setCropModal] = useState({ isOpen: false, data: null, isLoading: false });
  const [cropForm, setCropForm] = useState({ name: '', idealTempMin: '', idealTempMax: '', idealAirHumidityMin: '', idealAirHumidityMax: '', requiredDayHours: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'settings') return;
      
      setIsLoading(true);
      setSearchQuery('');
      
      try {
        if (activeTab === 'overview') {
          const [statsRes, chartsRes] = await Promise.all([
            getAdminStatsApi().catch(() => null),
            getAdminChartsApi(7).catch(() => null)
          ]);
          
          if (statsRes) setStats(statsRes.data || statsRes);
          if (chartsRes && chartsRes.charts?.registrations) {
        
            const formattedCharts = chartsRes.charts.registrations.map(item => ({
              ...item,
              date: new Date(item.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'uk-UA', { month: 'short', day: 'numeric' })
            }));
            setAdminChartsData(formattedCharts);
          }
        } 
        else if (activeTab === 'users') {
          const res = await getAllUsersApi().catch(() => []);
          setUsers(Array.isArray(res) ? res : (res.data || []));
        } 
        else if (activeTab === 'greenhouses') {
          const res = await getAllSystemGreenhousesApi().catch(() => []);
          setGreenhouses(Array.isArray(res) ? res : (res.data || []));
        }
        else if (activeTab === 'logs') {
          const res = await getSystemLogsApi().catch(() => []);
          setLogs(Array.isArray(res) ? res : (res.data || res.logs || []));
        }
        else if (activeTab === 'crops') {
          const res = await getAdminCropsApi().catch(() => []);
          setCrops(Array.isArray(res) ? res : (res.data || []));
        }
      } catch (error) {
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, i18n.language]);

  // --- ЛОГІКА КОРИСТУВАЧІВ ТА ТЕПЛИЦЬ (скорочено для читабельності, залишається незмінною) ---
  const handleDeleteUser = async (id) => {
    if (window.confirm(t('admin.confirmDeleteUser'))) {
      try { await deleteUserApi(id); setUsers(users.filter(u => u.id !== id && u._id !== id)); toast.success(t('common.success')); } 
      catch (error) { toast.error(error.response?.data?.error || t('common.error')); }
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try { await updateUserRoleApi(id, newRole); setUsers(users.map(u => (u.id === id || u._id === id) ? { ...u, role: newRole } : u)); toast.success(t('common.success')); } 
    catch (error) { toast.error(error.response?.data?.error || t('common.error')); }
  };

  const handleViewGreenhouseInfo = async (greenhouseId) => {
    if (!greenhouseId) return;
    setInfoModal({ isOpen: true, data: null, isLoading: true });
    try {
      const res = await getAdminGreenhouseDetailsApi(greenhouseId);
      setInfoModal({ isOpen: true, data: res.greenhouse || res.data || res, isLoading: false });
    } catch (error) {
      toast.error(error.response?.data?.error || t('common.error'));
      setInfoModal({ isOpen: false, data: null, isLoading: false });
    }
  };

  const handleDeleteGreenhouse = async (id) => {
    if (window.confirm(t('admin.confirmDeleteGreenhouse'))) {
      try { await deleteSystemGreenhouseApi(id); setGreenhouses(greenhouses.filter(g => g.id !== id && g._id !== id)); toast.success(t('common.success')); } 
      catch (error) { toast.error(error.response?.data?.error || t('common.error')); }
    }
  };

  const openCreateCropModal = () => { setCropForm({ name: '', idealTempMin: '', idealTempMax: '', idealAirHumidityMin: '', idealAirHumidityMax: '', requiredDayHours: '' }); setCropModal({ isOpen: true, data: null, isLoading: false }); };
  const openEditCropModal = (crop) => { setCropForm({ name: crop.name || '', idealTempMin: crop.idealTempMin || '', idealTempMax: crop.idealTempMax || '', idealAirHumidityMin: crop.idealAirHumidityMin || '', idealAirHumidityMax: crop.idealAirHumidityMax || '', requiredDayHours: crop.requiredDayHours || '' }); setCropModal({ isOpen: true, data: crop, isLoading: false }); };
  const handleCropSubmit = async (e) => {
    e.preventDefault(); setCropModal(prev => ({ ...prev, isLoading: true }));
    try {
      const payload = { name: cropForm.name, idealTempMin: cropForm.idealTempMin ? Number(cropForm.idealTempMin) : undefined, idealTempMax: cropForm.idealTempMax ? Number(cropForm.idealTempMax) : undefined, idealAirHumidityMin: cropForm.idealAirHumidityMin ? Number(cropForm.idealAirHumidityMin) : undefined, idealAirHumidityMax: cropForm.idealAirHumidityMax ? Number(cropForm.idealAirHumidityMax) : undefined, requiredDayHours: cropForm.requiredDayHours ? Number(cropForm.requiredDayHours) : undefined };
      if (cropModal.data) {
        const cropId = cropModal.data.id || cropModal.data._id;
        const res = await updateAdminCropApi(cropId, payload);
        setCrops(crops.map(c => (c.id === cropId || c._id === cropId) ? (res.data || res.crop || res) : c));
      } else {
        const res = await createAdminCropApi(payload);
        setCrops([...crops, (res.data || res.crop || res)]);
      }
      toast.success(t('common.success')); setCropModal({ isOpen: false, data: null, isLoading: false });
    } catch (error) { toast.error(error.response?.data?.error || t('common.error')); setCropModal(prev => ({ ...prev, isLoading: false })); }
  };
  const handleDeleteCrop = async (id) => {
    if (window.confirm(t('admin.confirmDeleteCrop'))) {
      try { await deleteAdminCropApi(id); setCrops(crops.filter(c => c.id !== id && c._id !== id)); toast.success(t('common.success')); } 
      catch (error) { toast.error(error.response?.data?.error || t('common.error')); }
    }
  };

  const handleExportBackup = async () => {
    try { toast.loading(t('common.loading'), { id: 'backup' }); const data = await exportSystemDataApi(); const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2)); const downloadNode = document.createElement('a'); downloadNode.setAttribute("href", dataStr); downloadNode.setAttribute("download", `agrosense_backup_${new Date().toISOString().split('T')[0]}.json`); document.body.appendChild(downloadNode); downloadNode.click(); downloadNode.remove(); toast.success(t('common.success'), { id: 'backup' }); } 
    catch (error) { toast.error(error.response?.data?.error || t('common.error'), { id: 'backup' }); }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0]; if (!file) return; const fileReader = new FileReader(); fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (event) => {
      try { const content = JSON.parse(event.target.result); toast.loading(t('common.loading'), { id: 'import' }); await importSystemDataApi(content); toast.success(t('common.success'), { id: 'import' }); } 
      catch (err) { toast.error(t('common.error'), { id: 'import' }); }
      e.target.value = null;
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    try { return new Date(dateString).toLocaleString(i18n.language === 'en' ? 'en-US' : 'uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); } 
    catch (e) { return dateString; }
  };

  const changeLanguage = (lng) => { i18n.changeLanguage(lng); toast.success(t('settings.saved')); };

 

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-[2rem] p-8 border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Users size={28} />
            </div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">{t('admin.totalUsers')}</p>
            <p className="text-4xl font-extrabold text-white">{stats.totalUsers !== undefined ? stats.totalUsers : '--'}</p>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-[2rem] p-8 border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <Database size={28} />
            </div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">{t('admin.totalGreenhouses')}</p>
            <p className="text-4xl font-extrabold text-white">{stats.totalGreenhouses !== undefined ? stats.totalGreenhouses : '--'}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-[2rem] p-8 border border-slate-700/50 shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
              <Activity size={28} />
            </div>
            <p className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">{t('admin.activeSensors')}</p>
            <p className="text-4xl font-extrabold text-white">{stats.activeSensors !== undefined ? stats.activeSensors : '--'}</p>
          </div>
        </div>
      </div>

   
      <div className="bg-slate-800/50 rounded-[2rem] p-8 border border-slate-700/50 shadow-lg mt-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity size={20} className="text-blue-500" />
          {t('admin.registrationsChart')}
        </h3>
        
        {adminChartsData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
            Немає даних для відображення
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adminChartsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="Реєстрації" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-500" /></div>
            <input type="text" placeholder={t('admin.searchUsers')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-11 p-3 outline-none" />
          </div>
        </div>
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/50">
                <th className="p-5 font-bold">{t('layout.user')}</th><th className="p-5 font-bold">Email</th><th className="p-5 font-bold">{t('settings.role')}</th><th className="p-5 font-bold text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">{t('admin.noUsers')}</td></tr> : filteredUsers.map((u) => {
                const uId = u.id || u._id; const roleValue = u.role?.toUpperCase() || 'USER';
                return (
                  <tr key={uId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300 shrink-0">{u.username?.charAt(0).toUpperCase()}</div><span className="font-bold text-slate-200">{u.username}</span></div></td>
                    <td className="p-5 text-slate-400 font-medium">{u.email}</td>
                    <td className="p-5"><select value={roleValue} onChange={(e) => handleRoleChange(uId, e.target.value)} className={`text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer appearance-none border transition-colors ${roleValue === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'}`}><option value="USER">{t('admin.roleUser')}</option><option value="ADMIN">{t('admin.roleAdmin')}</option></select></td>
                    <td className="p-5 text-right"><button onClick={() => handleDeleteUser(uId)} title={t('common.delete')} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700"><Trash2 size={18} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGreenhouses = () => {
    const filteredGH = greenhouses.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()) || g.location?.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-500" /></div>
            <input type="text" placeholder={t('admin.searchGreenhouses')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-11 p-3 outline-none" />
          </div>
        </div>
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/50">
                <th className="p-5 font-bold">{t('dashboard.name')}</th><th className="p-5 font-bold">{t('admin.location')}</th><th className="p-5 font-bold text-center">ID</th><th className="p-5 font-bold text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredGH.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">{t('admin.noGreenhouses')}</td></tr> : filteredGH.map((g) => {
                const gId = g.id || g._id || g.greenhouseId || g.greenhouse_id;
                return (
                  <tr key={gId || Math.random()} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shrink-0"><Leaf size={18} /></div><div><span className="font-bold text-slate-200 block truncate">{g.name}</span><span className="text-xs text-slate-500 font-medium">{t('admin.area')}: {g.areaSqMeters || '--'} м²</span></div></div></td>
                    <td className="p-5"><div className="flex items-center gap-1.5 text-slate-400 font-medium text-sm truncate"><MapPin size={16} className="text-slate-500 shrink-0"/>{g.location || '--'}</div></td>
                    <td className="p-5 text-center"><span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800 truncate block max-w-[120px] mx-auto">{gId || 'No ID'}</span></td>
                    <td className="p-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleViewGreenhouseInfo(gId)} title={t('admin.viewInfo')} className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700"><Info size={18} /></button><button onClick={() => handleDeleteGreenhouse(gId)} title={t('common.delete')} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700"><Trash2 size={18} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCrops = () => {
    const filteredCrops = crops.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-500" /></div>
            <input type="text" placeholder={t('admin.searchCrops')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 block w-full pl-11 p-3 outline-none" />
          </div>
          <button onClick={openCreateCropModal} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/20 shrink-0 w-full sm:w-auto"><Plus size={18} /> {t('admin.addCrop')}</button>
        </div>
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/50">
                <th className="p-5 font-bold">{t('admin.cropName')}</th><th className="p-5 font-bold text-center">{t('admin.optTemp')}</th><th className="p-5 font-bold text-center">{t('admin.optHum')}</th><th className="p-5 font-bold text-center">{t('admin.growingDays')}</th><th className="p-5 font-bold text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredCrops.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">{t('admin.noCrops')}</td></tr> : filteredCrops.map((c) => {
                const cId = c.id || c._id;
                return (
                  <tr key={cId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shrink-0"><Sprout size={18} /></div><span className="font-bold text-slate-200 block truncate">{c.name}</span></div></td>
                    <td className="p-5 text-center text-orange-400 font-bold text-sm">{c.idealTempMin !== undefined ? `${c.idealTempMin} - ${c.idealTempMax}°C` : '--'}</td>
                    <td className="p-5 text-center text-blue-400 font-bold text-sm">{c.idealAirHumidityMin !== undefined ? `${c.idealAirHumidityMin} - ${c.idealAirHumidityMax}%` : '--'}</td>
                    <td className="p-5 text-center text-slate-300 font-medium">{c.requiredDayHours ? `${c.requiredDayHours} год/добу` : '--'}</td>
                    <td className="p-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditCropModal(c)} title={t('common.edit')} className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700"><Edit2 size={18} /></button><button onClick={() => handleDeleteCrop(cId)} title={t('common.delete')} className="p-2 text-slate-500 hover:text-red-400 transition-colors bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700"><Trash2 size={18} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderLogs = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700/50">
                <th className="p-5 font-bold w-48">{t('admin.date', 'Дата')}</th><th className="p-5 font-bold">{t('admin.action', 'Дія')}</th><th className="p-5 font-bold">{t('admin.user', 'Користувач')}</th><th className="p-5 font-bold">{t('admin.detailsLog', 'Деталі')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {logs.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-500">{t('admin.noLogs', 'Логи відсутні')}</td></tr> : logs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-800/50 transition-colors text-sm">
                  <td className="p-5 text-slate-400 whitespace-nowrap">{formatDate(log.createdAt || log.timestamp)}</td>
                  <td className="p-5"><span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 text-xs">{log.action}</span></td>
                  <td className="p-5 font-medium text-slate-300 truncate max-w-[150px]">{log.userEmail || log.userId || '--'}</td>
                  <td className="p-5 text-slate-500 truncate max-w-[200px]" title={log.details || log.description}>{log.details || log.description || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBackup = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/40 rounded-[2rem] border border-slate-700/50 p-10 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/20 relative z-10"><Download size={36} /></div>
        <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{t('admin.exportTitle')}</h3>
        <p className="text-slate-400 mb-8 max-w-sm relative z-10">{t('admin.exportDesc')}</p>
        <button onClick={handleExportBackup} className="w-full max-w-xs py-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 relative z-10">{t('admin.exportBtn')}</button>
      </div>
      <div className="bg-slate-800/40 rounded-[2rem] border border-slate-700/50 p-10 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="w-20 h-20 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20 relative z-10"><Upload size={36} /></div>
        <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{t('admin.importTitle')}</h3>
        <p className="text-slate-400 mb-8 max-w-sm relative z-10">{t('admin.importDesc')}</p>
        <label className="w-full max-w-xs py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer relative z-10 text-center">
          <span>{t('admin.importBtn')}</span><input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
        </label>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-800/40 rounded-[2rem] border border-slate-700/50 p-8 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-12 h-12 bg-slate-700 text-slate-300 rounded-xl flex items-center justify-center"><Globe size={24} /></div>
          <div><h2 className="text-xl font-bold text-white">{t('settings.language')}</h2><p className="text-xs text-slate-400 font-medium">{t('settings.selectLanguage')}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-lg gap-4 relative z-10">
          <button onClick={() => changeLanguage('uk')} className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${i18n.language === 'uk' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'}`}>
            <span className="text-3xl">🇺🇦</span><span className={`font-bold ${i18n.language === 'uk' ? 'text-emerald-400' : 'text-slate-300'}`}>Українська</span>{i18n.language === 'uk' && <div className="absolute top-4 right-4 text-emerald-500"><Check size={18} /></div>}
          </button>
          <button onClick={() => changeLanguage('en')} className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${i18n.language === 'en' || i18n.language?.startsWith('en') ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'}`}>
            <span className="text-3xl">🇬🇧</span><span className={`font-bold ${i18n.language?.startsWith('en') ? 'text-emerald-400' : 'text-slate-300'}`}>English</span>{(i18n.language === 'en' || i18n.language?.startsWith('en')) && <div className="absolute top-4 right-4 text-emerald-500"><Check size={18} /></div>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-10 relative">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-slate-500 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'greenhouses' && renderGreenhouses()}
          {activeTab === 'crops' && renderCrops()}
          {activeTab === 'logs' && renderLogs()}
          {activeTab === 'backup' && renderBackup()}
          {activeTab === 'settings' && renderSettings()}
        </>
      )}

    
      {infoModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          {/* ... (існуючий код модалки теплиці) ... */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Leaf size={20} className="text-emerald-500" />
                {t('admin.greenhouseInfo')}
              </h2>
              <button 
                onClick={() => setInfoModal({ isOpen: false, data: null, isLoading: false })} 
                className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-700 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {infoModal.isLoading ? (
              <div className="flex justify-center items-center h-40 relative z-10">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              </div>
            ) : infoModal.data ? (
              <div className="space-y-6 text-sm relative z-10 overflow-y-auto pr-2 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <span className="text-slate-500 block mb-1 font-medium text-xs uppercase tracking-wider">{t('dashboard.name')}</span>
                    <div className="text-white font-bold text-lg truncate">{infoModal.data.name || '--'}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <span className="text-slate-500 block mb-1 font-medium text-xs uppercase tracking-wider">{t('admin.location')}</span>
                    <div className="text-white font-bold truncate">{infoModal.data.location || '--'}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <span className="text-slate-500 block mb-1 font-medium text-xs uppercase tracking-wider">{t('admin.area')}</span>
                    <div className="text-white font-bold">{infoModal.data.areaSqMeters ? `${infoModal.data.areaSqMeters} м²` : '--'}</div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4">
                    <span className="text-slate-500 block mb-1 font-medium text-xs uppercase tracking-wider">{t('admin.height')}</span>
                    <div className="text-white font-bold">{infoModal.data.heightMeters ? `${infoModal.data.heightMeters} м` : '--'}</div>
                  </div>
                </div>

                {infoModal.data.owner && typeof infoModal.data.owner === 'object' && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400 shrink-0">
                       <Shield size={20} />
                     </div>
                     <div className="min-w-0">
                       <span className="text-blue-400/80 block mb-0.5 font-medium text-xs uppercase tracking-wider">{t('admin.ownerDetails')}</span>
                       <div className="text-white font-bold truncate">{infoModal.data.owner.username || '--'}</div>
                       <div className="text-blue-300/80 text-xs truncate">{infoModal.data.owner.email || '--'}</div>
                     </div>
                  </div>
                )}

                <div>
                  <h3 className="text-slate-300 font-bold mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-emerald-500"/> {t('details.sensors')}
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{infoModal.data.sensors?.length || 0}</span>
                  </h3>
                  {(!infoModal.data.sensors || infoModal.data.sensors.length === 0) ? (
                    <p className="text-slate-500 text-xs">{t('details.noSensors')}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {infoModal.data.sensors.map(s => (
                        <div key={s.id} className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex justify-between items-center">
                          <div className="min-w-0 pr-2">
                            <p className="text-slate-200 font-bold text-xs truncate" title={s.name}>{s.name}</p>
                            <p className="text-slate-500 text-[10px] uppercase mt-0.5">{s.type}</p>
                          </div>
                          <span className="text-slate-400 text-xs font-mono bg-slate-900 px-1.5 py-0.5 rounded">{s.unit || '-'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-slate-300 font-bold mb-3 flex items-center gap-2">
                    <Settings2 size={16} className="text-amber-500"/> {t('details.actuators')}
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{infoModal.data.actuators?.length || 0}</span>
                  </h3>
                  {(!infoModal.data.actuators || infoModal.data.actuators.length === 0) ? (
                    <p className="text-slate-500 text-xs">{t('details.noActuators')}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {infoModal.data.actuators.map(a => (
                        <div key={a.id} className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex justify-between items-center">
                          <div className="min-w-0 pr-2">
                            <p className="text-slate-200 font-bold text-xs truncate" title={a.name}>{a.name}</p>
                            <p className="text-slate-500 text-[10px] uppercase mt-0.5">{a.type}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md shrink-0 ${a.currentState ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {a.currentState ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center text-slate-500 py-10 relative z-10">{t('common.error')}</div>
            )}
            
            {!infoModal.isLoading && (
              <button 
                onClick={() => setInfoModal({ isOpen: false, data: null, isLoading: false })} 
                className="w-full mt-8 py-3.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all relative z-10"
              >
                {t('admin.close')}
              </button>
            )}
          </div>
        </div>
      )}

    
      {cropModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden flex flex-col">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sprout size={20} className="text-green-500" />
                {cropModal.data ? t('admin.editCrop') : t('admin.addCrop')}
              </h2>
              <button 
                onClick={() => setCropModal({ isOpen: false, data: null, isLoading: false })} 
                className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-700 rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCropSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">{t('admin.cropName')} *</label>
                <input 
                  type="text" required value={cropForm.name} 
                  onChange={e => setCropForm({...cropForm, name: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none placeholder-slate-600" 
                  placeholder="Наприклад: Помідор черрі" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Мін. Темп. (°C)</label>
                  <input 
                    type="number" step="0.1" value={cropForm.idealTempMin} 
                    onChange={e => setCropForm({...cropForm, idealTempMin: e.target.value})} 
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none placeholder-slate-600" 
                    placeholder="18" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Макс. Темп. (°C)</label>
                  <input 
                    type="number" step="0.1" value={cropForm.idealTempMax} 
                    onChange={e => setCropForm({...cropForm, idealTempMax: e.target.value})} 
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none placeholder-slate-600" 
                    placeholder="25" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Мін. Волог. (%)</label>
                  <input 
                    type="number" step="0.1" value={cropForm.idealAirHumidityMin} 
                    onChange={e => setCropForm({...cropForm, idealAirHumidityMin: e.target.value})} 
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none placeholder-slate-600" 
                    placeholder="50" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Макс. Волог. (%)</label>
                  <input 
                    type="number" step="0.1" value={cropForm.idealAirHumidityMax} 
                    onChange={e => setCropForm({...cropForm, idealAirHumidityMax: e.target.value})} 
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none placeholder-slate-600" 
                    placeholder="70" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 ml-1">Період світла (год/добу)</label>
                <input 
                  type="number" value={cropForm.requiredDayHours} 
                  onChange={e => setCropForm({...cropForm, requiredDayHours: e.target.value})} 
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none placeholder-slate-600" 
                  placeholder="14" 
                />
              </div>
              
              <button 
                type="submit" disabled={cropModal.isLoading} 
                className="w-full mt-4 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2"
              >
                {cropModal.isLoading ? <Loader2 size={18} className="animate-spin" /> : t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;