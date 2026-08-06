import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, clientId }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    client_id: clientId,
    amount: '',
    receipt_image_url: null,
    status: 'Pendiente',
    payment_method: 'Transferencia',
    period_covered: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        client_id: clientId,
        amount: '',
        receipt_image_url: null,
        status: 'Pendiente',
        payment_method: 'Transferencia',
        period_covered: '',
      });
      setErrors({});
      setShowConfirmation(false);
    }
  }, [isOpen, clientId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.amount) newErrors.amount = 'El monto es requerido';
    if (!formData.receipt_image_url) newErrors.receipt_image_url = 'El comprobante de pago es requerido';
    // if (!formData.payment_method) newErrors.payment_method = 'El método de pago es requerido';
    if (!formData.period_covered) newErrors.period_covered = 'El período cubierto es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Only append fields that have values
      const appendIfValue = (key, value) => {
        if (value !== '' && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      };
      
      appendIfValue('client_id', formData.client_id);
      appendIfValue('amount', formData.amount);
      appendIfValue('status', formData.status);
      appendIfValue('payment_method', formData.payment_method);
      appendIfValue('period_covered', formData.period_covered);
      if (formData.receipt_image_url) formDataToSend.append('receipt_image_url', formData.receipt_image_url);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type manually - axios sets it automatically for FormData
        },
      };

      const response = await axios.post(`${apiUrl}/payments`, formDataToSend, config);
      
      if (response.status === 200 || response.status === 201) {
        setShowConfirmation(true);
        // Don't close immediately, show confirmation
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(JSON.stringify(error.response.data));
      } else {
        toast.error('Error al registrar el comprobante');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseWithConfirmation = () => {
    if (showConfirmation) {
      onClose();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const inputStyle = "px-3 py-2 bg-[#cccccc] text-[#1e222b] font-bold rounded-lg text-sm placeholder-[#555555] w-full text-center focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all";
  const labelStyle = "text-[14px] font-bold text-slate-400 block mb-1 pl-1";
  const selectStyle = "px-3 py-2 bg-[#cccccc] text-[#1e222b] font-bold rounded-lg text-sm w-full text-center focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all appearance-none bg-no-repeat bg-right pr-8";

  // Show confirmation screen
  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
          onClick={handleCloseWithConfirmation}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#141820] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">Comprobante Registrado</h2>
              <button
                onClick={handleCloseWithConfirmation}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Cerrar modal"
              >
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            {/* Confirmation Content */}
            <div className="p-8 text-center">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-gray-500/20 flex items-center justify-center">
                <FontAwesomeIcon icon={faCheckCircle} className="w-12 h-12 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">¡Comprobante enviado correctamente!</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Tu comprobante de pago ha sido registrado y está <strong className="text-[#f1b80c]">pendiente de revisión</strong> por nuestro equipo administrativo.
              </p>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-left mb-6">
                <p className="text-sm text-slate-400 mb-2">Detalles del registro:</p>
                <ul className="space-y-1 text-slate-300 text-sm">
                  <li><span className="font-semibold text-white">Monto:</span> {formData.amount}</li>
                  <li><span className="font-semibold text-white">Método:</span> {formData.payment_method}</li>
                  <li><span className="font-semibold text-white">Período:</span> {formData.period_covered}</li>
                  <li><span className="font-semibold text-white">Estado:</span> <span className="text-[#f1b80c]">{formData.status}</span></li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 mb-6">Recibirás una notificación cuando el pago sea verificado.</p>
              <button
                onClick={handleCloseWithConfirmation}
                className="w-full py-3 bg-[#f1b80c] text-[#1e222b] font-bold rounded-xl hover:bg-[#d9a406] transition-all text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#141820] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white">Registrar Comprobante de Pago</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Monto */}
            <div>
              <label className={labelStyle}>Monto (Cantidad)</label>
              <input 
                type="number" 
                name="amount" 
                placeholder="Ej: 50.00" 
                value={formData.amount} 
                onChange={handleChange} 
                className={inputStyle}
                step="0.01"
                min="0"
              />
              {errors.amount && <p className="text-red-400 text-[10px] mt-1">{errors.amount}</p>}
            </div>

            {/* Comprobante de Pago (Imagen) */}
            <div>
              <label className={labelStyle}>Comprobante de Pago (Imagen)</label>
              <label className="flex flex-col items-center justify-center p-4 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[100px]">
                <span className="text-xs font-bold text-slate-300 mb-2">Sube una imagen del comprobante 📷</span>
                <input 
                  type="file" 
                  name="receipt_image_url"
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleChange} 
                />
                {formData.receipt_image_url && (
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-[#f1b80c]">
                    <FontAwesomeIcon icon="file-image" className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{formData.receipt_image_url.name}</span>
                  </div>
                )}
                {errors.receipt_image_url && <p className="text-red-400 text-[10px] mt-2 text-center">{errors.receipt_image_url}</p>}
              </label>
            </div>

            {/* Método de Pago */}
            <div>
              <label className={labelStyle}>Método de Pago</label>
              <input className={selectStyle} type="text" name='payment_method' defaultValue={formData.payment_method} readOnly={true}/>
              {/* <select 
                name="payment_method" 
                value={formData.payment_method} 
                onChange={handleChange} 
                className={selectStyle}
              >
                <option value="" disabled>Selecciona un método</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="efectivo">Efectivo</option>
                <option value="paypal">PayPal</option>
                <option value="otro">Otro</option>
              </select> */}
              {errors.payment_method && <p className="text-red-400 text-[10px] mt-1">{errors.payment_method}</p>}
            </div>

            {/* Período Cubierto */}
            <div>
              <label className={labelStyle}>Período Cubierto</label>
              <select 
                name="period_covered" 
                value={formData.period_covered} 
                onChange={handleChange} 
                className={selectStyle}
              >
                <option value="" disabled>Selecciona un período</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral (3 meses)</option>
                <option value="semestral">Semestral (6 meses)</option>
                <option value="anual">Anual (12 meses)</option>
                {/* <option value="personalizado">Personalizado</option> */}
              </select>
              {errors.period_covered && <p className="text-red-400 text-[10px] mt-1">{errors.period_covered}</p>}
            </div>

            {/* Status (Hidden - always Pendiente) */}
            <input type="hidden" name="status" value="Pendiente" />

            {/* Botonera de control */}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/2 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-3 bg-[#f1b80c] text-[#1e222b] font-bold rounded-xl hover:bg-[#d9a406] disabled:opacity-40 disabled:pointer-events-none transition-all text-sm"
              >
                {isSubmitting ? 'Enviando...' : 'Registrar Comprobante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;