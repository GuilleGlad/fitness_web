import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faNoteSticky, faTrash, faCalendarDays, faClock, faDumbbell, faCommentDots, faChevronDown, faExpand, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../utils/tokenUtils';
import { getClientStatusLabel, getCuentaLabel, normalizeClientRow, normalizeStatusCode } from '../utils/clientUtils';
import moment from 'moment';
import 'moment/locale/es';


const initialForm = {
  name: '',
  email: '',
  password: '',
  genre: '',
  phone: '',
  picture: '/images/avatar.png',
  status: 0,
  deleted: 0,
  status_cuenta: 1
};

/* ───────── Reusable Modal Wrapper ───────── */
const ModalOverlay = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;
  const sizeClass = size === 'full'
    ? 'w-[96vw] max-w-[1600px] max-h-[95vh]'
    : 'w-full max-w-5xl max-h-[92vh]';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4" onClick={onClose}>
      <div
        className={`relative ${sizeClass} overflow-y-auto rounded-2xl border border-slate-700 bg-[#141820] shadow-2xl sm:rounded-[32px]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-[#141820] px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white" aria-label="Cerrar modal">✕</button>
        </div>
        <div className="p-3 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

/* ───────── Form Component (receives setForm via props) ───────── */
const ClientForm = ({ form, setForm, editingId, initialForm, onSubmit, onCancel, onOpenLibrary, isSubmitting }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <>
      <form onSubmit={onSubmit} >

        {editingId && (
          <label className="space-y-2 text-sm text-slate-200 flex flex-col items-center">
            {form.picture && form.picture === '/images/avatar.png' && <img src={form.picture} className='mt-2 w-full rounded-[50%] lg:w-1/4 object-cover border border-slate-700' />}
            <input name="picture" value={form.picture} type="url" readOnly placeholder="https://ejemplo.com/foto.jpg" onChange={handleChange} className="hidden w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
            {form.picture && form.picture !== '/images/avatar.png' && <img onClick={() => setPreviewImage(form.picture)} src={form.picture} alt="preview" className="cursor-pointer mt-2 w-[20em] h-[20em] rounded-[50%] object-cover border border-slate-700" />}
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onOpenLibrary} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">📚 Biblioteca</button>
              {form.picture && form.picture !== '/images/avatar.png' && <button type="button" onClick={() => setForm((p) => ({ ...p, picture: initialForm.picture }))} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">🗑️ Limpiar</button>}
            </div>
          </label>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="block space-y-2 text-sm text-slate-200">
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              placeholder="Ej. Juan Pérez"
              className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            Email
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="juan@email.com"
              className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            Contraseña
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
            />
          </label>
        </div>

        {/* Columna derecha */}
        <div className="grid gap-5 lg:grid-cols-3">
          <label className="block space-y-2 text-sm text-slate-200">
            Género
            <select name="genre" value={form.genre} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]">
              <option value="" disabled className="bg-[#0f172a]">Seleccione un género</option>
              <option value="m" className="bg-[#0f172a]">Masculino</option>
              <option value="f" className="bg-[#0f172a]">Femenino</option>
              <option value="n" className="bg-[#0f172a]">Prefiere no decirlo</option>
            </select>
          </label>

          <label className="block space-y-2 text-sm text-slate-200">
            Teléfono
            <input name="phone" value={form.phone} type="tel" placeholder="+34 600 000 000" onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
          </label>

          {editingId && (
            <label className="block space-y-2 text-sm text-slate-200">
              Cuenta
              <select name="status_cuenta" value={form.status_cuenta} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]">
                <option value="1" className="bg-[#0f172a]">Activa</option>
                <option value="0" className="bg-[#0f172a]">Inactiva</option>
              </select>
            </label>
          )}
        </div>

        {/* Botones - span 2 columnas en desktop */}
        <div className="lg:col-span-2 grid gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? (editingId ? 'Guardando...' : 'Creando...') : (editingId ? 'Guardar cambios' : 'Crear cliente')}
          </button>
          {editingId && (
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
              Cancelar edición
            </button>
          )}
        </div>
      </form>
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
    </>
  );
};

/* ───────── Trainer creation (copiado de Trainers.jsx) ───────── */
const initialTrainerForm = {
  name: '',
  email: '',
  password: '',
  role: 'Trainer',
  genre: '',
  phone: '',
  picture: '/images/avatar.png',
  status: 0,
  deleted: 0,
  status_cuenta: 1
};

const TrainerForm = ({ form, setForm, editingId, initialForm, onSubmit, onCancel, onOpenLibrary, isSubmitting }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Credenciales */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm text-slate-200">
          Email
          <input name="email" value={form.email} type="email" placeholder="entrenador@fit.com" onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
        </label>
        <label className="block space-y-2 text-sm text-slate-200">
          Contraseña
          <input name="password" value={form.password} type="password" placeholder={editingId ? "Dejar vacío para mantener actual" : "••••••••"} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
        </label>
      </div>

      {/* Datos personales */}
      <label className="block space-y-2 text-sm text-slate-200">
        Nombre completo
        <input name="name" value={form.name} type="text" placeholder="Ej. Carlos García" onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2 text-sm text-slate-200">
          Género
          <select name="genre" value={form.genre} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]">
            <option value="" disabled className="bg-[#0f172a]">Seleccione</option>
            <option value="m" className="bg-[#0f172a]">Masculino</option>
            <option value="f" className="bg-[#0f172a]">Femenino</option>
            <option value="n" className="bg-[#0f172a]">Prefiere no decirlo</option>
          </select>
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          Teléfono
          <input name="phone" value={form.phone} type="tel" placeholder="+34 600 000 000" onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          Cuenta
          <select name="status_cuenta" value={form.status_cuenta} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]">
            <option value="1" className="bg-[#0f172a]">Activa</option>
            <option value="0" className="bg-[#0f172a]">Inactiva</option>
          </select>
        </label>

        <label className="hidden space-y-2 text-sm text-slate-200">
          Rol
          <input name="role" value={form.role} readOnly disabled className="w-full rounded-3xl border border-slate-700 bg-[#1e293b] px-4 py-3 text-slate-400 cursor-not-allowed" />
        </label>
      </div>

      {/* Foto de perfil - solo en edición */}
      {editingId && (
        <label className="block space-y-2 text-sm text-slate-200">
          Foto de perfil
          <input name="picture" value={form.picture} type="url" readOnly placeholder="https://ejemplo.com/foto.jpg" onChange={handleChange} className="hidden w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
          {form.picture && form.picture !== '/images/avatar.png' && <img src={form.picture} alt="preview" className="mt-2 w-full rounded-lg object-cover border border-slate-700" />}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={() => onOpenLibrary((url) => setForm((p) => ({ ...p, picture: url })))} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">📚 Biblioteca</button>
            <button type="button" onClick={() => setForm((p) => ({ ...p, picture: initialForm.picture }))} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">🗑️ Limpiar</button>
          </div>
        </label>
      )}

      <div className="grid gap-3 pt-2">
        <button type="submit" disabled={isSubmitting} className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (editingId ? 'Guardando...' : 'Creando...') : (editingId ? 'Guardar cambios' : 'Crear entrenador')}
        </button>
        {editingId && (
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
};

/* ───────── Main Component ───────── */
const Clients = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const roleValue = localStorage.getItem('role');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  /* Modal states */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const personalDataRef = useRef(null);
  const biometricHistoryRef = useRef(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [trainerWorkouts, setTrainerWorkouts] = useState([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState([]);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [activeWorkoutTab, setActiveWorkoutTab] = useState('assigned');
  const [showWorkoutsFullModal, setShowWorkoutsFullModal] = useState(false);
  const [completedDateFilter, setCompletedDateFilter] = useState('');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [selectedDays, setSelectedDays] = useState({ L: false, M: false, X: false, J: false, V: false, S: false, D: false });
  const [trainerNotes, setTrainerNotes] = useState('');
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [loadingAssignedWorkouts, setLoadingAssignedWorkouts] = useState(false);
  const [loadingCompletedWorkouts, setLoadingCompletedWorkouts] = useState(false);
  const [loadingTrainerWorkouts, setLoadingTrainerWorkouts] = useState(false);
  const [trainerId, setTrainerId] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteModalData, setNoteModalData] = useState(null);
  const [noteFeedback, setNoteFeedback] = useState('');
  const [loadingNoteModal, setLoadingNoteModal] = useState(false);
  const [savingNoteFeedback, setSavingNoteFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Datos biométricos del cliente (modal Asignar rutina) ── */
  const [clientProfileData, setClientProfileData] = useState(null);
  const [clientProgressHistory, setClientProgressHistory] = useState([]);
  const [loadingBioData, setLoadingBioData] = useState(false);
  const [bioPhotoPreview, setBioPhotoPreview] = useState(null);

  /* ── Crear Entrenador (solo Administrador) ── */
  const [showNewTrainerModal, setShowNewTrainerModal] = useState(false);
  const [showEditTrainerModal, setShowEditTrainerModal] = useState(false);
  const [trainerForm, setTrainerForm] = useState(initialTrainerForm);
  const [isSubmittingTrainer, setIsSubmittingTrainer] = useState(false);
  const [showTrainerLibraryModal, setShowTrainerLibraryModal] = useState(false);
  const [trainerLibraryCallback, setTrainerLibraryCallback] = useState(null);

  /* ── Eliminación permanente de usuarios ya eliminados lógicamente (solo Administrador) ── */
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    if (!showAssignModal) return undefined;

    personalDataRef.current?.setAttribute('open', '');
    biometricHistoryRef.current?.setAttribute('open', '');

    const closeAccordionsTimer = setTimeout(() => {
      personalDataRef.current?.removeAttribute('open');
      biometricHistoryRef.current?.removeAttribute('open');
    }, 3000);

    return () => clearTimeout(closeAccordionsTimer);
  }, [showAssignModal]);

  const dayOptions = [
    { key: 'L', label: 'Lunes' },
    { key: 'M', label: 'Martes' },
    { key: 'X', label: 'Miércoles' },
    { key: 'J', label: 'Jueves' },
    { key: 'V', label: 'Viernes' },
    { key: 'S', label: 'Sábado' },
    { key: 'D', label: 'Domingo' },
  ];

  const dayColorMap = {
    L: 'bg-blue-500/25 text-blue-300 ring-1 ring-inset ring-blue-500/50',
    M: 'bg-violet-500/25 text-violet-300 ring-1 ring-inset ring-violet-500/50',
    X: 'bg-fuchsia-500/25 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/50',
    J: 'bg-orange-500/25 text-orange-300 ring-1 ring-inset ring-orange-500/50',
    V: 'bg-cyan-500/25 text-cyan-300 ring-1 ring-inset ring-cyan-500/50',
    S: 'bg-red-500/25 text-red-300 ring-1 ring-inset ring-red-500/50',
    D: 'bg-lime-500/25 text-lime-300 ring-1 ring-inset ring-lime-500/50',
  };

  const dayIdleMap = {
    L: 'border-blue-500/40 bg-blue-500/5 text-blue-200/80 hover:bg-blue-500/10',
    M: 'border-violet-500/40 bg-violet-500/5 text-violet-200/80 hover:bg-violet-500/10',
    X: 'border-fuchsia-500/40 bg-fuchsia-500/5 text-fuchsia-200/80 hover:bg-fuchsia-500/10',
    J: 'border-orange-500/40 bg-orange-500/5 text-orange-200/80 hover:bg-orange-500/10',
    V: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-200/80 hover:bg-cyan-500/10',
    S: 'border-red-500/40 bg-red-500/5 text-red-200/80 hover:bg-red-500/10',
    D: 'border-lime-500/40 bg-lime-500/5 text-lime-200/80 hover:bg-lime-500/10',
  };

  const dayBorderMap = {
    L: 'border-blue-500',
    M: 'border-violet-500',
    X: 'border-fuchsia-500',
    J: 'border-orange-500',
    V: 'border-cyan-500',
    S: 'border-red-500',
    D: 'border-lime-500',
  };

  const dayAccentMap = {
    L: 'accent-blue-500',
    M: 'accent-violet-500',
    X: 'accent-fuchsia-500',
    J: 'accent-orange-500',
    V: 'accent-cyan-500',
    S: 'accent-red-500',
    D: 'accent-lime-500',
  };

  const translateDay = (key) => {
    if (key.indexOf(',') != -1) {
      return key.split(',').map(k => translateDay(k)).join(', ');
    }
    const day = dayOptions.find((d) => d.key === key);
    return day ? day.label : key;
  };

  const resetAssignForm = () => {
    setSelectedWorkoutId('');
    setSelectedDays({ L: false, M: false, X: false, J: false, V: false, S: false, D: false });
    setTrainerNotes('');
  };

  const getDayString = () => Object.entries(selectedDays).filter(([, value]) => value).map(([day]) => day).join(',');

  const fetchAssignedWorkouts = async (clientId) => {
    setLoadingAssignedWorkouts(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${apiUrl}/workouts/list/${clientId}`, config);
      setAssignedWorkouts(res.data?.filas || []);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las rutinas asignadas.');
    } finally {
      setLoadingAssignedWorkouts(false);
    }
  };

  const fetchCompletedWorkouts = async (clientId) => {
    setLoadingCompletedWorkouts(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${apiUrl}/workouts/list-completed/${clientId}`, config);
      setCompletedWorkouts(res.data?.filas || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las rutinas completadas.');
    } finally {
      setLoadingCompletedWorkouts(false);
    }
  };

  const fetchTrainerWorkouts = async (trainerId) => {
    setLoadingTrainerWorkouts(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${apiUrl}/workouts/list-by-trainer/${trainerId}`, config);
      setTrainerWorkouts(res.data?.filas || []);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar las rutinas del entrenador.');
    } finally {
      setLoadingTrainerWorkouts(false);
    }
  };

  const fetchClientBioData = async (clientId) => {
    setLoadingBioData(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [profileRes, progressRes] = await Promise.all([
        axios.get(`${apiUrl}/progress/get-profile-by-id/${clientId}`, config),
        axios.get(`${apiUrl}/progress/get/${clientId}`, config),
      ]);
      setClientProfileData(profileRes.data?.profile?.[0] || null);
      setClientProgressHistory(progressRes.data?.filas || []);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar los datos biométricos del cliente.');
    } finally {
      setLoadingBioData(false);
    }
  };

  const handleOpenAssignModal = async (client) => {
    setShowAssignModal(true);
    setSelectedClient(client);
    setActiveWorkoutTab('assigned');
    setCompletedDateFilter('');
    resetAssignForm();

    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const meRes = await axios.get(`${apiUrl}/auth/me`, config);
      const currentTrainerId = meRes.data?.user?.id || meRes.data?.id || meRes.data?.trainer_id || meRes.data?.trainerId;
      if (!currentTrainerId) {
        toast.error('No se pudo obtener el trainer_id del usuario logueado.');
        return;
      }
      setTrainerId(currentTrainerId);
      await fetchTrainerWorkouts(currentTrainerId);
      await fetchAssignedWorkouts(client.id);
      await fetchCompletedWorkouts(client.id);
      await fetchClientBioData(client.id);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo obtener el entrenador actual.');
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedClient(null);
    setTrainerWorkouts([]);
    setAssignedWorkouts([]);
    setCompletedWorkouts([]);
    setActiveWorkoutTab('assigned');
    setCompletedDateFilter('');
    setClientProfileData(null);
    setClientProgressHistory([]);
    resetAssignForm();
  };

  const closeNoteModal = () => {
    setShowNoteModal(false);
    setNoteModalData(null);
    setNoteFeedback('');
    setLoadingNoteModal(false);
    setSavingNoteFeedback(false);
  };

  const handleNoteReview = async (workoutNoteId) => {
    if (!workoutNoteId) {
      toast.error('ID de nota inválido.');
      return;
    }

    setShowNoteModal(true);
    setLoadingNoteModal(true);
    setNoteModalData(null);
    setNoteFeedback('');

    const existingNote = assignedWorkouts.find(
      (item) => item.workout_note_id === workoutNoteId
    );

    if (existingNote) {
      setNoteModalData(existingNote);
      setNoteFeedback(existingNote.feedback || '');
      setLoadingNoteModal(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no disponible. Inicia sesión.');
        closeNoteModal();
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${apiUrl}/workouts/note/${workoutNoteId}`, config);
      const noteData = res.data?.note || res.data || null;
      if (!noteData) {
        toast.error('No se encontró la nota.');
        closeNoteModal();
        return;
      }
      setNoteModalData(noteData);
      setNoteFeedback(noteData.feedback || '');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo cargar la nota.');
      closeNoteModal();
    } finally {
      setLoadingNoteModal(false);
    }
  };

  const saveNoteFeedback = async () => {
    if (!noteModalData) return;
    setSavingNoteFeedback(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const noteId = noteModalData.workout_note_id || noteModalData.id;
      const payload = {
        feedback: noteFeedback.trim(),
      };

      const response = await axios.put(`${apiUrl}/workouts/update-feedback/${noteId}`, payload, config);
      const updated = response.data?.note || response.data || {};
      const updatedFeedback = updated.feedback ?? payload.feedback;
      const updatedStatus = updated.status ?? 1;

      setAssignedWorkouts((prev) =>
        prev.map((item) =>
          item.workout_note_id === noteId
            ? { ...item, feedback: updatedFeedback, status: updatedStatus }
            : item
        )
      );
      toast.success('Feedback guardado correctamente.');
      closeNoteModal();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo guardar el feedback.');
    } finally {
      setSavingNoteFeedback(false);
    }
  };

  const handleToggleDay = (key) => {
    setSelectedDays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (!selectedWorkoutId) return toast.error('Selecciona una rutina.');
    const dayString = getDayString();
    if (!dayString) return toast.error('Selecciona al menos un día de la semana.');

    setLoadingAssign(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return toast.error('Token no disponible. Inicia sesión.');
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
      const progress_history_id = clientProgressHistory.length > 0 ? clientProgressHistory[0].id : null;

      const payload = {
        client_id: selectedClient.id,
        workout_id: Number(selectedWorkoutId),
        day_of_week: dayString,
        trainer_notes: trainerNotes.trim(),
        progress_history_id: progress_history_id,
      };
      await axios.post(`${apiUrl}/workouts/add`, payload, config);
      toast.success('Rutina asignada correctamente.');
      await fetchAssignedWorkouts(selectedClient.id);
      resetAssignForm();
    } catch (err) {
      console.error(err);
      toast.error('No se pudo asignar la rutina.');
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleDeleteAssignedWorkout = async (assignmentId) => {
    if (!assignmentId) return;
    yesNo('¿Eliminar esta rutina asignada?', async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return toast.error('Token no disponible. Inicia sesión.');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${apiUrl}/workouts/delete/${assignmentId}`, config);
        setAssignedWorkouts((prev) => prev.filter((item) => item.id !== assignmentId));
        setCompletedWorkouts((prev) => prev.filter((item) => item.id !== assignmentId));
        toast.success('Rutina asignada eliminada correctamente.');
      } catch (err) {
        console.error(err);
        toast.error('No se pudo eliminar la rutina asignada.');
      }
    });
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

    const fetchClients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return toast.error('Token no disponible. Inicia sesión.');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/admin/clients`, config);
        const list = res.data?.clientes || res.data || [];
        setClients(
          list.map((item) => normalizeClientRow({
            ...item,
            id: item.user_id ?? item.id,
            name: item.name,
            email: item.email,
            password: '',
            genre: item.genre || '',
            phone: item.phone || '',
            picture: item.picture || '/images/avatar.png',
            role: item.role || '',
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los usuarios.');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [apiUrl]);

  const openLibraryPicker = () => setIsLibraryOpen(true);
  const handleSelectLibraryItem = (payload) => {
    const items = Array.isArray(payload) ? payload : [payload];
    const urls = items.filter((i) => i?.mediaType === 'image').map((i) => i.url).filter(Boolean);
    if (!urls.length) return toast.error('No se seleccionó ningún elemento válido.');
    setForm((p) => ({ ...p, picture: urls.join('\n') }));
    setIsLibraryOpen(false);
  };

  const handleRutina = (client) => {
    handleOpenAssignModal(client);
  };

  const handleProgress = (client) => {
    handleOpenAssignModal(client);
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name,
      email: client.email,
      password: '',
      role: 'client',
      genre: client.genre || '',
      phone: client.phone || '',
      picture: client.picture || '/images/avatar.png',
      status: normalizeStatusCode(client.status),
      status_cuenta: Number(client.status_cuenta ?? 1) === 0 ? 0 : 1,
    });
    setEditingId(client.id);
    setShowEditModal(true);
  };

  const handleEditTrainer = (client) => {
    setTrainerForm({
      name: client.name,
      email: client.email,
      password: '',
      role: 'Trainer',
      genre: client.genre || '',
      phone: client.phone || '',
      picture: client.picture || '/images/avatar.png',
      status: normalizeStatusCode(client.status),
      status_cuenta: Number(client.status_cuenta ?? 1) === 0 ? 0 : 1,
    });
    setEditingId(client.id);
    setShowEditTrainerModal(true);
  };

  const handleNewClient = () => { setForm(initialForm); setEditingId(null); setShowNewModal(true); };
  const cancelEdit = () => { setForm(initialForm); setEditingId(null); setShowEditModal(false); };
  const cancelNew = () => { setForm(initialForm); setEditingId(null); setShowNewModal(false); };

  /* ── Crear Entrenador (solo Administrador) ── */
  const handleNewTrainer = () => { setTrainerForm(initialTrainerForm); setShowNewTrainerModal(true); };
  const cancelNewTrainer = () => { setTrainerForm(initialTrainerForm); setShowNewTrainerModal(false); };
  const cancelEditTrainer = () => { setTrainerForm(initialTrainerForm); setEditingId(null); setShowEditTrainerModal(false); };

  const openTrainerLibraryPicker = (callback) => {
    setTrainerLibraryCallback(() => callback);
    setShowTrainerLibraryModal(true);
  };

  const closeTrainerLibraryModal = () => {
    setShowTrainerLibraryModal(false);
    setTrainerLibraryCallback(null);
  };

  const handleSelectTrainerLibraryItem = (media) => {
    const items = Array.isArray(media) ? media : [media];
    if (trainerLibraryCallback && items.length > 0 && items[0]?.url) {
      setTrainerForm((prev) => ({ ...prev, picture: items[0].url }));
      trainerLibraryCallback(items[0].url);
    }
    closeTrainerLibraryModal();
  };

  const handleTrainerSubmit = async (e) => {
    e.preventDefault();

    // Evita doble registro si se hace doble click en "Crear entrenador".
    if (isSubmittingTrainer) return;

    if (!trainerForm.name.trim() || !trainerForm.email.trim()) return toast.error('Nombre y email son obligatorios.');
    if (!trainerForm.password) return toast.error('La contraseña es obligatoria para crear un entrenador.');

    const token = localStorage.getItem('token');
    if (!token) return toast.error('Token no disponible.');

    const payload = {
      name: trainerForm.name.trim(),
      email: trainerForm.email.trim(),
      password: trainerForm.password,
      role: 'Trainer',
      genre: trainerForm.genre.trim(),
      phone: trainerForm.phone.trim(),
      picture: trainerForm.picture.trim(),
      status: Number(trainerForm.status) || 0,
      status_cuenta: Number(trainerForm.status_cuenta) === 0 ? 0 : 1,
    };
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

    setIsSubmittingTrainer(true);
    if (editingId) {
      setClients((p) => p.map((c) => c.id === editingId ? normalizeClientRow({ ...c, ...payload }) : c));
      cancelEditTrainer();
      try {
        await axios.put(`${apiUrl}/admin/user/${editingId}`, payload, config);
        toast.success('Entrenador actualizado correctamente.');
      } catch { toast.error('No se pudo actualizar el entrenador.'); }
      finally { setIsSubmittingTrainer(false); }
    } else {
      try {
        await axios.post(`${apiUrl}/auth/register`, payload, config);
        toast.success('Entrenador creado correctamente.');
        cancelNewTrainer();
      } catch (err) {
        console.error(err);
        toast.error('No se pudo crear el entrenador. Verifique los datos.');
      } finally {
        setIsSubmittingTrainer(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Evita doble registro/actualización si se hace doble click
    // en "Crear cliente" / "Guardar cambios".
    if (isSubmitting) return;

    if (!form.name.trim() || !form.email.trim()) return toast.error('Nombre y email son obligatorios.');
    const token = localStorage.getItem('token');
    if (!token) return toast.error('Token no disponible.');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      genre: form.genre.trim(),
      phone: form.phone.trim(),
      picture: form.picture.trim(),
      status: Number(form.status) || 0,
      role: 'client',
      status_cuenta: Number(form.status_cuenta) === 0 ? 0 : 1,
    };
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

    setIsSubmitting(true);

    if (editingId) {
      setClients((p) => p.map((c) => c.id === editingId ? normalizeClientRow({ ...c, ...form }) : c));
      cancelEdit();
      try {
        await axios.put(`${apiUrl}/admin/user/${editingId}`, payload, config);
        toast.success('Cliente actualizado correctamente.');
      } catch { toast.error('No se pudo actualizar el cliente.'); }
      finally { setIsSubmitting(false); }
    } else {
      try {
        const res = await axios.post(`${apiUrl}/auth/register`, payload, config);
        const saved = res.data?.cliente || res.data || {};
        const savedUser = saved.user || saved;
        const newClient = normalizeClientRow({
          ...savedUser,
          ...payload,
          id: savedUser?.user_id ?? savedUser?.id ?? Date.now(),
          deleted: savedUser?.deleted ?? payload.deleted ?? 0,
          status: savedUser?.status ?? payload.status ?? 0,
          status_cuenta: savedUser?.status_cuenta ?? payload.status_cuenta ?? 1,
        });
        setClients((p) => [...p, newClient]);
        toast.success('Cliente guardado correctamente.');
        cancelNew();
      } catch { toast.error('No se pudo guardar el cliente.'); }
      finally { setIsSubmitting(false); }
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${apiUrl}/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setClients((p) => p.map((c) => c.id === id ? { ...c, deleted: 1 } : c));
      toast.success('Cliente eliminado correctamente.');
    } catch { toast.error('No se pudo eliminar el cliente.'); }
  };

  const handleRestore = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${apiUrl}/admin/user-restore/${id}`, null, { headers: { Authorization: `Bearer ${token}` } });
      setClients((p) => p.map((c) => c.id === id ? { ...c, deleted: 0 } : c));
      toast.success('Cliente restaurado correctamente.');
    } catch { toast.error('No se pudo restaurar el cliente.'); }
  };

  /* ── Eliminación permanente de usuarios ya eliminados lógicamente (solo Administrador) ── */
  const handlePurgeDeleted = () => {
    const deletedCount = clients.filter((c) => c.deleted).length;

    if (deletedCount === 0) {
      toast.error('No hay usuarios eliminados para purgar.');
      return;
    }

    yesNo(
      `Se eliminarán PERMANENTEMENTE ${deletedCount} usuario${deletedCount === 1 ? '' : 's'} que ya ${deletedCount === 1 ? 'está' : 'están'} en la papelera. Esta acción no se puede deshacer. ¿Continuar?`,
      async () => {
        const token = localStorage.getItem('token');
        if (!token) return toast.error('Token no disponible.');

        setIsPurging(true);
        try {
          await axios.delete(`${apiUrl}/admin/users/purge`, { headers: { Authorization: `Bearer ${token}` } });
          setClients((prev) => prev.filter((c) => !c.deleted));
          toast.success('Usuarios eliminados permanentemente.');
        } catch (err) {
          console.error(err);
          toast.error('No se pudo completar la eliminación permanente.');
        } finally {
          setIsPurging(false);
        }
      }
    );
  };

  const yesNo = (msg, onConfirm) => {
    toast.success((t) => (
      <div className="flex items-center gap-3 px-4 py-2">
        <span>{msg}</span>
        <div className="flex gap-2">
          <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="rounded-full bg-[#9a1314] px-4 py-1.5 text-sm font-semibold text-white border-none cursor-pointer">Sí</button>
          <button onClick={() => toast.dismiss(t.id)} className="rounded-full bg-slate-600 px-4 py-1.5 text-sm font-semibold text-white border-none cursor-pointer">No</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const totalActive = clients.filter((c) => !c.deleted).length;
  const totalDeleted = clients.filter((c) => c.deleted).length;
  const filteredCompletedWorkouts = completedDateFilter
    ? completedWorkouts.filter((item) => item.log_date && moment(item.log_date).format('YYYY-MM-DD') === completedDateFilter)
    : completedWorkouts;
  const visibleWorkouts = activeWorkoutTab === 'completed' ? filteredCompletedWorkouts : assignedWorkouts;
  const loadingVisibleWorkouts = activeWorkoutTab === 'completed' ? loadingCompletedWorkouts : loadingAssignedWorkouts;

  const renderWorkoutsList = ({ cardsWrapperClass = 'min-h-0 flex-1 space-y-2 overflow-y-auto pr-2 pb-2 sm:space-y-3 sm:pr-4' } = {}) => (
    <>
      <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-900/80 p-1 sm:mb-4 sm:gap-2" role="tablist" aria-label="Rutinas del cliente">
        <button
          type="button"
          role="tab"
          aria-selected={activeWorkoutTab === 'assigned'}
          onClick={() => setActiveWorkoutTab('assigned')}
          className={`rounded-xl px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:py-2 sm:text-sm ${activeWorkoutTab === 'assigned' ? 'bg-[#f1b80c] text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          Asignadas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeWorkoutTab === 'completed'}
          onClick={() => setActiveWorkoutTab('completed')}
          className={`rounded-xl px-2 py-1.5 text-xs font-semibold transition sm:px-3 sm:py-2 sm:text-sm ${activeWorkoutTab === 'completed' ? 'bg-[#f1b80c] text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          Completadas
        </button>
      </div>
      {activeWorkoutTab === 'completed' && (
        <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block w-full space-y-1 text-xs font-medium text-slate-400 sm:max-w-[220px] sm:space-y-1.5">
            <span className="pl-1">Filtrar por fecha</span>
            <span className="relative block">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                type="date"
                value={completedDateFilter}
                onChange={(e) => setCompletedDateFilter(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                aria-label="Filtrar rutinas completadas por fecha"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/70 py-1.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition hover:border-slate-600 focus:border-[#f1b80c]/70 focus:ring-1 focus:ring-[#f1b80c]/30 sm:py-2"
                style={{ colorScheme: 'dark' }}
              />
            </span>
          </label>
          {completedDateFilter && (
            <button
              type="button"
              onClick={() => setCompletedDateFilter('')}
              className="self-start rounded-xl px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white sm:self-end sm:py-2"
            >
              Limpiar
            </button>
          )}
        </div>
      )}
      {loadingVisibleWorkouts ? (
        <p className="text-slate-400">
          {activeWorkoutTab === 'completed' ? 'Cargando rutinas completadas…' : 'Cargando rutinas asignadas…'}
        </p>
      ) : visibleWorkouts.length === 0 ? (
        <p className="text-slate-400">
          {activeWorkoutTab === 'completed'
            ? 'Este cliente no tiene rutinas completadas aún.'
            : 'Este cliente no tiene rutinas asignadas aún.'}
        </p>
      ) : (
        <div className={cardsWrapperClass}>
          {visibleWorkouts.map((item) => (
            <div
              key={item.id || `${item.client_id}-${item.workout_id}-${item.log_date}`}
              className="group relative flex flex-col gap-2 rounded-xl border border-slate-700 border-l-4 border-l-[#f1b80c] bg-slate-800/70 p-2.5 shadow-lg transition hover:border-slate-600 hover:bg-slate-800 sm:gap-2.5 sm:rounded-2xl sm:p-3.5"
            >
              {/* Header: icon + title + actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-600/20 text-[#f1b80c] sm:h-8 sm:w-8">
                    <FontAwesomeIcon icon={faDumbbell} size="sm" />
                  </span>
                  <h4 className="truncate text-sm font-semibold text-white lg:text-base" title={item.title || item.name || item.workout_name}>
                    {item.title || item.name || item.workout_name || `#${item.workout_id}`}
                  </h4>
                </div>
                {activeWorkoutTab !== 'completed' &&
                <div className="flex shrink-0 items-center gap-1.5">
                  {item.workout_note_id &&
                    <button
                      type='button'
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-800 text-white transition hover:bg-green-400 hover:text-slate-600 ${item.note && !item.status && 'animate-pulseBorder'}`}
                      aria-label="Notas del Cliente"
                      title='Notas del Cliente'
                      onClick={() => handleNoteReview(item.workout_note_id)}
                    >
                      <FontAwesomeIcon icon={faNoteSticky} size='xs' />
                    </button>
                  }
                  <button
                    type="button"
                    onClick={() => handleDeleteAssignedWorkout(item.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 text-white transition hover:bg-red-500"
                    aria-label="Eliminar rutina asignada"
                    title='Eliminar rutina asignada'
                  >
                    <FontAwesomeIcon icon={faTrash} size='xs' />
                  </button>
                </div>
                }
              </div>

              {/* Meta: día / fecha as inline chips */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 sm:gap-x-4 lg:text-sm">
                <span className="inline-flex flex-wrap items-center gap-1">
                  <FontAwesomeIcon icon={faCalendarDays} className="mr-0.5 text-[#f1b80c]" />
                  {item.day_of_week ? (
                    item.day_of_week.split(',').filter(Boolean).map((d) => (
                      <span
                        key={d}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold lg:text-xs ${dayColorMap[d.trim()] || 'bg-slate-600/40 text-slate-300 ring-1 ring-inset ring-slate-500/30'}`}
                      >
                        {translateDay(d.trim())}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faClock} className="text-[#f1b80c]" />
                  {item.log_date ? new Date(item.log_date).toLocaleDateString() : '—'}
                </span>
                {item.status === 1 &&
                  <span className="ml-auto rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400 lg:text-xs">
                    Revisada
                  </span>
                }
              </div>

              {activeWorkoutTab === 'completed' && (
                <details className="group rounded-xl border border-slate-700/80 bg-slate-900/60">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:text-xs [&::-webkit-details-marker]:hidden">
                    <span>Datos Biométricos para la Fecha</span>
                    <FontAwesomeIcon icon={faChevronDown} className="text-slate-500 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="border-t border-slate-700/80 p-3">
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5 lg:text-sm">
                      {[
                        { label: 'Peso', value: item.weight },
                        { label: 'Cadera', value: item.hips },
                        { label: 'Cintura', value: item.waist },
                        { label: 'Piernas', value: item.legs },
                        { label: 'Brazos', value: item.arms },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-lg bg-slate-800/70 px-2 py-1.5">
                          <p className="text-[10px] text-slate-500 lg:text-xs">{metric.label}</p>
                          <p className="font-semibold text-slate-200">{metric.value ?? '—'}</p>
                        </div>
                      ))}
                    </div>
                    {(item.photo_front_url || item.photo_back_url) && (
                      <div className="mt-3 flex gap-2">
                        {item.photo_front_url && (
                          <img
                            src={item.photo_front_url}
                            alt="Foto frontal del progreso"
                            title="Foto frontal"
                            className="h-14 w-14 cursor-pointer rounded-lg object-cover ring-1 ring-slate-600 transition hover:opacity-80"
                            onClick={() => setBioPhotoPreview(item.photo_front_url)}
                          />
                        )}
                        {item.photo_back_url && (
                          <img
                            src={item.photo_back_url}
                            alt="Foto trasera del progreso"
                            title="Foto trasera"
                            className="h-14 w-14 cursor-pointer rounded-lg object-cover ring-1 ring-slate-600 transition hover:opacity-80"
                            onClick={() => setBioPhotoPreview(item.photo_back_url)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Indicaciones del entrenador */}
              <p className="line-clamp-2 rounded-xl bg-slate-900/60 px-3 py-2 text-xs text-slate-300 lg:text-sm" title={item.trainer_notes || ''}>
                <span className="mr-1 font-semibold text-slate-200">Indicaciones:</span>
                {item.trainer_notes || '—'}
              </p>

              {/* Nota del cliente */}
              {item.note &&
                <p className="line-clamp-2 flex items-start gap-1.5 rounded-xl border border-yellow-400/40 bg-yellow-400/5 px-3 py-2 text-xs text-slate-200 lg:text-sm" title={item.note}>
                  <FontAwesomeIcon icon={faCommentDots} className="mt-0.5 shrink-0 text-[#f1b80c]" />
                  <span><span className="mr-1 font-semibold text-white">Cliente:</span>{item.note}</span>
                </p>
              }

              {/* Feedback del entrenador */}
              {item.status === 1 &&
                <p className="line-clamp-2 rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-3 py-2 text-xs text-slate-200 lg:text-sm" title={item.feedback || ''}>
                  <span className="mr-1 font-semibold text-emerald-400">Respuesta:</span>
                  {item.feedback || '—'}
                </p>
              }
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl text-white">Gestión de usuarios</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Crea, modifica o elimina usuarios con nombre, email y estado.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {roleValue === '1' && (
              <button
                onClick={handlePurgeDeleted}
                disabled={isPurging}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-600 bg-red-600/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-600/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPurging ? 'Eliminando...' : '🗑️ Vaciar papelera'}
              </button>
            )}
            <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
              Volver al dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            { label: 'Total', value: clients.length, color: 'text-white' },
            { label: 'Activos', value: totalActive, color: 'text-[#f1b80c]' },
            ...(totalDeleted > 0 ? [{ label: 'Eliminados', value: totalDeleted, color: 'text-red-400' }] : []),
          ].map((s) => (
            <div key={s.label} className="rounded-[32px] border border-slate-800 bg-[#141820] p-5 text-center">
              <p className="text-xs uppercase tracking-widest text-slate-500">{s.label}</p>
              <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table / Cards Container */}
        <section className="overflow-hidden rounded-[40px] border border-slate-800 bg-[#141820]">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="text-xl font-semibold text-white">Lista de usuarios</h2>
            <div className="flex gap-2">
              {roleValue === '1' && (
                <button onClick={handleNewTrainer} disabled={isSubmittingTrainer} className="rounded-full border border-[#f1b80c] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#f1b80c] transition hover:bg-[#f1b80c]/10 disabled:cursor-not-allowed disabled:opacity-60">
                  + Nuevo entrenador
                </button>
              )}
              <button onClick={handleNewClient} disabled={isSubmitting} className="rounded-full bg-[#f1b80c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-60">
                + Nuevo cliente
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {/* <th className="px-6 py-4 font-medium text-slate-400">ID</th> */}
                  <th className="px-6 py-4 font-medium text-slate-400">Foto</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Nombre</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Email</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Teléfono</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Rol</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Estado</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Cuenta</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan="8" className="py-12 text-center text-slate-400">Cargando usuarios…</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan="8" className="py-12 text-center text-slate-400">No hay usuarios aún.</td></tr>
                ) : clients.map((client) => (

                  <tr key={client.id} className={`group transition ${client.deleted ? 'bg-red-950/30' : 'hover:bg-slate-800/40'}`}>
                    {/* <td className="px-6 py-4 text-slate-300">{client.id}</td> */}
                    <td className="px-6 py-4"><img src={client.role != 'admin' ? client.picture || '/images/avatar.png' : '/images/avatar.png'} alt={client.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700" /></td>
                    <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                    <td className="px-6 py-4 text-slate-300">{client.email}</td>
                    <td className="px-6 py-4 text-slate-300">{client.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${(client.role == "client") ? "bg-slate-700" : ""} ${(client.role == "admin") ? "bg-red-700" : ""} ${(client.role == "trainer") ? "bg-blue-700" : ""} text-slate-200`}>
                        {client.role || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getClientStatusLabel(client) === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                        {getClientStatusLabel(client)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{getCuentaLabel(client)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100">
                        {client.deleted == 1 ? (
                          <button
                            onClick={() => yesNo('¿Restaurar este cliente?', () => handleRestore(client.id))}
                            disabled={client.role === 'admin'}
                            className="rounded-full bg-slate-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Restaurar
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => client.role == 'client' ? handleEdit(client) : handleEditTrainer(client)}
                              disabled={client.role === 'admin'}
                              hidden={client.role === 'admin'}
                              className="rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Editar
                            </button>
                            {/* {roleValue === '2' && <button
                              onClick={() => handleRutina(client)}
                              disabled={client.role === 'admin'}
                              className="rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-green-300"
                            >
                              Rutinas
                            </button>} */}
                            {roleValue === '2' && <button
                              onClick={() => handleProgress(client)}
                              disabled={client.role === 'admin'}
                              className="rounded-full bg-blue-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-blue-200"
                            >
                              Progreso y Rutinas
                            </button>}
                            <button
                              onClick={() => yesNo('¿Eliminar este cliente?', () => handleDelete(client.id))}
                              disabled={client.role === 'admin'}
                              hidden={client.role === 'admin'}
                              className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {loading ? (
              <p className="py-12 text-center text-slate-400">Cargando…</p>
            ) : clients.length === 0 ? (
              <p className="py-12 text-center text-slate-400">No hay usuarios aún.</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {clients.map((client) => (
                  <div key={client.id} className={`flex flex-col gap-3 p-5 ${client.deleted ? 'bg-red-950/20' : ''}`}>
                    <div className="flex items-center gap-4">
                      <img src={client.picture || '/images/avatar.png'} alt={client.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700" />
                      <div>
                        <h3 className="font-semibold text-white">{client.name}</h3>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {client.phone && <span>Tel: {client.phone}</span>}
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${(client.role == "client") ? "bg-slate-700" : ""} ${(client.role == "admin") ? "bg-red-700" : ""} ${(client.role == "trainer") ? "bg-blue-700" : ""} text-slate-200`}>
                        {client.role || '—'}
                      </span>
                      <span className={`rounded-full px-3 py-1 ${getClientStatusLabel(client) === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                        {getClientStatusLabel(client)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {client.deleted ? (
                        <button
                          onClick={() => yesNo('¿Restaurar este cliente?', () => handleRestore(client.id))}
                          disabled={client.role === 'admin'}
                          className="flex-1 rounded-full bg-slate-600 py-2.5 text-xs font-semibold text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Restaurar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(client)}
                            className="flex-1 rounded-full bg-[#f1b80c] py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleRutina(client)}
                            disabled={client.role === 'admin'}
                            className="flex-1 rounded-full bg-blue-300 py-2.5 text-xs font-semibold text-slate-950 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Progreso y Rutinas
                          </button>
                          <button
                            onClick={() => yesNo('¿Eliminar este cliente?', () => handleDelete(client.id))}
                            disabled={client.role === 'admin'}
                            className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Assign Workout Modal */}
      <ModalOverlay isOpen={showAssignModal} onClose={closeAssignModal} title={selectedClient ? `Asignar rutina a ${selectedClient.name}` : 'Asignar rutina'}>
        <div className="flex flex-col">
          <div>
            <section id='datos_biometricos' className="mb-4 space-y-4 sm:mb-6 sm:space-y-5">
              {loadingBioData ? (
                <p className="rounded-3xl border border-slate-700 bg-[#0f172a] p-4 text-center text-sm text-slate-400">
                  Cargando datos biométricos…
                </p>
              ) : (
                <>
                  {/* Datos personales */}
                  <details ref={personalDataRef} open className="group overflow-hidden rounded-3xl border border-slate-700 bg-[#0f172a]">
                    <summary className="flex cursor-pointer list-none items-center justify-between border-b border-slate-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f1b80c] [&::-webkit-details-marker]:hidden">
                      <span>Datos personales</span>
                      <FontAwesomeIcon icon={faChevronDown} className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-700/60">
                            <th className="px-4 py-3 font-medium text-slate-400">Nombre</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Edad</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Altura</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Peso</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Días a entrenar</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Objetivo</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{selectedClient?.name || '—'}</td>
                            <td className="px-4 py-3 text-slate-300">{clientProfileData?.age ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-300">{clientProfileData?.height ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-300">{clientProfileData?.initial_weight ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-300">{clientProfileData?.training_days ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-300 capitalize">{clientProfileData?.goal?.toString().replace(/_/g, ' ') || '—'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </details>

                  {/* Historial biométrico */}
                  <details ref={biometricHistoryRef} open className="group overflow-hidden rounded-3xl border border-slate-700 bg-[#0f172a]">
                    <summary className="flex cursor-pointer list-none items-center justify-between border-b border-slate-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f1b80c] [&::-webkit-details-marker]:hidden">
                      <span>Historial biométrico</span>
                      <FontAwesomeIcon icon={faChevronDown} className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="max-h-[320px] overflow-y-auto overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                          <tr className="sticky top-0 z-10 border-b border-slate-700/60 bg-[#0f172a]">
                            <th className="px-4 py-3 font-medium text-slate-400">Fecha</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Peso</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Cintura</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Cadera</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Brazos</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Piernas</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Fotos</th>
                            <th className="px-4 py-3 font-medium text-slate-400">Notas del entrenador</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {clientProgressHistory.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="px-4 py-6 text-center text-slate-400">
                                Este cliente todavía no tiene registros de progreso.
                              </td>
                            </tr>
                          ) : (
                            clientProgressHistory.map((entry) => (
                              <tr key={entry.id} className="hover:bg-slate-800/40">
                                <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                                  {entry.log_date ? moment(entry.log_date).format('DD-MM-YYYY') : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-300">{entry.weight ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-300">{entry.waist ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-300">{entry.hips ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-300">{entry.arms ?? '—'}</td>
                                <td className="px-4 py-3 text-slate-300">{entry.legs ?? '—'}</td>
                                <td className="px-4 py-3">
                                  <div className="flex gap-2">
                                    {entry.photo_front_url ? (
                                      <img
                                        src={entry.photo_front_url}
                                        alt="Foto frontal"
                                        className="h-12 w-12 cursor-pointer rounded-lg object-cover ring-2 ring-slate-700 hover:opacity-80"
                                        onClick={() => setBioPhotoPreview(entry.photo_front_url)}
                                      />
                                    ) : null}
                                    {entry.photo_back_url ? (
                                      <img
                                        src={entry.photo_back_url}
                                        alt="Foto trasera"
                                        className="h-12 w-12 cursor-pointer rounded-lg object-cover ring-2 ring-slate-700 hover:opacity-80"
                                        onClick={() => setBioPhotoPreview(entry.photo_back_url)}
                                      />
                                    ) : null}
                                    {!entry.photo_front_url && !entry.photo_back_url && (
                                      <span className="text-xs text-slate-500">—</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 max-w-xs text-slate-300">{entry.trainer_notes || '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </>
              )}
            </section>
            <details open className="group mb-4 overflow-hidden rounded-2xl border border-slate-700 bg-[#0f172a] sm:mb-6 sm:rounded-3xl">
              <summary className="flex cursor-pointer list-none items-center justify-between border-b border-slate-700 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f1b80c] [&::-webkit-details-marker]:hidden">
                <span>Agregar nueva rutina</span>
                <FontAwesomeIcon icon={faChevronDown} className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <form onSubmit={handleAssignSubmit} className="space-y-4 p-3 sm:space-y-5 sm:p-4">
                <label className="block space-y-2 text-sm text-slate-200">
                Rutina
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                >
                  <option value="" disabled>Selecciona una rutina</option>
                  {loadingTrainerWorkouts ? (
                    <option value="">Cargando rutinas...</option>
                  ) : trainerWorkouts.length === 0 ? (
                    <option value="">No se encontraron rutinas</option>
                  ) : (
                    trainerWorkouts.map((workout) => (
                      <option key={workout.id || workout.workout_id || workout.workoutId} value={workout.id || workout.workout_id || workout.workoutId}>
                        {workout.title + ' (Sets: ' + workout.sets + ' Reps: ' + workout.reps_text + ' ' + workout.client_effort_notes + ')'}
                      </option>
                    ))
                  )}
                </select>
                </label>

                <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Días de la semana</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {dayOptions.map((day) => (
                    <label
                      key={day.key}
                      className={`inline-flex items-center gap-2 rounded-3xl border px-4 py-3 text-sm font-medium transition ${
                        selectedDays[day.key]
                          ? `border-transparent ${dayColorMap[day.key]}`
                          : dayIdleMap[day.key]
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDays[day.key]}
                        onChange={() => handleToggleDay(day.key)}
                        className={`h-4 w-4 rounded border-2 bg-slate-900 focus:ring-2 focus:ring-offset-0 ${dayBorderMap[day.key]} ${dayAccentMap[day.key]}`}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
                </div>

                <label className="block space-y-2 text-sm text-slate-200">
                Notas del entrenador
                <textarea
                  value={trainerNotes}
                  onChange={(e) => setTrainerNotes(e.target.value)}
                  placeholder="Escribe información extra sobre la rutina..."
                  className="min-h-[120px] w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                <button type="submit" disabled={loadingAssign} className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-70">
                  {loadingAssign ? 'Asignando...' : 'Asignar rutina'}
                </button>
                <button type="button" onClick={closeAssignModal} className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
                  Cerrar
                </button>
                </div>
              </form>
            </details>
          </div>

          <div className="flex min-h-0 flex-col rounded-2xl border border-slate-700 bg-[#0f172a] p-3 sm:rounded-3xl sm:p-4 lg:h-[65vh] lg:max-h-[65vh]">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white sm:text-lg">Rutinas asignadas</h3>
                <button
                  type="button"
                  onClick={() => setShowWorkoutsFullModal(true)}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                  aria-label="Ver rutinas en pantalla completa"
                  title="Ver en pantalla completa"
                >
                  <FontAwesomeIcon icon={faExpand} size="xs" />
                </button>
                <span className="hidden text-[11px] text-slate-500 sm:inline">Pantalla completa</span>
              </div>
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
                Total: {visibleWorkouts.length}
              </span>
            </div>
            {renderWorkoutsList()}
          </div>
        </div>
      </ModalOverlay>

      {/* Full-screen Workouts List Modal */}
      <ModalOverlay
        isOpen={showWorkoutsFullModal}
        onClose={() => setShowWorkoutsFullModal(false)}
        title={selectedClient ? `Rutinas de ${selectedClient.name}` : 'Rutinas asignadas'}
        size="full"
      >
        <div className="flex min-h-0 flex-col lg:h-[80vh] lg:max-h-[80vh]">
          {renderWorkoutsList()}
        </div>
      </ModalOverlay>

      {/* Note Review Modal */}
      <ModalOverlay isOpen={showNoteModal} onClose={closeNoteModal} title="Revisar nota">
        <div className="space-y-4">
          {loadingNoteModal ? (
            <p className="text-slate-400">Cargando nota…</p>
          ) : noteModalData ? (
            <>
              {/* Contexto de la rutina */}
              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-600/20 text-[#f1b80c]">
                    <FontAwesomeIcon icon={faDumbbell} size="sm" />
                  </span>
                  <h4 className="truncate text-sm font-semibold text-white">
                    {noteModalData.title || noteModalData.name || noteModalData.workout_name || `#${noteModalData.workout_id || '—'}`}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                  <span className="inline-flex flex-wrap items-center gap-1">
                    <FontAwesomeIcon icon={faCalendarDays} className="mr-0.5 text-[#f1b80c]" />
                    {(noteModalData.day_of_week || noteModalData.days || noteModalData.day) ? (
                      (noteModalData.day_of_week || noteModalData.days || noteModalData.day)
                        .split(',')
                        .filter(Boolean)
                        .map((d) => (
                          <span
                            key={d}
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${dayColorMap[d.trim()] || 'bg-slate-600/40 text-slate-300 ring-1 ring-inset ring-slate-500/30'}`}
                          >
                            {translateDay(d.trim())}
                          </span>
                        ))
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faClock} className="text-[#f1b80c]" />
                    {noteModalData.log_date ? new Date(noteModalData.log_date).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              {/* Nota del cliente (solo lectura) */}
              <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/5 p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <FontAwesomeIcon icon={faCommentDots} className="text-[#f1b80c]" />
                  Nota del cliente
                </p>
                <p className="whitespace-pre-wrap text-sm text-slate-200">
                  {noteModalData.note || noteModalData.notes || 'El cliente no dejó ninguna nota.'}
                </p>
              </div>

              {/* Respuesta del entrenador */}
              <label className="block space-y-2 text-sm text-slate-200">
                <span className="font-semibold text-white">Tu respuesta</span>
                <textarea
                  value={noteFeedback}
                  onChange={(e) => setNoteFeedback(e.target.value)}
                  placeholder="Escribe tu respuesta para el cliente..."
                  className="min-h-[140px] w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={saveNoteFeedback}
                  disabled={savingNoteFeedback}
                  className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {savingNoteFeedback ? 'Guardando...' : 'Guardar respuesta'}
                </button>
                <button
                  type="button"
                  onClick={closeNoteModal}
                  className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <p className="text-slate-400">No hay datos de la nota disponibles.</p>
          )}
        </div>
      </ModalOverlay>

      {/* Edit Client Modal */}
      <ModalOverlay isOpen={showEditModal} onClose={cancelEdit} title="Editar cliente">
        <ClientForm form={form} setForm={setForm} editingId={editingId} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelEdit} onOpenLibrary={openLibraryPicker} isSubmitting={isSubmitting} />
      </ModalOverlay>

      {/* New Client Modal */}
      <ModalOverlay isOpen={showNewModal} onClose={cancelNew} title="Nuevo cliente">
        <ClientForm form={form} setForm={setForm} editingId={null} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelNew} onOpenLibrary={openLibraryPicker} isSubmitting={isSubmitting} />
      </ModalOverlay>

      {/* Edit Trainer Modal (solo Administrador) */}
      <ModalOverlay isOpen={showEditTrainerModal} onClose={cancelEditTrainer} title="Editar Entrenador">
        <TrainerForm form={trainerForm} setForm={setTrainerForm} editingId={editingId} initialForm={initialTrainerForm} onSubmit={handleTrainerSubmit} onCancel={cancelEditTrainer} onOpenLibrary={openTrainerLibraryPicker} isSubmitting={isSubmittingTrainer} />
      </ModalOverlay>

      {/* New Trainer Modal (solo Administrador) */}
      <ModalOverlay isOpen={showNewTrainerModal} onClose={cancelNewTrainer} title="Nuevo entrenador">
        <TrainerForm form={trainerForm} setForm={setTrainerForm} editingId={null} initialForm={initialTrainerForm} onSubmit={handleTrainerSubmit} onCancel={cancelNewTrainer} onOpenLibrary={openTrainerLibraryPicker} isSubmitting={isSubmittingTrainer} />
      </ModalOverlay>

      {/* Trainer Library Modal */}
      {showTrainerLibraryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-6xl">
            <TrainerLibrary isModal selectionMode="single" onSelectMedia={handleSelectTrainerLibraryItem} onClose={closeTrainerLibraryModal} />
          </div>
        </div>
      )}

      {/* Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-6xl">
            <TrainerLibrary isModal selectionMode="single" onSelectMedia={handleSelectLibraryItem} onClose={() => setIsLibraryOpen(false)} />
          </div>
        </div>
      )}

      {/* Biometric photo preview */}
      {bioPhotoPreview && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setBioPhotoPreview(null)}
        >
          <img src={bioPhotoPreview} alt="Foto de progreso" className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
};

export default Clients;
