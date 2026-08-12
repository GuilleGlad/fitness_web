import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { faAdd, faHome, faPencil, faPlus, faVideo, faBars, faTimes, faBell } from '@fortawesome/free-solid-svg-icons';
import BodySilhouette from '../components/BodySilhouette';
import moment from 'moment';
import 'moment/locale/es';
import FloatingButton from '../components/FloatingButton';
import ExerciseCard from '../components/ExerciseCard';
import ProgressModal from '../components/ProgressModal';
import PaymentModal from '../components/PaymentModal';
import { yellow } from '@mui/material/colors';
import toast from 'react-hot-toast';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useNotifications } from '../context/NotificationsContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ROLE_MAP = {
  'admin': 1,
  'trainer': 2,
  'client': 3,
};

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

const Dashboard = () => {
  const navigate = useNavigate();
  // ✅ Estado para controlar el menú móvil
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState('Perfil de Usuario');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const [status, setStatus] = useState(localStorage.getItem('status'));
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const genre = localStorage.getItem('genre');
  const clientId = localStorage.getItem('client_id');
  const roleString = Object.entries(ROLE_MAP).find(([key, value]) => value === roleValue)?.[0]?.toUpperCase() || 'CLIENTE';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const [progreso, setProgreso] = useState([{ cadera: 100, cintura: 100, piernas: 60, brazos: 30 }]);
  const [profile, setProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [receiptPreviewImage, setReceiptPreviewImage] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [previewExercise, setPreviewExercise] = useState(null);
  const [notesModal, setNotesModal] = useState({ isOpen: false, workoutId: null, title: '', date: '', notes: '' });
  const [calendarView, setCalendarView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));
  const [progressTab, setProgressTab] = useState('silhouette');
  const [chartLimit, setChartLimit] = useState(10);
  const {
    notifications,
    showNotificationsModal,
    openNotificationsModal,
    closeNotificationsModal,
    markingReadId,
    markingAllRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

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

  // ========================
  // Resto del código sin cambios hasta renderSectionContent()
  // ========================

  const DAY_LETTER_BY_INDEX = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const getWorkoutDayLetters = (item) => {
    const raw = (item.day_of_week || item.days || item.day || item.week_day || item.dayOfWeek || '')
      .toString()
      .trim()
      .toUpperCase();

    if (!raw) return '';
    return raw.replace(/[^A-Z]/g, '');
  };

  const getSelectedDayLetter = (date) => {
    const index = date.isoWeekday() - 1;
    return DAY_LETTER_BY_INDEX[index] || '';
  };

  const weekStart = useMemo(() => selectedDate.clone().startOf('isoWeek'), [selectedDate]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => weekStart.clone().add(i, 'day')),
    [weekStart]
  );

  const monthStart = useMemo(() => selectedDate.clone().startOf('month'), [selectedDate]);
  const monthEnd = useMemo(() => selectedDate.clone().endOf('month'), [selectedDate]);
  const monthGrid = useMemo(() => {
    const start = monthStart.clone().startOf('isoWeek');
    const end = monthEnd.clone().endOf('isoWeek');
    const days = [];
    const current = start.clone();
    while (current.isSameOrBefore(end, 'day')) {
      days.push(current.clone());
      current.add(1, 'day');
    }
    return days;
  }, [monthStart, monthEnd]);

  const filteredWorkouts = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    const selectedLetter = getSelectedDayLetter(selectedDate);
    return workouts.filter((item) => {
      const letters = getWorkoutDayLetters(item);
      return letters.includes(selectedLetter);
    });
  }, [workouts, selectedDate]);

  moment.locale('es');
  const weekDayLabels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  const selectWeekDay = (day) => {
    setSelectedDate(day.clone().startOf('day'));
    setCalendarView('week');
  };

  const selectMonthDay = (day) => {
    setSelectedDate(day.clone().startOf('day'));
  };

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
  }, [progreso]);

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

  const [counts, setCounts] = useState({
    trainers: 0,
    clients: 0,
    recipes: 0,
    ads: 0,
    news: 0,
  });

  const initials = useMemo(() => {
    return userName
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userName]);

  useEffect(() => {
    var redirectPath = null;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };

    checkToken();

    const fetchCounts = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.get(`${apiUrl}/admin/counts`, config).then((response) => {
          if (response.status === 200) {
            setCounts(response.data.counts);
          }
        })
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    }

    const fetchCountsByTrainer = async () => {
      const trainer_id = clientId;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.get(`${apiUrl}/admin/counts-by-trainer/${trainer_id}`, config).then((response) => {
          if (response.status === 200) {
            setCounts(response.data.counts);
          }
        })
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    }

    if (roleString.toLowerCase() === 'client' && status === '0') {
      navigate('/wizard');
    }

    if (roleValue === 1 && redirectPath === null) {
      fetchCounts();
    }
    if (roleValue === 2) {
      fetchCountsByTrainer();
    }

    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        await axios.get(`${apiUrl}/progress/get-profile`, config).then((response) => {
          if (response.status === 200) {
            setProfile(response.data.profile[0]);
            console.log(response.data.profile[0]);
          }
        })
      } catch (error) {
        console.error('Error fetchin data: ', error);
      }
    }

    if (roleString.toLowerCase() === 'client') {
      fetchProfile();
    }

    const fetchProgress = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        await axios.get(`${apiUrl}/progress/get/${clientId}`, config).then((response) => {
          if (response.status === 200) {
            setProgreso(response.data.filas);
            // console.log(progreso);

          }
        })
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    }

    fetchProgress();

    const fetchWorkouts = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        await axios.get(`${apiUrl}/workouts/list/${clientId}`, config).then((response) => {
          if (response.status === 200) {
            console.log('Workouts:', response.data.filas);
            setWorkouts(response.data.filas);
          }
        })
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    }

    if (roleString.toLowerCase() === 'client') {
      fetchWorkouts();
    }

    const fetchPayments = async ({ client_id, status = '', payment_method = '', start_date = '', end_date = '', trainer_id } = {}) => {
      setLoadingPayments(true);
      try {
        if (roleValue === 3 && clientId) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              client_id: clientId,
              status,
              payment_method,
              start_date,
              end_date,
              trainer_id
            },
          };
          const response = await axios.get(`${apiUrl}/payments/client/${clientId}`, config);
          if (response.status === 200) {
            const data = response.data.payments || response.data.filas || response.data.data || response.data || [];
            const items = Array.isArray(data) ? data : (Array.isArray(response.data) ? response.data : [data]);
            setPayments(items);
          }
        }
        if (roleValue === 2) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              client_id,
              status,
              payment_method,
              start_date,
              end_date,
              trainer_id
            },
          };
          const response = await axios.get(`${apiUrl}/payments/?trainer_id=${clientId}`, config);
          if (response.status === 200) {
            // console.log(response);
            const data = response.data.payments || response.data.filas || response.data.data || response.data || [];
            const items = Array.isArray(data) ? data : (Array.isArray(response.data) ? response.data : [data]);
            setPayments(items);
          }
        }

      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoadingPayments(false);
      }
    }

    fetchPayments();

  }, [navigate, apiUrl, roleValue, status, showPaymentModal]);

  const handleLogout = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre'];
    keysToClear.forEach(key => {
      localStorage.removeItem(key);
    });
    navigate('/login');
  };

  const handleExercisePreview = async (id) => {
    if (!id) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${apiUrl}/exercises/get/${id}`, config);
      const exerciseData = response.data?.exercises?.[0];
      setPreviewExercise(exerciseData || null);
    } catch (error) {
      console.error('Error fetching exercise preview:', error);
      setPreviewExercise(null);
    }
  };

  const handleWorkoutNotes = async (workout_id, client_id, log_date, title = '', note) => {
    if (!workout_id || !client_id || !log_date) return;

    setNotesModal({
      isOpen: true,
      workoutId: workout_id,
      title: title || 'Rutina',
      date: log_date,
      notes: note || '',
    });
  };

  const closeNotesModal = () => {
    setNotesModal({ isOpen: false, workoutId: null, title: '', date: '', notes: '' });
  };

  const formatTimestamp = (dateString) => {
    const m = moment(dateString);
    if (!m.isValid()) return dateString;
    const now = moment();
    if (m.hour() === 0 && m.minute() === 0 && m.second() === 0) {
      return m.set({
        hour: now.hour(),
        minute: now.minute(),
        second: now.second(),
      }).format('YYYY-MM-DD HH:mm:ss');
    }
    return m.format('YYYY-MM-DD HH:mm:ss');
  };

  const renderStatusBadge = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (!s) return <span className="ml-2 inline-block rounded-full bg-slate-700 text-white px-3 py-1 text-xs font-semibold">—</span>;
    if (s.includes('pend')) return <span className="ml-2 inline-block rounded-full bg-orange-400 text-black px-3 py-1 text-xs font-semibold">{status}</span>;
    if (s.includes('aprob') || s.includes('aprobed') || s.includes('complete') || s.includes('paid') || s.includes('complet')) return <span className="ml-2 inline-block rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold">{status}</span>;
    if (s.includes('rech') || s.includes('reject')) return <span className="ml-2 inline-block rounded-full bg-red-600 text-white px-3 py-1 text-xs font-semibold">{status}</span>;
    return <span className="ml-2 inline-block rounded-full bg-slate-700 text-white px-3 py-1 text-xs font-semibold">{status}</span>;
  };

  const saveNotes = async () => {
    if (!notesModal.workoutId) return;
    try {
      const formattedDate = formatTimestamp(notesModal.date);
      const data = {
        client_id: clientId,
        daily_workouts_id: notesModal.workoutId,
        note: notesModal.notes,
        log_date: formattedDate,
      };
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(`${apiUrl}/workouts/add-note`, data, config);
      const savedNote = response.data?.note || notesModal.notes;

      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((workout) =>
          workout.id === notesModal.workoutId
            ? { ...workout, note: savedNote, trainer_notes: savedNote }
            : workout
        )
      );
      toast.success('Nota guardada correctamente', { autoClose: 2000 });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Error, no se pudo guardar la nota', { autoClose: 2000 });
    }
    closeNotesModal();
  };

  const renderSectionContent = () => {
    if (roleValue === 1) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            {[
              { label: 'Entrenadores activos', value: counts.trainers },
              { label: 'Usuarios registrados', value: counts.clients },
              { label: 'Recetas publicadas', value: counts.recipes },
              { label: 'Anuncios activos', value: counts.ads },
            ].map((card) => (
              <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
                <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-1">
            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Actividad reciente</h2>
              <div className="space-y-3 text-slate-300">
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="font-semibold text-white">Nuevo entrenador aprobado</p>
                  <p className="text-sm">María López se unió como trainer hace 2 horas.</p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="font-semibold text-white">Cliente nuevo en plan premium</p>
                  <p className="text-sm">Sergio creó una suscripción de 12 semanas.</p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="font-semibold text-white">Receta destacada</p>
                  <p className="text-sm">Nueva receta de batidos cargada por trainer Ana.</p>
                </div>
              </div>
            </section>
          </div>
        </>
      );
    }

    if (roleValue === 2) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            {[
              { label: 'Clientes activos', value: counts.clients },
              { label: 'Ejercicios Publicados', value: counts.exercises },
              { label: 'Recetas disponibles', value: counts.recipes },
              { label: 'Pagos pendientes', value: payments.filter(r => r.status === "Pendiente").length },
            ].map((card) => (
              <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
                <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Resumen semanal</h2>
              <ul className="space-y-3 text-slate-300">
                <li className="rounded-2xl bg-slate-900/70 p-4">
                  <strong>Clientes con rutina nueva:</strong> 8
                </li>
                <li className="rounded-2xl bg-slate-900/70 p-4">
                  <strong>Sesiones programadas:</strong> 12 esta semana
                </li>
                <li className="rounded-2xl bg-slate-900/70 p-4">
                  <strong>Pagos recibidos:</strong> 5 / 8 completados
                </li>
              </ul>
            </section>

            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Clientes destacados</h2>
              <div className="space-y-3 text-slate-300">
                {[
                  { name: 'Camila R.', status: '4 entrenos/sem' },
                  { name: 'Diego M.', status: 'En crecimiento muscular' },
                  { name: 'Valeria G.', status: 'Preparación para maratón' },
                ].map((client) => (
                  <div key={client.name} className="rounded-2xl bg-slate-900/70 p-4">
                    <p className="text-white font-semibold">{client.name}</p>
                    <p className="text-sm">{client.status}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 mb-6">
          {[
            { label: 'Rutinas activas', value: workouts.length },
            { label: 'Entrenador', value: profile?.trainer_name || 'No asignado' },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
              <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{card.value}&nbsp;{card.label === 'Entrenador' && profile?.trainer_phone ? <Link to={`https://wa.me/${profile?.trainer_phone}`} target='_blank' className="text-sm text-green-400 mt-1"><FontAwesomeIcon icon={faWhatsapp} size='2x'></FontAwesomeIcon></Link> : null}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2 mb-6">
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
                  <div className="space-y-4">
                    <BodySilhouette genre={genre} cadera={Number(progreso[0]?.hips || progreso[0]?.cadera)} cintura={Number(progreso[0]?.waist || progreso[0]?.cintura)} piernas={Number(progreso[0]?.legs || progreso[0]?.piernas)} brazos={Number(progreso[0]?.arms || progreso[0]?.brazos)} />
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

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
            <h2 className="items-center text-xl font-semibold text-white mb-4">Datos Iniciales</h2>
            <div className=" grid grid-cols-3 text-slate-300 mb-4">
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
              <h2 className="text-left text-xl font-semibold text-white mb-4 mt-1">Datos Biometricos</h2>
              <div className="justify-end flex-grow flex">
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="text-nowrap flex items-center gap-2 bg-yellow-400 text-gray-800 lg:px-4 lg:py-2 px-2 py-1 hover:bg-yellow-200 transition duration-200 rounded-full uppercase lg:text-md text-xs justify-center font-bold"
                >
                  Agregar Datos <FontAwesomeIcon icon={faAdd} />
                </button>
              </div>
            </div>
            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
              {progreso.map((item, index) => (
                <div
                  key={item.id}
                  className={`rounded-xl p-3 border ${index === 0
                    ? 'bg-yellow-400 text-black border-black'
                    : 'bg-slate-800 border-yellow-400 text-white'
                    }`}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
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

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
            <h2 className="text-xl font-semibold text-white mb-4">Rutinas</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCalendarView('week')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${calendarView === 'week' ? 'bg-[#f1b80c] text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                  >
                    Semana
                  </button>
                  <button
                    onClick={() => setCalendarView('month')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${calendarView === 'month' ? 'bg-[#f1b80c] text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                  >
                    Mes
                  </button>
                </div>
                <p className="text-sm text-slate-400">Selecciona un día para ver las rutinas asignadas.</p>
              </div>

              {calendarView === 'week' ? (
                <div className="grid grid-cols-7 gap-2 rounded-2xl bg-slate-900/80 p-2">
                  {weekDays.map((day) => {
                    const isSelected = day.isSame(selectedDate, 'day');
                    return (
                      <button
                        key={day.format('YYYY-MM-DD')}
                        type="button"
                        onClick={() => selectWeekDay(day)}
                        className={`rounded-2xl border p-2 text-center transition ${isSelected ? 'border-[#f1b80c] bg-[#f1b80c] text-slate-950 shadow-lg' : 'border-slate-800 bg-[#111827] text-slate-300 hover:border-slate-500 hover:bg-slate-800'}`}
                      >
                        <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{weekDayLabels[day.isoWeekday() - 1]}</div>
                        <div className="mt-1 text-base font-semibold">{day.format('D')}</div>
                        <div className="mt-1 text-[10px] text-slate-500">{day.format('ddd')}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-900/80 p-3">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-400">{selectedDate.format('MMMM YYYY')}</p>
                      <h3 className="text-lg font-semibold text-white">Calendario mensual</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDate((prev) => prev.clone().subtract(1, 'month'))}
                        className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDate((prev) => prev.clone().add(1, 'month'))}
                        className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((label) => (
                      <div key={label}>{label}</div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {monthGrid.map((day) => {
                      const isCurrentMonth = day.month() === monthStart.month();
                      const isSelected = day.isSame(selectedDate, 'day');
                      return (
                        <button
                          key={day.format('YYYY-MM-DD')}
                          type="button"
                          onClick={() => selectMonthDay(day)}
                          className={`rounded-2xl border p-2 text-left transition ${isSelected ? 'border-[#f1b80c] bg-[#f1b80c] text-slate-950 shadow-lg' : isCurrentMonth ? 'border-slate-800 bg-[#111827] text-slate-200 hover:border-slate-500 hover:bg-slate-800' : 'border-transparent bg-slate-950/40 text-slate-600'}`}
                        >
                          <div className="text-sm font-semibold">{day.format('D')}</div>
                          {day.isSame(moment(), 'day') && <div className="mt-1 text-[10px] uppercase text-slate-400">Hoy</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-3xl bg-slate-900/70 p-4 text-slate-300">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Rutinas para el día</p>
                    <h3 className="text-lg font-semibold text-white">{selectedDate.format('dddd, D [de] MMMM')}</h3>
                  </div>
                </div>
                {filteredWorkouts.length === 0 ? (
                  <p className="text-sm text-slate-400">No hay rutinas asignadas para este día.</p>
                ) : (
                  <div className="grid gap-3">
                    {filteredWorkouts.map((item) => (
                      <div key={item.id || `${item.workout_id}-${item.day_of_week}-${item.title || item.name || item.workout_name}`}
                        className="rounded-[32px] border border-[#f1b80c] bg-gradient-to-br from-slate-950 via-slate-900 to-[#111827] p-4 shadow-[0_16px_48px_rgba(241,184,12,0.18)] "
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-1 workout-title">
                            <h4 className="text-lg font-bold text-white">{item.title || item.name || item.workout_name || `Rutina ${item.workout_id || item.id}`}</h4>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#f1b80c]">Sets: {item.sets || '—'} Reps: {item.reps_text} {item.client_effort_notes}</p>
                            {item.note && <span className='font-bold text-white'>Notas: <span className='font-normal text-slate-200'>{item.note}</span></span>}
                          </div>
                          <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-right text-sm font-semibold text-slate-300 flex">
                            <button className="rounded-2xl border p-2 text-left bg-yellow-400 border-black hover:bg-yellow-200" title='Video' onClick={() => handleExercisePreview(item.exercise_id)}><FontAwesomeIcon icon={faVideo} className="text-black"></FontAwesomeIcon></button>
                            <button className="rounded-2xl border p-2 text-left bg-yellow-400 border-black hover:bg-yellow-200" title='Nota' onClick={() => handleWorkoutNotes(item.id, clientId, selectedDate.clone().set({ hour: moment().hour(), minute: moment().minute(), second: moment().second() }).format('YYYY-MM-DD HH:mm:ss'), item.title || item.name || item.workout_name, item.note)}><FontAwesomeIcon icon={faPencil} className='text-black'></FontAwesomeIcon></button>
                          </div>
                        </div>
                        {item.description && <p className="mt-4 text-sm leading-6 text-slate-300">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
            <h2 className="text-xl font-semibold text-white mb-4">Pagos</h2>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className='bg-yellow-400 hover:bg-yellow-200 text-black rounded-2xl p-2 font-semibold'
                >
                  Registrar Comprobante <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                </button>
                <span className="ml-2 text-sm text-slate-400">Sube tu comprobante de pago para que tu entrenador pueda revisarlo.</span>
              </div>
              <div>
                {loadingPayments ? (
                  <p className="text-sm text-slate-400">Cargando pagos...</p>
                ) : payments.length === 0 ? (
                  <p className="text-sm text-slate-400">No se han enviado comprobantes todavía.</p>
                ) : (
                  <div className="max-h-[450px] overflow-y-auto space-y-3 pr-1">
                    {payments.map((p, idx) => {
                      const isFirst = idx === 0;
                      const dateText = (p.payment_date || p.paymentDate) ? moment(p.payment_date || p.paymentDate).format('DD/MM/YYYY') : '—';
                      const amount = Number(p.amount || p.total || 0).toFixed(2);
                      const method = p.payment_method || p.paymentMethod || '—';
                      const period = p.period_covered || p.period_cover || p.periodCovered || '—';
                      const statusText = p.status || '—';
                      const receiptUrl = p.receipt_image_url || p.receipt_image || p.receiptImageUrl || '';
                      const clientLabel = (p.client_name || p.name) ? `${p.client_name || p.name}` : (p.client_email || p.email || '—');
                      return (
                        <div
                          key={p.id || `${p.client_id || p.clientId}-${idx}`}
                          className='rounded-xl p-3 border bg-slate-800 border-yellow-400 text-white'
                        >
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <p><span className="font-semibold">Fecha:</span> {dateText}</p>
                            <p className="text-right"><span className="font-semibold">Monto:</span> ${amount}</p>
                            <p><span className="font-semibold">Método:</span> {method}</p>
                            <p className="text-right"><span className="font-semibold">Periodo:</span> {period}</p>
                          </div>

                          <div className="flex gap-2 mt-3 items-center justify-between">
                            <div className="flex items-center gap-3">
                              {receiptUrl ? (
                                <img
                                  src={receiptUrl}
                                  alt="comprobante"
                                  className="h-14 w-20 object-cover rounded-md cursor-pointer hover:opacity-80"
                                  onClick={() => setReceiptPreviewImage(receiptUrl)}
                                />
                              ) : (
                                <div className="h-14 w-20 rounded-md bg-slate-900/50 flex items-center justify-center text-slate-500">—</div>
                              )}

                              <div className="text-slate-300 text-sm">
                                <p className="font-semibold text-white">{clientLabel}</p>
                                {(p.client_email || p.email) && <p className="text-xs text-gray-400">{p.client_email || p.email}</p>}
                              </div>
                            </div>

                            <div className="text-right text-xs">
                              <p className="col-span-2"><span className="font-semibold"></span>{renderStatusBadge(statusText)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {receiptPreviewImage && (
                <div
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setReceiptPreviewImage(null)}
                >
                  <img src={receiptPreviewImage} className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl" />
                </div>
              )}
            </div>
          </section>
        </div>
      </>
    );
  };

  // ✅ Función para manejar la navegación + cierre del menú móvil
  const handleMenuNavigation = (item) => {
    if (item.indexOf('Clientes') !== -1 || item.indexOf("Usuarios") !== -1) {
      navigate('/clients'); setMenuOpen(false); return;
    }
    if (item.indexOf('Entrenadores') !== -1) {
      navigate('/trainers'); setMenuOpen(false); return;
    }
    if (item.indexOf('Ejercicios') !== -1 || item.indexOf('Ejercicios por Entrenador') !== -1) {
      navigate('/trainer-exercises'); setMenuOpen(false); return;
    }
    if (item.indexOf('Fotos/Videos') !== -1) {
      navigate('/trainer-library'); setMenuOpen(false); return;
    }
    if (item.indexOf('Recetas') !== -1 || item.indexOf('Recetas por Entrenador') !== -1) {
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
    if (item.indexOf('Rutinas') !== -1) {
      navigate('/routines'); setMenuOpen(false); return;
    }
    if (item.indexOf('Progreso') !== -1) {
      navigate('/progress'); setMenuOpen(false); return;
    }
    setSelectedMenu(item);
    setMenuOpen(false); // cerrar al seleccionar en móvil
  };

  const handleLogoutWithClose = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre'];
    keysToClear.forEach(key => localStorage.removeItem(key));
    setMenuOpen(false);
    navigate('/login');
  };

  // ✅ Componente reutilizable del panel de navegación (se usa tanto en móvil como escritorio)
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
              className={`w-full rounded-3xl px-4 py-3 text-left text-md font-semibold transition-all ${selectedMenu === item ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
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

            {/* Contenido existente del main */}
            <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Panel</p>
                <h2 className="mt-3 text-3xl font-bold text-white">{selectedMenu}</h2>
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

            <div className="rounded-[40px] border border-slate-800 bg-[#141820] shadow-2xl">
              {renderSectionContent()}
            </div>
          </main>
        </div>

        {/* ====== VISTA MÓVIL — overlay del menú (solo < lg) ====== */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
            onClick={closeMenu}
          >
            {/* Panel deslizable desde la izquierda */}
            <aside
              className="relative h-full w-[300px] max-w-[85vw] overflow-y-auto bg-[#141820] shadow-2xl transition-transform duration-300 ease-out"
              onClick={(e) => e.stopPropagation()} // no cerrar al tocar el panel
            >
              {/* Botón cerrar (X) */}
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

      {/* Exercise preview */}
      {previewExercise && (
        <ExerciseCard
          title={previewExercise.title || previewExercise.name || 'Ejercicio'}
          description={previewExercise.description || previewExercise.details || ''}
          photo_url={previewExercise.photo_url || previewExercise.photoUrl || previewExercise.image_url || previewExercise.imageUrl}
          video_url={previewExercise.video_url || previewExercise.videoUrl}
          index={0}
          total={1}
          onClose={() => setPreviewExercise(null)}
          Navigation={false}
        />
      )}

      {/* Workout notes modal */}
      {notesModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-slate-700 bg-[#141820] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">Notas de Rutina</p>
              </div>
              <button
                onClick={closeNotesModal}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Ejercicio</p>
                  <p className="mt-2 text-2x1 font-semibold text-white">{notesModal.title}</p>
                </div>
                <div className="rounded-3xl bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Fecha</p>
                  <p className="mt-2 text-2x1 font-semibold text-white">{moment(notesModal.date).format("DD-MM-YYYY")}</p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-950/70 p-4">
                <label className="text-2x1 font-semibold text-slate-200" htmlFor="workout-notes">Notas</label>
                <textarea
                  id="workout-notes"
                  value={notesModal.notes}
                  onChange={(e) => setNotesModal((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Escribe tus notas aquí..."
                  className="mt-3 min-h-[180px] w-full resize-y rounded-3xl border border-slate-700 bg-[#111827] p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-[#f1b80c] focus:outline-none focus:ring-2 focus:ring-[#f1b80c]/20"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeNotesModal}
                  className="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveNotes}
                  className="rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeNotificationsModal}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-[32px] border border-slate-700 bg-[#141820] p-6 shadow-2xl shadow-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">Notificaciones</p>
                <h2 className="mt-2 text-xl font-semibold text-white">{notifications.length} sin leer</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    disabled={markingAllRead}
                    className="whitespace-nowrap rounded-full border border-[#f1b80c] px-3 py-2 text-xs font-bold uppercase text-[#f1b80c] transition hover:bg-[#f1b80c] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingAllRead ? 'Marcando...' : 'Marcar todas como leídas'}
                  </button>
                )}
                <button
                  onClick={closeNotificationsModal}
                  aria-label="Cerrar notificaciones"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="rounded-3xl bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                  No tienes notificaciones pendientes.
                </p>
              ) : (
                notifications.map((n) => {
                  const isRead = String(n.status) === '1' || String(n.status).toLowerCase() === 'read' || String(n.status).toLowerCase() === 'leído';
                  const content = (
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{n.message}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            De: <span className="text-slate-300">{n.source_id}</span>
                          </p>
                        </div>
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(n.id)}
                            disabled={markingReadId === n.id}
                            className="whitespace-nowrap rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-bold uppercase text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {markingReadId === n.id ? 'Marcando...' : 'Marcar como leída'}
                          </button>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                        <span className={`rounded-full px-3 py-1 font-semibold ${isRead ? 'bg-green-600 text-white' : 'bg-orange-400 text-black'}`}>
                          {isRead ? 'Leída' : 'Pendiente'}
                        </span>
                        <span>Creada: {moment(n.created_at).format('DD-MM-YYYY HH:mm')}</span>
                        {n.updated_at && <span>Actualizada: {moment(n.updated_at).format('DD-MM-YYYY HH:mm')}</span>}
                      </div>
                    </>
                  );

                  return n.navigate_to ? (
                    <Link
                      key={n.id}
                      to={n.navigate_to}
                      onClick={closeNotificationsModal}
                      className="block rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-[#f1b80c]"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={n.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        clientId={clientId}
        trainerId={profile?.trainer_id}
      />
    </>
  );
};

export default Dashboard;
