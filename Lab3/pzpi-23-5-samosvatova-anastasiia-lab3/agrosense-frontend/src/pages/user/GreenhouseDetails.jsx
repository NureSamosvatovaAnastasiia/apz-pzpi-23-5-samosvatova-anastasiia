import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Leaf, MapPin, Maximize, Ruler, 
  ThermometerSun, Droplets, Wind, Sun, Power, Activity,
  Plus, MoreVertical, Edit2, Trash2, X, Clock, History, Check, Loader2, LineChart as LineChartIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import useAgroStore from '../../store/useAgroStore';
import useIotStore from '../../store/useIotStore';
import { getSensorHistoryApi, getActuatorHistoryApi, getSensorChartApi } from '../../api/iot.api';


const getLocalizedSensorName = (sensor, t) => {
  const type = (sensor?.type || '').toLowerCase();
  const name = (sensor?.name || '').toLowerCase();
  
  if (type === 'temperature' || name.includes('temp') || name.includes('темп')) return t('details.typeTemp', 'Температура');
  if (type === 'soil_humidity' || name.includes('soil') || name.includes('ґрунт')) return t('details.typeSoilHum', 'Волога ґрунту');
  if (type === 'humidity' || name.includes('humid') || name.includes('волог')) return t('details.typeHum', 'Вологість пов.');
  if (type === 'light' || name.includes('light') || name.includes('освіт')) return t('details.typeLight', 'Освітленість');
  
  return sensor?.name || 'Unknown';
};

const ValueSlider = ({ actuatorId, initialState, initialValue, isManuallyToggled, onClearManualToggle, onValueSubmit }) => {
  const { t } = useTranslation();
  const [localVal, setLocalVal] = useState(initialValue ?? 100);
  const [isDirty, setIsDirty] = useState(isManuallyToggled);

  useEffect(() => {
    if (isManuallyToggled) setIsDirty(true);
  }, [isManuallyToggled]);

  useEffect(() => {
    if (!isDirty) {
      setLocalVal(initialValue ?? 100);
    }
  }, [initialValue, isDirty]);

  const handleApply = () => {
    onValueSubmit(actuatorId, initialState, localVal);
    setIsDirty(false);
    if (onClearManualToggle) onClearManualToggle();
  };

  const handleChange = (e) => {
    setLocalVal(e.target.value);
    setIsDirty(true);
  };

  return (
    <div className="mt-5 px-1 animate-in fade-in slide-in-from-top-2">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {t('details.power')}: <span className="text-gray-900 font-bold ml-1">{Math.round(localVal)}%</span>
        </span>
        {isDirty && (
          <button
            onClick={handleApply}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm font-bold transition-all active:scale-95 animate-in zoom-in"
          >
            <Check size={14} /> {t('details.apply')}
          </button>
        )}
      </div>
      <input 
        type="range" 
        min="0" max="100" step="5"
        value={localVal} 
        onChange={handleChange}
        className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
    </div>
  );
};

const GreenhouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const { greenhouses, fetchGreenhouses } = useAgroStore();
  const { 
    sensors, actuators, isLoading, isActionLoading, fetchIotData, 
    changeActuatorState, addSensor, removeSensor, editSensor,
    addActuator, removeActuator, editActuator
  } = useIotStore();
  
  const greenhouse = greenhouses.find(gh => gh.id === id);

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [sensorModal, setSensorModal] = useState({ isOpen: false, data: null });
  const [actuatorModal, setActuatorModal] = useState({ isOpen: false, data: null });
  
  const [historyModal, setHistoryModal] = useState({ 
    isOpen: false, data: null, type: 'sensor', records: [], isLoading: false 
  });

  const [sensorForm, setSensorForm] = useState({ name: '', type: 'temperature', unit: '°C' });
  const [actuatorForm, setActuatorForm] = useState({ name: '', type: 'pump' });

  const [manualToggles, setManualToggles] = useState({}); 

  const [activeChartSensor, setActiveChartSensor] = useState('');
  const [chartData, setChartData] = useState([]);
  const [chartHours, setChartHours] = useState(24);
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    if (greenhouses.length === 0) fetchGreenhouses();
    fetchIotData(id);
    
    const interval = setInterval(() => {
      fetchIotData(id);
    }, 10000);
    return () => clearInterval(interval);
  }, [id, greenhouses.length]);

  // Вибір першого датчика за замовчуванням для графіка
  useEffect(() => {
    if (sensors.length > 0 && !activeChartSensor) {
      setActiveChartSensor(sensors[0].id);
    }
  }, [sensors, activeChartSensor]);

  // Завантаження даних для графіка
  useEffect(() => {
    if (!activeChartSensor) return;
    
    const fetchChart = async () => {
      setIsChartLoading(true);
      try {
        const res = await getSensorChartApi(id, activeChartSensor, chartHours);
        const data = Array.isArray(res) ? res : (res.data || []);
        
        const formatted = data.map(d => ({
          time: new Date(d.createdAt || d.timestamp).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'uk-UA', {hour: '2-digit', minute:'2-digit'}),
          value: d.value !== undefined ? Number(d.value) : Number(d.reading),
          fullDate: new Date(d.createdAt || d.timestamp).toLocaleString(i18n.language === 'en' ? 'en-US' : 'uk-UA')
        })).reverse(); 
        
        setChartData(formatted);
      } catch(e) {
        console.error("Error loading chart", e);
      } finally {
        setIsChartLoading(false);
      }
    }
    fetchChart();
  }, [activeChartSensor, chartHours, id, i18n.language]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getSensorStyle = (type, name) => {
    const tLower = (type || name || '').toLowerCase();
    if (tLower.includes('temp')) return { icon: ThermometerSun, color: 'text-orange-500', bg: 'bg-orange-50' };
    if (tLower.includes('humid') && tLower.includes('soil')) return { icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (tLower.includes('humid') || tLower.includes('волог')) return { icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' };
    if (tLower.includes('light') || tLower.includes('lux') || tLower.includes('освіт')) return { icon: Sun, color: 'text-amber-400', bg: 'bg-amber-50' };
    return { icon: Activity, color: 'text-brand-500', bg: 'bg-brand-50' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--:--';
    const d = new Date(dateString);
    const locale = i18n.language === 'en' ? 'en-US' : 'uk-UA';
    return d.toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleActuatorToggle = async (actuatorId, currentState, currentValue) => {
    try {
      const val = !currentState ? (currentValue || 100) : 0;
      
      if (!currentState) {
        setManualToggles(prev => ({ ...prev, [actuatorId]: true }));
      } else {
        setManualToggles(prev => {
          const newObj = { ...prev };
          delete newObj[actuatorId];
          return newObj;
        });
      }

      await changeActuatorState(id, actuatorId, !currentState, val);
      toast.success(t('details.toggledSuccess'));
    } catch (err) {
      toast.error(t('details.toggleError'));
    }
  };

  const handleValueChange = async (actuatorId, currentState, newValue) => {
    try {
      await changeActuatorState(id, actuatorId, currentState, parseInt(newValue));
      toast.success(t('details.powerSuccess'));
    } catch (err) {
      toast.error(t('details.powerError'));
    }
  };

  const openSensorModal = (sensor = null) => {
    setActiveMenuId(null);
    setSensorModal({ isOpen: true, data: sensor });
    setSensorForm(sensor ? { name: sensor.name, type: sensor.type, unit: sensor.unit } : { name: '', type: 'temperature', unit: '°C' });
  };

  const submitSensor = async (e) => {
    e.preventDefault();
    try {
      if (sensorModal.data) await editSensor(id, sensorModal.data.id, sensorForm);
      else await addSensor(id, sensorForm);
      setSensorModal({ isOpen: false, data: null });
      toast.success(t('common.success'));
    } catch (error) { toast.error(t('common.error')); }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (window.confirm(t('details.deleteConfirmSensor'))) {
      try { await removeSensor(id, sensorId); toast.success(t('common.delete')); } 
      catch (err) { toast.error(t('common.error')); }
    }
  };

  const openActuatorModal = (actuator = null) => {
    setActiveMenuId(null);
    setActuatorModal({ isOpen: true, data: actuator });
    setActuatorForm(actuator ? { name: actuator.name, type: actuator.type } : { name: '', type: 'pump' });
  };

  const submitActuator = async (e) => {
    e.preventDefault();
    try {
      if (actuatorModal.data) await editActuator(id, actuatorModal.data.id, actuatorForm);
      else await addActuator(id, actuatorForm);
      setActuatorModal({ isOpen: false, data: null });
      toast.success(t('common.success'));
    } catch (error) { toast.error(t('common.error')); }
  };

  const handleDeleteActuator = async (actuatorId) => {
    if (window.confirm(t('details.deleteConfirmActuator'))) {
      try { await removeActuator(id, actuatorId); toast.success(t('common.delete')); } 
      catch (err) { toast.error(t('common.error')); }
    }
  };

  const loadHistory = async (item, type) => {
    setActiveMenuId(null);
    setHistoryModal({ isOpen: true, data: item, type, records: [], isLoading: true });
    
    try {
      let res;
      if (type === 'sensor') {
        res = await getSensorHistoryApi(id, item.id, 20);
      } else {
        res = await getActuatorHistoryApi(id, item.id, 20);
      }
      
      const historyData = Array.isArray(res) ? res : (res?.data || res?.history || res?.logs || []);
      setHistoryModal(prev => ({ ...prev, records: historyData, isLoading: false }));
    } catch (error) {
      toast.error(t('details.historyError'));
      setHistoryModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (!greenhouse && !isLoading) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 truncate" title={greenhouse?.name}>{greenhouse?.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {greenhouse?.location && <span className="flex items-center gap-1 truncate" title={greenhouse.location}><MapPin size={16} className="text-green-500 shrink-0" /> {greenhouse.location}</span>}
            <span className="flex items-center gap-1 shrink-0"><Activity size={16} className="text-blue-500" /> {t('details.active')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="xl:col-span-1 space-y-6">
          <section>
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="text-xl font-bold text-gray-900">{t('details.sensors')}</h2>
              <button onClick={() => openSensorModal()} className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 shrink-0">
                <Plus size={16} /> {t('common.add')}
              </button>
            </div>
            
            {sensors.length === 0 && !isLoading ? (
               <div className="bg-white rounded-3xl p-6 border border-dashed border-gray-200 text-center text-gray-500 text-sm">{t('details.noSensors')}</div>
            ) : (
              <div className="flex flex-col gap-3">
                {sensors.map(sensor => {
                  const style = getSensorStyle(sensor.type, sensor.name);
                  const Icon = style.icon;
                  const isMenuOpen = activeMenuId === `s-${sensor.id}`;
                  const locName = getLocalizedSensorName(sensor, t);

                  return (
                    <div key={sensor.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group hover:border-green-200 transition-colors relative ${isMenuOpen ? 'z-50' : 'z-10'}`}>
                      <div className="flex items-center gap-4 min-w-0 pr-4">
                        <div className={`w-12 h-12 rounded-xl ${style.bg} ${style.color} flex items-center justify-center shrink-0`}>
                          <Icon size={24} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate" title={locName}>{locName}</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-extrabold text-gray-900 truncate" title={sensor.value !== undefined ? sensor.value : '--'}>
                              {sensor.value !== undefined && sensor.value !== null ? sensor.value : '--'}
                            </p>
                            <span className="text-sm text-gray-500 font-semibold shrink-0">{sensor.unit || ''}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : `s-${sensor.id}`); }} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 relative z-20">
                          <MoreVertical size={20} />
                        </button>
                        {isMenuOpen && (
                          <div className="absolute right-4 top-12 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-[100] animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => loadHistory(sensor, 'sensor')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <History size={16} className="text-purple-500" /> {t('details.history')}
                            </button>
                            <button onClick={() => openSensorModal(sensor)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Edit2 size={16} className="text-blue-500" /> {t('common.edit')}
                            </button>
                            <button onClick={() => handleDeleteSensor(sensor.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">
                              <Trash2 size={16} /> {t('common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="xl:col-span-2 space-y-8 min-w-0">
          
          <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-visible">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center rounded-t-[2rem]">
              <div className="min-w-0 pr-4">
                <h2 className="text-lg font-bold text-gray-900 truncate" title={t('details.actuators')}>{t('details.actuators')}</h2>
                <p className="text-sm text-gray-500 truncate" title={t('details.actuatorsDesc')}>{t('details.actuatorsDesc')}</p>
              </div>
              <button onClick={() => openActuatorModal()} className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-green-600 hover:bg-green-50 transition-colors text-sm font-medium shrink-0">
                <Plus size={16} /> <span className="hidden sm:inline">{t('common.add')}</span>
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {actuators.length === 0 ? (
                <p className="p-4 text-center text-gray-500 text-sm col-span-2">{t('details.noActuators')}</p>
              ) : (
                actuators.map(actuator => {
                  const isMenuOpen = activeMenuId === `a-${actuator.id}`;

                  return (
                  <div key={actuator.id} className={`flex flex-col p-4 bg-gray-50/50 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-colors group relative ${isMenuOpen ? 'z-50' : 'z-10'}`}>
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0 ${actuator.state ? 'bg-green-100 text-green-600 shadow-inner' : 'bg-white border border-gray-200 text-gray-400'}`}>
                          <Power size={24} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-gray-800 block truncate" title={actuator.name}>{actuator.name}</span>
                          <span className="text-xs font-medium text-gray-500 truncate">{actuator.state ? t('details.on_lower') : t('details.off_lower')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <div>
                          <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : `a-${actuator.id}`); }} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                            <MoreVertical size={18} />
                          </button>
                          
                          {isMenuOpen && (
                            <div className="absolute right-16 top-10 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-[100] animate-in fade-in slide-in-from-top-2">
                              <button onClick={() => loadHistory(actuator, 'actuator')} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <History size={16} className="text-purple-500" /> {t('details.logHistory')}
                              </button>
                              <button onClick={() => openActuatorModal(actuator)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                <Edit2 size={16} className="text-blue-500" /> {t('common.edit')}
                              </button>
                              <button onClick={() => handleDeleteActuator(actuator.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1">
                                <Trash2 size={16} /> {t('common.delete')}
                              </button>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => handleActuatorToggle(actuator.id, actuator.state, actuator.value)}
                          className={`relative inline-flex h-8 w-14 ml-2 items-center rounded-full transition-colors duration-300 focus:outline-none ${actuator.state ? 'bg-green-500' : 'bg-gray-300 shadow-inner'}`}
                        >
                          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${actuator.state ? 'translate-x-7 shadow-sm' : 'translate-x-1 shadow-sm'}`} />
                        </button>
                      </div>
                    </div>
                    
                    {actuator.state && (
                      <ValueSlider 
                        actuatorId={actuator.id} 
                        initialState={actuator.state} 
                        initialValue={actuator.value} 
                        isManuallyToggled={!!manualToggles[actuator.id]}
                        onClearManualToggle={() => {
                          setManualToggles(prev => {
                            const newObj = { ...prev };
                            delete newObj[actuator.id];
                            return newObj;
                          });
                        }}
                        onValueSubmit={handleValueChange} 
                      />
                    )}
                  </div>
                )})
              )}
            </div>
          </section>

          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <LineChartIcon className="text-blue-500" size={20} />
                {t('details.chartsTitle', 'Графіки показників')}
              </h2>
              
              <div className="flex gap-2">
                <select 
                  value={activeChartSensor} 
                  onChange={(e) => setActiveChartSensor(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-3 py-2 outline-none font-medium cursor-pointer"
                >
                  <option value="" disabled>{t('details.selectSensor', 'Оберіть датчик')}</option>
                  {sensors.map(s => (
                    <option key={s.id} value={s.id}>{getLocalizedSensorName(s, t)}</option>
                  ))}
                </select>
                
                <select 
                  value={chartHours} 
                  onChange={(e) => setChartHours(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-3 py-2 outline-none font-medium cursor-pointer"
                >
                  <option value={24}>{t('details.last24h', 'Останні 24 год.')}</option>
                  <option value={168}>{t('details.last7d', 'Останні 7 днів')}</option>
                </select>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              {isChartLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                  {t('details.emptyHistory', 'Історія порожня')}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#64748b' }}
                      itemStyle={{ fontWeight: 'bold', color: '#22c55e' }}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#22c55e" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      name={t('details.value', 'Значення')}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      </div>

      {historyModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 truncate pr-4" title={`${t('details.history')}: ${historyModal.data?.name}`}>
                <Clock size={20} className="text-purple-500 shrink-0"/> 
                <span className="truncate">{t('details.history')}: {historyModal.type === 'sensor' ? getLocalizedSensorName(historyModal.data, t) : historyModal.data?.name}</span>
              </h2>
              <button onClick={() => setHistoryModal({ isOpen: false, data: null })} className="text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full shrink-0"><X size={20} /></button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 space-y-2">
              {historyModal.isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-500" size={32} /></div>
              ) : historyModal.records.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t('details.emptyHistory')}</p>
              ) : (
                historyModal.records.map((record, idx) => {
                  const val = record.value !== undefined ? record.value : record.reading;
                  let isStateOn = false;
                  let powerValue = undefined;

                  if (historyModal.type === 'actuator') {
                    if (typeof record.action === 'string' && record.action.startsWith('TURN_')) {
                      if (record.action === 'TURN_OFF') { isStateOn = false; } 
                      else if (record.action.startsWith('TURN_ON')) {
                        isStateOn = true;
                        const match = record.action.match(/\((\d+(?:\.\d+)?)%\)/);
                        powerValue = (match && match[1]) ? Math.round(Number(match[1])) : 100;
                      }
                    } else {
                      isStateOn = record.currentState === true || record.currentState === 'true' || record.state === true || record.state === 'true' || record.status === true || record.status === 'true' || record.action === 'ON';
                      powerValue = record.currentValue !== undefined && record.currentValue !== null ? Math.round(Number(record.currentValue)) : Math.round(Number(record.power));
                    }
                  }
                  
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm gap-4">
                      <div className="flex flex-col min-w-0">
                         <span className="text-gray-500 font-medium truncate">{formatDate(record.createdAt || record.timestamp || record.date)}</span>
                         {record.details && <span className="text-xs text-gray-400 mt-0.5 truncate" title={record.details}>{record.details}</span>}
                      </div>
                      {historyModal.type === 'sensor' ? (
                        <span className="font-bold text-gray-900 text-lg shrink-0">
                          {val !== undefined ? val : '--'} 
                          <span className="text-gray-400 text-xs font-semibold ml-1">{historyModal.data.unit}</span>
                        </span>
                      ) : (
                        <div className="text-right shrink-0">
                          <span className={`font-bold block ${isStateOn ? 'text-green-600' : 'text-gray-500'}`}>
                            {isStateOn ? t('details.on') : t('details.off')}
                          </span>
                          {isStateOn && powerValue !== undefined && (
                            <span className="text-xs text-gray-500 font-semibold block mt-0.5">{t('details.power')}: {powerValue}%</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {sensorModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold truncate pr-4">{sensorModal.data ? t('details.editSensor') : t('details.addSensor')}</h2>
              <button onClick={() => setSensorModal({ isOpen: false, data: null })} className="text-gray-400 bg-gray-50 p-2 rounded-full shrink-0"><X size={20} /></button>
            </div>
            <form onSubmit={submitSensor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{t('details.sensorName')}</label>
                <input type="text" required value={sensorForm.name} onChange={e => setSensorForm({...sensorForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('details.type')}</label>
                  <select value={sensorForm.type} onChange={e => setSensorForm({...sensorForm, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500">
                    <option value="temperature">{t('details.typeTemp')}</option>
                    <option value="humidity">{t('details.typeHum')}</option>
                    <option value="soil_humidity">{t('details.typeSoilHum')}</option>
                    <option value="light">{t('details.typeLight')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">{t('details.unit')}</label>
                  <input type="text" required value={sensorForm.unit} onChange={e => setSensorForm({...sensorForm, unit: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <button disabled={isActionLoading} type="submit" className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg mt-4">
                {sensorModal.data ? t('common.save') : t('common.add')}
              </button>
            </form>
          </div>
        </div>
      )}

      {actuatorModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold truncate pr-4">{actuatorModal.data ? t('details.editActuator') : t('details.addActuator')}</h2>
              <button onClick={() => setActuatorModal({ isOpen: false, data: null })} className="text-gray-400 bg-gray-50 p-2 rounded-full shrink-0"><X size={20} /></button>
            </div>
            <form onSubmit={submitActuator} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">{t('details.actuatorName')}</label>
                <input type="text" required value={actuatorForm.name} onChange={e => setActuatorForm({...actuatorForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">{t('details.actuatorType')}</label>
                <select value={actuatorForm.type} onChange={e => setActuatorForm({...actuatorForm, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500">
                  <option value="pump">{t('details.typePump')}</option>
                  <option value="light">{t('details.typePhytoLight')}</option>
                  <option value="fan">{t('details.typeFan')}</option>
                  <option value="heater">{t('details.typeHeater')}</option>
                </select>
              </div>
              <button disabled={isActionLoading} type="submit" className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl shadow-lg mt-4">
                {actuatorModal.data ? t('common.save') : t('common.add')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreenhouseDetails;