import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';

const initialForm = {
  title: '',
  text: '',
  image_url: '',
  author: '',
  status: 1
};

const NewsManager = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const trainerId = localStorage.getItem('client_id');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState('image');

  useEffect(() => {
    const fetchNews = async () => {
      if (!trainerId) return;
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no disponible. Inicia sesión.');
        return;
      }

      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/news/list`, config);
        console.log('Noticias cargadas:', res.data);
        const list = res.data?.filas || [];
        setNews(
          list.map((n) => ({
            id: n.id,
            title: n.title,
            text: n.text,
            image_url: n.image_url,
            author: n.author,
            status: n.status,
          }))
        );
      } catch (err) {
        console.error('Error cargando noticias:', err.message);
        // toast.error('No se pudieron cargar las noticias.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [apiUrl, trainerId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

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
    if (!form.author.trim()) {
      toast.error('El autor es obligatorio.');
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
      title: form.title.trim(),
      text: form.text.trim(),
      image_url: form.image_url.trim(),
      author: form.author.trim(),
      status: form.status ? 1 : 0,
    };

    if (editingId) {
      payload.id = editingId;
    }

    const loadingToastId = toast.loading(editingId ? 'Guardando cambios...' : 'Creando noticia...');
    const showSuccessToast = (message) => {
      toast.dismiss(loadingToastId);
      window.setTimeout(() => {
        toast.success(message, { duration: 4000 });
      }, 0);
    };

    try {
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

      if (editingId) {
        await axios.put(`${apiUrl}/news/update`, payload, config);
        setNews((prev) => prev.map((n) => (n.id === editingId ? { ...n, ...payload } : n)));
        showSuccessToast('Noticia actualizada correctamente.');
      } else {
        const res = await axios.post(`${apiUrl}/news/add`, payload, config);
        const saved = res.data?.news || res.data || {};
        setNews((prev) => [
          ...prev,
          {
            id: saved.id || Date.now(),
            ...payload,
          },
        ]);
        showSuccessToast('Noticia creada correctamente.');
      }

      setForm(initialForm);
      setEditingId(null);
    } catch (err) {
      console.error('Error guardando noticia:', err.message || err);
      toast.dismiss(loadingToastId);
      toast.error('No se pudo guardar la noticia.', { duration: 4000 });
    }
  };

  const handleEdit = (item) => {
    console.log(item);
    setForm({
      id: item.id,
      title: item.title,
      text: item.text,
      image_url: item.image_url,
      author: item.author,
      status: item.status,
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token no disponible.');
      return;
    }

    const deletingToastId = toast.loading('Eliminando noticia...');

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`${apiUrl}/news/delete/${id}`, config);
      setNews((prev) => prev.filter((n) => n.id !== id));
      toast.success('Noticia eliminada.', { id: deletingToastId, duration: 4000 });
      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error eliminando noticia:', err.message || err);
      toast.error('No se pudo eliminar la noticia.', { id: deletingToastId, duration: 4000 });
    }
  };

  const previewImage = form.image_url || '';

  const triggerYesNoToast = (handle, ...params) => {
    toast((t) => (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>¿Está seguro que desea eliminar la noticia?</span>
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
            <h1 className="mt-3 text-4xl font-bold text-white">Noticias</h1>
            <p className="mt-2 max-w-2xl text-slate-400">Crea y administra noticias para tus clientes.</p>
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
              <h2 className="text-2xl font-semibold text-white">Lista de noticias</h2>
              <span className="rounded-3xl bg-slate-900/70 px-4 py-2 text-sm text-slate-200">Total: {news.length}</span>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">Cargando noticias...</div>
              ) : news.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">No hay noticias aún.</div>
              ) : null}

              {news.map((n) => (
                <article key={n.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{n.title}</h3>
                      <p className="text-sm text-slate-300">{n.text}</p>
                      <img src={n.image_url} alt="Imagen de la noticia" className="mt-2 h-20 w-auto rounded-2xl object-contain" />
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        {n.author && <span className="rounded-full bg-slate-800 px-3 py-1">Autor: {n.author}</span>}
                        {/* {n.image_url && <span className="rounded-full bg-slate-800 px-3 py-1">Con imagen</span>} */}
                         <span className="rounded-full bg-slate-800 px-3 py-1">{n.status === 1 ? 'Activa':'Inactiva'}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(n)} className="rounded-3xl bg-customYellow text-gray-900 px-4 py-2 text-sm font-semibold">Editar</button>
                      <button onClick={() => triggerYesNoToast(handleDelete, n.id)} className="rounded-3xl bg-gray-600 px-4 py-2 text-sm font-semibold text-gray-200">Eliminar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">{editingId ? 'Editar noticia' : 'Crear noticia'}</h2>
              <p className="text-sm text-slate-400">Rellena los campos y guarda los cambios dentro de esta misma página.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block space-y-2 text-sm text-slate-200">
                <span>Título</span>
                <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="Título de la noticia" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Texto</span>
                <textarea name="text" value={form.text} onChange={handleChange} rows={6} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="Contenido de la noticia" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Autor</span>
                <input name="author" value={form.author} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="Nombre del autor" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Imagen (URL)</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input name="image_url" value={form.image_url} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none" placeholder="https://.../imagen.jpg" />
                  <button type="button" onClick={openLibraryPicker} className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200">Biblioteca</button>
                </div>
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Activa </span>
                <input type="checkbox" name="status" checked={form.status} onChange={handleChange} className="h-5 w-5 rounded border border-slate-700 bg-[#0f172a] text-[#f1b80c] outline-none" />
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <button type="submit" className="rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950">{editingId ? 'Guardar cambios' : 'Crear noticia'}</button>
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
              <TrainerLibrary
                isModal
                selectionMode="single"
                onSelectMedia={handleSelectLibraryItem}
                onClose={() => setIsLibraryOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsManager;