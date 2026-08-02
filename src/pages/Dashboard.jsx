import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faHome } from '@fortawesome/free-solid-svg-icons';
import BodySilhouette from '../components/BodySilhouette';
import moment from 'moment';
import FloatingButton from '../components/FloatingButton';
import { Link } from 'react-router-dom';
import ProgressModal from '../components/ProgressModal';
import { yellow } from '@mui/material/colors';
const ROLE_MAP = {
  'admin': 1,
  'trainer': 2,
  'client': 3,
};

const ROLE_MENUS = {
  1: [
    'Perfil de Usuario',
    '👤 Usuarios',
    '💪 Entrenadores',
    '🏋️ Ejercicios',
    '🍎 Recetas',
    '📰 Noticias',
    '⚙️ Ajustes',
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
  const [showProgressModal, setShowProgressModal] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const [status, setStatus] = useState(localStorage.getItem('status'));
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const genre = localStorage.getItem('genre');
  const clientId = localStorage.getItem('client_id');
  const notifications = 4;
  const roleString = Object.entries(ROLE_MAP).find(([key, value]) => value === roleValue)?.[0]?.toUpperCase() || 'CLIENTE';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const [progreso, setProgreso] = useState([{ cadera: 100, cintura: 100, piernas: 60, brazos: 30 }]);
  const [profile, setProfile] = useState({});
  const [previewImage, setPreviewImage] = useState(null);


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
    var redirectPath = null;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };

    checkToken();

    const fetchCounts = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.get(`${apiUrl}/admin/counts`, config).then((response) => {
          if (response.status === 200) {
            setCounts(response.data.counts);
            // console.log(response.data);
          }
        })
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    }

    if (roleString.toLowerCase() === 'client' && status === '0') {
      navigate('/wizard');
    }

    if (roleValue === 1 && redirectPath === null) {
      fetchCounts();
    }

    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        await axios.get(`${apiUrl}/progress/get-profile`, config).then((response) => {
          if (response.status === 200) {
            setProfile(response.data.profile[0]);
          }
        })
      } catch (error) {
        console.error('Error fetchin data: ', error);
      }
    }

    fetchProfile();

    const fetchProgress = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        await axios.get(`${apiUrl}/progress/get/${clientId}`, config).then((response) => {
          if (response.status === 200) {
            setProgreso(response.data.filas);
            console.log(progreso);

          }
        })
      } catch (error) {
        console.error('Error fetchin data: ', error);
      }
    }

    fetchProgress();

  }, [navigate, apiUrl, roleValue, status]);

  const handleLogout = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre'];
    keysToClear.forEach(key => {
      localStorage.removeItem(key);
    });
    navigate('/login');
  };

  const renderSectionContent = () => {
    if (roleValue === 1) {
      return (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
            {[
              { label: 'Entrenadores activos', value: counts.trainers },
              { label: 'Usuarios registrados', value: counts.clients },
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
          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
            <div className="flex items-start justify-between mb-5 lg:flex-row flex-col">
              <div>
                <h2 className="text-xl font-semibold text-white">Progreso corporal</h2>
                <p className="text-sm text-slate-400">Última actualización hace 3 días</p>
              </div>
              <span className="rounded-full bg-[#f1b80c]/15 px-3 py-1 lg:text-sm text-xs text-nowrap text-[#f1b80c] font-semibold">En progreso</span>
            </div>
            <div className="space-y-4">
              <BodySilhouette genre={genre} cadera={Number(progreso[0].hips)} cintura={Number(progreso[0].waist)} piernas={Number(progreso[0].legs)} brazos={Number(progreso[0].arms)} />
              {/* {[
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
              ))} */}
            </div>
          </section>

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
            <h2 className="text-xl font-semibold text-white mb-4">Datos Iniciales</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-medium text-white">Edad</td>
                    <td className="py-3">{profile.age}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-medium text-white">Altura</td>
                    <td className="py-3">{profile.height}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-medium text-white">Peso</td>
                    <td className="py-3">{profile.initial_weight}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-medium text-white">Objetivo</td>
                    <td className="py-3">{profile.goal?.replace('_', ' ').toUpperCase()}</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 font-medium text-white">Dias a Entrenar</td>
                    <td className="py-3">{profile.training_days}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr></hr>
            <div className="flex justify-evenly">
              <h2 className="text-xl font-semibold text-white mb-4 mt-1">Datos Biometricos</h2>
              <div className="text-center">
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="text-nowrap flex items-center gap-2 bg-yellow-100 text-gray-800 lg:px-4 lg:py-2 px-2 py-1 my-2 hover:bg-yellow-400 transition duration-200 rounded-full uppercase lg:text-md text-xs justify-center font-bold"
                >
                  Agregar <FontAwesomeIcon icon={faAdd} />
                </button>
              </div>
            </div>
<div className="max-h-[250px] overflow-y-auto space-y-3 pr-1">
  {progreso.map((item, index) => (
    <div
      key={item.id}
      className={`rounded-xl p-3 border ${
        index === 0
          ? 'bg-yellow-100 text-black border-yellow-500'
          : 'bg-yellow-400 border-slate-800 text-black'
      }`}
    >
      <div className="grid grid-cols-2 gap-2 text-xs">
        <p><span className="font-semibold">Cintura:</span> {item.hips}</p>
        <p><span className="font-semibold">Cadera:</span> {item.waist}</p>
        <p><span className="font-semibold">Brazos:</span> {item.arms}</p>
        <p><span className="font-semibold">Piernas:</span> {item.legs}</p>
        <p className="col-span-2">
          <span className="font-semibold">Fecha:</span> {moment(item.log_date).format('DD-MM-YYYY')}
        </p>
      </div>

      <div className="flex gap-2 mt-2">
        <img
          src={item.photo_front_url}
          className="h-10 rounded-md cursor-pointer hover:opacity-80 transition"
          onClick={() => setPreviewImage(item.photo_front_url)}
        />

        <img
          src={item.photo_back_url}
          className="h-10 rounded-md cursor-pointer hover:opacity-80 transition"
          onClick={() => setPreviewImage(item.photo_back_url)}
        />
      </div>
    </div>
  ))}
</div>

            {previewImage && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setPreviewImage(null)}
              >
                <img
                  src={previewImage}
                  className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
                />
              </div>
            )}

          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
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

          <section className="rounded-3xl bg-[#141820] border border-slate-800 p-6 shadow-xl w-full overflow-hidden">
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
    <>
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
                        if (item.indexOf('Clientes') !== -1 || item.indexOf("Usuarios") !== -1) {
                          navigate('/clients');
                          return;
                        }
                        if (item.indexOf('Entrenadores') !== -1) {
                          navigate('/trainers');
                          return;
                        }
                        if (item.indexOf('Ejercicios') !== -1 || item.indexOf('Ejercicios por Entrenador') !== -1) {
                          navigate('/trainer-exercises');
                          return;
                        }
                        if (item.indexOf('Fotos/Videos') !== -1) {
                          navigate('/trainer-library');
                          return;
                        }
                        if (item.indexOf('Recetas') !== -1 || item.indexOf('Recetas por Entrenador') !== -1) {
                          navigate('/trainer-recipes');
                          return;
                        }
                        if (item.indexOf('Ajustes') !== -1) {
                          navigate('/settings');
                          return;
                        }
                        if (item.indexOf('Noticias') !== -1) {
                          navigate('/news-manager');
                          return;
                        }
                        setSelectedMenu(item);
                      }}
                      className={`w-full rounded-3xl px-4 py-3 text-left text-md font-semibold transition-all ${selectedMenu === item ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
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
                <button
                  onClick={navigate.bind(null, '/')}
                  className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  <FontAwesomeIcon icon={faHome} className='mr-2'></FontAwesomeIcon><span>Página de Inicio</span>
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

            <div className="rounded-[40px] border border-slate-800 bg-[#141820] shadow-2xl">
              {renderSectionContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        clientId={clientId}
        age={profile.age}
        height={profile.height}
        initialWeight={profile.initial_weight}
        goal={profile.goal}
        trainingDays={profile.training_days}
        trainerId={profile.trainer_id}
      />
    </>
  );
};

export default Dashboard;
