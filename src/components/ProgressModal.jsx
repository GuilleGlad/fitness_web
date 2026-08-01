import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ProgressModal = ({ isOpen, onClose, clientId, age, height, initialWeight, goal, trainingDays, trainerId }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('token');
  const genre = localStorage.getItem('genre') || '';

  const [formData, setFormData] = useState({
    client_id: clientId,
    weight: initialWeight || '',
    waist: '',
    hips: '',
    arms: '',
    legs: '',
    photo_front: null,
    photo_back: null,
    age: age || '',
    height: height || '',
    goal: goal || '',
    training_days: trainingDays || '',
    trainerId: trainerId || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

// Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        client_id: clientId,
        weight: initialWeight || '',
        waist: '',
        hips: '',
        arms: '',
        legs: '',
        photo_front: null,
        photo_back: null,
        age: age || '',
        height: height || '',
        goal: goal || '',
        training_days: trainingDays || '',
        trainerId: trainerId || '',
      });
      setErrors({});
    }
  }, [isOpen, clientId, initialWeight, age, height, goal, trainingDays, trainerId]);

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
    if (!formData.weight) newErrors.weight = 'El peso es requerido';
    if (!formData.waist) newErrors.waist = 'La cintura es requerida';
    if (!formData.hips) newErrors.hips = 'La cadera es requerida';
    if (!formData.arms) newErrors.arms = 'Los brazos son requeridos';
    if (!formData.legs) newErrors.legs = 'Las piernas son requeridas';
    if (!formData.photo_front) newErrors.photo_front = 'La foto de frente es requerida';
    if (!formData.photo_back) newErrors.photo_back = 'La foto de espalda es requerida';
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
      appendIfValue('weight', formData.weight);
      appendIfValue('waist', formData.waist);
      appendIfValue('hips', formData.hips);
      appendIfValue('arms', formData.arms);
      appendIfValue('legs', formData.legs);
      appendIfValue('age', formData.age);
      appendIfValue('height', formData.height);
      appendIfValue('goal', formData.goal);
      appendIfValue('training_days', formData.training_days);
      appendIfValue('trainerId', formData.trainerId);
      if (formData.photo_front) formDataToSend.append('photo_front', formData.photo_front);
      if (formData.photo_back) formDataToSend.append('photo_back', formData.photo_back);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type manually - axios sets it automatically for FormData
        },
      };

      const response = await axios.post(`${apiUrl}/progress/add`, formDataToSend, config);
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Progreso agregado correctamente');
        onClose();
        // Refresh the page to show new data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding progress:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(JSON.stringify(error.response.data));
      } else {
        toast.error('Error al agregar el progreso');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = "px-3 py-2 bg-[#cccccc] text-[#1e222b] font-bold rounded-lg text-xs placeholder-[#555555] w-full text-center focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all";
  const labelStyle = "text-[10px] font-bold text-slate-400 block mb-1 pl-1";

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
        <div className="relative w-full max-w-2xl bg-[#141820] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white">Agregar Progreso Corporal {genre}</h2>
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
            {/* Medidas Antropométricas */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              <span className="text-[11px] font-extrabold text-slate-400 block mb-3 uppercase tracking-wider text-center">Ingresa tus Medidas (cm)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Cintura</label>
                  <input 
                    type="number" 
                    name="waist" 
                    placeholder="Ej: 75" 
                    value={formData.waist} 
                    onChange={handleChange} 
                    className={inputStyle}
                    step="0.1"
                    min="0"
                  />
                  {errors.waist && <p className="text-red-400 text-[10px] mt-1">{errors.waist}</p>}
                </div>
                <div>
                  <label className={labelStyle}>Cadera</label>
                  <input 
                    type="number" 
                    name="hips" 
                    placeholder="Ej: 95" 
                    value={formData.hips} 
                    onChange={handleChange} 
                    className={inputStyle}
                    step="0.1"
                    min="0"
                  />
                  {errors.hips && <p className="text-red-400 text-[10px] mt-1">{errors.hips}</p>}
                </div>
                <div>
                  <label className={labelStyle}>Brazos</label>
                  <input 
                    type="number" 
                    name="arms" 
                    placeholder="Ej: 32" 
                    value={formData.arms} 
                    onChange={handleChange} 
                    className={inputStyle}
                    step="0.1"
                    min="0"
                  />
                  {errors.arms && <p className="text-red-400 text-[10px] mt-1">{errors.arms}</p>}
                </div>
                <div>
                  <label className={labelStyle}>Piernas</label>
                  <input 
                    type="number" 
                    name="legs" 
                    placeholder="Ej: 55" 
                    value={formData.legs} 
                    onChange={handleChange} 
                    className={inputStyle}
                    step="0.1"
                    min="0"
                  />
                  {errors.legs && <p className="text-red-400 text-[10px] mt-1">{errors.legs}</p>}
                </div>
                <div>
                  <label className={labelStyle}>Peso (kg)</label>
                  <input 
                    type="number" 
                    name="weight" 
                    placeholder="Ej: 75" 
                    value={formData.weight} 
                    onChange={handleChange} 
                    className={inputStyle}
                    step="0.1"
                    min="0"
                  />
                  {errors.weight && <p className="text-red-400 text-[10px] mt-1">{errors.weight}</p>}
                </div>                
              </div>
            </div>

            {/* Selección de Archivos Multimedia Obligatorios */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              <span className="text-[11px] font-extrabold text-slate-400 block mb-3 uppercase tracking-wider text-center">Fotos Obligatorias</span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center p-3 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[70px]">
                  <span className="text-xs font-bold text-slate-300">Foto Frente 📷</span>
                  <input 
                    type="file" 
                    name="photo_front"
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleChange} 
                  />
                  {formData.photo_front && <span className="text-[10px] text-[#f1b80c] mt-1 truncate max-w-[140px]">{formData.photo_front.name}</span>}
                  {errors.photo_front && <p className="text-red-400 text-[10px] mt-1 text-center">{errors.photo_front}</p>}
                </label>

                <label className="flex flex-col items-center justify-center p-3 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[70px]">
                  <span className="text-xs font-bold text-slate-300">Foto Espalda 📷</span>
                  <input 
                    type="file" 
                    name="photo_back"
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleChange} 
                  />
                  {formData.photo_back && <span className="text-[10px] text-[#f1b80c] mt-1 truncate max-w-[140px]">{formData.photo_back.name}</span>}
                  {errors.photo_back && <p className="text-red-400 text-[10px] mt-1 text-center">{errors.photo_back}</p>}
                </label>
              </div>
            </div>

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
                {isSubmitting ? 'Guardando...' : 'Guardar Progreso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;