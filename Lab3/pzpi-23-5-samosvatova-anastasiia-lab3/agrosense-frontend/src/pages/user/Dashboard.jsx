import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, ThermometerSun, Droplets, MapPin, Activity, Leaf, 
  MoreVertical, Edit2, Trash2, X, Wind, Sun, SlidersHorizontal, 
  Eye, EyeOff, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAgroStore from '../../store/useAgroStore';
import { getGreenhouseSensorsApi, getSensorHistoryApi } from '../../api/iot.api';


const getSensorStyle = (type, name) => {
  const tLower = (type || name || '').toLowerCase();
  if (tLower.includes('temp')) return { icon: ThermometerSun, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
  if (tLower.includes('humid') && tLower.includes('soil')) return { icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
  if (tLower.includes('humid') || tLower.includes('волог')) return { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' };
  if (tLower.includes('light') || tLower.includes('lux') || tLower.includes('освіт')) return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
  return { icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' };
};

const getLocalizedSensorName = (sensor, t) => {
  const type = (sensor.type || '').toLowerCase();
  const name = (sensor.name || '').toLowerCase();
  
  if (type === 'temperature' || name.includes('temp') || name.includes('темп')) return t('details.typeTemp', 'Температура');
  if (type === 'soil_humidity' || name.includes('soil') || name.includes('ґрунт')) return t('details.typeSoilHum', 'Волога ґрунту');
  if (type === 'humidity' || name.includes('humid') || name.includes('волог')) return t('details.typeHum', 'Вологість пов.');
  if (type === 'light' || name.includes('light') || name.includes('освіт')) return t('details.typeLight', 'Освітленість');
  
  return sensor.name; 
};

const GreenhouseCard = ({ gh, viewDetails, toggleMenu, activeMenuId, activeFilterId, toggleFilter, openEditModal, handleDelete }) => {
  const { t } = useTranslation();
  
  const [sensorsList, setSensorsList] = useState([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(true);
  
  const [hiddenSensors, setHiddenSensors] = useState(() => {
    const saved = localStorage.getItem(`agrosense_hidden_sensors_${gh.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const isFilterOpen = activeFilterId === gh.id;
  const isMenuOpen = activeMenuId === gh.id;

  useEffect(() => {
    localStorage.setItem(`agrosense_hidden_sensors_${gh.id}`, JSON.stringify(hiddenSensors));
  }, [hiddenSensors, gh.id]);

  useEffect(() => {
    const fetchSensorsData = async () => {
      setIsLoadingSensors(true);
      try {
        const sensorsRes = await getGreenhouseSensorsApi(gh.id);
        const sensorData = Array.isArray(sensorsRes) ? sensorsRes : (sensorsRes.data || []);
        
        const dataWithValues = await Promise.all(sensorData.map(async (s) => {
          let val = s.value !== undefined ? s.value : (s.reading || '--');
          try {
            const histRes = await getSensorHistoryApi(gh.id, s.id, 1);
            const histArr = Array.isArray(histRes) ? histRes : (histRes.data || histRes.history || []);
            if (histArr.length > 0 && histArr[0].value !== undefined) {
              val = histArr[0].value;
            }
          } catch (e) {}
          return { ...s, currentValue: val };
        }));
        
        setSensorsList(dataWithValues.sort((a,b) => String(a.id).localeCompare(String(b.id))));
      } catch (e) {
        console.error("Error fetching sensors for", gh.id);
      } finally {
        setIsLoadingSensors(false);
      }
    };
    fetchSensorsData();
  }, [gh.id]);

  const toggleSensorVisibility = (e, sensorId) => {
    e.stopPropagation();
    setHiddenSensors(prev => 
      prev.includes(sensorId) 
        ? prev.filter(id => id !== sensorId) 
        : [...prev, sensorId]
    );
  };

  const visibleSensors = sensorsList.filter(s => !hiddenSensors.includes(s.id));

  return (
    <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row cursor-pointer hover:border-green-200 transition-colors group relative ${isFilterOpen || isMenuOpen ? 'z-50' : 'z-10'}`} onClick={() => viewDetails(gh.id)}>
      
      {/* ЛІВА ЧАСТИНА */}
      <div className="xl:w-[350px] p-6 xl:p-8 bg-gradient-to-br from-green-50/50 to-transparent border-b xl:border-b-0 xl:border-r border-gray-100 flex flex-col justify-between shrink-0 relative rounded-t-[2rem] xl:rounded-tr-none xl:rounded-l-[2rem] min-w-0">
        
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={(e) => toggleMenu(e, gh.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors shadow-sm border border-gray-100"
          >
            <MoreVertical size={18} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <button onClick={(e) => openEditModal(e, gh)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Edit2 size={16} className="text-blue-500" /> {t('common.edit')}
              </button>
              <button onClick={(e) => handleDelete(e, gh.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50 mt-1">
                <Trash2 size={16} /> {t('common.delete')}
              </button>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-green-500 border border-green-100 mb-6 shrink-0">
            <Leaf size={28} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors truncate" title={gh.name}>
            {gh.name}
          </h3>
          {gh.location && (
            <div className="flex items-center text-gray-500 text-sm gap-1.5 font-medium mb-4 min-w-0">
              <MapPin size={16} className="text-green-500 shrink-0" />
              <span className="truncate" title={gh.location}>{gh.location}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200/60 flex items-center justify-between min-w-0">
           <div className="text-sm font-medium text-gray-400 truncate pr-2" title={`${gh.areaSqMeters || '--'} м²`}>
             {t('dashboard.area')} <span className="text-gray-700 whitespace-nowrap ml-1">{gh.areaSqMeters || '--'} м²</span>
           </div>
           <div className="text-green-600 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 shrink-0">
              {t('dashboard.details')} &rarr;
           </div>
        </div>
      </div>
      
      {/* ПРАВА ЧАСТИНА */}
      <div className="flex-1 p-6 xl:p-8 flex flex-col bg-white rounded-b-[2rem] xl:rounded-bl-none xl:rounded-r-[2rem] min-w-0">
        
        <div className="flex justify-between items-center mb-6 relative gap-4">
           <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider truncate" title={t('dashboard.currentMetrics')}>
             {t('dashboard.currentMetrics')}
           </h4>
           
           <div className="relative shrink-0">
             <button 
               onClick={(e) => toggleFilter(e, gh.id)}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border ${
                 isFilterOpen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-gray-200 shadow-sm'
               }`}
             >
               <SlidersHorizontal size={16} /> 
               <span className="hidden sm:inline">{t('dashboard.customize')}</span>
             </button>

             {isFilterOpen && (
               <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2" onClick={e => e.stopPropagation()}>
                 <div className="px-3 py-2 border-b border-gray-50 mb-2">
                   <p className="text-xs font-bold text-gray-400 uppercase truncate" title={t('dashboard.showOnCard')}>
                     {t('dashboard.showOnCard')}
                   </p>
                 </div>
                 {sensorsList.length === 0 ? (
                   <p className="px-3 py-2 text-sm text-gray-500">{t('details.noSensors')}</p>
                 ) : (
                   <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                     {sensorsList.map(s => {
                       const isHidden = hiddenSensors.includes(s.id);
                       const style = getSensorStyle(s.type, s.name);
                       const Icon = style.icon;
                       const locName = getLocalizedSensorName(s, t); // Локалізована назва
                       
                       return (
                         <div 
                           key={s.id}
                           onClick={(e) => toggleSensorVisibility(e, s.id)}
                           className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors min-w-0 ${isHidden ? 'hover:bg-gray-50' : 'bg-green-50/50 hover:bg-green-50 border border-green-100/50'}`}
                         >
                           <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                              <Icon size={16} className={`shrink-0 ${isHidden ? 'text-gray-400' : style.color}`} />
                              <span className={`text-sm truncate ${isHidden ? 'text-gray-600' : 'text-green-800 font-medium'}`} title={locName}>
                                {locName}
                              </span>
                           </div>
                           {isHidden ? <EyeOff size={16} className="text-gray-300 shrink-0" /> : <Eye size={16} className="text-green-500 shrink-0" />}
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>

        <div className="flex-1 flex flex-col justify-center min-w-0">
          {isLoadingSensors ? (
             <div className="flex items-center gap-3 text-gray-400">
               <Loader2 className="animate-spin" size={20} />
               <span className="text-sm font-medium">{t('common.loading')}</span>
             </div>
          ) : sensorsList.length === 0 ? (
             <div className="text-gray-400 text-sm font-medium bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-center">
               {t('details.noSensors')}
             </div>
          ) : visibleSensors.length === 0 ? (
             <div className="text-gray-400 text-sm font-medium bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 text-center">
               {t('dashboard.allHidden')}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleSensors.map(s => {
                const style = getSensorStyle(s.type, s.name);
                const Icon = style.icon;
                const locName = getLocalizedSensorName(s, t); // Локалізована назва

                return (
                  <div key={s.id} className={`bg-white rounded-2xl p-4 border shadow-sm transition-colors ${style.border} hover:shadow-md flex flex-col min-w-0`}>
                    <div className="flex items-center gap-2 mb-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${style.bg} ${style.color} flex items-center justify-center shrink-0`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider truncate" title={locName}>
                        {locName}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-auto min-w-0">
                      <span className="text-2xl font-extrabold text-gray-900 truncate" title={s.currentValue}>
                        {s.currentValue}
                      </span>
                      <span className="text-sm font-bold text-gray-400 shrink-0">{s.unit || ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { greenhouses, isLoading, fetchGreenhouses, createGreenhouse, updateGreenhouse, deleteGreenhouse } = useAgroStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeFilterId, setActiveFilterId] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', areaSqMeters: '', heightMeters: '' });

  useEffect(() => {
    fetchGreenhouses();
  }, [fetchGreenhouses]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
      setActiveFilterId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', location: '', areaSqMeters: '', heightMeters: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (e, greenhouse) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingId(greenhouse.id);
    setFormData({
      name: greenhouse.name || '', location: greenhouse.location || '',
      areaSqMeters: greenhouse.areaSqMeters || '', heightMeters: greenhouse.heightMeters || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (window.confirm(t('dashboard.confirmDelete'))) {
      try {
        await deleteGreenhouse(id);
        toast.success(t('common.delete'));
      } catch (err) { toast.error(t('common.error')); }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name, location: formData.location,
      areaSqMeters: formData.areaSqMeters ? Number(formData.areaSqMeters) : undefined,
      heightMeters: formData.heightMeters ? Number(formData.heightMeters) : undefined,
    };

    try {
      if (editingId) await updateGreenhouse(editingId, payload);
      else await createGreenhouse(payload);
      toast.success(t('common.success'));
      setIsModalOpen(false);
    } catch (err) { toast.error(t('common.error')); }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
    setActiveFilterId(null);
  };

  const toggleFilter = (e, id) => {
    e.stopPropagation();
    setActiveFilterId(activeFilterId === id ? null : id);
    setActiveMenuId(null);
  };

  const viewDetails = (id) => navigate(`/dashboard/greenhouse/${id}`);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 truncate" title={t('dashboard.title')}>
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-500 mt-1 truncate" title={t('dashboard.subtitle')}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={openCreateModal} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl font-medium transition-all shadow-lg shadow-green-500/30">
            <Plus size={20} /> <span className="hidden sm:inline">{t('dashboard.addGreenhouse')}</span>
          </button>
        </div>
      </div>

      {isLoading && !isModalOpen && greenhouses.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      )}

      {!isLoading && greenhouses.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200 px-4">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><Leaf size={32} /></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.noGreenhouses')}</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">{t('dashboard.noGreenhousesDesc')}</p>
          <button onClick={openCreateModal} className="text-green-600 font-semibold bg-green-50 px-6 py-3 rounded-xl hover:bg-green-100 transition-colors inline-flex items-center gap-2">
            <Plus size={18} /> {t('dashboard.addFirst')}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {greenhouses.map((gh) => (
          <GreenhouseCard 
            key={gh.id} gh={gh} 
            viewDetails={viewDetails} 
            toggleMenu={toggleMenu} 
            activeMenuId={activeMenuId} 
            activeFilterId={activeFilterId}
            toggleFilter={toggleFilter}
            openEditModal={openEditModal} 
            handleDelete={handleDelete} 
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">{editingId ? t('common.edit') : t('dashboard.new')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors shrink-0"><X size={20} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1 truncate">{t('dashboard.name')}</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required placeholder={t('dashboard.placeholderName')} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1 truncate">{t('dashboard.location')}</label>
                <input type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder={t('dashboard.placeholderLocation')} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1 truncate">{t('dashboard.area')}</label>
                  <input type="number" step="0.01" name="areaSqMeters" value={formData.areaSqMeters} onChange={handleFormChange} placeholder={t('dashboard.placeholderArea')} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1 truncate">{t('dashboard.height')}</label>
                  <input type="number" step="0.01" name="heightMeters" value={formData.heightMeters} onChange={handleFormChange} placeholder={t('dashboard.placeholderHeight')} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500 w-full p-3.5 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-4 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/30 font-bold transition-all active:scale-[0.98]">
                {editingId ? t('common.save') : t('dashboard.create')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;