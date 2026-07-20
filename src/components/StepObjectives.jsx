import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const StepObjectives = ({ formData, updateData, next, prev }) => {
  const handleSelect = (obj) => updateData({ goal: obj });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-white mb-2">Definición de Objetivos</h2>
      
      <div className="space-y-3">
        <button
          type="button" onClick={() => handleSelect('perder_grasa')}
          className={`w-full p-4 rounded-xl border text-left transition-all ${
            formData.goal === 'perder_grasa'
              ? 'border-[#f1b80c] bg-[#f1b80c]/10 text-[#f1b80c]'
              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
          }`}
        >
          <div className="font-bold text-base">Perder Grasa</div>
          <div className="text-xs text-slate-400 mt-0.5">Enfoque en déficit calórico y definición.</div>
        </button>

        <button
          type="button" onClick={() => handleSelect('aumentar_masa')}
          className={`w-full p-4 rounded-xl border text-left transition-all ${
            formData.goal === 'aumentar_masa'
              ? 'border-[#f1b80c] bg-[#f1b80c]/10 text-[#f1b80c]'
              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
          }`}
        >
          <div className="font-bold text-base">Aumentar Masa Muscular</div>
          <div className="text-xs text-slate-400 mt-0.5">Enfoque en superávit y desarrollo de fuerza.</div>
        </button>
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={prev} className="w-1/3 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm">
          Atrás
        </button>
        <button 
          onClick={next} disabled={!formData.goal}
          className="w-2/3 py-3.5 bg-[#f1b80c] text-[#1e222b] font-bold rounded-xl hover:bg-[#d9a406] disabled:opacity-40 disabled:pointer-events-none transition-all text-sm"
        >
          Siguiente
        </button>
      </div>
                <p className="text-center text-sm mt-6 text-gray-400">
                    <Link to="/" className="text-yellow-400 hover:text-yellow-300">Regresar a la página principal <FontAwesomeIcon icon={faHome}/></Link>
                </p>      
    </div>
  );
};

export default StepObjectives;