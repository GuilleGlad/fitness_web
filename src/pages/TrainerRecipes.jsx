import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';


const initialForm = {
  trainer_id: '',
  title: '',
  ingredients: '',
  instructions: '',
  image_url: '',
  is_public: false,
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
const RecipeForm = ({ form, setForm, editingId, initialForm, onSubmit, onCancel, onOpenLibrary }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
          placeholder="Título de la receta"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Ingredientes</span>
        <textarea
          name="ingredients"
          value={form.ingredients}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
          placeholder="Lista de ingredientes"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Instrucciones</span>
        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          rows={6}
          className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
          placeholder="Pasos de la receta"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Imagen (URL)</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
            placeholder="https://.../imagen.jpg"
          />
          <button
            type="button"
            onClick={onOpenLibrary}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            📚 Biblioteca
          </button>
        </div>
      </label>

      <label className="flex items-center gap-3 text-sm text-slate-200">
        <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} className="h-4 w-4 rounded border-slate-700 bg-[#0f172a] text-[#f1b80c] focus:ring-[#f1b80c]" />
        <span>Activa</span>
      </label>

      <div className="grid gap-3 pt-2">
        <button type="submit" className="rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
          {editingId ? 'Guardar cambios' : 'Crear receta'}
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
const TrainerRecipes = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const trainerId = localStorage.getItem('client_id');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  /* Modal states */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
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
        toast.error('No se pudieron cargar las recetas.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [apiUrl, trainerId]);

  const openLibraryPicker = () => {
    setLibraryTarget('image');
    setIsLibraryOpen(true);
  };

  const handleSelectLibraryItem = (payload) => {
    const selectedItems = Array.isArray(payload) ? payload : [payload];
    const validItems = selectedItems.filter(Boolean);
    const invalidItem = validItems.find((item) => item.mediaType !== 'image');

    if (invalidItem) {
      toast.error('Selecciona una imagen.');
      return;
    }

    const urls = validItems.map((item) => item.url).filter(Boolean);
    if (urls.length === 0) {
      toast.error('No se seleccionó ningún elemento válido.');
      return;
    }

    setForm((prev) => ({ ...prev, image_url: urls.join('\n') }));
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

    if (editingId) {
      setRecipes((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...payload, is_public: payload.is_public === '1' } : r)));
      cancelEdit();
      try {
        const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
        await axios.put(`${apiUrl}/recipes/update`, payload, config);
        toast.success('Receta actualizada correctamente.');
      } catch {
        toast.error('No se pudo actualizar la receta.');
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

      toast.success('Receta creada correctamente.');
      cancelNew();
    } catch (err) {
      console.error('Error guardando receta:', err.message || err);
      toast.error('No se pudo guardar la receta.');
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
    setShowEditModal(true);
  };

  const handleNewRecipe = () => { setForm(initialForm); setEditingId(null); setShowNewModal(true); };
  const cancelEdit = () => { setForm(initialForm); setEditingId(null); setShowEditModal(false); };
  const cancelNew = () => { setForm(initialForm); setEditingId(null); setShowNewModal(false); };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token no disponible.');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`${apiUrl}/recipes/delete/${id}`, config);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Receta eliminada.');
      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error eliminando receta:', err.message || err);
      toast.error('No se pudo eliminar la receta.');
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

  const previewImage = form.image_url || '';

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Trainer</p>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl text-white">Recetas</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">Crea y administra recetas para tus clientes.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
            Volver al dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            { label: 'Total', value: recipes.length, color: 'text-white' },
            { label: 'Activas', value: recipes.filter(r => r.is_public).length, color: 'text-[#f1b80c]' },
            { label: 'Inactivas', value: recipes.filter(r => !r.is_public).length, color: 'text-red-400' },
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
            <h2 className="text-xl font-semibold text-white">Lista de recetas</h2>
            <button onClick={handleNewRecipe} className="rounded-full bg-[#f1b80c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
              + Nueva receta
            </button>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="px-6 py-4 font-medium text-slate-400">Imagen</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Título</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Ingredientes</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Estado</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">Cargando recetas…</td></tr>
                ) : recipes.length === 0 ? (
                  <tr><td colSpan="5" className="py-12 text-center text-slate-400">No hay recetas aún.</td></tr>
                ) : recipes.map((r) => (
                  <tr key={r.id} className="group transition hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.title} className="h-12 w-12 rounded-lg object-cover ring-2 ring-slate-700" />
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{r.title}</td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.ingredients}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${r.is_public ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {r.is_public ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100">
                        <button onClick={() => handleEdit(r)} className="rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                        <button onClick={() => yesNo('¿Eliminar esta receta?', () => handleDelete(r.id))} className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
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
            ) : recipes.length === 0 ? (
              <p className="py-12 text-center text-slate-400">No hay recetas aún.</p>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {recipes.map((r) => (
                  <div key={r.id} className="flex flex-col gap-3 p-5">
                    <div className="flex items-start gap-4">
                      {r.image_url && (
                        <img src={r.image_url} alt={r.title} className="h-16 w-16 rounded-lg object-cover ring-2 ring-slate-700 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{r.title}</h3>
                        <p className="text-sm text-slate-300 truncate">{r.ingredients}</p>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-400">
                          <span className={`rounded-full px-3 py-1 ${r.is_public ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {r.is_public ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(r)} className="flex-1 rounded-full bg-[#f1b80c] py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                      <button onClick={() => yesNo('¿Eliminar esta receta?', () => handleDelete(r.id))} className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      <ModalOverlay isOpen={showEditModal} onClose={cancelEdit} title="Editar receta">
        <RecipeForm form={form} setForm={setForm} editingId={editingId} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelEdit} onOpenLibrary={openLibraryPicker} />
      </ModalOverlay>

      {/* New Recipe Modal */}
      <ModalOverlay isOpen={showNewModal} onClose={cancelNew} title="Nueva receta">
        <RecipeForm form={form} setForm={setForm} editingId={null} initialForm={initialForm} onSubmit={handleSubmit} onCancel={cancelNew} onOpenLibrary={openLibraryPicker} />
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

export default TrainerRecipes;