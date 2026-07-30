import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import BodySilhouette from './BodySilhouette';

const StepVisualRegister = ({ formData, updateData, next, prev }) => {
  const handleMeasureChange = (e) => {
    updateData({
      [e.target.name]: e.target.value
    });
  };

  // Extraemos las medidas con valores por defecto para evitar errores matemáticos en el SVG
  var cintura = parseFloat(formData.waist) || 60;
  var cadera = parseFloat(formData.hips) || 90;
  var brazos = parseFloat(formData.arms) || 25;
  var piernas = parseFloat(formData.legs) || 20;
  
  const inputMeasureStyle = "px-3 py-2 bg-[#cccccc] text-[#1e222b] font-bold rounded-lg text-xs placeholder-[#555555] w-full text-center focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all";

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-center text-white mb-1">Registro Visual Inicial</h2>

      <BodySilhouette genre="m" cadera={cadera} cintura={cintura} piernas={piernas} brazos={brazos} />


      {/* Inputs de Medidas Antropométricas */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
        <span className="text-[11px] font-extrabold text-slate-400 block mb-3 uppercase tracking-wider text-center">Ingresa tus Medidas (cm)</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Cintura</label>
            <input type="number" name="waist" placeholder="Ej: 75" value={formData.waist} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Cadera</label>
            <input type="number" name="hips" placeholder="Ej: 95" value={formData.hips} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Brazos</label>
            <input type="number" name="arms" placeholder="Ej: 32" value={formData.arms} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Piernas</label>
            <input type="number" name="legs" placeholder="Ej: 55" value={formData.legs} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
        </div>
      </div>

      {/* Selección de Archivos Multimedia Obligatorios */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col items-center justify-center p-3 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[70px]">
          <span className="text-xs font-bold text-slate-300">Foto Frente 📷</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => updateData({ photo_front: e.target.files[0] })} />
          {formData.photo_front && <span className="text-[10px] text-[#f1b80c] mt-1 truncate max-w-[140px]">{formData.photo_front.name}</span>}
        </label>

        <label className="flex flex-col items-center justify-center p-3 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[70px]">
          <span className="text-xs font-bold text-slate-300">Foto Espalda 📷</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => updateData({ photo_back: e.target.files[0] })} />
          {formData.photo_back && <span className="text-[10px] text-[#f1b80c] mt-1 truncate max-w-[140px]">{formData.photo_back.name}</span>}
        </label>
      </div>

      {/* Botonera de control */}
      <div className="flex gap-3 pt-2">
        <button onClick={prev} className="w-1/3 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm">
          Atrás
        </button>
        <button
          onClick={next}
          disabled={!formData.photo_front || !formData.photo_back || !formData.waist || !formData.hips || !formData.arms || !formData.legs}
          className="w-2/3 py-3 bg-[#f1b80c] text-[#1e222b] font-bold rounded-xl hover:bg-[#d9a406] disabled:opacity-40 disabled:pointer-events-none transition-all text-sm"
        >
          Siguiente
        </button>
      </div>
      <p className="text-center text-sm mt-6 text-gray-400">
        <Link to="/" className="text-yellow-400 hover:text-yellow-300">Regresar a la página principal <FontAwesomeIcon icon={faHome} /></Link>
      </p>
    </div>
  );
};

export default StepVisualRegister;