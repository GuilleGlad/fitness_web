import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';


const StepTrainerAssignment = ({ formData, updateData, submit, prev }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [trainers, setTrainers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        axios.get(`${apiUrl}/admin/trainers`, config).then((response) => {
          console.log(response.data);
          setTrainers(response.data.entrenadores);
        });
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchTrainers();
  }, [])

  // Evita doble registro si se hace doble click en "Registrarse".
  // `submit` puede ser sync o async (async si hace la llamada de
  // registro), por eso se usa `await` sobre su resultado en ambos casos.
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-white mb-2">Asignación de Entrenador</h2>

      <div className="space-y-2.5">
        {trainers.filter(trainer => trainer.status == 1).map((trainer) => (
          <div
            key={trainer.id}
            onClick={() => updateData({ trainerId: trainer.id })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${formData.trainerId === trainer.id
              ? 'border-[#f1b80c] bg-[#f1b80c]/5 text-white'
              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
              }`}
          >
            <div>
              <p className="font-bold text-sm text-white">{trainer.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{trainer.bio}</p>
            </div>

            {/* Custom Checkbox circular */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.trainerId === trainer.id ? 'border-[#f1b80c]' : 'border-slate-500'
              }`}>
              {formData.trainerId === trainer.id && (
                <div className="w-2.5 h-2.5 bg-[#f1b80c] rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={prev} disabled={isSubmitting} className="w-1/3 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm disabled:cursor-not-allowed disabled:opacity-40">
          Atrás
        </button>
        <button
          onClick={handleSubmit} disabled={!formData.trainerId || isSubmitting}
          className="w-2/3 py-3.5 bg-[#f1b80c] text-[#1e222b] font-extrabold rounded-xl hover:bg-[#d9a406] disabled:opacity-40 disabled:pointer-events-none transition-all text-sm uppercase tracking-wider"
        >
          {isSubmitting ? 'Registrando...' : 'Registrarse'}
        </button>
      </div>
      <p className="text-center text-sm mt-6 text-gray-400">
        <Link to="/" className="text-yellow-400 hover:text-yellow-300">Regresar a la página principal <FontAwesomeIcon icon={faHome} /></Link>
      </p>
    </div>
  );
};

export default StepTrainerAssignment;