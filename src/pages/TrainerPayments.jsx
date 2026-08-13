import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';
import moment from 'moment';
import 'moment/locale/es';
import { verifyToken } from '../utils/tokenUtils';


const initialForm = {
  trainer_id: '',
  title: '',
  ingredients: '',
  instructions: '',
  image_url: '',
  status: false,
  is_public: 0,
};

const status_colors = {
  'Pendiente': 'yellow-400',
  'Aprobado': 'green-400',
  'Rechazado': 'red-400'
}

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

/* ───────── Main Component ───────── */
const TrainerPayments = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const trainerId = localStorage.getItem('client_id');
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);

  /* Modal states */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState('image');
  const [paymentPreviewImage, setPaymentPreviewImage] = useState('');

  useEffect(() => {

    var redirectPath = null;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };

    checkToken();

    const fetchPayments = async () => {
      if (!trainerId) return;
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Token no disponible. Inicia sesión.');
        return;
      }

      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`${apiUrl}/payments/?trainer_id=${trainerId}`, config);
        const data = res.data?.data || [];
        setPayments(data);
      } catch (err) {
        console.error('Error cargando recetas:', err.message);
        toast.error('No se pudieron cargar las recetas.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [apiUrl, trainerId]);

const updatePaymentStatus = async (id, status) => {
  try{
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };    
    const data = {
      'status':status
    }
    await axios.patch(`${apiUrl}/payments/${id}/status`, data, config);
    
    // Actualizar el estado local para que la tabla se refresque visualmente
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === id ? { ...payment, status } : payment
      )
    );
    
    toast.success('Pago actualizado correctamente', { autoClose: 2000 });
  }catch(error){
    toast.error('No se pudo actualizar el Pago', { autoClose: 2000 });
    console.log("Error: " + error.message);
  }
}

const approvePayment = (id) => {
  updatePaymentStatus(id, "Aprobado");
}

const rejectPayment = (id) => {
  updatePaymentStatus(id, "Rechazado");
}

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
          <h1 className="mt-3 text-3xl font-bold md:text-4xl text-white">Pagos</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">Lista de Comprobantes recibidos</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="inline-flex items-center justify-center rounded-full bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]">
          Volver al dashboard
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total', value: payments.length, color: 'text-white' },
          { label: 'Pendientes', value: payments.filter(r => r.status === "Pendiente").length, color: 'text-yellow-400' },
          { label: 'Aprobados', value: payments.filter(r => r.status === "Aprobado").length, color: 'text-green-400' },
          { label: 'Rechazados', value: payments.filter(r => r.status === "Rechazado").length, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="rounded-[32px] border border-slate-800 bg-[#141820] p-5 text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>


      {/* Table / Cards Container */}
      <section className="overflow-hidden rounded-[40px] border border-slate-800 bg-[#141820]">
        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                <th className="px-6 py-4 font-medium text-slate-400">Cliente</th>
                <th className="px-6 py-4 font-medium text-slate-400">Cantidad</th>
                <th className="px-6 py-4 font-medium text-slate-400">Fecha de Pago</th>
                <th className="px-6 py-4 font-medium text-slate-400">Método de Pago</th>
                <th className="px-6 py-4 font-medium text-slate-400">Período</th>
                <th className="px-6 py-4 font-medium text-slate-400">Imagen</th>
                <th className="px-6 py-4 font-medium text-slate-400">Status</th>
                <th className="px-6 py-4 font-medium text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">Cargando pagos</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="5" className="py-12 text-center text-slate-400">No hay pagos aún.</td></tr>
              ) : payments.map((r) => (
                <tr key={r.id} className="group transition hover:bg-slate-800/40">
                  <td className="px-6 py-4 font-medium text-white">{r.client_id}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.amount}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{moment(r.payment_date).format('DD-MM-YYYY')}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.payment_method}</td>
                  <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{r.period_covered}</td>
                  <td className="px-6 py-4">
                    {r.receipt_image_url ? (
                      <img
                        src={r.receipt_image_url}
                        alt="comprobante"
                        className="h-14 w-20 object-cover rounded-md cursor-pointer hover:opacity-80"
                        onClick={() => setPaymentPreviewImage(r.receipt_image_url)}
                      />
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-slate-800 text-${status_colors[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 opacity-70 group-hover:opacity-100">
                      <button onClick={() => yesNo('¿Aprobar este comprobante?', () => approvePayment(r.id))} className="rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-green-800 hover:text-white">Aprobar</button>
                      <button onClick={() => yesNo('¿Eliminar esta receta?', () => rejectPayment(r.id))} className="rounded-full bg-red-600 hover:bg-red-800 px-4 py-2 text-xs font-semibold text-white">Rechazar</button>
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
          ) : payments.length === 0 ? (
            <p className="py-12 text-center text-slate-400">No hay pagos aún.</p>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {payments.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start gap-4">
                    {r.receipt_image_url && (
                      <img
                        src={r.receipt_image_url}
                        alt="comprobante"
                        className="h-16 w-16 rounded-lg object-cover ring-2 ring-slate-700 flex-shrink-0 cursor-pointer"
                        onClick={() => setPaymentPreviewImage(r.receipt_image_url)}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">Cliente: {r.client_id}</h3>
                      <p className="text-sm text-slate-300 truncate">Cantidad: {r.amount}</p>
                      <p className="text-sm text-slate-300 truncate">Fecha: {moment(r.payment_date).format('DD-MM-YYYY')}</p>
                      <p className="text-sm text-slate-300 truncate">Método: {r.payment_method}</p>
                      <p className="text-sm text-slate-300 truncate">Período: {r.period_covered}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold bg-slate-800 text-${status_colors[r.status]}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => yesNo('¿Aprobar este comprobante?', () => approvePayment(r.id))}
                      className="flex-1 rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-green-800 hover:text-white"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => yesNo('¿Rechazar este comprobante?', () => rejectPayment(r.id))}
                      className="flex-1 rounded-full bg-red-600 hover:bg-red-800 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
          {paymentPreviewImage && (
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setPaymentPreviewImage(null)}
            >
              <img src={paymentPreviewImage} className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl" />
            </div>
          )}      
    </div>
  </div>
);

}
export default TrainerPayments;