import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ROLE_MAP = {
  'admin': 1,
  'trainer': 2,
  'client': 3,
};

const ROLE_MENUS = {
  1: [
    'Perfil de Usuario',
    'Clientes',
    'Entrenadores',
    'Ejercicios',
    'Recetas',
    'Noticias',
    'Ajustes',
  ],
  2: [
    'Perfil de Usuario',
    'Clientes',
    'Ejercicios',
    'Fotos/Videos',
    'Recetas',
    'Pagos',
    'Ajustes',
  ],
  3: [
    'Perfil de Usuario',
    'Rutinas',
    'Recetas',
    'Pagos',
    'Ajustes',
  ],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('Perfil de Usuario');
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const notifications = 4;
  const roleString = Object.entries(ROLE_MAP).find(([key, value]) => value === roleValue)?.[0]?.toUpperCase() || 'CLIENTE';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const [counts, setCounts] = useState({
    trainers: 0,
    clients: 0,
    recipes: 0,
    ads: 0,
    news: 0,
  });
  const initials = useMemo(() => {
    return userName
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userName]);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      try{
      axios.get(`${apiUrl}/auth/check-token`, config).then((response) => {
        console.log(response);
        if (response.status !== 200) {
          navigate('/login');
        }
      }).catch((error) => {
        navigate('/login');
      })
      }catch(error){
        navigate('/login');
      }
    }
    verifyToken();

  const fetchCounts = async () => {
    try{
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios.get(`${apiUrl}/admin/counts`, config).then((response) => {
        if (response.status === 200) {
          setCounts(response.data.counts);
          console.log(response.data);
        }
      })
    }catch(error){
      console.error('Error fetching counts:', error);
    }
  }

  fetchCounts();

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('client_id');
    navigate('/login');
  };

  const renderSectionContent = () => {
    if (roleValue === 1) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            {[
              { label: 'Entrenadores activos', value: counts.trainers },
              { label: 'Clientes registrados', value: counts.clients },
              { label: 'Recetas publicadas', value: counts.recipes },
              { label: 'Anuncios activos', value: counts.ads },
            ].map((card) => (
              <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
                <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-1">
            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Actividad reciente</h2>
              <div className="space-y-3 text-slate-300">
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="font-semibold text-white">Nuevo entrenador aprobado</p>
                  <p className="text-sm">María López se unió como trainer hace 2 horas.</p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="font-semibold text-white">Cliente nuevo en plan premium</p>
                  <p className="text-sm">Sergio creó una suscripción de 12 semanas.</p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="font-semibold text-white">Receta destacada</p>
                  <p className="text-sm">Nueva receta de batidos cargada por trainer Ana.</p>
                </div>
              </div>
            </section>
          </div>
        </>
      );
    }

    if (roleValue === 2) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            {[
              { label: 'Clientes activos', value: 18 },
              { label: 'Rutinas publicadas', value: 42 },
              { label: 'Recetas disponibles', value: 16 },
              { label: 'Pagos pendientes', value: 3 },
            ].map((card) => (
              <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
                <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Resumen semanal</h2>
              <ul className="space-y-3 text-slate-300">
                <li className="rounded-2xl bg-slate-900/70 p-4">
                  <strong>Clientes con rutina nueva:</strong> 8
                </li>
                <li className="rounded-2xl bg-slate-900/70 p-4">
                  <strong>Sesiones programadas:</strong> 12 esta semana
                </li>
                <li className="rounded-2xl bg-slate-900/70 p-4">
                  <strong>Pagos recibidos:</strong> 5 / 8 completados
                </li>
              </ul>
            </section>

            <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">Clientes destacados</h2>
              <div className="space-y-3 text-slate-300">
                {[
                  { name: 'Camila R.', status: '4 entrenos/sem' },
                  { name: 'Diego M.', status: 'En crecimiento muscular' },
                  { name: 'Valeria G.', status: 'Preparación para maratón' },
                ].map((client) => (
                  <div key={client.name} className="rounded-2xl bg-slate-900/70 p-4">
                    <p className="text-white font-semibold">{client.name}</p>
                    <p className="text-sm">{client.status}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
          {[
            { label: 'Progreso general', value: '74%' },
            { label: 'Rutinas activas', value: 5 },
            { label: 'Recetas favoritas', value: 12 },
            { label: 'Pagos próximos', value: 1 },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl bg-[#141820] border border-slate-800 p-5 shadow-xl">
              <p className="text-sm text-slate-400 uppercase tracking-[0.25em]">{card.label}</p>
              <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2 mb-6">
          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-white">Progreso corporal</h2>
                <p className="text-sm text-slate-400">Última actualización hace 3 días</p>
              </div>
              <span className="rounded-full bg-[#f1b80c]/15 px-3 py-1 text-sm text-[#f1b80c] font-semibold">En progreso</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'IMC', value: '23.5', percent: 75 },
                { label: 'Grasa corporal', value: '18%', percent: 60 },
                { label: 'Masa muscular', value: '42%', percent: 86 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>{item.label}</span>
                    <span className="font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full rounded-full bg-[#f1b80c]" style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Datos biométricos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <tbody>
                  {[
                    { label: 'Altura', value: '175 cm' },
                    { label: 'Peso', value: '72 kg' },
                    { label: 'Cintura', value: '78 cm' },
                    { label: 'Cadera', value: '96 cm' },
                  ].map((item) => (
                    <tr key={item.label} className="border-b border-slate-800">
                      <td className="py-3 font-medium text-white">{item.label}</td>
                      <td className="py-3">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Rutinas</h2>
            <div className="space-y-3 text-slate-300">
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="font-semibold text-white">Full Body</p>
                <p className="text-sm">4 días / semana · Fuerza y movilidad</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="font-semibold text-white">Cardio ligero</p>
                <p className="text-sm">3 días / semana · Recuperación</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Recetas</h2>
            <div className="space-y-3 text-slate-300">
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="font-semibold text-white">Smoothie Energético</p>
                <p className="text-sm">Proteínas, banana y espinaca.</p>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-4">
                <p className="font-semibold text-white">Cena ligera</p>
                <p className="text-sm">Salmón al horno con quinoa.</p>
              </div>
            </div>
          </section>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-[#141820] lg:w-[320px] lg:min-h-screen lg:border-r lg:border-b-0">
          <div className="flex h-full flex-col justify-between p-6">
            <div>
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#f1b80c] to-[#d97706] text-xl font-bold text-slate-950 shadow-xl shadow-[#f1b80c]/20">
                {initials}
              </div>
              <div className="mt-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Bienvenido</p>
                <h1 className="mt-3 text-2xl font-bold text-white">{userName}</h1>
                <p className="mt-1 text-sm text-slate-400">{roleString}</p>
              </div>

              <div className="mt-8 space-y-2">
                {menuLinks.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === 'Ejercicios' || item === 'Ejercicios por Entrenador') {
                        navigate('/trainer-exercises');
                        return;
                      }
                      if (item === 'Fotos/Videos') {
                        navigate('/trainer-library');
                        return;
                      }
if (item === 'Recetas' || item === 'Recetas por Entrenador') {
                        navigate('/trainer-recipes');
                        return;
                      }
                      if (item === 'Ajustes') {
                        navigate('/settings');
                        return;
                      }
                      if (item === 'Noticias') {
                        navigate('/news-manager');
                        return;
                      }
                      setSelectedMenu(item);
                    }}
                    className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition-all ${selectedMenu === item ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-[#0d1117] p-6 lg:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Panel</p>
              <h2 className="mt-3 text-3xl font-bold text-white">{selectedMenu}</h2>
              <p className="mt-2 text-slate-400">Contenido personalizado para tu rol de {roleString}.</p>
            </div>

            {(roleValue === 2 || roleValue === 3) && (
              <div className="inline-flex items-center gap-4 rounded-3xl bg-[#141820] border border-slate-800 p-4 shadow-xl">
                <div className="rounded-2xl bg-slate-900/80 p-3 text-[#f1b80c]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 2a7 7 0 0 0-7 7v2.585l-.707.707A1 1 0 0 0 4 14h16a1 1 0 0 0 .707-1.707L19 11.585V9a7 7 0 0 0-7-7zm0 20a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Notificaciones</p>
                  <p className="text-2xl font-bold text-white">{notifications}</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            {renderSectionContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
