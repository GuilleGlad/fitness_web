import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { faAdd, faHome, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import BodySilhouette from '../components/BodySilhouette';
import moment from 'moment';
import 'moment/locale/es';
import ProgressModal from '../components/ProgressModal';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

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
    'Pagos'
  ],
};

const Progress = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const genre = localStorage.getItem('genre');
  const clientId = localStorage.getItem('client_id');
  const notifications = 4;
  const roleString = roleValue === 1 ? 'ADMIN' : roleValue === 2 ? 'TRAINER' : 'CLIENT';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const [progreso, setProgreso] = useState([{ cadera: 100, cintura: 100, piernas: 60, brazos: 30 }]);
  const [profile, setProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [progressTab, setProgressTab] = useState('silhouette');
  const [chartLimit, setChartLimit] = useState(10);
  const [showProgressModal, setShowProgressModal] = useState(false);

  moment.locale('es');

  const initials = useMemo(() => {
    return userName
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userName]);

  // ✅ Cerrar menú al presionar Escape en móvil
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // ✅ Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const chartData = useMemo(() => {
    const sorted = [...progreso].sort((a, b) => {
      const ma = moment(a?.log_date);
      const mb = moment(b?.log_date);
      const aValid = ma.isValid();
      const bValid = mb.isValid();
      if (aValid && bValid) return ma.valueOf() - mb.valueOf();
      if (aValid) return -1;
      if (bValid) return 1;
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
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: '#e2e8f0',
          font: { size: 12 },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
      },
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148,163,184,0.15)' },
      },
      y: {
        ticks: { color: '#cbd5e1' },
        grid: { color: 'rgba(148,163,184,0.15)' },
      },
    },
  }), []);

  useEffect(() => {
    var redirectPath = null;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };
    checkToken();

    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
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
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        const response = await axios.get(`${apiUrl}/progress/get/${clientId}`, config);
        if (response.status === 200) {
          setProgreso(response.data.filas);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchProgress();
  }, [navigate, apiUrl, clientId, token, showProgressModal]);

  // ✅ Navegación del menú lateral (misma lógica que en Dashboard/Routines)
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
    if (item.indexOf('Pagos') !== -1) {
      if (roleValue === 3) {
        navigate('/payments'); setMenuOpen(false); return;
      }
      navigate('/trainer-payments'); setMenuOpen(false); return;
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
      // Ya estamos en la página de Progreso
      setMenuOpen(false); return;
    }
    setMenuOpen(false);
  };

  const handleLogoutWithClose = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre'];
    keysToClear.forEach(key => localStorage.removeItem(key));
    setMenuOpen(false);
    navigate('/login');
  };

  // ✅ Componente reutilizable del panel de navegación (idéntico al de Dashboard/Routines)
  const SidebarPanel = () => (
    <div className="flex h-full flex-col justify-between p-6">
      <div>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#f1b80c] to-[#d97706] text-xl font-bold text-slate-950 shadow-xl shadow-[#f1b80c]/20">
          {initials}
        </div>
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

          {/* ====== VISTA ESCRITORIO (≥ lg) — sidebar siempre visible ====== */}
          <aside className="hidden w-full border-b border-slate-800 bg-[#141820] lg:block lg:w-[320px] lg:min-h-screen lg:border-r lg:border-b-0 lg:sticky lg:top-0">
            {SidebarPanel()}
          </aside>

          {/* ====== CONTENIDO PRINCIPAL ====== */}
          <main className="flex-1 bg-[#0d1117] p-6 lg:p-8">

            {/* ✅ Botón hamburguesa — solo visible en móvil */}
            <div className="mb-4 lg:hidden  top-4 sticky text-right">
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
                <h2 className="mt-3 text-3xl font-bold text-white">Progreso</h2>
              </div>

              <div className="inline-flex items-center gap-4 rounded-3xl bg-[#141820] border border-slate-800 p-4 shadow-xl">
                <div className="rounded-2xl bg-slate-900/80 p-3 text-[#f1b80c]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 2a7 7 0 0 0-7 7v2.585l-.707.707A1 1 0 0 0 4 14h16a1 1 0 0 0 .707-1.707L19 11.585V9a7 7 0 0 0-7-7zm0 20a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Notificaciones</p>
                  <p className="text-2xl font-bold text-white">{notifications}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[40px] border border-slate-800 bg-[#141820] shadow-2xl p-6 lg:p-8">
              <div className="flex flex-col gap-4 ">

                {/* ===== Progreso corporal ===== */}
                <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
                  <div className="flex items-start justify-between mb-5 lg:flex-row flex-col">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Progreso corporal</h2>
                      <p className="text-sm text-slate-400">Última actualización hace 3 días</p>
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
                        <div className='flex flex-col sm:flex-row gap-4'>
                          <div className="space-y-4 w-full sm:w-1/2">
                            <BodySilhouette genre={genre} cadera={Number(progreso[0]?.hips || progreso[0]?.cadera)} cintura={Number(progreso[0]?.waist || progreso[0]?.cintura)} piernas={Number(progreso[0]?.legs || progreso[0]?.piernas)} brazos={Number(progreso[0]?.arms || progreso[0]?.brazos)} />
                          </div>
                          <div className="w-full sm:w-1/2">
                            <h2 className="items-center text-xl font-semibold text-white mb-4">Datos Iniciales</h2>
                            {[
                              { label: "Edad", value: profile?.age },
                              { label: "Altura", value: profile?.height+ " cm" },
                              { label: "Peso", value: profile?.initial_weight + " kg" },
                              { label: "Objetivo", value: profile?.goal?.replace('_', ' ').toUpperCase() },
                              { label: "Días a Entrenar", value: profile?.training_days },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className={`rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center grid grid-cols-2`}
                              >
                                <span className="text-slate-400">{item.label}</span>
                                <span className="font-semibold text-center">{item.value}</span>
                              </div>
                            ))}
                            <h2 className="items-center text-xl font-semibold text-white mt-4">Medidas Recientes</h2>
                            <div className='rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center grid grid-cols-2'>
                              <span className="text-slate-400" >Cintura:</span><span className="font-semibold text-center"> {progreso[0]?.hips} cm</span>
                            </div>
                            <div className='rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center grid grid-cols-2'>
                              <span className="text-slate-400" >Cadera:</span> <span className="font-semibold text-center">{progreso[0]?.waist} cm</span>
                              </div>
                              <div className='rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center grid grid-cols-2'>
                              <span className="text-slate-400" >Brazos:</span> <span className="font-semibold text-center">{progreso[0]?.arms} cm</span>
                              </div>
                              <div className='rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center grid grid-cols-2'>
                              <span className="text-slate-400" >Piernas:</span> <span className="font-semibold text-center">{progreso[0]?.legs} cm</span>
                              </div>
                              <div className='rounded-lg p-2 bg-slate-900/60 border border-slate-800 text-white justify-between items-center grid grid-cols-2'>
                              <span className="text-slate-400" >Fecha:</span> <span className="font-semibold text-center">{moment(progreso[0]?.log_date).format('DD-MM-YYYY')}</span>
                              </div>
                            </div>
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

                {/* ===== Datos Iniciales ===== */}
                <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
                  <div className="flex flex-wrap gap-3 items-center">
                    <h2 className="text-left text-xl font-semibold text-white mb-4 mt-1">Datos Biometricos</h2>
                    <div className="justify-end flex-grow flex">
                      <button
                        onClick={() => setShowProgressModal(true)}
                        className="text-nowrap text-center flex items-center gap-2 bg-yellow-400 text-gray-800 lg:px-4 lg:py-2 px-2 py-1 hover:bg-yellow-200 transition duration-200 rounded-full uppercase lg:text-md text-xs justify-center font-bold"
                      >
                        Agregar Datos <FontAwesomeIcon icon={faAdd} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1">
                    {progreso.map((item, index) => (
                      <div
                        key={item.id}
                        className={`rounded-xl p-3 border ${index === 0
                          ? 'bg-yellow-400 text-black border-black'
                          : 'bg-slate-800 border-yellow-400 text-white'
                          }`}
                      >
                        <div className="grid grid-cols-2 gap-2 text-md">
                          <p><span className="font-semibold">Cintura:</span> {item.hips}</p>
                          <p><span className="font-semibold">Cadera:</span> {item.waist}</p>
                          <p><span className="font-semibold">Brazos:</span> {item.arms}</p>
                          <p><span className="font-semibold">Piernas:</span> {item.legs}</p>
                          <p className="col-span-2">
                            <span className="font-semibold">Fecha:</span> {moment(item.log_date).format('DD-MM-YYYY')}
                          </p>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <img
                            src={item.photo_front_url}
                            className="h-10 rounded-md cursor-pointer hover:opacity-80 transition"
                            onClick={() => setPreviewImage(item.photo_front_url)}
                          />

                          <img
                            src={item.photo_back_url}
                            className="h-10 rounded-md cursor-pointer hover:opacity-80 transition"
                            onClick={() => setPreviewImage(item.photo_back_url)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {previewImage && (
                    <div
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                      onClick={() => setPreviewImage(null)}
                    >
                      <img
                        src={previewImage}
                        className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
                      />
                    </div>
                  )}
                </section>

              </div>
            </div>
          </main>
        </div>

        {/* ====== VISTA MÓVIL — overlay del menú (solo < lg) ====== */}
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

      {/* Progress Modal */}
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
    </>
  );
};

export default Progress;
