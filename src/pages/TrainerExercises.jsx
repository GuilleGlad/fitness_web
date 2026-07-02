import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';


const initialForm = {
  title: '',
  description: '',
  photoUrl: '',
  videoUrl: '',
};

const TrainerExercises = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const trainerId = localStorage.getItem('client_id');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
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
          }))
        );
      } catch (err) {
        setFetchError('No se pudieron cargar los ejercicios.');
        console.log('No se pudieron cargar los ejercicios. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [apiUrl, trainerId]);

  const title = editingId ? 'Editar ejercicio' : 'Crear ejercicio';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
    };

    if (editingId) {
      setExercises((previous) =>
        previous.map((exercise) =>
          exercise.id === editingId ? { ...exercise, ...form } : exercise
        )
      );
      setForm(initialForm);
      setEditingId(null);
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
          id: savedExercise.id || Date.now(),
          title: payload.title,
          description: payload.description,
          photoUrl: payload.photo_url,
          videoUrl: payload.video_url,
        },
      ]);

      toast.success('Ejercicio guardado correctamente.');
      setForm(initialForm);
      setEditingId(null);
    } catch (error) {
      console.error('Error guardando ejercicio:', error);
      toast.error('No se pudo guardar el ejercicio. Intenta de nuevo.');
    }
  };

  const handleEdit = (exercise) => {
    setForm({
      title: exercise.title,
      description: exercise.description,
      photoUrl: exercise.photoUrl,
      videoUrl: exercise.videoUrl,
    });
    setEditingId(exercise.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    try {
      const response = await axios.delete(apiUrl + "/exercises/delete/" + id, { headers });
      toast.success('Ejercicio eliminado correctamente.');
      setExercises((previous) => previous.filter((exercise) => exercise.id !== id));
      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error eliminando ejercicio:', error);
      toast.error('No se pudo eliminar el ejercicio. Intenta de nuevo.');
      return;
    }
  };

  const handleCancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const openLibraryPicker = (target) => {
    setLibraryTarget(target);
    setIsLibraryOpen(true);
  };

  const handleSelectLibraryItem = (url, mediaType) => {
    if (libraryTarget === 'photo' && mediaType !== 'image') {
      toast.error('Selecciona una imagen para la foto.');
      return;
    }

    if (libraryTarget === 'video' && mediaType !== 'video') {
      toast.error('Selecciona un video para el campo de video.');
      return;
    }

    setForm((previous) => ({
      ...previous,
      [libraryTarget === 'photo' ? 'photoUrl' : 'videoUrl']: url,
    }));
    setIsLibraryOpen(false);
  };

  const previewPhoto = form.photoUrl || '';
  const previewVideo = form.videoUrl || '';

  const pageTitle = 'Gestión de ejercicios';

  const triggerYesNoToast = (handle, ...params) => {
    toast((t) => (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>¿Está seguro que desea eliminar el ejercicio?</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id); // Closes the toast
              handle(...params);
            }}
            style={{ background: '#9a1314', color: 'white', marginRight: '8px', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
          >
            Si
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id); // Closes the toast
            }}
            style={{ background: '#c8cfd5', color: '#242526', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
          >
            No
          </button>
        </div>
      </div>
    ), {
      style: {
        background: '#323',

      },
      duration: Infinity, // Prevents the toast from auto-closing before selection
    });
  };


  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Toaster
        toastOptions={{
          style: {
            color: 'white',
            background: 'green'
          },
          success: {
            icon: '👍',
          },
          error: {
            icon: '👎',
            background: 'red',
          }
        }
        } />
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trainer</p>
            <h1 className="mt-3 text-4xl font-bold text-white">{pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Crea, modifica o elimina ejercicios con título, descripción, foto y video.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
          >
            Volver al dashboard
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <section className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Lista de ejercicios</h2>
                <p className="text-sm text-slate-400">Total registrados: {exercisesCount}</p>
              </div>
              <span className="rounded-3xl bg-slate-900/70 px-4 py-2 text-sm text-slate-200">
                {editingId ? 'Modo edición' : 'Nuevo ejercicio'}
              </span>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">
                  Cargando ejercicios...
                </div>
              ) : exercises.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">
                  No hay ejercicios aún. Completa el formulario para crear el primero.
                </div>
              ) : null}

              {exercises.map((exercise) => (
                <article key={exercise.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{exercise.title}</h3>
                      <p className="text-sm text-slate-300">{exercise.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        {exercise.photoUrl && <span className="rounded-full bg-slate-800 px-3 py-1">Foto</span>}
                        {exercise.videoUrl && <span className="rounded-full bg-slate-800 px-3 py-1">Video</span>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(exercise)}
                        className="rounded-3xl bg-customYellow text-gray-900 px-4 py-2 text-sm font-semibold transition hover:bg-yellow-500 hover:text-black"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerYesNoToast(handleDelete, exercise.id)}
                        className="rounded-3xl bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
              <p className="text-sm text-slate-400">Rellena los campos y guarda los cambios dentro de esta misma página.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  rows={4}
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="Escribe los detalles del ejercicio..."
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Foto (URL)</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    name="photoUrl"
                    value={form.photoUrl}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                    placeholder="https://.../foto.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => openLibraryPicker('photo')}
                    className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Biblioteca
                  </button>
                </div>
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Video (URL)</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    name="videoUrl"
                    value={form.videoUrl}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                    placeholder="https://.../video.mp4"
                  />
                  <button
                    type="button"
                    onClick={() => openLibraryPicker('video')}
                    className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Biblioteca
                  </button>
                </div>
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <button
                  type="submit"
                  className="rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
                >
                  {editingId ? 'Guardar cambios' : 'Crear ejercicio'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-slate-200">Vista previa</p>
              <div className="mt-4 grid gap-4">
                {!previewVideo && !previewPhoto ? (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/10 p-6 text-center text-sm text-slate-500">
                    Añade la URL de un video/imagen para ver las vistas previa.
                  </div>
                ) : (
                  previewVideo || previewPhoto ? (
                    <>
                      {previewPhoto &&  
                        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-[#0f172a]">
                          <img src={previewPhoto} alt="Previsualización" className="h-56 w-full object-cover" />
                        </div>
                      }
                      {previewVideo &&
                        <div className="rounded-3xl overflow-hidden border border-slate-800 bg-[#0f172a]">
                          <video controls className="h-56 w-full bg-black">
                            <source src={previewVideo} />
                            Tu navegador no soporta la reproducción de video.
                          </video>
                        </div>
                      }
                    </>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/10 p-6 text-center text-sm text-slate-500">
                      Añade la URL de un video para ver la vista previa.
                    </div>
                  )
                )
                }

              </div>
            </div>
          </section>
        </div>
      </div>

      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-6xl">
            <TrainerLibrary
              isModal
              onSelectMedia={handleSelectLibraryItem}
              onClose={() => setIsLibraryOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerExercises;
