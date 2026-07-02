import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';

const initialForm = {
  trainer_id: '',
  title: '',
  ingredients: '',
  instructions: '',
  image_url: '',
  is_public: false,
};

const TrainerRecipes = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const trainerId = localStorage.getItem('client_id');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState('image');

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!trainerId) return;
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no disponible. Inicia sesión.');
        return;
      }

      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/recipes/list`, config);
        const list = res.data?.filas || [];
        setRecipes(
          list.map((r) => ({
            id: r.id,
            trainer_id: r.trainer_id,
            title: r.title,
            ingredients: r.ingredients,
            instructions: r.instructions,
            image_url: r.image_url,
            is_public: !!r.is_public,
          }))
        );
      } catch (err) {
        console.error('Error cargando recetas:', err.message);
        // toast.error('No se pudieron cargar las recetas.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [apiUrl, trainerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openLibraryPicker = () => {
    setLibraryTarget('image');
    setIsLibraryOpen(true);
  };

  const handleSelectLibraryItem = (url, mediaType) => {
    if (mediaType !== 'image') {
      toast.error('Selecciona una imagen.');
      return;
    }
    setForm((prev) => ({ ...prev, image_url: url }));
    setIsLibraryOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('El título es obligatorio.');
      return;
    }
    if (!trainerId) {
      toast.error('Id del Entrenador no disponible.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token no disponible. Inicia sesión nuevamente.');
      return;
    }

    const payload = {
      trainer_id: form.trainer_id || trainerId,
      title: form.title.trim(),
      ingredients: form.ingredients.trim(),
      instructions: form.instructions.trim(),
      image_url: form.image_url.trim(),
      is_public: form.is_public ? '1' : '0',
    };

    if (editingId) {
      payload.id = editingId;
    }

    const loadingToastId = toast.loading(editingId ? 'Guardando cambios...' : 'Creando receta...');
    const showSuccessToast = (message) => {
      toast.dismiss(loadingToastId);
      window.setTimeout(() => {
        toast.success(message, { duration: 4000 });
      }, 0);
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

      if (editingId) {
        await axios.put(`${apiUrl}/recipes/update`, payload, config);
        setRecipes((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload, is_public: payload.is_public === '1' } : r)));
        showSuccessToast('Receta actualizada correctamente.');
      } else {
        const res = await axios.post(`${apiUrl}/recipes/add`, payload, config);
        const saved = res.data?.recipe || res.data || {};
        setRecipes((prev) => [
          ...prev,
          {
            id: saved.id || Date.now(),
            ...payload,
            is_public: payload.is_public === '1',
          },
        ]);
        showSuccessToast('Receta creada correctamente.');
      }

      setForm(initialForm);
      setEditingId(null);
    } catch (err) {
      console.error('Error guardando receta:', err.message || err);
      toast.dismiss(loadingToastId);
      toast.error('No se pudo guardar la receta.', { duration: 4000 });
    }
  };

  const handleEdit = (recipe) => {
    setForm({
      trainer_id: recipe.trainer_id,
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image_url: recipe.image_url,
      is_public: !!recipe.is_public,
    });
    setEditingId(recipe.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token no disponible.');
      return;
    }

    const deletingToastId = toast.loading('Eliminando receta...');

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`${apiUrl}/recipes/delete/${id}`, config);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Receta eliminada.', { id: deletingToastId, duration: 4000 });
      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error eliminando receta:', err.message || err);
      toast.error('No se pudo eliminar la receta.', { id: deletingToastId, duration: 4000 });
    }
  };

  const previewImage = form.image_url || '';

  const triggerYesNoToast = (handle, ...params) => {
    toast((t) => (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>¿Está seguro que desea eliminar la receta?</span>
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
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trainer</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Recetas</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Crea y administra recetas para tus clientes.</p>
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
              <h2 className="text-2xl font-semibold text-white">Lista de recetas</h2>
              <span className="rounded-3xl bg-slate-900/70 px-4 py-2 text-sm text-slate-200">Total: {recipes.length}</span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">Cargando recetas...</div>
              ) : recipes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">No hay recetas aún.</div>
              ) : null}

              {recipes.map((r) => (
                <article key={r.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{r.title}</h3>
                      <p className="text-sm text-slate-300">{r.ingredients}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        {r.image_url && <span className="rounded-full bg-slate-800 px-3 py-1">Con imagen</span>}
                        {r.is_public && <span className="rounded-full bg-slate-800 px-3 py-1">Pública</span>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(r)} className="rounded-3xl bg-customYellow text-gray-900 px-4 py-2 text-sm font-semibold">Editar</button>
                      <button onClick={() => triggerYesNoToast(handleDelete, r.id)} className="rounded-3xl bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-200">Eliminar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">{editingId ? 'Editar receta' : 'Crear receta'}</h2>
              <p className="text-sm text-slate-400">Rellena los campos y guarda los cambios dentro de esta misma página.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Título</span>
                <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="Título de la receta" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Ingredientes</span>
                <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={4} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="Lista de ingredientes" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Instrucciones</span>
                <textarea name="instructions" value={form.instructions} onChange={handleChange} rows={6} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="Pasos de la receta" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Imagen (URL)</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="https://.../imagen.jpg" />
                  <button type="button" onClick={openLibraryPicker} className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200">Biblioteca</button>
                </div>
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} className="h-4 w-4" />
                <span>Es pública</span>
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <button type="submit" className="rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950">{editingId ? 'Guardar cambios' : 'Crear receta'}</button>
                {editingId && <button type="button" onClick={() => { setForm(initialForm); setEditingId(null); }} className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Cancelar edición</button>}
              </div>
            </form>

            {previewImage && <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-slate-200">Vista previa</p>
              <div className="mt-4 grid gap-4">
                <div className="rounded-3xl overflow-hidden border border-slate-800 bg-[#0f172a]">
                  <img src={previewImage} alt="Previsualización" className="h-56 w-full object-cover" />
                </div>
              </div>
            </div>
            }
          </section>
        </div>

        {isLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-6xl">
              <TrainerLibrary isModal onSelectMedia={handleSelectLibraryItem} onClose={() => setIsLibraryOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerRecipes;
