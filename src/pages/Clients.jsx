import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  email: '',
  password: '',
  genre: '',
  phone: '',
  picture: '',
  status: 'Activo',
};

const Clients = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Token no disponible. Inicia sesión.');
          return;
        }

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
            picture: item.picture || '',
            status: item.status || 'Activo',
            role: 'client',
          }))
        );
      } catch (err) {
        console.error('Error fetching clients:', err);
        toast.error('No se pudieron cargar los clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [apiUrl]);

  const title = editingId ? 'Editar cliente' : 'Crear cliente';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('El nombre y el email son obligatorios.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Token no disponible. Inicia sesión nuevamente.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      genre: form.genre.trim(),
      phone: form.phone.trim(),
      picture: form.picture.trim(),
      status: form.status,
      role: 'client',
    };

    if (editingId) {
      // Optimistically update UI
      setClients((previous) =>
        previous.map((client) =>
          client.id === editingId ? { ...client, ...form } : client
        )
      );
      setForm(initialForm);
      setEditingId(null);

      // Make API call for update
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        };
        await axios.put(`${apiUrl}/admin/clients/${editingId}`, payload, config);
        toast.success('Cliente actualizado correctamente.');
      } catch (error) {
        console.error('Error updating client:', error);
        toast.error('No se pudo actualizar el cliente.');
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

      const response = await axios.post(`${apiUrl}/auth/register`, payload, config);
      const savedClient = response.data?.cliente || response.data || {};

      setClients((previous) => [
        ...previous,
        {
          id: savedClient.id || Date.now(),
          name: payload.name,
          email: payload.email,
          password: payload.password,
          genre: payload.genre,
          phone: payload.phone,
          picture: payload.picture,
          status: payload.status,
        },
      ]);

      toast.success('Cliente guardado correctamente.');
      setForm(initialForm);
      setEditingId(null);
    } catch (error) {
      console.error('Error guardando cliente:', error);
      toast.error('No se pudo guardar el cliente. Intenta de nuevo.');
    }
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name,
      email: client.email,
      password: client.password || '',
      genre: client.genre || '',
      phone: client.phone || '',
      picture: client.picture || '',
      status: client.status,
    });
    setEditingId(client.id);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    try {
      await axios.delete(`${apiUrl}/admin/clients/${id}`, { headers });
      toast.success('Cliente eliminado correctamente.');
      setClients((previous) => previous.filter((client) => client.id !== id));
      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      toast.error('No se pudo eliminar el cliente. Intenta de nuevo.');
    }
  };

  const handleCancelEdit = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const triggerYesNoToast = (handle, ...params) => {
    toast((t) => (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>¿Está seguro que desea eliminar el cliente?</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handle(...params);
            }}
            style={{ background: '#9a1314', color: 'white', marginRight: '8px', padding: '8px 16px', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
          >
            Si
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
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
      duration: Infinity,
    });
  };

  const pageTitle = 'Gestión de clientes';

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-3 text-4xl font-bold text-white">{pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Crea, modifica o elimina clientes con nombre, email y estado.
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
                <h2 className="text-2xl font-semibold text-white">Lista de clientes</h2>
                <p className="text-sm text-slate-400">Total registrados: {clients.length}</p>
              </div>
              <span className="rounded-3xl bg-slate-900/70 px-4 py-2 text-sm text-slate-200">
                {editingId ? 'Modo edición' : 'Nuevo cliente'}
              </span>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">
                  Cargando clientes...
                </div>
              ) : clients.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center text-slate-400">
                  No hay clientes aún. Completa el formulario para crear el primero.
                </div>
              ) : null}

              {clients.map((client) => (
                <article key={client.id} className="rounded-3xl border border-slate-700 bg-slate-900/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">{client.name}</h3>
                      <p className="text-sm text-slate-300">{client.email}</p>
                      <p className="text-sm text-slate-300">{client.status}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                        <span
                          className={`rounded-full px-3 py-1 ${
                            client.status === 'Activo'
                              ? 'bg-[#f1b80c]/15 text-[#f1b80c]'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200">
                        Genre: {client.genre || '-'}
                        <br />
                        Phone: {client.phone || '-'}
                        <br />
                        Picture: {client.picture || '-'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(client)}
                        className="rounded-3xl bg-customYellow text-gray-900 px-4 py-2 text-sm font-semibold transition hover:bg-yellow-500 hover:text-black"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerYesNoToast(handleDelete, client.id)}
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
                <span>Nombre</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="Ej. Juan Pérez"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Email</span>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="juan@email.com"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Contraseña</span>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="Escribe la contraseña" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Género</span>
                <input
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="Ej. Masculino, Femenino, Otro" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Teléfono</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  type="tel"
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="Ej. +34 600 000 000" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Foto URL</span>
                <input
                  name="picture"
                  value={form.picture}
                  onChange={handleChange}
                  type="url"
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                  placeholder="https://ejemplo.com/foto.jpg" />
              </label>

              <label className="block space-y-2 text-sm text-slate-200">
                <span>Estado</span>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                >
                  <option value="Activo" className="bg-[#0f172a]">Activo</option>
                  <option value="Inactivo" className="bg-[#0f172a]">Inactivo</option>
                </select>
              </label>

              <div className="grid gap-4 lg:grid-cols-2">
                <button
                  type="submit"
                  className="rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
                >
                  {editingId ? 'Guardar cambios' : 'Crear cliente'}
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
          </section>
        </div>
      </div>
    </div>
  );
};

export default Clients;