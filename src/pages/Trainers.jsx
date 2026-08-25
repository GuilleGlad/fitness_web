import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';

const initialTrainerForm = {
    name: '',
    email: '',
    password: '',
    role: 'Trainer',
    genre: '',
    phone: '',
    picture: '/images/avatar.png',
    status: 'Activo',
    deleted: 0,
};

/* ───────── Modal Wrapper ───────── */
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

/* ───────── Trainer Form Component (Adaptado a la especificación) ───────── */
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


            <label className="hidden *:block space-y-2 text-sm text-slate-200">
                Estado
                <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]">
                    <option value="1" className="bg-[#0f172a]">Activo</option>
                    <option value="0" className="bg-[#0f172a]">Inactivo</option>
                </select>
            </label>


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
const Trainers = () => {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL || '';

    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(initialTrainerForm);
    const [editingId, setEditingId] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [libraryCallback, setLibraryCallback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTrainers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return toast.error('Token no disponible. Inicia sesión.');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`${apiUrl}/admin/trainers`, config);
                const list = res.data?.entrenadores || [];
                setTrainers(
                    list.map((item) => ({
                        id: item.id,
                        name: item.name || '',
                        email: item.email || '',
                        password: item.password || '',
                        role: item.role || 'Trainer',
                        genre: item.genre || '',
                        phone: item.phone || '',
                        picture: item.picture || '/images/avatar.png',
                        status: item.status || 'Activo',
                        deleted: item.deleted || 0,
                    }))
                );
            } catch (err) {
                console.error('Error fetching trainers:', err);
                toast.error('No se pudieron cargar los entrenadores.');
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, [apiUrl]);

    const handleEdit = (trainer) => {
        setForm({
            name: trainer.name,
            email: trainer.email,
            password: trainer.password || '',
            role: 'Trainer',
            genre: trainer.genre || '',
            phone: trainer.phone || '',
            picture: trainer.picture || '/images/avatar.png',
            status: trainer.status,
        });
        setEditingId(trainer.id);
        setShowEditModal(true);
    };

    const handleNewTrainer = () => {
        setForm(initialTrainerForm);
        setEditingId(null);
        setShowNewModal(true);
    };

    const cancelEdit = () => {
        setForm(initialTrainerForm);
        setEditingId(null);
        setShowEditModal(false);
    };

    const cancelNew = () => {
        setForm(initialTrainerForm);
        setEditingId(null);
        setShowNewModal(false);
    };

    // Library picker handlers
    const openLibraryPicker = (callback) => {
        setLibraryCallback(() => callback);
        setShowLibraryModal(true);
    };

    const closeLibraryModal = () => {
        setShowLibraryModal(false);
        setLibraryCallback(null);
    };

    const handleSelectLibraryItem = (media) => {
        if (libraryCallback && media.length > 0) {
            setForm((prev) => ({ ...prev, picture: media[0].url }));
            libraryCallback(media[0].url);
        }
        closeLibraryModal();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Evita doble registro/actualización si se hace doble click
        // en "Crear entrenador" / "Guardar cambios".
        if (isSubmitting) return;

        if (!form.name.trim() || !form.email.trim()) return toast.error('Nombre y email son obligatorios.');

        const token = localStorage.getItem('token');
        if (!token) return toast.error('Token no disponible.');

        // Solo incluir password si se escribió o estamos creando
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password || (editingId ? null : undefined),
            role: 'Trainer',
            genre: form.genre.trim(),
            phone: form.phone.trim(),
            picture: form.picture.trim(),
            status: form.status,
        };

        const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

        setIsSubmitting(true);

        if (editingId) {
            setTrainers((p) => p.map((t) => t.id === editingId ? { ...t, ...form } : t));
            cancelEdit();
            try {
                await axios.put(`${apiUrl}/admin/user/${editingId}`, payload, config);
                toast.success('Entrenador actualizado correctamente.');
            } catch { toast.error('No se pudo actualizar el entrenador.'); }
            finally { setIsSubmitting(false); }
        } else {
            if (!payload.password) {
                setIsSubmitting(false);
                return toast.error('La contraseña es obligatoria para crear un entrenador.');
            }
            try {
                const res = await axios.post(`${apiUrl}/auth/register`, payload, config);
                const saved = res.data?.trainer || res.data || {};
                setTrainers((p) => [...p, { id: saved.user.id || Date.now(), ...payload }]);
                toast.success('Entrenador guardado correctamente.');
                cancelNew();
            } catch (err) {
                console.error(err);
                toast.error('No se pudo guardar el entrenador. Verifique los datos.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${apiUrl}/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setTrainers((p) => p.map((c) => c.id === id ? { ...c, deleted: 1 } : c));
            toast.success('Entrenador eliminado correctamente.');
        } catch { toast.error('No se pudo eliminar el entrenador.'); }
    };
    const handleRestore = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${apiUrl}/admin/user-restore/${id}`, null, { headers: { Authorization: `Bearer ${token}` } });
            setTrainers((p) => p.map((c) => c.id === id ? { ...c, deleted: 0 } : c));
            toast.success('Entrenador restaurado correctamente.');
        } catch { toast.error('No se pudo restaurar el entrenador.'); }
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

    const totalActive = trainers.filter((t) => t.status === 'Activo').length;
    const totalInactive = trainers.filter((t) => t.status !== 'Activo').length;

    return (
        <div className="min-h-screen bg-[#0d1117] text-white">
            <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Admin</p>
                        <h1 className="mt-3 text-3xl font-bold md:text-4xl text-white">Gestión de entrenadores</h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-400">Crea, modifica o elimina entrenadores con credenciales y datos personales.</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
                        Volver al dashboard
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {[
                        { label: 'Total entrenadores', value: trainers.length, color: 'text-white' },
                        { label: 'Activos', value: totalActive, color: 'text-[#f1b80c]' },
                        ...(totalInactive > 0 ? [{ label: 'Inactivos', value: totalInactive, color: 'text-red-400' }] : []),
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
                        <h2 className="text-xl font-semibold text-white">Lista de entrenadores</h2>
                        <button onClick={handleNewTrainer} disabled={isSubmitting} className="rounded-full bg-[#f1b80c] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-60">
                            + Nuevo entrenador
                        </button>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-700/60">
                                    <th className="px-6 py-4 font-medium text-slate-400">Nombre</th>
                                    <th className="px-6 py-4 font-medium text-slate-400">Email</th>
                                    <th className="px-6 py-4 font-medium text-slate-400">Género</th>
                                    <th className="px-6 py-4 font-medium text-slate-400">Teléfono</th>
                                    <th className="px-6 py-4 font-medium text-slate-400">Estado</th>
                                    <th className="px-6 py-4 font-medium text-slate-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {loading ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-slate-400">Cargando entrenadores…</td></tr>
                                ) : trainers.length === 0 ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-slate-400">No hay entrenadores aún.</td></tr>
                                ) : trainers.map((trainer) => (
                                    <tr key={trainer.id} className={`group transition ${trainer.deleted ? 'bg-red-950/30' : 'hover:bg-slate-800/40'}`}>
                                        <td className="px-6 py-4"><img src={trainer.picture || '/images/avatar.png'} alt={trainer.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-700" /></td>
                                        <td className="px-6 py-4 font-medium text-white">{trainer.name}</td>
                                        <td className="px-6 py-4 text-slate-300">{trainer.email}</td>
                                        <td className="px-6 py-4 text-slate-300">{trainer.genre ? (trainer.genre === 'm' ? 'Masc.' : trainer.genre === 'f' ? 'Fem.' : 'N/D') : '—'}</td>
                                        <td className="px-6 py-4 text-slate-300">{trainer.phone || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${trainer.status === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                                                {trainer.deleted ? 'Inactivo' : 'Activo'}
                                                
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 opacity-70 group-hover:opacity-100">
                                                {trainer.deleted ? (
                                                    <button onClick={() => yesNo('¿Restaurar este entrenador?', () => handleRestore(trainer.id))} className="rounded-full bg-slate-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-500">Restaurar</button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEdit(trainer)} className="rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                                                        <button onClick={() => yesNo('¿Eliminar este entrenador?', () => handleDelete(trainer.id))} className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
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
                        ) : trainers.length === 0 ? (
                            <p className="py-12 text-center text-slate-400">No hay entrenadores aún.</p>
                        ) : (
                            <div className="divide-y divide-slate-800/50">
                                {trainers.map((trainer) => (
                                    <div key={trainer.id} className="flex flex-col gap-3 p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{trainer.name}</h3>
                                                <p className="text-sm text-slate-400">{trainer.email}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${trainer.status === 'Activo' ? 'bg-[#f1b80c]/15 text-orange-400' : 'bg-red-500/15 text-yellow-400'}`}>
                                                {trainer.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                                            <span>{trainer.genre ? (trainer.genre === 'm' ? 'Masculino' : trainer.genre === 'f' ? 'Femenino' : 'Prefiere no decirlo') : 'N/D'}</span>
                                            <span>Tel: {trainer.phone || '—'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(trainer)} className="flex-1 rounded-full bg-[#f1b80c] py-2.5 text-xs font-semibold text-slate-950 hover:bg-[#d69e2e]">Editar</button>
                                            <button onClick={() => yesNo('¿Eliminar este entrenador?', () => handleDelete(trainer.id))} className="flex-1 rounded-full bg-red-600 py-2.5 text-xs font-semibold text-white hover:bg-red-500">Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Edit Modal */}
            <ModalOverlay isOpen={showEditModal} onClose={cancelEdit} title="Editar entrenador">
                <TrainerForm form={form} setForm={setForm} editingId={editingId} initialForm={initialTrainerForm} onSubmit={handleSubmit} onCancel={cancelEdit} onOpenLibrary={openLibraryPicker} isSubmitting={isSubmitting} />
            </ModalOverlay>

            {/* New Trainer Modal */}
            <ModalOverlay isOpen={showNewModal} onClose={cancelNew} title="Nuevo entrenador">
                <TrainerForm form={form} setForm={setForm} editingId={null} initialForm={initialTrainerForm} onSubmit={handleSubmit} onCancel={cancelNew} onOpenLibrary={openLibraryPicker} isSubmitting={isSubmitting} />
            </ModalOverlay>

            {/* Library Modal */}
            {showLibraryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-6xl">
                        <TrainerLibrary isModal selectionMode="single" onSelectMedia={handleSelectLibraryItem} onClose={closeLibraryModal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trainers;
