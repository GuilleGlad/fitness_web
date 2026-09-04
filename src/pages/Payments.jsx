import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHome, faBars, faTimes, faBell } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import 'moment/locale/es';
import PaymentModal from '../components/PaymentModal';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

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
    'Progreso',
    'Pagos',
  ],
};

const Payments = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const roleValue = parseInt(localStorage.getItem('role'), 10) || 3;
  const userName = localStorage.getItem('name') || 'Usuario EliteFit';
  const clientId = localStorage.getItem('client_id');
  const {
    notifications,
    showNotificationsModal,
    openNotificationsModal,
    closeNotificationsModal,
    markingReadId,
    markingAllRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();
  const roleString = roleValue === 1 ? 'ADMIN' : roleValue === 2 ? 'TRAINER' : 'CLIENT';
  const menuLinks = ROLE_MENUS[roleValue] || ROLE_MENUS[3];
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const [profile, setProfile] = useState({});
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [receiptPreviewImage, setReceiptPreviewImage] = useState(null);

  moment.locale('es');

  const initials = useMemo(() => {
    return userName
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userName]);

  // ✅ Cerrar menú al presionar Escape en móvil
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // ✅ Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const renderStatusBadge = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (!s) return <span className="ml-2 inline-block rounded-full bg-slate-700 text-white px-3 py-1 text-xs font-semibold">—</span>;
    if (s.includes('pend')) return <span className="ml-2 inline-block rounded-full bg-orange-400 text-black px-3 py-1 text-xs font-semibold">{status}</span>;
    if (s.includes('aprob') || s.includes('aprobed') || s.includes('complete') || s.includes('paid') || s.includes('complet')) return <span className="ml-2 inline-block rounded-full bg-green-600 text-white px-3 py-1 text-xs font-semibold">{status}</span>;
    if (s.includes('rech') || s.includes('reject')) return <span className="ml-2 inline-block rounded-full bg-red-600 text-white px-3 py-1 text-xs font-semibold">{status}</span>;
    return <span className="ml-2 inline-block rounded-full bg-slate-700 text-white px-3 py-1 text-xs font-semibold">{status}</span>;
  };

  useEffect(() => {
    var redirectPath = null;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };
    checkToken();

    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        };
        const response = await axios.get(`${apiUrl}/progress/get-profile`, config);
        if (response.status === 200) {
          setProfile(response.data.profile[0]);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchProfile();

    const fetchPayments = async ({ client_id, status = '', payment_method = '', start_date = '', end_date = '', trainer_id } = {}) => {
      setLoadingPayments(true);
      try {
        if (roleValue === 3 && clientId) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              client_id: clientId,
              status,
              payment_method,
              start_date,
              end_date,
              trainer_id
            },
          };
          const response = await axios.get(`${apiUrl}/payments/client/${clientId}`, config);
          if (response.status === 200) {
            const data = response.data.payments || response.data.filas || response.data.data || response.data || [];
            const items = Array.isArray(data) ? data : (Array.isArray(response.data) ? response.data : [data]);
            setPayments(items);
          }
        }
        if (roleValue === 2) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              client_id,
              status,
              payment_method,
              start_date,
              end_date,
              trainer_id
            },
          };
          const response = await axios.get(`${apiUrl}/payments/?trainer_id=${clientId}`, config);
          if (response.status === 200) {
            const data = response.data.payments || response.data.filas || response.data.data || response.data || [];
            const items = Array.isArray(data) ? data : (Array.isArray(response.data) ? response.data : [data]);
            setPayments(items);
          }
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPayments();
  }, [navigate, apiUrl, roleValue, clientId, token, showPaymentModal]);


  // ✅ Navegación del menú lateral (misma lógica que en Dashboard/Routines/Progress)
  const handleMenuNavigation = (item) => {
    if (item.indexOf('Clientes') !== -1 || item.indexOf('Usuarios') !== -1) {
      navigate('/clients'); setMenuOpen(false); return;
    }
    if (item.indexOf('Entrenadores') !== -1) {
      navigate('/trainers'); setMenuOpen(false); return;
    }
    if (item.indexOf('Ejercicios') !== -1) {
      navigate('/trainer-exercises'); setMenuOpen(false); return;
    }
    if (item.indexOf('Fotos/Videos') !== -1) {
      navigate('/trainer-library'); setMenuOpen(false); return;
    }
    if (item.indexOf('Recetas') !== -1) {
      navigate('/trainer-recipes'); setMenuOpen(false); return;
    }
    if (item.indexOf('Ajustes') !== -1) {
      navigate('/settings'); setMenuOpen(false); return;
    }
    if (item.indexOf('Noticias') !== -1) {
      navigate('/news-manager'); setMenuOpen(false); return;
    }
    if (item.indexOf('Perfil de Usuario') !== -1) {
      navigate('/dashboard'); setMenuOpen(false); return;
    }
    if (item.indexOf('Rutinas') !== -1) {
      navigate('/routines'); setMenuOpen(false); return;
    }
    if (item.indexOf('Progreso') !== -1) {
      navigate('/progress'); setMenuOpen(false); return;
    }
    if (item.indexOf('Pagos') !== -1) {
      if (roleValue === 3) {
        // Ya estamos en la página de Pagos del cliente
        setMenuOpen(false); return;
      }
      navigate('/trainer-payments'); setMenuOpen(false); return;
    }
    setMenuOpen(false);
  };

  const handleLogoutWithClose = () => {
    const keysToClear = ['token', 'role', 'name', 'client_id', 'status', 'genre'];
    keysToClear.forEach(key => localStorage.removeItem(key));
    setMenuOpen(false);
    navigate('/login');
  };

  // ✅ Componente reutilizable del panel de navegación (idéntico al de Dashboard/Routines/Progress)
  const SidebarPanel = () => (
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
              onClick={() => handleMenuNavigation(item)}
              className={`w-full rounded-3xl px-4 py-3 text-left text-md font-semibold transition-all ${item === 'Pagos' ? 'bg-[#f1b80c] text-[#1e222b]' : 'bg-slate-900/70 text-slate-200 hover:bg-slate-800'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-3 sticky bottom-0">
        <button
          onClick={handleLogoutWithClose}
          className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          Cerrar sesión
        </button>
        <button
          onClick={() => { setMenuOpen(false); navigate('/'); }}
          className="w-full rounded-3xl bg-[#1f2937] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <FontAwesomeIcon icon={faHome} className='mr-2'></FontAwesomeIcon><span>Página de Inicio</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">

          {/* ====== VISTA ESCRITORIO (≥ lg) — sidebar siempre visible ====== */}
          <aside className="hidden w-full border-b border-slate-800 bg-[#141820] lg:block lg:w-[320px] lg:min-h-screen lg:border-r lg:border-b-0 lg:sticky lg:top-0">
            {SidebarPanel()}
          </aside>

          {/* ====== CONTENIDO PRINCIPAL ====== */}
          <main className="flex-1 bg-[#0d1117] p-3 sm:p-6 lg:p-8">

            {/* ✅ Botón hamburguesa — solo visible en móvil */}
            <div className="mb-4 lg:hidden  top-4 sticky text-right">
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menú"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#141820] text-white shadow-lg transition hover:bg-slate-800 active:scale-95"
              >
                <FontAwesomeIcon icon={faBars} className="text-lg" />
              </button>
            </div>

            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Panel</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:mt-3 sm:text-3xl">Pagos</h2>
              </div>

              <button
                type="button"
                onClick={openNotificationsModal}
                className={`inline-flex items-baseline gap-2 rounded-2xl bg-[#141820] border border-slate-600 p-2.5 shadow-lg transition hover:bg-slate-800 sm:gap-4 sm:rounded-3xl sm:p-4 ${notifications.length > 0 ? "shadow-yellow-400 animate-pulse hover:border-yellow-400" : "animate-none shadow-none"}`}
              >
                <div className="rounded-2xl bg-slate-900/80 text-[#f1b80c]">
                  <FontAwesomeIcon icon={faBell} className='text-lg rounded-[50%]'></FontAwesomeIcon>
                </div>
                <div>
                  <p className="text-lg font-bold text-white sm:text-2xl">{notifications.length}</p>
                </div>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#141820] shadow-2xl p-3 sm:rounded-[40px] sm:p-6 lg:p-8">
              <div className="grid gap-4 xl:grid-cols-1">

                {/* ===== Pagos ===== */}
                {profile.trainer_phone &&
                <p className="text-center mt-3 sm:mt-4 lg:text-3xl text-base sm:text-lg font-bold text-white">Contacto Whatsapp <Link to={`https://wa.me/${profile?.trainer_phone}`} target='_blank' className="text-sm text-green-400 mt-1"><FontAwesomeIcon icon={faWhatsapp} className='text-lg lg:text-3xl'></FontAwesomeIcon></Link></p>
                }
                <section className="rounded-2xl bg-[#141820] border border-slate-800 p-4 shadow-xl w-full overflow-hidden sm:rounded-3xl sm:p-6">
                  <h2 className="text-lg font-semibold text-white mb-3 sm:text-xl sm:mb-4">Pagos</h2>
                  <div className="space-y-3 text-slate-300">
                    <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:gap-3">
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className='bg-yellow-400 hover:bg-yellow-200 text-black rounded-xl px-3 py-1.5 text-sm font-semibold sm:rounded-2xl sm:p-2 sm:text-base'
                      >
                        Registrar Comprobante <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                      </button>
                      <span className="text-xs text-slate-400 sm:ml-2 sm:text-sm">Sube tu comprobante de pago para que tu entrenador pueda revisarlo.</span>
                    </div>
                    <div>
                      {loadingPayments ? (
                        <p className="text-sm text-slate-400">Cargando pagos...</p>
                      ) : payments.length === 0 ? (
                        <p className="text-sm text-slate-400">No se han enviado comprobantes todavía.</p>
                      ) : (
                        <div className="max-h-[600px] overflow-y-auto space-y-3 pr-1">
                          {payments.map((p, idx) => {
                            const dateText = (p.payment_date || p.paymentDate) ? moment(p.payment_date || p.paymentDate).format('DD/MM/YYYY') : '—';
                            const amount = Number(p.amount || p.total || 0).toFixed(2);
                            const method = p.payment_method || p.paymentMethod || '—';
                            const period = p.period_covered || p.period_cover || p.periodCovered || '—';
                            const statusText = p.status || '—';
                            const receiptUrl = p.receipt_image_url || p.receipt_image || p.receiptImageUrl || '';
                            const clientLabel = (p.client_name || p.name) ? `${p.client_name || p.name}` : (p.client_email || p.email || '—');
                            return (
                              <div
                                key={p.id || `${p.client_id || p.clientId}-${idx}`}
                                className='rounded-lg p-2.5 border bg-slate-800 border-yellow-400 text-white sm:rounded-xl sm:p-3'
                              >
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <p><span className="font-semibold">Fecha:</span> {dateText}</p>
                                  <p className="text-right"><span className="font-semibold">Monto:</span> ${amount}</p>
                                  <p><span className="font-semibold">Método:</span> {method}</p>
                                  <p className="text-right"><span className="font-semibold">Periodo:</span> {period}</p>
                                </div>

                                <div className="flex gap-2 mt-3 items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {receiptUrl ? (
                                      <img
                                        src={receiptUrl}
                                        alt="comprobante"
                                        className="h-14 w-20 object-cover rounded-md cursor-pointer hover:opacity-80"
                                        onClick={() => setReceiptPreviewImage(receiptUrl)}
                                      />
                                    ) : (
                                      <div className="h-14 w-20 rounded-md bg-slate-900/50 flex items-center justify-center text-slate-500">—</div>
                                    )}

                                    <div className="text-slate-300 text-sm">
                                      <p className="font-semibold text-white">{clientLabel}</p>
                                      {(p.client_email || p.email) && <p className="text-xs text-gray-400">{p.client_email || p.email}</p>}
                                    </div>
                                  </div>

                                  <div className="text-right text-xs">
                                    <p className="col-span-2"><span className="font-semibold"></span>{renderStatusBadge(statusText)}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {receiptPreviewImage && (
                      <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setReceiptPreviewImage(null)}
                      >
                        <img src={receiptPreviewImage} className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl" />
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </div>
          </main>
        </div>

        {/* ====== VISTA MÓVIL — overlay del menú (solo < lg) ====== */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
            onClick={closeMenu}
          >
            <aside
              className="relative h-full w-[300px] max-w-[85vw] overflow-y-auto bg-[#141820] shadow-2xl transition-transform duration-300 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={closeMenu}
                  aria-label="Cerrar menú"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 shadow transition hover:bg-slate-700 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {SidebarPanel()}
            </aside>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        clientId={clientId}
        trainerId={profile?.trainer_id}
      />

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-4"
          onClick={closeNotificationsModal}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-700 bg-[#141820] p-4 shadow-2xl shadow-black/40 sm:rounded-[32px] sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">Notificaciones</p>
                <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">{notifications.length} sin leer</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsAsRead}
                    disabled={markingAllRead}
                    className="whitespace-nowrap rounded-full border border-[#f1b80c] px-3 py-2 text-xs font-bold uppercase text-[#f1b80c] transition hover:bg-[#f1b80c] hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingAllRead ? 'Marcando...' : 'Marcar todas como leídas'}
                  </button>
                )}
                <button
                  onClick={closeNotificationsModal}
                  aria-label="Cerrar notificaciones"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 transition hover:bg-slate-800"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="rounded-3xl bg-slate-900/70 p-6 text-center text-sm text-slate-400">
                  No tienes notificaciones pendientes.
                </p>
              ) : (
                notifications.map((n) => {
                  const isRead = String(n.status) === '1' || String(n.status).toLowerCase() === 'read' || String(n.status).toLowerCase() === 'leído';
                  const content = (
                    <>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{n.message}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            De: <span className="text-slate-300">{n.source_id}</span>
                          </p>
                        </div>
                        {!isRead && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(n.id)}
                            disabled={markingReadId === n.id}
                            className="whitespace-nowrap rounded-full bg-[#f1b80c] px-4 py-2 text-xs font-bold uppercase text-slate-950 transition hover:bg-[#d69e2e] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {markingReadId === n.id ? 'Marcando...' : 'Marcar como leída'}
                          </button>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                        <span className={`rounded-full px-3 py-1 font-semibold ${isRead ? 'bg-green-600 text-white' : 'bg-orange-400 text-black'}`}>
                          {isRead ? 'Leída' : 'Pendiente'}
                        </span>
                        <span>Creada: {moment(n.created_at).format('DD-MM-YYYY HH:mm')}</span>
                        {n.updated_at && <span>Actualizada: {moment(n.updated_at).format('DD-MM-YYYY HH:mm')}</span>}
                      </div>
                    </>
                  );

                  return n.navigate_to ? (
                    <Link
                      key={n.id}
                      to={n.navigate_to}
                      onClick={closeNotificationsModal}
                      className="block rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-[#f1b80c]"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div
                      key={n.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Payments;
