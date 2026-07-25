import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';

const initialForm = {
  name: '',
  email: '',
  password: '',
  genre: '',
  phone: '',
  picture: '/images/avatar.png',
  status: 'Activo',
  deleted: 0,
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
const ClientForm = ({ form, setForm, editingId, initialForm, onSubmit, onCancel, onOpenLibrary }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {[
        { label: 'Nombre', name: 'name', type: 'text', placeholder: 'Ej. Juan Pérez' },
        { label: 'Email', name: 'email', type: 'email', placeholder: 'juan@email.com' },
        { label: 'Contraseña', name: 'password', type: 'password', placeholder: '••••••••' },
      ].map(({ label, name, type, placeholder }) => (
        <label key={name} className="block space-y-2 text-sm text-slate-200">
          {label}
          <input
            name={name}
            value={form[name]}
            onChange={handleChange}
            type={type}
            placeholder={placeholder}
            className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
          />
        </label>
      ))}

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
        <>
          <label className="block space-y-2 text-sm text-slate-200">
            Foto
            <input name="picture" value={form.picture} type="url" readOnly placeholder="https://ejemplo.com/foto.jpg" onChange={handleChange} className="hidden w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]" />
            {form.picture && form.picture !== '/images/avatar.png' && <img src={form.picture} alt="preview" className="mt-2 w-full rounded-lg object-cover border border-slate-700" />}
            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onOpenLibrary} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">📚 Biblioteca</button>
              <button type="button" onClick={() => setForm((p) => ({ ...p, picture: initialForm.picture }))} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">🗑️ Limpiar</button>
            </div>
          </label>

          <label className="hidden space-y-2 text-sm text-slate-200">
            Estado
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]">
              <option value="Activo" className="bg-[#0f172a]">Activo</option>
              <option value="Inactivo" className="bg-[#0f172a]">Inactivo</option>
            </select>
          </label>
        </>
      )}

      <div className="grid gap-3 pt-2">
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

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  /* Modal states */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return toast.error('Token no disponible. Inicia sesión.');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/admin/clients`, config);
        const list = res.data?.clientes || res.data || [];
        setClients(
          list.map((item) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            password: item.password || '',
            genre: item.genre || '',
            phone: item.phone || '',
            picture: item.picture || '/images/avatar.png',
            status: item.status,
            deleted: item.deleted || false,
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

  const handleEdit = (client) => {
    setForm({ name: client.name, email: client.email, password: client.password || '', genre: client.genre || '', phone: client.phone || '', picture: client.picture || '/images/avatar.png', status: client.status });
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

    const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password.trim(), genre: form.genre.trim(), phone: form.phone.trim(), picture: form.picture.trim(), status: form.status, role: 'client' };
    const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

    if (editingId) {
      setClients((p) => p.map((c) => c.id === editingId ? { ...c, ...form } : c));
      cancelEdit();
      try {
        await axios.put(`${apiUrl}/admin/user/${editingId}`, payload, config);
        toast.success('Cliente actualizado correctamente.');
      } catch { toast.error('No se pudo actualizar el cliente.'); }
    } else {
      try {
        const res = await axios.post(`${apiUrl}/auth/register`, payload, config);
        const saved = res.data?.cliente || res.data || {};
        setClients((p) => [...p, { id: saved.id || Date.now(), ...payload }]);
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
                  <th className="px-6 py-4 font-medium text-slate-400">Foto</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Nombre</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Email</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Teléfono</th>
                  <th className="px-6 py-4 font-medium text-slate-400">Estado</th>
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
                    <td className="px-6 py-4"><img src={client.picture || '/images/avatar.png'} alt={client.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700" /></td>
                    <td className="px-6 py-4 font-medium text-white">{client.name}</td>
                    <td className="px-6 py-4 text-slate-300">{client.email}</td>
                    <td className="px-6 py-4 text-slate-300">{client.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${client.status === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                        {client.status ?? 'Inicial'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100">
                        {client.deleted ? (
                          <button onClick={() => yesNo('¿Restaurar este cliente?', () => handleRestore(client.id))} className="rounded-full bg-slate-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-500">Restaurar</button>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(client)} className="rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                            <button onClick={() => yesNo('¿Eliminar este cliente?', () => handleDelete(client.id))} className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
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
                      <span className={`rounded-full px-3 py-1 ${client.status === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                        {client.status ?? 'Inicial'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {client.deleted ? (
                        <button onClick={() => yesNo('¿Restaurar este cliente?', () => handleRestore(client.id))} className="flex-1 rounded-full bg-slate-600 py-2.5 text-xs font-semibold text-white hover:bg-slate-500">Restaurar</button>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(client)} className="flex-1 rounded-full bg-[#f1b80c] py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                          <button onClick={() => yesNo('¿Eliminar este cliente?', () => handleDelete(client.id))} className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
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
