import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faNoteSticky, faTrash } from '@fortawesome/free-solid-svg-icons';
import { verifyToken } from '../utils/tokenUtils';
import { getClientStatusLabel, getCuentaLabel, normalizeClientRow, normalizeStatusCode } from '../utils/clientUtils';

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
const ModalOverlay = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[32px] border border-slate-700 bg-[#141820] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-[#141820] px-6 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white" aria-label="Cerrar modal">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ───────── Form Component (receives setForm via props) ───────── */
const ClientForm = ({ form, setForm, editingId, initialForm, onSubmit, onCancel, onOpenLibrary }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} >

      {editingId && (
        <label className="space-y-2 text-sm text-slate-200 flex flex-col items-center">
          {form.picture && form.picture === '/images/avatar.png' &&<img src={form.picture} className='mt-2 w-full rounded-[50%] lg:w-1/4 object-cover border border-slate-700'/>}
          <input name="picture" value={form.picture} type="url" readOnly placeholder="https://ejemplo.com/foto.jpg" onChange={handleChange} className="hidden w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
          {form.picture && form.picture !== '/images/avatar.png' && <img src={form.picture} alt="preview" className="mt-2 w-full rounded-[50%] lg:w-1/4 object-cover border border-slate-700" />}
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
        <button type="submit" className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
          {editingId ? 'Guardar cambios' : 'Crear cliente'}
        </button>
        {editingId && (
          <button type="button" onClick={onCancel} className="rounded-full bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
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
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [trainerWorkouts, setTrainerWorkouts] = useState([]);
  const [assignedWorkouts, setAssignedWorkouts] = useState([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState('');
  const [selectedDays, setSelectedDays] = useState({ L: false, M: false, X: false, J: false, V: false, S: false, D: false });
  const [trainerNotes, setTrainerNotes] = useState('');
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [loadingAssignedWorkouts, setLoadingAssignedWorkouts] = useState(false);
  const [loadingTrainerWorkouts, setLoadingTrainerWorkouts] = useState(false);
  const [trainerId, setTrainerId] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteModalData, setNoteModalData] = useState(null);
  const [noteFeedback, setNoteFeedback] = useState('');
  const [loadingNoteModal, setLoadingNoteModal] = useState(false);
  const [savingNoteFeedback, setSavingNoteFeedback] = useState(false);

  const dayOptions = [
    { key: 'L', label: 'Lunes' },
    { key: 'M', label: 'Martes' },
    { key: 'X', label: 'Miércoles' },
    { key: 'J', label: 'Jueves' },
    { key: 'V', label: 'Viernes' },
    { key: 'S', label: 'Sábado' },
    { key: 'D', label: 'Domingo' },
  ];

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

  const handleOpenAssignModal = async (client) => {
    setShowAssignModal(true);
    setSelectedClient(client);
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
      (item) => item.workout_note_id === workoutNoteId || item.id === workoutNoteId
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
      const updated = response.data?.note || response.data || { feedback: payload.feedback };

      setAssignedWorkouts((prev) =>
        prev.map((item) =>
          item.workout_note_id === noteId || item.id === noteId
            ? { ...item, feedback: updated.feedback || payload.feedback }
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
      const payload = {
        client_id: selectedClient.id,
        workout_id: Number(selectedWorkoutId),
        day_of_week: dayString,
        trainer_notes: trainerNotes.trim(),
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
            password: item.password || '',
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
      password: client.password || '',
      genre: client.genre || '',
      phone: client.phone || '',
      picture: client.picture || '/images/avatar.png',
      status: normalizeStatusCode(client.status),
      status_cuenta: Number(client.deleted ?? client.status_cuenta ?? 0) === 0 ? 1 : 0,
    });
    setEditingId(client.id);
    setShowEditModal(true);
  };

  const handleNewClient = () => { setForm(initialForm); setEditingId(null); setShowNewModal(true); };
  const cancelEdit = () => { setForm(initialForm); setEditingId(null); setShowEditModal(false); };
  const cancelNew = () => { setForm(initialForm); setEditingId(null); setShowNewModal(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    if (editingId) {
      setClients((p) => p.map((c) => c.id === editingId ? normalizeClientRow({ ...c, ...form }) : c));
      cancelEdit();
      try {
        await axios.put(`${apiUrl}/admin/user/${editingId}`, payload, config);
        toast.success('Cliente actualizado correctamente.');
      } catch { toast.error('No se pudo actualizar el cliente.'); }
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

  const yesNo = (msg, onConfirm) => {
    toast((t) => (
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
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
            Volver al dashboard
          </button>
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
            <button onClick={handleNewClient} className="rounded-full bg-[#f1b80c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
              + Nuevo cliente
            </button>
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
                  <th className="px-6 py-4 font-medium text-slate-400">Estado</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Cuenta</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400">Cargando usuarios…</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan="6" className="py-12 text-center text-slate-400">No hay usuarios aún.</td></tr>
                ) : clients.map((client) => (
                  
                    <tr key={client.id} className={`group transition ${client.deleted ? 'bg-red-950/30' : 'hover:bg-slate-800/40'}`}>
                    {/* <td className="px-6 py-4 text-slate-300">{client.id}</td> */}
                    <td className="px-6 py-4"><img src={client.role != 'admin' ? client.picture || '/images/avatar.png' : '/images/avatar.png'} alt={client.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700" /></td>
                    <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                    <td className="px-6 py-4 text-slate-300">{client.email}</td>
                    <td className="px-6 py-4 text-slate-300">{client.phone || '—'}</td>
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
                            onClick={() => yesNo('¿Restaurar este cliente?', () => handleRestore(client.user_id))}
                            disabled={client.role === 'admin'}
                            className="rounded-full bg-slate-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Restaurar
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(client)}
                              disabled={client.role === 'admin'}
                              hidden={client.role === 'admin'}
                              className="rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Editar
                            </button>
                            {roleValue === '2' && <button
                              onClick={() => handleRutina(client)}
                              disabled={client.role === 'admin'}
                              className="rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-green-300"
                            >
                              Rutinas
                            </button>}
                            {roleValue === '2' && <button
                              onClick={() => handleProgress(client)}
                              disabled={client.role === 'admin'}
                              className="rounded-full bg-blue-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-blue-200"
                            >
                              Progreso
                            </button>}
                            <button
                              onClick={() => yesNo('¿Eliminar este cliente?', () => handleDelete(client.user_id))}
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
                  <div key={client.user_id} className={`flex flex-col gap-3 p-5 ${client.deleted ? 'bg-red-950/20' : ''}`}>
                    <div className="flex items-center gap-4">
                      <img src={client.picture || '/images/avatar.png'} alt={client.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-700" />
                      <div>
                        <h3 className="font-semibold text-white">{client.name}</h3>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {client.phone && <span>Tel: {client.phone}</span>}
                      <span className={`rounded-full px-3 py-1 ${getClientStatusLabel(client) === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                        {getClientStatusLabel(client)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {client.deleted ? (
                        <button
                          onClick={() => yesNo('¿Restaurar este cliente?', () => handleRestore(client.user_id))}
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
                            className="flex-1 rounded-full bg-green-400 py-2.5 text-xs font-semibold text-slate-950 hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Asignar rutina
                          </button>
                          <button
                            onClick={() => yesNo('¿Eliminar este cliente?', () => handleDelete(client.user_id))}
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
            <form onSubmit={handleAssignSubmit} className="space-y-5">
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
                    <label key={day.key} className="inline-flex items-center gap-2 rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-slate-200 transition hover:border-[#f1b80c]">
                      <input
                        type="checkbox"
                        checked={selectedDays[day.key]}
                        onChange={() => handleToggleDay(day.key)}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-[#f1b80c] focus:ring-[#f1b80c]"
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
          </div>

          <div className="rounded-3xl border border-slate-700 bg-[#0f172a] p-4 lg:max-h-[65vh] lg:overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Rutinas asignadas</h3>
              {/* <span className="text-sm text-slate-400">Cliente: {selectedClient?.name || '—'}</span> */}
              <span className="text-sm text-slate-400">Total: {assignedWorkouts.length}</span>
            </div>
            {loadingAssignedWorkouts ? (
              <p className="text-slate-400">Cargando rutinas asignadas…</p>
            ) : assignedWorkouts.length === 0 ? (
              <p className="text-slate-400">Este cliente no tiene rutinas asignadas aún.</p>
            ) : (
              <div className="grid gap-4 overflow-y-auto pr-1 lg:max-h-[56vh]">
                {assignedWorkouts.map((item) => (
                  <div key={item.id || `${item.client_id}-${item.workout_id}-${item.log_date}`} className="rounded-3xl border border-yellow-400 bg-slate-800 p-4 shadow-xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-yellow-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">Rutina</span>
                          <h4 className="text-base font-semibold text-white">{item.title || item.name || item.workout_name || `#${item.workout_id}`}</h4>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-800 bg-slate-600 p-3 text-sm text-slate-300">
                            <p className="font-semibold text-white">Días</p>
                            <p>{translateDay(item.day_of_week) || '—'}</p>
                          </div>
                          <div className="rounded-2xl border border-slate-800 bg-slate-600 p-3 text-sm text-slate-300">
                            <p className="font-semibold text-white">Creado</p>
                            <p>{item.log_date ? new Date(item.log_date).toLocaleDateString() : '—'}</p>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-600 p-3 text-sm text-slate-300">
                          <p className="font-semibold text-white">Indicaciones del entrenador</p>
                          <p>{item.trainer_notes || '—'}</p>
                        </div>
                        {item.note &&
                          <div className="rounded-2xl border border-yellow-400 bg-slate-600 p-3 text-sm text-slate-300">
                            <p className="font-semibold text-white">Notas del Cliente</p>
                            <p>{item.note || '—'}</p>
                          </div>
                        }
                        {item.status === 1 &&
                          <div className="text-right rounded-2xl border border-yellow-400 bg-slate-800 p-3 text-sm text-white">
                            <p className="font-semibold text-yellow-400">Notas del Entrenador</p>
                            <p>{item.feedback || '—'}</p>
                          </div>
                        }
                      </div>
                      <div className="flex items-start justify-end gap-2">
                        {item.workout_note_id &&
                          <button
                            type='button'
                            className={`inline-flex items-center justify-center rounded-full bg-green-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-400 hover:text-slate-600 ${item.note && !item.status && 'animate-pulseBorder'}`}
                            aria-label="Notas del Cliente"
                            title='Notas del Cliente'
                            onClick={() => handleNoteReview(item.workout_note_id)}
                          >
                            <FontAwesomeIcon icon={faNoteSticky} size='2x'></FontAwesomeIcon>
                          </button>
                        }
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignedWorkout(item.id)}
                          className="inline-flex items-center justify-center rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
                          aria-label="Eliminar rutina asignada"
                          title='Eliminar rutina asignada'
                        >
                          <FontAwesomeIcon icon={faTrash} size='2x'></FontAwesomeIcon>'
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalOverlay>

      {/* Note Review Modal */}
      <ModalOverlay isOpen={showNoteModal} onClose={closeNoteModal} title="Revisar nota">
        <div className="space-y-5">
          {loadingNoteModal ? (
            <p className="text-slate-400">Cargando nota…</p>
          ) : noteModalData ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">ID de nota</p>
                  <p>{noteModalData.workout_note_id || noteModalData.id || '—'}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">ID cliente</p>
                  <p>{noteModalData.client_id || '—'}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Rutina</p>
                  <p>{noteModalData.title || noteModalData.name || noteModalData.workout_name || `#${noteModalData.workout_id || '—'}`}</p>
                </div>
                <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Fecha</p>
                  <p>{noteModalData.log_date ? new Date(noteModalData.log_date).toLocaleString() : '—'}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
                <p className="font-semibold text-white">Días</p>
                <p>{translateDay(noteModalData.day_of_week || noteModalData.days || noteModalData.day || '') || '—'}</p>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-200">
                <p className="font-semibold text-white">Instrucciones del entrenador</p>
                <p>{noteModalData.trainer_notes || noteModalData.trainer_notes_text || '—'}</p>
              </div>

              <label className="block space-y-2 text-sm text-slate-200">
                Nota
                <textarea
                  value={noteModalData.note || noteModalData.notes || ''}
                  readOnly
                  placeholder="No hay nota disponible"
                  className="min-h-[120px] w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-slate-300 outline-none transition focus:border-[#f1b80c]"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                Feedback
                <textarea
                  value={noteFeedback}
                  onChange={(e) => setNoteFeedback(e.target.value)}
                  placeholder="Escribe el feedback del cliente..."
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
                  {savingNoteFeedback ? 'Guardando...' : 'Guardar feedback'}
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

      {/* Edit Modal */}
      <ModalOverlay isOpen={showEditModal} onClose={cancelEdit} title="Editar cliente">
        <ClientForm form={form} setForm={setForm} editingId={editingId} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelEdit} onOpenLibrary={openLibraryPicker} />
      </ModalOverlay>

      {/* New Client Modal */}
      <ModalOverlay isOpen={showNewModal} onClose={cancelNew} title="Nuevo cliente">
        <ClientForm form={form} setForm={setForm} editingId={null} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelNew} onOpenLibrary={openLibraryPicker} />
      </ModalOverlay>

      {/* Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-6xl">
            <TrainerLibrary isModal selectionMode="single" onSelectMedia={handleSelectLibraryItem} onClose={() => setIsLibraryOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
