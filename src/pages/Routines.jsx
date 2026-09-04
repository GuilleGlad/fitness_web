import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faVideo, faBars, faTimes, faHome, faBell, faDumbbell, faCalendarDays, faCommentDots } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import 'moment/locale/es';
import ExerciseCard from '../components/ExerciseCard';
import toast from 'react-hot-toast';
import { useNotifications } from '../context/NotificationsContext';

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

const Routines = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const clientId = localStorage.getItem('client_id');
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
  const roleString = roleValue === 1 ? 'ADMIN' : roleValue === 2 ? 'TRAINER' : 'CLIENT';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const [workouts, setWorkouts] = useState([]);
  const [previewExercise, setPreviewExercise] = useState(null);
  const [notesModal, setNotesModal] = useState({ isOpen: false, workoutId: null, title: '', date: '', notes: '' });
  const [calendarView, setCalendarView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));

  moment.locale('es');
  const weekDayLabels = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

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

  const selectWeekDay = (day) => {
    setSelectedDate(day.clone().startOf('day'));
    setCalendarView('week');
  };

  const selectMonthDay = (day) => {
    setSelectedDate(day.clone().startOf('day'));
  };

  useEffect(() => {
    var redirectPath = null;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };
    checkToken();

    const fetchWorkouts = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`${apiUrl}/workouts/list/${clientId}`, config);
        if (response.status === 200) {
          setWorkouts(response.data.filas);
        }
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchWorkouts();
  }, [navigate, apiUrl, clientId, token]);

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

  // ✅ Navegación del menú lateral (misma lógica que en Dashboard)
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
      // Ya estamos en la página de Rutinas
      setMenuOpen(false); return;
    }
    if (item.indexOf('Progreso') !== -1) {
      navigate('/progress'); setMenuOpen(false); return;
    }
    setMenuOpen(false);
  };

  const handleLogoutWithClose = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre'];
    keysToClear.forEach(key => localStorage.removeItem(key));
    setMenuOpen(false);
    navigate('/login');
  };

  // ✅ Componente reutilizable del panel de navegación (idéntico al de Dashboard)
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
              className={`w-full rounded-3xl px-4 py-3 text-left text-md font-semibold transition-all ${item === 'Rutinas' ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
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
                <h2 className="mt-3 text-3xl font-bold text-white">Rutinas</h2>
              </div>

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
            </div>

            <div className="rounded-[40px] border border-slate-800 bg-[#141820] shadow-2xl p-6 lg:p-8">
              <div className="grid gap-4 xl:grid-cols-1">
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
                          const dayLetter = getSelectedDayLetter(day);
                          return (
                            <button
                              key={day.format('YYYY-MM-DD')}
                              type="button"
                              onClick={() => selectWeekDay(day)}
                              className={`rounded-2xl border p-2 text-center transition ${isSelected ? selectedDayButtonMap[dayLetter] : dayButtonMap[dayLetter]}`}
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
                        <div className="grid gap-3 md:grid-cols-2">
                          {filteredWorkouts.map((item) => {
                            const dayLetters = getWorkoutDayLetters(item).split('').filter(Boolean);
                            const workoutTitle = item.title || item.name || item.workout_name || `Rutina ${item.workout_id || item.id}`;
                            return (
                              <div
                                key={item.id || `${item.workout_id}-${item.day_of_week}-${workoutTitle}`}
                                className="group relative flex flex-col gap-2.5 rounded-2xl border border-slate-700 border-l-4 border-l-[#f1b80c] bg-slate-800/70 p-3.5 shadow-lg transition hover:border-slate-600 hover:bg-slate-800"
                              >
                                {/* Header: icon + título + acciones */}
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-600/20 text-[#f1b80c]">
                                      <FontAwesomeIcon icon={faDumbbell} size="sm" />
                                    </span>
                                    <h4 className="truncate text-sm font-semibold text-white" title={workoutTitle}>
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
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
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
                                    <span className="mr-1 font-semibold text-emerald-400">Feedback:</span>
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
    </>
  );
};

export default Routines;
