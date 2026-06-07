import React from 'react';

const AVAILABLE_TRAINERS = [
  { id: 1, name: 'Coach Carlos Mendoza', bio: 'Especialista en Fuerza e Hipertrofia' },
  { id: 2, name: 'Coach Elena Rostova', bio: 'Especialista en Estética y Rendimiento' },
];

const StepTrainerAssignment = ({ formData, updateData, submit, prev }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-white mb-2">Asignación de Entrenador</h2>
      
      <div className="space-y-2.5">
        {AVAILABLE_TRAINERS.map((trainer) => (
          <div
            key={trainer.id}
            onClick={() => updateData({ trainerId: trainer.id })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
              formData.trainerId === trainer.id
                ? 'border-[#f1b80c] bg-[#f1b80c]/5 text-white'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
            }`}
          >
            <div>
              <p className="font-bold text-sm text-white">{trainer.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{trainer.bio}</p>
            </div>
            
            {/* Custom Checkbox circular */}
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              formData.trainerId === trainer.id ? 'border-[#f1b80c]' : 'border-slate-500'
            }`}>
              {formData.trainerId === trainer.id && (
                <div className="w-2.5 h-2.5 bg-[#f1b80c] rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={prev} className="w-1/3 py-3.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm">
          Atrás
        </button>
        <button 
          onClick={submit} disabled={!formData.trainerId}
          className="w-2/3 py-3.5 bg-[#f1b80c] text-[#1e222b] font-extrabold rounded-xl hover:bg-[#d9a406] disabled:opacity-40 disabled:pointer-events-none transition-all text-sm uppercase tracking-wider"
        >
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default StepTrainerAssignment;