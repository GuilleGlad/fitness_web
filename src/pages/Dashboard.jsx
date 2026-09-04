import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { getClientStatusLabel } from '../utils/clientUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { faAdd, faHome, faPencil, faPlus, faVideo, faBars, faTimes, faBell, faDumbbell, faCalendarDays, faCommentDots } from '@fortawesome/free-solid-svg-icons';
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
import { Helmet } from 'react-helmet-async';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const ROLE_MAP = {
  'admin': 1,
  'trainer': 2,
  'client': 3,
};

const ROLE_MENUS = {
  1: [
    '💻 Dashboard',
    '👤 Usuarios',
    '💪 Entrenadores',
    '🏋️ Ejercicios',
    '🍎 Recetas',
    '📰 Noticias',
    '⚙️ Ajustes',
  ],
  2: [
    'Dashboard',
    'Clientes',
    'Ejercicios',
    'Fotos/Videos',
    'Recetas',
    'Pagos',
  ],
  3: [
    'Dashboard',
    'Rutinas',
    'Progreso',
    'Pagos'
  ],
};

const Dashboard = () => {
  const navigate = useNavigate();
  // ✅ Estado para controlar el menú móvil
  const [menuOpen, setMenuOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
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
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [payDayMessage, setPayDayMessage] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
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
  var redirectPath = null;
  useEffect(() => {
    const timer = setTimeout(() => {
      const checkToken = async () => {
        const redirectPath = await verifyToken();

        if (redirectPath) {
          navigate(redirectPath);
        }
      };

      checkToken();
    }, 500); // 1.5 segundos de delay

    if (roleString.toLowerCase() === 'client' && status === '0') {
      navigate('/wizard');
    }

    return () => clearTimeout(timer);


  }, [progreso]);


  useEffect(() => {
    if (profile?.payment_day) {
      const fetch_payday_validation = async () => {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        const p = await axios.get(`${apiUrl}/payments/client/${clientId}/check-payment-day`, config);
        const d = p.data;
        setPayDayMessage(d.message);
        if (d.days_remaining <= 5) {
          toast.success(d.message);
        }
      }

      fetch_payday_validation();
    }
  }, [profile])

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

  const DAY_LETTER_BY_INDEX = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const DAY_FULL_NAME_BY_LETTER = {
    L: 'Lunes',
    M: 'Martes',
    X: 'Miércoles',
    J: 'Jueves',
    V: 'Viernes',
    S: 'Sábado',
    D: 'Domingo',
  };

  const dayColorMap = {
    L: 'bg-blue-500/25 text-blue-300 ring-1 ring-inset ring-blue-500/50',
    M: 'bg-violet-500/25 text-violet-300 ring-1 ring-inset ring-violet-500/50',
    X: 'bg-fuchsia-500/25 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/50',
    J: 'bg-orange-500/25 text-orange-300 ring-1 ring-inset ring-orange-500/50',
    V: 'bg-cyan-500/25 text-cyan-300 ring-1 ring-inset ring-cyan-500/50',
    S: 'bg-red-500/25 text-red-300 ring-1 ring-inset ring-red-500/50',
    D: 'bg-lime-500/25 text-lime-300 ring-1 ring-inset ring-lime-500/50',
  };

  const dayButtonMap = {
    L: 'border-blue-500/50 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20',
    M: 'border-violet-500/50 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20',
    X: 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-200 hover:bg-fuchsia-500/20',
    J: 'border-orange-500/50 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20',
    V: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20',
    S: 'border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20',
    D: 'border-lime-500/50 bg-lime-500/10 text-lime-200 hover:bg-lime-500/20',
  };

  const selectedDayButtonMap = {
    L: 'border-blue-300 bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    M: 'border-violet-300 bg-violet-500 text-white shadow-lg shadow-violet-500/20',
    X: 'border-fuchsia-300 bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20',
    J: 'border-orange-300 bg-orange-500 text-white shadow-lg shadow-orange-500/20',
    V: 'border-cyan-300 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
    S: 'border-red-300 bg-red-500 text-white shadow-lg shadow-red-500/20',
    D: 'border-lime-300 bg-lime-500 text-slate-950 shadow-lg shadow-lime-500/20',
  };

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

  const getPaymentCycleDate = (paymentDay, year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(paymentDay, daysInMonth));
  };

  const hasApprovedPayment = useMemo(() => {
    const paymentDay = Number(profile?.payment_day);
    if (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > 31) {
      return false;
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentCycleDate = getPaymentCycleDate(paymentDay, startOfDay.getFullYear(), startOfDay.getMonth());
    const nextCycleDate = getPaymentCycleDate(paymentDay, startOfDay.getFullYear(), startOfDay.getMonth() + 1);
    const previousCycleDate = getPaymentCycleDate(paymentDay, startOfDay.getFullYear(), startOfDay.getMonth() - 1);
    const cycleStart = startOfDay >= currentCycleDate ? currentCycleDate : previousCycleDate;
    const cycleEnd = startOfDay >= currentCycleDate ? nextCycleDate : currentCycleDate;

    return payments.some((p) => {
      if (p.status !== 'Aprobado') return false;
      const paymentDate = new Date(p.payment_date);
      return paymentDate >= cycleStart && paymentDate < cycleEnd;
    });
  }, [payments, profile?.payment_day]);

  const PaymentGateMessage = () => (
    <section className="rounded-3xl border border-dashed border-slate-700 bg-[#141820] p-6 shadow-xl w-full flex flex-col items-center justify-center text-center gap-2 min-h-[180px]">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f1b80c]">Sección bloqueada</p>
      <p className="max-w-sm text-sm text-slate-400">
        Esta sección se habilita cuando tu entrenador aprueba el pago de tu mensualidad correspondiente al período actual.
      </p>
      <button
        hidden
        type="button"
        onClick={() => setShowPaymentModal(true)}
        className="mt-2 rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
      >
        Registrar comprobante
      </button>
    </section>
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

    const fetchClients = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = await axios.get(`${apiUrl}/admin/clients`, config);
        const list = res.data?.clientes || res.data || [];
        setClients(
          list.map((item) => ({
            ...item,
            id: item.user_id ?? item.id,
            name: item.name,
            email: item.email,
            password: item.password || '',
            genre: item.genre || '',
            phone: item.phone || '',
            picture: item.picture || '/images/avatar.png',
            role: item.role || '',
          }))
        );
      } catch (err) {
        console.error(err);
        console.error('No se pudieron cargar los usuarios para el dashboard');
      }
    };

    if (roleValue === 1 && redirectPath === null) {
      fetchCounts();
      fetchClients();
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

    const checkPayment = async (r) => {
      const id = r.id;
      const status = r.status;
      if (status == "Expirado")
        return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.get(`${apiUrl}/payments/${id}/check-expiration`, config).then((response) => {
          console.log(response);
          if (response.data?.status_modification == true) {
            const status_str = "Expirado";
            setPayments(prevPayments =>
              prevPayments.map(payment =>
                payment.id === id ? { ...payment, status: status_str } : payment
              )
            );
          }
        })
      } catch (error) {
        console.log("Error: " + error.message);
      }

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
            const data = response.data.payments || response.data.filas || response.data.data || response.data || [];
            const items = Array.isArray(data) ? data : (Array.isArray(response.data) ? response.data : [data]);
            setPayments(items);
            items.map((p) => {
              if (p.status == "Pendiente") {
                checkPayment(p)
              }
            })
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

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoadingTrainers(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return setLoadingTrainers(false);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/admin/trainers`, config);
        setTrainers(res.data?.entrenadores || []);
      } catch (err) {
        console.error('Error fetching trainers:', err);
      } finally {
        setLoadingTrainers(false);
      }
    };

    if (roleValue === 1) {
      fetchTrainers();
    }

    const fetchExercises = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no disponible. Inicia sesión.');
        return;
      }
      try {
        setLoadingExercises(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/exercises/list`, config);
        const list = res.data?.exercises || res.data || [];

        setExercises(
          list.map((item) => ({
            id: item.id,
            trainerId: item.trainer_id,
            title: item.title,
            description: item.description,
            photoUrl: item.photo_url,
            videoUrl: item.video_url,
            publico: Number(item.publico),
            username: item.username,
          }))
        );
      } catch (err) {
        console.error(err);
        // toast.error('No se pudieron cargar los ejercicios.');
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();

  }, [roleValue, apiUrl]);

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

            {/* Dashboard Admin Section - Users Table */}
            <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
              <div className="flex items-center justify-between px-6 py-5">
                <Link to="/clients" className="items-center text-xl font-semibold text-white mb-4 hover:text-customYellow">Usuarios</Link>
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      {/* <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">ID</th> */}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Foto</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Cuenta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id}>
                        {/* <td className="px-6 py-3">{client.id}</td> */}
                        <td className="px-6 py-3">
                          <img src={client.picture || '/images/avatar.png'} alt={client.name} className="h-8 w-8 rounded-full object-cover" />
                        </td>
                        <td className="px-6 py-3">{client.name}</td>
                        <td className="px-6 py-3">{client.email}</td>
                        <td className="px-6 py-3">{client.phone || '—'}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${client.role === 'admin' ? 'bg-red-600 text-white' : client.role === 'trainer' ? 'bg-blue-500 text-white' : 'bg-green-600 text-white'}`}>
                            {client.role || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${client.deleted === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {getClientStatusLabel(client)}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {client.deleted === 0 ? 'Activa' : 'Inactiva'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Dashboard Admin Section - Trainers Table */}
            <div className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
              <div className="flex items-center justify-between px-6 py-5">
                <Link to="/trainer-exercises" className="items-center text-xl font-semibold text-white mb-4 hover:text-customYellow">Entrenadores</Link>
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60">
                      <th className="px-6 py-4 font-medium text-slate-400">Nombre</th>
                      <th className="px-6 py-4 font-medium text-slate-400">Email</th>
                      <th className="px-6 py-4 font-medium text-slate-400">Género</th>
                      <th className="px-6 py-4 font-medium text-slate-400">Teléfono</th>
                      <th className="px-6 py-4 font-medium text-slate-400">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {loadingTrainers ? (
                      <tr><td colSpan="6" className="py-12 text-center text-slate-400">Cargando entrenadores…</td></tr>
                    ) : trainers.length === 0 ? (
                      <tr><td colSpan="6" className="py-12 text-center text-slate-400">No hay entrenadores aún.</td></tr>
                    ) : trainers.map((trainer) => (
                      <tr key={trainer.id} className={`group transition ${trainer.deleted ? 'bg-red-950/30' : 'hover:bg-slate-800/40'}`}>
                        <td className="px-6 py-4"><img src={trainer.picture || '/images/avatar.png'} alt={trainer.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700" /></td>
                        <td className="px-6 py-4 font-medium text-white">{trainer.name}</td>
                        <td className="px-6 py-4 text-slate-300">{trainer.email}</td>
                        <td className="px-6 py-4 text-slate-300">{trainer.genre ? (trainer.genre === 'm' ? 'Masc.' : trainer.genre === 'f' ? 'Fem.' : 'N/D') : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${trainer.status === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                            {trainer.deleted ? 'Inactivo' : 'Activo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* End Trainers Table */}
          </div>
          {/* Desktop Workouts Table */}
          <div className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
            <div className="flex items-center justify-between px-6 py-5">
              <Link to="/trainer-exercises" className="items-center text-xl font-semibold text-white mb-4 hover:text-customYellow">Ejercicios</Link>
            </div>
            <div className="hidden max-h-[400px] overflow-y-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60">
                    <th className="px-6 py-4 font-medium text-slate-400">Foto</th>
                    <th className="px-6 py-4 font-medium text-slate-400">Título</th>
                    <th className="px-6 py-4 font-medium text-slate-400">Descripción</th>
                    <th className="px-6 py-4 font-medium text-slate-400">Video</th>
                    <th className="px-6 py-4 font-medium text-slate-400">Público</th>
                    <th className="px-6 py-4 font-medium text-slate-400">Entrenador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loadingExercises ? (
                    <tr><td colSpan="6" className="py-12 text-center text-slate-400">Cargando ejercicios…</td></tr>
                  ) : exercises.length === 0 ? (
                    <tr><td colSpan="6" className="py-12 text-center text-slate-400">No hay ejercicios aún.</td></tr>
                  ) : exercises.map((exercise) => (
                    <tr key={exercise.id} className="group transition hover:bg-slate-800/40">
                      <td className="px-6 py-4">
                        {exercise.photoUrl ? (
                          <img src={exercise.photoUrl} alt={exercise.title} className="h-10 w-10 rounded-lg object-cover ring-2 ring-slate-700" />
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{exercise.title}</td>
                      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{exercise.description}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {exercise.videoUrl ? (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">Video</span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>
                      <td>
                        {exercise.publico === 1 && <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-green-400">Página Principal</span>}
                        {exercise.publico === 0 && <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-yellow-400">Para Clientes</span>}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{exercise.username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    if (roleValue === 2) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
            {[
              { label: 'Clientes activos', value: counts.clients },
              { label: 'Ejercicios Publicados', value: counts.exercises },
              { label: 'Recetas disponibles', value: counts.recipes },
              { label: 'Pagos pendientes', value: payments.filter(r => r.status === "Pendiente").length },
              { label: 'Pagos Vencidos', value: payments.filter(r => r.status === "Expirado").length },
            ].map((card, index) => (
              <div key={card.label} className={`rounded-3xl ${index % 2 == 0 ? "bg-slate-800" : "bg-slate-600"} border border-slate-800 p-5 shadow-xl`}>
                <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Información</h2>
              <ul className="space-y-3 text-slate-300">

              </ul>
            </section>

            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Clientes Nuevos de el Mes</h2>
              <div className="space-y-3 text-slate-300">

              </div>
            </section>
          </div>
        </>
      );
    }


    if (roleString.toLowerCase() === 'client' && status !== '0') {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-6">
            {[
              { label: 'Rutinas activas', value: workouts.length, extra: '' },
              { label: 'Entrenador', value: profile?.trainer_name || 'No asignado', extra: '' },
              { label: 'Día de pago mensual', value: profile?.payment_day ? `Día ${profile.payment_day}` : 'No definido', extra: payDayMessage ? payDayMessage : '' },
            ].map((card) => (
              <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
                <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}&nbsp;{card.label === 'Entrenador' && profile?.trainer_phone ? <Link to={`https://wa.me/${profile?.trainer_phone}`} target='_blank' className="text-sm text-green-400 mt-1"><FontAwesomeIcon icon={faWhatsapp} size='2x'></FontAwesomeIcon></Link> : null}</p>
                {card.extra !== '' && <p className='mt-4 text-[0.6em] text-slate-200 uppercase tracking-[0.25em]'>{payDayMessage}</p>}
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2 mb-6">
            {hasApprovedPayment ? (
              <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
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
            ) : (
              <PaymentGateMessage />
            )}
            {hasApprovedPayment ? (
              <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
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
                <div className="max-h-[395px] overflow-y-auto space-y-3 pr-1">
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
            ) : (
              <PaymentGateMessage />
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {hasApprovedPayment ? (
              <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
                <h2 className="text-lg font-semibold text-white mb-3 sm:text-xl sm:mb-4">Workout Diario</h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setCalendarView('week')}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${calendarView === 'week' ? 'bg-[#f1b80c] text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                      >
                        Semana
                      </button>
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${calendarView === 'month' ? 'bg-[#f1b80c] text-slate-950' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                      >
                        Mes
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 sm:text-sm">Selecciona un día para ver las rutinas asignadas y escribe tus observaciones en el icono <FontAwesomeIcon icon={faPencil}></FontAwesomeIcon>.</p>
                  </div>

                  {calendarView === 'week' ? (
                    <div className="grid grid-cols-7 gap-1 rounded-2xl bg-slate-900/80 p-1.5 sm:gap-2 sm:p-2">
                      {weekDays.map((day) => {
                        const isSelected = day.isSame(selectedDate, 'day');
                        const dayLetter = getSelectedDayLetter(day);
                        return (
                          <button
                            key={day.format('YYYY-MM-DD')}
                            type="button"
                            onClick={() => selectWeekDay(day)}
                            className={`rounded-xl border p-1 text-center transition sm:rounded-2xl sm:p-2 ${isSelected ? selectedDayButtonMap[dayLetter] : dayButtonMap[dayLetter]}`}
                          >
                            <div className={`text-[10px] uppercase tracking-[0.25em] ${isSelected ? 'text-white/80' : 'text-current/70'}`}>{weekDayLabels[day.isoWeekday() - 1]}</div>
                            <div className="mt-1 text-base font-semibold">{day.format('D')}</div>
                            <div className={`mt-1 text-[10px] ${isSelected ? 'text-white/80' : 'text-current/70'}`}>{day.format('ddd')}</div>
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
                          const dayLetter = getSelectedDayLetter(day);
                          return (
                            <button
                              key={day.format('YYYY-MM-DD')}
                              type="button"
                              onClick={() => selectMonthDay(day)}
                              className={`rounded-2xl border p-2 text-left transition ${isSelected ? selectedDayButtonMap[dayLetter] : isCurrentMonth ? dayButtonMap[dayLetter] : 'border-transparent bg-slate-950/40 text-slate-600'}`}
                            >
                              <div className="text-sm font-semibold">{day.format('D')}</div>
                              {day.isSame(moment(), 'day') && <div className={`mt-1 text-[10px] uppercase ${isSelected ? 'text-white/80' : 'text-current/70'}`}>Hoy</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-slate-900/70 p-3 text-slate-300 sm:rounded-3xl sm:p-4">
                    <div className="mb-2 flex items-center justify-between sm:mb-3">
                      <div>
                        <p className="text-xs text-slate-400 sm:text-sm">Rutinas para el día</p>
                        <h3 className="text-base font-semibold text-white sm:text-lg">{selectedDate.format('dddd, D [de] MMMM')}</h3>
                      </div>
                    </div>
                    {filteredWorkouts.length === 0 ? (
                      <p className="text-sm text-slate-400">No hay rutinas asignadas para este día.</p>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-1">
                        {filteredWorkouts.map((item) => {
                          const dayLetters = getWorkoutDayLetters(item).split('').filter(Boolean);
                          const workoutTitle = item.title || item.name || item.workout_name || `Rutina ${item.workout_id || item.id}`;
                          return (
                            <div
                              key={item.id || `${item.workout_id}-${item.day_of_week}-${workoutTitle}`}
                              className="group relative flex min-w-0 flex-col gap-2 rounded-xl border border-slate-700 border-l-4 border-l-[#f1b80c] bg-slate-800/70 p-2.5 shadow-lg transition hover:border-slate-600 hover:bg-slate-800 sm:gap-2.5 sm:rounded-2xl sm:p-3.5"
                            >
                              {/* Header: icon + title + acciones */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-600/20 text-[#f1b80c] sm:h-8 sm:w-8">
                                    <FontAwesomeIcon icon={faDumbbell} size="sm" />
                                  </span>
                                  <h4 className="min-w-0 flex-1 truncate text-sm font-semibold text-white" title={workoutTitle}>
                                    {workoutTitle}
                                  </h4>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <button
                                    type="button"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-black transition hover:bg-yellow-200"
                                    title="Video"
                                    onClick={() => handleExercisePreview(item.exercise_id)}
                                  >
                                    <FontAwesomeIcon icon={faVideo} size="xs" />
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-black transition hover:bg-yellow-200"
                                    title="Nota"
                                    onClick={() => handleWorkoutNotes(item.id, clientId, selectedDate.clone().set({ hour: moment().hour(), minute: moment().minute(), second: moment().second() }).format('YYYY-MM-DD HH:mm:ss'), workoutTitle, item.note)}
                                  >
                                    <FontAwesomeIcon icon={faPencil} size="xs" />
                                  </button>
                                </div>
                              </div>

                              {/* Meta: días + sets/reps */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 sm:gap-x-4">
                                <span className="inline-flex flex-wrap items-center gap-1">
                                  <FontAwesomeIcon icon={faCalendarDays} className="mr-0.5 text-[#f1b80c]" />
                                  {dayLetters.length > 0 ? (
                                    dayLetters.map((d) => (
                                      <span
                                        key={d}
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dayColorMap[d] || 'bg-slate-600/40 text-slate-300 ring-1 ring-inset ring-slate-500/30'}`}
                                      >
                                        {DAY_FULL_NAME_BY_LETTER[d] || d}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </span>
                                <span className="rounded-full bg-slate-900/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#f1b80c]">
                                  Sets: {item.sets || '—'} · Reps: {item.reps_text || '—'}
                                </span>
                              </div>

                              {item.client_effort_notes && (
                                <p className="text-xs text-slate-400">{item.client_effort_notes}</p>
                              )}

                              {/* Nota del cliente */}
                              {item.note &&
                                <p className="line-clamp-2 flex items-start gap-1.5 rounded-xl border border-yellow-400/40 bg-yellow-400/5 px-3 py-2 text-xs text-slate-200" title={item.note}>
                                  <FontAwesomeIcon icon={faCommentDots} className="mt-0.5 shrink-0 text-[#f1b80c]" />
                                  <span><span className="mr-1 font-semibold text-white">Notas:</span>{item.note}</span>
                                </p>
                              }

                              {/* Feedback del entrenador */}
                              {item.feedback &&
                                <p className="line-clamp-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 text-xs text-slate-200" title={item.feedback}>
                                  <span className="mr-1 font-semibold text-emerald-400">{profile?.trainer_name || 'Feedback'}:</span>
                                  {item.feedback}
                                </p>
                              }

                              {item.description && (
                                <p className="text-xs leading-5 text-slate-300">{item.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <PaymentGateMessage />
            )}
            <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 sm:text-xl sm:mb-4">Pagos</h2>
              <div className="space-y-3 text-slate-300">
                <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:gap-3">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className='bg-yellow-400 hover:bg-yellow-200 text-black rounded-xl px-3 py-1.5 text-sm font-semibold sm:rounded-2xl sm:p-2 sm:text-base'
                  >
                    Registrar Comprobante <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                  </button>
                  <span className="text-xs text-slate-400 sm:ml-2 sm:text-sm">Sube tu comprobante de pago para que tu entrenador pueda revisarlo.</span>
                </div>
                <div>
                  {loadingPayments ? (
                    <p className="text-sm text-slate-400">Cargando pagos...</p>
                  ) : payments.length === 0 ? (
                    <p className="text-sm text-slate-400">No se han enviado comprobantes todavía.</p>
                  ) : (
                    <div className="max-h-[450px] overflow-y-auto space-y-3 pr-1">
                      {payments.map((p, idx) => {
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
                            className='rounded-lg p-2.5 border bg-slate-800 border-yellow-400 text-white sm:rounded-xl sm:p-3'
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
  }

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
      <div className='sticky top-10'>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#f1b80c] to-[#d97706] text-xl font-bold text-slate-950 shadow-xl shadow-[#f1b80c]/20">
          {initials}
        </div>
        <div className="mt-5">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Bienvenido</p>
          <h1 className="mt-3 text-2xl font-bold text-white">{userName}</h1>
          <p className="mt-1 text-sm text-slate-400">{roleString}</p>
        </div>
        {
          (roleString !== "CLIENT" || (roleString === "CLIENT" && hasApprovedPayment)) ? (
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
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-xs text-slate-400">
              Tu menú se habilitará cuando tu entrenador apruebe el pago de tu mensualidad correspondiente al período actual.
            </div>
          )
        }
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
            <div className="mb-4 lg:hidden top-4 sticky text-right">
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
              <Helmet>
                <title>Ajustes</title>
              </Helmet>
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
                          {n.navigate_to &&
                            <p className="mt-1 text-xs text-slate-400">
                              {n.navigate_to}
                            </p>
                          }
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
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                        <span className={`rounded-full px-3 py-1 font-semibold ${isRead ? 'bg-green-600 text-white' : 'bg-orange-400 text-black'}`}>
                          {isRead ? 'Leída' : 'Pendiente'}
                        </span>
                        <span>{moment(n.created_at).format('DD-MM-YYYY HH:mm')}</span>
                      </div>
                    </>
                  );

                  return n.navigate_to ? (
                    <Link
                      key={n.id}
                      to={n.navigate_to}
                      onClick={closeNotificationsModal}
                      className="block rounded-2xl border border-slate-800 bg-[#141820] p-4 transition hover:border-[#f1b80c]"
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
        paymentCount={payments.length}
        onPaymentDayReceived={(paymentDay) => setProfile((currentProfile) => ({ ...currentProfile, payment_day: paymentDay }))}
      />
    </>
  );
};

export default Dashboard;