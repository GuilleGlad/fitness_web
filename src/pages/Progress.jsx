import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faHome, faBars, faTimes, faBell } from '@fortawesome/free-solid-svg-icons';
import BodySilhouette from '../components/BodySilhouette';
import moment from 'moment';
import 'moment/locale/es';
import ProgressModal from '../components/ProgressModal';
import { useNotifications } from '../context/NotificationsContext';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';

const ROLE_MENUS = {
  1: [
    'Perfil de Usuario',
    '👤 Usuarios',
    '💪 Entrenadores',
    '🏋️ Ejercicios',
    '🍎 Recetas',
    '📰 Noticias',
    '⚙️ Ajustes',
  ],
  2: [
    'Perfil de Usuario',
    'Clientes',
    'Ejercicios',
    'Fotos/Videos',
    'Recetas',
    'Pagos',
    'Ajustes',
  ],
  3: [
    'Perfil de Usuario',
    'Rutinas',
    'Progreso',
    'Pagos',
  ],
};

const Progress = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const clientId = localStorage.getItem('client_id');
  const genre = localStorage.getItem('genre');
  const {
    notifications,
    openNotificationsModal,
  } = useNotifications();
  const roleString = roleValue === 1 ? 'ADMIN' : roleValue === 2 ? 'TRAINER' : 'CLIENT';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState({});
  const [progreso, setProgreso] = useState([{ cadera: 100, cintura: 100, piernas: 60, brazos: 30 }]);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [progressTab, setProgressTab] = useState('silhouette');
  const [chartLimit, setChartLimit] = useState(10);

  // Estados para foto de perfil
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [selectedProfilePhoto, setSelectedProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [fullSizeProfileImage, setFullSizeProfileImage] = useState(null);
  moment.locale('es');

  const initials = useMemo(() => {
    return userName
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userName]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const checkToken = async () => {
      const redirectPath = await verifyToken();
      if (redirectPath) navigate(redirectPath);
    };
    checkToken();

    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${apiUrl}/progress/get-profile`, config);
        if (response.status === 200) {
          setProfile(response.data.profile[0]);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchProfile();

    const fetchProgress = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${apiUrl}/progress/get/${clientId}`, config);
        if (response.status === 200) {
          setProgreso(response.data.filas);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    fetchProgress();
  }, [navigate, apiUrl, clientId, token]);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedProfilePhoto(e.target.files[0]);
    }
  };

  const handleSaveOrReplacePhoto = async () => {
    if (!selectedProfilePhoto) {
      toast.error('Por favor, selecciona una imagen primero.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('picture', selectedProfilePhoto);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = await axios.post(`${apiUrl}/admin/users/update-picture`, formData, config);

      const newPictureUrl = res.data?.picture || res.data?.picture_url;
      if (newPictureUrl) {
        setProfile((prev) => ({ ...prev, picture: newPictureUrl }));
        localStorage.setItem('picture', newPictureUrl);
      }

      toast.success('Fotografía actualizada con éxito');
      setShowProfilePhotoModal(false);
      setSelectedProfilePhoto(null);
    } catch (error) {
      console.error('Error al subir la fotografía:', error);
      toast.error('Ocurrió un error al guardar la foto de perfil');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`${apiUrl}/admin/users/delete-picture`, config);

      setProfile((prev) => ({ ...prev, picture: null }));
      localStorage.removeItem('picture');

      toast.success('Fotografía eliminada');
      setShowProfilePhotoModal(false);
      setSelectedProfilePhoto(null);
    } catch (error) {
      console.error('Error al eliminar la fotografía:', error);
      toast.error('Ocurrió un error al eliminar la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const chartData = useMemo(() => {
    const sorted = [...progreso].sort((a, b) => {
      const ma = moment(a?.log_date);
      const mb = moment(b?.log_date);
      if (ma.isValid() && mb.isValid()) return ma.valueOf() - mb.valueOf();
      return 0;
    });

    const limitedData = chartLimit > 0 ? sorted.slice(-chartLimit) : sorted;

    const labels = limitedData.map((item, index) =>
      moment(item?.log_date).isValid()
        ? moment(item.log_date).format('DD-MM-YY')
        : `Registro ${index + 1}`
    );

    const getNumeric = (item, keys) => {
      const value = keys.reduce(
        (acc, key) => acc ?? item[key] ?? item[key?.toLowerCase()] ?? acc,
        undefined
      );
      return Number(value || 0);
    };

    return {
      labels,
      datasets: [
        {
          label: 'Cintura (cm)',
          data: limitedData.map((item) => getNumeric(item, ['cintura', 'waist'])),
          borderColor: '#f1b80c',
          backgroundColor: 'rgba(241, 184, 12, 0.15)',
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 1,
          fill: true,
        },
        {
          label: 'Cadera (cm)',
          data: limitedData.map((item) => getNumeric(item, ['cadera', 'hips'])),
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 1,
          fill: true,
        },
        {
          label: 'Piernas (cm)',
          data: limitedData.map((item) => getNumeric(item, ['piernas', 'legs'])),
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 1,
          fill: true,
        },
        {
          label: 'Brazos (cm)',
          data: limitedData.map((item) => getNumeric(item, ['brazos', 'arms'])),
          borderColor: '#f472b6',
          backgroundColor: 'rgba(244, 114, 182, 0.15)',
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 1,
          fill: true,
        },
        {
          label: 'Peso (Kg)',
          data: limitedData.map((item) => getNumeric(item, ['peso', 'weight'])),
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.15)',
          tension: 0.35,
          pointRadius: 2,
          borderWidth: 1,
          fill: true,
        },
      ],
    };
  }, [progreso, chartLimit]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { boxWidth: 10, boxHeight: 10, color: '#e2e8f0', font: { size: 12 } },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
      },
    },
    scales: {
      x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148,163,184,0.15)' } },
      y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148,163,184,0.15)' } },
    },
  }), []);

  const getValidMetricValue = (item, ...keys) => {
    for (const key of keys) {
      const rawValue = item?.[key] ?? item?.[key.toLowerCase()] ?? item?.[key.toUpperCase()];

      if (rawValue === null || rawValue === undefined || rawValue === '') {
        continue;
      }

      const parsed = Number(rawValue);
      if (!Number.isNaN(parsed)) return parsed;
      if (rawValue !== 'null' && rawValue !== 'undefined') return rawValue;
    }
    return null;
  };

  const formatMetricValue = (value, suffix = '') => {
    if (value === null || value === undefined || value === '') return null;
    const normalized = Number(value);
    if (!Number.isNaN(normalized)) {
      return `${normalized % 1 === 0 ? normalized.toFixed(0) : normalized.toFixed(1)}${suffix}`;
    }
    return `${value}${suffix}`;
  };

  const handleMenuNavigation = (item) => {
    if (item.indexOf('Clientes') !== -1 || item.indexOf('Usuarios') !== -1) {
      navigate('/clients'); setMenuOpen(false); return;
    }
    if (item.indexOf('Entrenadores') !== -1) {
      navigate('/trainers'); setMenuOpen(false); return;
    }
    if (item.indexOf('Ejercicios') !== -1) {
      navigate('/trainer-exercises'); setMenuOpen(false); return;
    }
    if (item.indexOf('Fotos/Videos') !== -1) {
      navigate('/trainer-library'); setMenuOpen(false); return;
    }
    if (item.indexOf('Recetas') !== -1) {
      navigate('/trainer-recipes'); setMenuOpen(false); return;
    }
    if (item.indexOf('Ajustes') !== -1) {
      navigate('/settings'); setMenuOpen(false); return;
    }
    if (item.indexOf('Noticias') !== -1) {
      navigate('/news-manager'); setMenuOpen(false); return;
    }
    if (item.indexOf('Perfil de Usuario') !== -1) {
      navigate('/dashboard'); setMenuOpen(false); return;
    }
    if (item.indexOf('Rutinas') !== -1) {
      navigate('/routines'); setMenuOpen(false); return;
    }
    if (item.indexOf('Progreso') !== -1) {
      setMenuOpen(false); return;
    }
    if (item.indexOf('Pagos') !== -1) {
      if (roleValue === 3) {
        navigate('/payments'); setMenuOpen(false); return;
      }
      navigate('/trainer-payments'); setMenuOpen(false); return;
    }
    setMenuOpen(false);
  };

  const handleLogoutWithClose = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre', 'picture'];
    keysToClear.forEach(key => localStorage.removeItem(key));
    setMenuOpen(false);
    navigate('/login');
  };

  const SidebarPanel = () => (
    <div className="flex h-full flex-col justify-between p-6">
      <div className='sticky top-10'>
        {(profile?.picture && profile.picture !== '/images/avatar.png') || localStorage.getItem('picture') ? (
          <img
            src={profile?.picture || localStorage.getItem('picture')}
            alt={userName}
            onClick={() => setShowProfilePhotoModal(true)}
            className="h-16 w-16 cursor-pointer rounded-3xl object-cover ring-2 ring-[#f1b80c] transition hover:opacity-80"
          />
        ) : (
          <div
            onClick={() => setShowProfilePhotoModal(true)}
            className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-3xl bg-gradient-to-br from-[#f1b80c] to-[#d97706] text-xl font-bold text-slate-950 shadow-xl shadow-[#f1b80c]/20 transition hover:opacity-80"
            title="Haz click para agregar foto"
          >
            {initials}
          </div>
        )}
        <div className="mt-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Bienvenido</p>
          <h1 className="mt-3 text-2xl font-bold text-white">{userName}</h1>
          <p className="mt-1 text-sm text-slate-400">{roleString}</p>
        </div>

        <div className="mt-8 space-y-2">
          {menuLinks.map((item) => (
            <button
              key={item}
              onClick={() => handleMenuNavigation(item)}
              className={`w-full rounded-3xl px-4 py-3 text-left text-md font-semibold transition-all ${item === 'Progreso' ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3 sticky bottom-0">
        <button
          onClick={handleLogoutWithClose}
          className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
        <button
          onClick={() => { setMenuOpen(false); navigate('/'); }}
          className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <FontAwesomeIcon icon={faHome} className='mr-2'></FontAwesomeIcon><span>Página de Inicio</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
          <aside className="hidden w-full border-b border-slate-800 bg-[#141820] lg:block lg:w-[320px] lg:min-h-screen lg:border-r lg:border-b-0 lg:sticky lg:top-0">
            {SidebarPanel()}
          </aside>

          <main className="flex-1 bg-[#0d1117] p-6 lg:p-8">
            <div className="mb-4 lg:hidden top-4 sticky text-right">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#141820] text-white shadow-lg transition hover:bg-slate-800 active:scale-95"
              >
                <FontAwesomeIcon icon={faBars} className="text-lg" />
              </button>
            </div>

            <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Panel</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Mi Progreso</h2>
              </div>

              {(roleValue === 2 || roleValue === 3) && (
                <button
                  type="button"
                  onClick={openNotificationsModal}
                  className={`inline-flex items-baseline gap-4 rounded-3xl bg-[#141820] border border-slate-600 p-4 shadow-lg transition hover:bg-slate-800 ${notifications.length > 0 ? "shadow-yellow-400 animate-pulse hover:border-yellow-400" : "animate-none shadow-none"}`}
                >
                  <div className="rounded-2xl bg-slate-900/80 text-[#f1b80c]">
                    <FontAwesomeIcon icon={faBell} className='text-lg rounded-[50%]'></FontAwesomeIcon>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{notifications.length}</p>
                  </div>
                </button>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-2 mb-6">
              <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
                <div className="flex items-start justify-between mb-5 lg:flex-row flex-col">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Progreso corporal</h2>
                  </div>
                </div>
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setProgressTab('silhouette')}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${progressTab === 'silhouette' ? 'bg-[#f1b80c] text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                    >
                      Silueta
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgressTab('chart')}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${progressTab === 'chart' ? 'bg-[#f1b80c] text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                    >
                      Gráfico
                    </button>
                  </div>

                  <div>
                    {progressTab === 'silhouette' ? (
                      <div className="space-y-4">
                        <BodySilhouette
                          genre={genre}
                          cadera={Number(progreso[0]?.hips || progreso[0]?.cadera)}
                          cintura={Number(progreso[0]?.waist || progreso[0]?.cintura)}
                          piernas={Number(progreso[0]?.legs || progreso[0]?.piernas)}
                          brazos={Number(progreso[0]?.arms || progreso[0]?.brazos)}
                        />
                      </div>
                    ) : (
                      <div className="w-full chart-div mt-10">
                        <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-4">
                          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Evolución biométrica</p>
                              <h3 className="text-lg font-semibold text-white">Peso y medidas</h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <label htmlFor="chart-limit" className="text-xs uppercase tracking-[0.25em] text-slate-400">Últimos</label>
                              <select
                                id="chart-limit"
                                value={chartLimit}
                                onChange={(e) => setChartLimit(Number(e.target.value))}
                                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-[#f1b80c]"
                              >
                                {[5, 10, 15, 20, 30, 0].map((limit) => (
                                  <option key={limit} value={limit}>
                                    {limit === 0 ? 'Todos' : limit}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="h-[320px] w-full">
                            <Line
                              data={chartData}
                              options={chartOptions}
                              height={320}
                              style={{ width: '100%', display: 'block' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
                <h2 className="items-center text-xl font-semibold text-white mb-4">Datos Iniciales</h2>
                <div className="grid grid-cols-3 text-slate-300 mb-4">
                  {[
                    { label: "Edad", value: profile?.age },
                    { label: "Altura", value: profile?.height },
                    { label: "Peso", value: profile?.initial_weight },
                    { label: "Objetivo", value: profile?.goal?.replace('_', ' ').toUpperCase() },
                    { label: "Días a Entrenar", value: profile?.training_days },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center text-xs flex ${item.label === "Objetivo" ? 'col-span-2' : 'col-span-1'}`}
                    >
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex">
                  <h2 className="text-left text-xl font-semibold text-white mb-4 mt-1">Datos Biométricos</h2>
                  <div className="justify-end flex-grow flex">
                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="text-nowrap flex items-center gap-2 bg-yellow-400 text-gray-800 lg:px-4 lg:py-2 px-2 py-1 hover:bg-yellow-200 transition duration-200 rounded-full uppercase lg:text-md text-xs justify-center font-bold"
                    >
                      Agregar Datos <FontAwesomeIcon icon={faAdd} />
                    </button>
                  </div>
                </div>
                <div className="max-h-[395px] overflow-y-auto space-y-3 pr-1">
                  {progreso.map((item, index) => {
                    const metricEntries = [
                      { label: 'Peso', value: getValidMetricValue(item, 'peso', 'weight'), suffix: ' kg' },
                      { label: 'Cintura', value: getValidMetricValue(item, 'cintura', 'waist'), suffix: ' cm' },
                      { label: 'Cadera', value: getValidMetricValue(item, 'cadera', 'hips'), suffix: ' cm' },
                      { label: 'Brazos', value: getValidMetricValue(item, 'brazos', 'arms'), suffix: ' cm' },
                      { label: 'Piernas', value: getValidMetricValue(item, 'piernas', 'legs'), suffix: ' cm' },
                      { label: 'Masa corporal', value: getValidMetricValue(item, 'masa_corporal'), suffix: ' kg' },
                      { label: 'Grasa corporal', value: getValidMetricValue(item, 'grasa_corporal'), suffix: '%' },
                      { label: 'Masa muscular', value: getValidMetricValue(item, 'masa_muscular'), suffix: ' kg' },
                      { label: 'Metab. basal', value: getValidMetricValue(item, 'metabolismo_basal'), suffix: ' kcal' },
                      { label: 'Edad corporal', value: getValidMetricValue(item, 'edad_corporal'), suffix: ' años' },
                      { label: 'Grasa visceral', value: getValidMetricValue(item, 'grasa_visceral'), suffix: '%' },
                    ];

                    return (
                      <div
                        key={item.id || index}
                        className={`rounded-xl p-3 border ${index === 0
                          ? 'bg-yellow-200 text-black border-black'
                          : 'bg-slate-800 border-yellow-400 text-white'
                          }`}
                      >
                        <div className="grid grid-cols-2 gap-2 text-[16px] sm:grid-cols-3">
                          {metricEntries.map((metric) => {
                            const displayValue = formatMetricValue(metric.value, metric.suffix) ?? '—';

                            return (
                              <div
                                key={metric.label}
                                className={`rounded-lg border px-2 py-1.5 shadow-sm ${index === 0
                                  ? 'border-black/20 bg-[#1e222b]/10'
                                  : 'border-slate-700 bg-slate-900/70'
                                  }`}
                              >
                                <p className={`text-[12px] uppercase tracking-[0.12em] ${index === 0 ? 'text-black/75' : 'text-slate-400'}`}>
                                  {metric.label}
                                </p>
                                <p className={`mt-1 font-bold ${index === 0 ? 'text-slate-950' : 'text-white'}`}>
                                  {displayValue}
                                </p>
                              </div>
                            );
                          })}
                          <div className={`flex w-full flex-col gap-2 rounded-lg border px-2 py-2 shadow-sm ${index === 0
                                  ? 'border-black/20 bg-[#1e222b]/10'
                                  : 'border-slate-700 bg-slate-900/70'
                                  }`}>
                            <p className={`text-[12px] uppercase tracking-[0.12em] ${index === 0 ? 'text-black/75' : 'text-slate-400'}`}>
                              Fotos
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              {item.photo_front_url && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(item.photo_front_url)}
                                  className="group relative h-16 w-16 overflow-hidden rounded-md border border-slate-600 bg-slate-950/50 p-0 transition hover:scale-[1.02] hover:border-[#f1b80c]"
                                  aria-label="Ver foto frontal"
                                >
                                  <img
                                    src={item.photo_front_url}
                                    className="h-full w-full object-cover cursor-pointer"
                                    alt="Frontal"
                                  />
                                </button>
                              )}
                              {item.photo_back_url && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(item.photo_back_url)}
                                  className="group relative h-16 w-16 overflow-hidden rounded-md border border-slate-600 bg-slate-950/50 p-0 transition hover:scale-[1.02] hover:border-[#f1b80c]"
                                  aria-label="Ver foto trasera"
                                >
                                  <img
                                    src={item.photo_back_url}
                                    className="h-full w-full object-cover cursor-pointer"
                                    alt="Posterior"
                                  />
                                </button>
                              )}
                              {!item.photo_front_url && !item.photo_back_url && (
                                <span className={`text-[10px] ${index === 0 ? 'text-black/70' : 'text-slate-500'}`}>
                                  Sin fotos
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className={`mt-3 text-[11px] font-semibold ${index === 0 ? 'text-black/80' : 'text-slate-300'}`}>
                          <span>Fecha:</span> {moment(item.log_date).format('DD-MM-YYYY')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {previewImage && (
                  <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setPreviewImage(null)}
                  >
                    <img
                      src={previewImage}
                      alt="Previsualización"
                      className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
                    />
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>

        {menuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
            onClick={closeMenu}
          >
            <aside
              className="relative h-full w-[300px] max-w-[85vw] overflow-y-auto bg-[#141820] shadow-2xl transition-transform duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={closeMenu}
                  aria-label="Cerrar menú"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 shadow transition hover:bg-slate-700 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {SidebarPanel()}
            </aside>
          </div>
        )}
      </div>

      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        clientId={clientId}
        age={profile?.age}
        height={profile?.height}
        initialWeight={profile?.initial_weight}
        goal={profile?.goal}
        trainingDays={profile?.training_days}
        trainerId={profile?.trainer_id}
      />

      {/* Modal Foto de Perfil */}
      {showProfilePhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-slate-700 bg-[#141820] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Gestionar Foto de Perfil</h3>
              <button
                onClick={() => {
                  setShowProfilePhotoModal(false);
                  setSelectedProfilePhoto(null);
                }}
                className="rounded-full bg-slate-800 p-2 text-slate-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="my-6 flex flex-col items-center gap-4">
              {selectedProfilePhoto ? (
                <img
                  src={URL.createObjectURL(selectedProfilePhoto)}
                  alt="Vista previa"
                  onClick={() => setFullSizeProfileImage(URL.createObjectURL(selectedProfilePhoto))}
                  className="h-28 w-28 cursor-pointer rounded-full object-cover ring-4 ring-[#f1b80c] transition hover:opacity-80"
                  title="Haz clic para ver en tamaño completo"
                />
              ) : profile?.picture || localStorage.getItem('picture') ? (
                <img
                  src={profile?.picture || localStorage.getItem('picture')}
                  alt={userName}
                  onClick={() => setFullSizeProfileImage(profile?.picture || localStorage.getItem('picture'))}
                  className="h-28 w-28 cursor-pointer rounded-full object-cover ring-4 ring-slate-700 transition hover:opacity-80"
                  title="Haz clic para ver en tamaño completo"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-[#f1b80c]">
                  {initials}
                </div>
              )}

              <label className="cursor-pointer rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">
                {profile?.picture || localStorage.getItem('picture') ? 'Seleccionar nueva foto' : 'Elegir imagen'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled={uploadingPhoto || !selectedProfilePhoto}
                onClick={handleSaveOrReplacePhoto}
                className="w-full rounded-2xl bg-[#f1b80c] py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:opacity-50"
              >
                {uploadingPhoto
                  ? 'Guardando...'
                  : profile?.picture || localStorage.getItem('picture')
                    ? 'Reemplazar Fotografía'
                    : 'Guardar Fotografía'}
              </button>

              {(profile?.picture || localStorage.getItem('picture')) && (
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={handleDeletePhoto}
                  className="w-full rounded-2xl bg-red-600/20 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-600/30 disabled:opacity-50"
                >
                  Eliminar Fotografía
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowProfilePhotoModal(false);
                  setSelectedProfilePhoto(null);
                }}
                className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver la foto de perfil en tamaño completo */}
      {fullSizeProfileImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setFullSizeProfileImage(null)}
        >
          <img
            src={fullSizeProfileImage}
            alt="Foto de perfil tamaño completo"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default Progress;