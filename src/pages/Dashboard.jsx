import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faHome, faPencil, faVideo } from '@fortawesome/free-solid-svg-icons';
import BodySilhouette from '../components/BodySilhouette';
import moment from 'moment';
import 'moment/locale/es';
import FloatingButton from '../components/FloatingButton';
import ExerciseCard from '../components/ExerciseCard';
import { Link } from 'react-router-dom';
import ProgressModal from '../components/ProgressModal';
import { yellow } from '@mui/material/colors';
import toast from 'react-hot-toast';
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
    'Recetas',
    'Pagos',
    'Ajustes',
  ],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('Perfil de Usuario');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const [status, setStatus] = useState(localStorage.getItem('status'));
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const genre = localStorage.getItem('genre');
  const clientId = localStorage.getItem('client_id');
  const notifications = 4;
  const roleString = Object.entries(ROLE_MAP).find(([key, value]) => value === roleValue)?.[0]?.toUpperCase() || 'CLIENTE';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const [progreso, setProgreso] = useState([{ cadera: 100, cintura: 100, piernas: 60, brazos: 30 }]);
  const [profile, setProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [previewExercise, setPreviewExercise] = useState(null);
  const [notesModal, setNotesModal] = useState({ isOpen: false, workoutId: null, title: '', date: '', notes: '' });
  const [calendarView, setCalendarView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));

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
            // console.log(response.data);
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
            console.log(progreso);

          }
        })
      } catch (error) {
        console.error('Error fetchin data: ', error);
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

  }, [navigate, apiUrl, roleValue, status]);

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
              { label: 'Clientes activos', value: 18 },
              { label: 'Rutinas publicadas', value: 42 },
              { label: 'Recetas disponibles', value: 16 },
              { label: 'Pagos pendientes', value: 3 },
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          {[
            { label: 'Rutinas activas', value: 5 },
            { label: 'Recetas favoritas', value: 12 },
            { label: 'Pagos próximos', value: 1 },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
              <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
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
              <span className="rounded-full bg-[#f1b80c]/15 px-3 py-1 lg:text-sm text-xs text-nowrap text-[#f1b80c] font-semibold">En progreso</span>
            </div>
            <div className="space-y-4">
              <BodySilhouette genre={genre} cadera={Number(progreso[0].hips)} cintura={Number(progreso[0].waist)} piernas={Number(progreso[0].legs)} brazos={Number(progreso[0].arms)} />
              {/* {[
                { label: 'IMC', value: '23.5', percent: 75 },
                { label: 'Grasa corporal', value: '18%', percent: 60 },
                { label: 'Masa muscular', value: '42%', percent: 86 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>{item.label}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-[#f1b80c]" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))} */}
            </div>
          </section>

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
            <h2 className="items-center text-xl font-semibold text-white mb-4">Datos Iniciales</h2>
            <div className=" grid grid-cols-3 text-slate-300 mb-4">
              {[
                { label: "Edad", value: profile.age },
                { label: "Altura", value: profile.height },
                { label: "Peso", value: profile.initial_weight },
                { label: "Objetivo", value: profile.goal?.replace('_', ' ').toUpperCase() },
                { label: "Días a Entrenar", value: profile.training_days },
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
                  className="text-nowrap flex items-center gap-2 bg-yellow-100 text-gray-800 lg:px-4 lg:py-2 px-2 py-1 my-2 hover:bg-yellow-400 transition duration-200 rounded-full uppercase lg:text-md text-xs justify-center font-bold"
                >
                  Agregar <FontAwesomeIcon icon={faAdd} />
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
                  {/* <span className="rounded-full bg-[#f1b80c] px-3 py-1 text-xs font-semibold text-slate-950">{filteredWorkouts.length} encontradas</span> */}
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
                            {/* <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#f1b80c]">Día: {item.day_of_week || '—'}</p> */}
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#f1b80c]">Sets: {item.sets || '—'} Reps: {item.reps_text} {item.client_effort_notes}</p>
                          </div>
                          <div className="rounded-2xl bg-slate-950/70 px-3 py-2 text-right text-sm font-semibold text-slate-300 flex">
                            {/* {item.log_date ? moment(item.log_date).format('DD/MM/YYYY') : 'Fecha pendiente'} */}
                            <button className="rounded-2xl border p-2 text-left bg-yellow-400 border-black hover:bg-yellow-200" title='Video' onClick={() => handleExercisePreview(item.exercise_id)}><FontAwesomeIcon icon={faVideo} className="text-black"></FontAwesomeIcon></button>
                            <button className="rounded-2xl border p-2 text-left bg-yellow-400 border-black hover:bg-yellow-200" title={item.note || `Notas`} onClick={() => handleWorkoutNotes(item.id, clientId, selectedDate.clone().set({ hour: moment().hour(), minute: moment().minute(), second: moment().second() }).format('YYYY-MM-DD HH:mm:ss'), item.title || item.name || item.workout_name, item.note)}><FontAwesomeIcon icon={faPencil} className='text-black'></FontAwesomeIcon></button>
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
            <h2 className="text-xl font-semibold text-white mb-4">Recetas</h2>
            <div className="space-y-3 text-slate-300">
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="font-semibold text-white">Smoothie Energético</p>
                <p className="text-sm">Proteínas, banana y espinaca.</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="font-semibold text-white">Cena ligera</p>
                <p className="text-sm">Salmón al horno con quinoa.</p>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
          <aside className="w-full border-b border-slate-800 bg-[#141820] lg:w-[320px] lg:min-h-screen lg:border-r lg:border-b-0">
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
                      onClick={() => {
                        if (item.indexOf('Clientes') !== -1 || item.indexOf("Usuarios") !== -1) {
                          navigate('/clients');
                          return;
                        }
                        if (item.indexOf('Entrenadores') !== -1) {
                          navigate('/trainers');
                          return;
                        }
                        if (item.indexOf('Ejercicios') !== -1 || item.indexOf('Ejercicios por Entrenador') !== -1) {
                          navigate('/trainer-exercises');
                          return;
                        }
                        if (item.indexOf('Fotos/Videos') !== -1) {
                          navigate('/trainer-library');
                          return;
                        }
                        if (item.indexOf('Recetas') !== -1 || item.indexOf('Recetas por Entrenador') !== -1) {
                          navigate('/trainer-recipes');
                          return;
                        }
                        if (item.indexOf('Ajustes') !== -1) {
                          navigate('/settings');
                          return;
                        }
                        if (item.indexOf('Noticias') !== -1) {
                          navigate('/news-manager');
                          return;
                        }
                        setSelectedMenu(item);
                      }}
                      className={`w-full rounded-3xl px-4 py-3 text-left text-md font-semibold transition-all ${selectedMenu === item ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  Cerrar sesión
                </button>
                <button
                  onClick={navigate.bind(null, '/')}
                  className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  <FontAwesomeIcon icon={faHome} className='mr-2'></FontAwesomeIcon><span>Página de Inicio</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 bg-[#0d1117] p-6 lg:p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Panel</p>
                <h2 className="mt-3 text-3xl font-bold text-white">{selectedMenu}</h2>
                <p className="mt-2 text-slate-400">Contenido personalizado para tu rol de {roleString}.</p>
              </div>

              {(roleValue === 2 || roleValue === 3) && (
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
              )}
            </div>

            <div className="rounded-[40px] border border-slate-800 bg-[#141820] shadow-2xl">
              {renderSectionContent()}
            </div>
          </main>
        </div>
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
                {/* <h2 className="mt-2 text-2xl font-bold text-white">{notesModal.title}</h2> */}
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

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        clientId={clientId}
        age={profile.age}
        height={profile.height}
        initialWeight={profile.initial_weight}
        goal={profile.goal}
        trainingDays={profile.training_days}
        trainerId={profile.trainer_id}
      />
    </>
  );
};

export default Dashboard;
