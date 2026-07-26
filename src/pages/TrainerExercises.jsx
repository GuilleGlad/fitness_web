import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';


const initialForm = {
  title: '',
  description: '',
  photoUrl: '',
  videoUrl: '',
  publico: 0,
};

/* ───────── Reusable Modal Wrapper ───────── */
const ModalOverlay = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[32px] border border-slate-700 bg-[#141820] shadow-2xl"
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
const ExerciseForm = ({ form, setForm, editingId, initialForm, onSubmit, onCancel, onOpenLibrary, libraryTarget }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-2 text-sm text-slate-200">
        <span>Título</span>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
          placeholder="Ej. Sentadilla con barra"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Descripción</span>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={10}
          className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
          placeholder="Escribe los detalles del ejercicio..."
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2 text-sm text-slate-200">
          <span className='mr-2'>Foto</span>
          {
          form.photoUrl && <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="photoUrl"
              value={form.photoUrl}
              onChange={handleChange}
              className="hidden w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
              placeholder="https://.../foto.jpg"
            />
            <img src={form.photoUrl} className='w-full'/>
          </div>
          }
          <div className="block space-y-2 text-sm text-slate-200">
            <button
              type="button"
              onClick={() => onOpenLibrary('photo')}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              📚 Biblioteca
            </button>      
            <button 
              type="button" 
              onClick={() => setForm((p) => ({ ...p, photoUrl: initialForm.photoUrl }))} 
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">
                🗑️ Limpiar
            </button>  
          </div>
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span className='mr-2'>Video</span>
          {
          form.videoUrl != "" && <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
              className="hidden w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
              placeholder="https://.../video.mp4"
            />
            <video key={form.videoUrl} name="videoEjercicio" src={form.videoUrl} className="mt-4 w-auto rounded-2xl object-contain " autoPlay loop muted playsInline/>
          </div>
          }
          <div className="block space-y-2 text-sm text-slate-200">
            <button
              type="button"
              onClick={() => onOpenLibrary('video')}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              📚 Biblioteca
            </button>
            <button 
              type="button" 
              onClick={() => setForm((p) => ({ ...p, videoUrl: initialForm.videoUrl }))}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">
                🗑️ Limpiar
            </button>                  
          </div>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Público</span>
        <select
          name="publico"
          value={form.publico}
          onChange={handleChange}
          className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
        >
          <option value="1" className="bg-[#0f172a]">En Pagina Principal</option>
          <option value="0" className="bg-[#0f172a]">Solo a los Clientes</option>
        </select>
      </label>

      <div className="grid gap-3 pt-2">
        <button type="submit" className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
          {editingId ? 'Guardar cambios' : 'Crear ejercicio'}
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
const TrainerExercises = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const trainerId = localStorage.getItem('client_id');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  /* Modal states */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState('photo');

  const exercisesCount = exercises.length;

  useEffect(() => {
    const fetchExercises = async () => {
      if (!trainerId) return;

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no disponible. Inicia sesión.');
        return;
      }

      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/exercises/list/${trainerId}`, config);
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
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error('No se pudieron cargar los ejercicios.');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [apiUrl, trainerId]);

  const openLibraryPicker = (target) => {
    setLibraryTarget(target);
    setIsLibraryOpen(true);
  };

  const handleSelectLibraryItem = (payload) => {
    const selectedItems = Array.isArray(payload) ? payload : [payload];
    const validItems = selectedItems.filter(Boolean);

    if (libraryTarget === 'photo') {
      const invalidItem = validItems.find((item) => item.mediaType !== 'image');
      if (invalidItem) {
        toast.error('Selecciona una imagen para la foto.');
        return;
      }
    }

    if (libraryTarget === 'video') {
      const invalidItem = validItems.find((item) => item.mediaType !== 'video');
      if (invalidItem) {
        toast.error('Selecciona un video para el campo de video.');
        return;
      }
    }

    const urls = validItems.map((item) => item.url).filter(Boolean);
    if (urls.length === 0) {
      toast.error('No se seleccionó ningún elemento válido.');
      return;
    }

    setForm((previous) => ({
      ...previous,
      [libraryTarget === 'photo' ? 'photoUrl' : 'videoUrl']: urls.join('\n'),
    }));
    setIsLibraryOpen(false);
  };

  const handleEdit = (exercise) => {
    setForm({
      title: exercise.title,
      description: exercise.description,
      photoUrl: exercise.photoUrl,
      videoUrl: exercise.videoUrl,
      publico: exercise.publico,
    });
    setEditingId(exercise.id);
    setShowEditModal(true);
  };

  const handleNewExercise = () => { 
    setForm(initialForm); 
    setEditingId(null); 
    setShowNewModal(true); 
  };

  const cancelEdit = () => { 
    setForm(initialForm); 
    setEditingId(null); 
    setShowEditModal(false); 
  };

  const cancelNew = () => { 
    setForm(initialForm); 
    setEditingId(null); 
    setShowNewModal(false); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('El título y la descripción son obligatorios.');
      return;
    }

    if (!trainerId) {
      toast.error('No se encontró el ID del trainer. Vuelve a iniciar sesión.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token no disponible. Inicia sesión nuevamente.');
      return;
    }

    const payload = {
      trainer_id: trainerId,
      title: form.title.trim(),
      description: form.description.trim(),
      photo_url: form.photoUrl.trim(),
      video_url: form.videoUrl.trim(),
      publico: form.publico,
    };

    if (editingId) {
      setExercises((previous) =>
        previous.map((exercise) =>
          exercise.id === editingId ? { ...exercise, ...form, publico: Number(form.publico) } : exercise
        )
      );
      cancelEdit();
      try {
        await axios.put(`${apiUrl}/exercises/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        toast.success('Ejercicio actualizado correctamente.');
      } catch {
        toast.error('No se pudo actualizar el ejercicio.');
      }
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(`${apiUrl}/exercises/add`, payload, config);
      const savedExercise = response.data?.exercise || response.data || {};

      setExercises((previous) => [
        ...previous,
        {
          id: savedExercise.insert_id || Date.now(),
          title: payload.title,
          description: payload.description,
          photoUrl: payload.photo_url,
          videoUrl: payload.video_url,
          publico: Number(payload.publico)
        },
      ]);

      toast.success('Ejercicio guardado correctamente.');
      cancelNew();
    } catch (error) {
      console.error('Error guardando ejercicio:', error);
      toast.error('No se pudo guardar el ejercicio. Intenta de nuevo.');
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${apiUrl}/exercises/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setExercises((previous) => previous.filter((exercise) => exercise.id !== id));
      toast.success('Ejercicio eliminado correctamente.');
    } catch (error) {
      console.error('Error eliminando ejercicio:', error);
      toast.error('No se pudo eliminar el ejercicio. Intenta de nuevo.');
    }
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

  const pageTitle = 'Gestión de ejercicios';

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trainer</p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl text-white">{pageTitle}</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Crea, modifica o elimina ejercicios con título, descripción, foto y video.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
            Volver al dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            { label: 'Total', value: exercisesCount, color: 'text-white' },
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
            <h2 className="text-xl font-semibold text-white">Lista de ejercicios</h2>
            <button onClick={handleNewExercise} className="rounded-full bg-[#f1b80c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
              + Nuevo ejercicio
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="px-6 py-4 font-medium text-slate-400">Foto</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Título</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Descripción</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Video</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Público</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">Cargando ejercicios…</td></tr>
                ) : exercises.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">No hay ejercicios aún.</td></tr>
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100">
                        <button onClick={() => handleEdit(exercise)} className="rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                        <button onClick={() => yesNo('¿Eliminar este ejercicio?', () => handleDelete(exercise.id))} className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
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
            ) : exercises.length === 0 ? (
              <p className="py-12 text-center text-slate-400">No hay ejercicios aún.</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="flex flex-col gap-3 p-5">
                    <div className="flex items-start gap-4">
                      {exercise.photoUrl && (
                        <img src={exercise.photoUrl} alt={exercise.title} className="h-16 w-16 rounded-lg object-cover ring-2 ring-slate-700 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{exercise.title}</h3>
                        <p className="text-sm text-slate-300 truncate">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-400">
                          {exercise.photoUrl && <span className="rounded-full bg-slate-800 px-3 py-1">Foto</span>}
                          {exercise.videoUrl && <span className="rounded-full bg-slate-800 px-3 py-1">Video</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(exercise)} className="flex-1 rounded-full bg-[#f1b80c] py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                      <button onClick={() => yesNo('¿Eliminar este ejercicio?', () => handleDelete(exercise.id))} className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      <ModalOverlay isOpen={showEditModal} onClose={cancelEdit} title="Editar ejercicio">
        <ExerciseForm form={form} setForm={setForm} editingId={editingId} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelEdit} onOpenLibrary={openLibraryPicker} libraryTarget={libraryTarget} />
      </ModalOverlay>

      {/* New Exercise Modal */}
      <ModalOverlay isOpen={showNewModal} onClose={cancelNew} title="Nuevo ejercicio">
        <ExerciseForm form={form} setForm={setForm} editingId={null} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelNew} onOpenLibrary={openLibraryPicker} libraryTarget={libraryTarget} />
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

export default TrainerExercises;