import React from 'react';

const StepVisualRegister = ({ formData, updateData, next, prev }) => {
  const handleMeasureChange = (e) => {
    updateData({
      medidas: { ...formData.medidas, [e.target.name]: e.target.value }
    });
  };

  // Extraemos las medidas con valores por defecto para evitar errores matemáticos en el SVG
  const cintura = parseFloat(formData.medidas.cintura) || 60;
  const cadera = parseFloat(formData.medidas.cadera) || 80;
  const brazos = parseFloat(formData.medidas.brazos) || 25;
  const piernas = parseFloat(formData.medidas.piernas) || 45;

  // Factores de escala para deformar sutilmente la silueta de forma controlada y proporcional
  const escalaCintura = Math.min(Math.max(cintura / 70, 0.6), 1.6);
  const escalaCadera = Math.min(Math.max(cadera / 90, 0.6), 1.6);
  const escalaBrazos = Math.min(Math.max(brazos / 30, 0.6), 1.6);
  const escalaPiernas = Math.min(Math.max(piernas / 50, 0.6), 1.6);

  const inputMeasureStyle = "px-3 py-2 bg-[#cccccc] text-[#1e222b] font-bold rounded-lg text-xs placeholder-[#555555] w-full text-center focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all";

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-center text-white mb-1">Registro Visual Inicial</h2>
      
      {/* Zona de Gráfico SVG Dinámico */}
      <div className="flex justify-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <svg width="160" height="220" viewBox="0 0 160 220" className="drop-shadow-[0_0_8px_rgba(241,184,12,0.15)]">
          <defs>
            {/* Gradiente para darle estética premium de EliteFit */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* Cabeza */}
          <circle cx="80" cy="25" r="14" fill="url(#bodyGradient)" stroke="#64748b" strokeWidth="1.5" />

          {/* Cuello */}
          <rect x="76" y="38" width="8" height="10" fill="url(#bodyGradient)" stroke="#64748b" strokeWidth="1" />

          {/* Torso / Hombros */}
          <path 
            d="M 52 48 
            C 52 48, 100 46, 108 48 
            C 104 65, 100 75, 92 90 
            C 85 90, 75 90, 68 90 
            C 60 75, 56 65, 52 48 Z" 
            fill="url(#bodyGradient)" 
            stroke="#64748b" 
            strokeWidth="1.5" 
          />


            <path 
            d={`M 52 48 
            C 60 70, 80 105, 60 120
            C 60 120, 40 130, 50 140
            L 110 140
            C 110 140, 120 130 , 100 120
            C 80 110, 110 50 , 110 48 
            Z
             `} 
            fill="url(#bodyGradient)" 
            stroke="red" 
            strokeWidth="2.5" 
          />

          {/* Brazos Dinámicos (Se engrosan/adelgazan según escalaBrazos) */}
          {/* Brazo Izquierdo */}
          {/* <path 
            d={`M 52 48 C ${46 - (escalaBrazos * 4)} 60, ${42 - (escalaBrazos * 4)} 80, ${44 - (escalaBrazos * 2)} 110 
                C ${49 + (escalaBrazos * 2)} 110, ${49 + (escalaBrazos * 2)} 80, 56 60 Z`}
            fill={formData.medidas.brazos ? '#f1b80c' : 'url(#bodyGradient)'}
            fillOpacity={formData.medidas.brazos ? '0.25' : '1'}
            stroke={formData.medidas.brazos ? '#f1b80c' : '#64748b'}
            strokeWidth="1.5"
            className="transition-all duration-300"
          /> */}
          {/* Brazo Derecho */}
          {/* <path 
            d={`M 108 48 C ${114 + (escalaBrazos * 4)} 60, ${118 + (escalaBrazos * 4)} 80, ${116 + (escalaBrazos * 2)} 110 
                C ${111 - (escalaBrazos * 2)} 110, ${111 - (escalaBrazos * 2)} 80, 104 60 Z`}
            fill={formData.medidas.brazos ? '#f1b80c' : 'url(#bodyGradient)'}
            fillOpacity={formData.medidas.brazos ? '0.25' : '1'}
            stroke={formData.medidas.brazos ? '#f1b80c' : '#64748b'}
            strokeWidth="1.5"
            className="transition-all duration-300"
          /> */}

          {/* Cintura Dinámica */}
          {/* <path 
            d={`M ${80 - (14 * escalaCintura)} 90 
            Q 80 94 ${80 + (14 * escalaCintura)} 90 
            L ${80 + (16 * escalaCadera)} 115 
            Q 80 120 ${80 - (16 * escalaCadera)} 115 Z`}
            fill={formData.medidas.cintura ? '#f1b80c' : 'url(#bodyGradient)'}
            fillOpacity={formData.medidas.cintura ? '0.25' : '1'}
            stroke={formData.medidas.cintura ? '#f1b80c' : '#64748b'}
            strokeWidth="1.5"
            className="transition-all duration-300"
          /> */}

          {/* Cadera / Glúteos (Depende de escalaCadera) */}
          {/* <path 
            d={`
            M 65 115 
            C 65 115, 40 135, 55 140 
            L 98 140 
            C 120 135, 100 115, 95 115  `}
            fill={formData.medidas.cadera ? '#f1b80c' : 'url(#bodyGradient)'}
            fillOpacity={formData.medidas.cadera ? '0.25' : '1'}
            stroke={formData.medidas.cadera ? '#f1b80c' : '#64748b'}
            strokeWidth="1.5"
            className="transition-all duration-300"
          /> */}

          {/* Piernas Dinámicas (Dependen de escalaPiernas) */}
          {/* Pierna Izquierda */}
          <path 
            d={`M 55 140 C ${60 - (escalaPiernas * 3)} 165, ${58 - (escalaPiernas * 2)} 190, 64 215 
                L 76 215 C 72 190, 74 165, 80 140 `}
            fill={formData.medidas.piernas ? '#f1b80c' : 'url(#bodyGradient)'}
            fillOpacity={formData.medidas.piernas ? '0.25' : '1'}
            stroke={formData.medidas.piernas ? '#f1b80c' : '#64748b'}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />
          {/* Pierna Derecho */}
          <path 
            d={`M 98 140 C ${100 + (escalaPiernas * 3)} 165, ${102 + (escalaPiernas * 2)} 190, 96 215 
                L 84 215 C 88 190, 86 165, 80 140 `}
            fill={formData.medidas.piernas ? '#f1b80c' : 'url(#bodyGradient)'}
            fillOpacity={formData.medidas.piernas ? '0.25' : '1'}
            stroke={formData.medidas.piernas ? '#f1b80c' : '#64748b'}
            strokeWidth="1.5"
            className="transition-all duration-300"
          />

          {/* Líneas de Guías visuales con texto amarillo si el campo tiene datos */}
          {formData.medidas.brazos && <line x1="25" y1="75" x2="44" y2="75" stroke="#f1b80c" strokeWidth="1" strokeDasharray="2,2" />}
          {formData.medidas.cintura && <line x1="25" y1="98" x2="65" y2="98" stroke="#f1b80c" strokeWidth="1" strokeDasharray="2,2" />}
          {formData.medidas.cadera && <line x1="135" y1="125" x2="95" y2="125" stroke="#f1b80c" strokeWidth="1" strokeDasharray="2,2" />}
          {formData.medidas.piernas && <line x1="135" y1="170" x2="100" y2="170" stroke="#f1b80c" strokeWidth="1" strokeDasharray="2,2" />}
        </svg>
      </div>

      {/* Inputs de Medidas Antropométricas */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
        <span className="text-[11px] font-extrabold text-slate-400 block mb-3 uppercase tracking-wider text-center">Ingresa tus Medidas (cm)</span>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Cintura</label>
            <input type="number" name="cintura" placeholder="Ej: 75" value={formData.medidas.cintura} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Cadera</label>
            <input type="number" name="cadera" placeholder="Ej: 95" value={formData.medidas.cadera} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Brazos</label>
            <input type="number" name="brazos" placeholder="Ej: 32" value={formData.medidas.brazos} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 pl-1">Piernas</label>
            <input type="number" name="piernas" placeholder="Ej: 55" value={formData.medidas.piernas} onChange={handleMeasureChange} className={inputMeasureStyle} />
          </div>
        </div>
      </div>

      {/* Selección de Archivos Multimedia Obligatorios */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col items-center justify-center p-3 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[70px]">
          <span className="text-xs font-bold text-slate-300">Foto Frente 📷</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => updateData({ fotoFrente: e.target.files[0] })} />
          {formData.fotoFrente && <span className="text-[10px] text-[#f1b80c] mt-1 truncate max-w-[140px]">{formData.fotoFrente.name}</span>}
        </label>
        
        <label className="flex flex-col items-center justify-center p-3 bg-slate-800/60 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-[#f1b80c] transition-all min-h-[70px]">
          <span className="text-xs font-bold text-slate-300">Foto Espalda 📷</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => updateData({ fotoEspalda: e.target.files[0] })} />
          {formData.fotoEspalda && <span className="text-[10px] text-[#f1b80c] mt-1 truncate max-w-[140px]">{formData.fotoEspalda.name}</span>}
        </label>
      </div>

      {/* Botonera de control */}
      <div className="flex gap-3 pt-2">
        <button onClick={prev} className="w-1/3 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-sm">
          Atrás
        </button>
        <button 
          onClick={next} 
          disabled={!formData.fotoFrente || !formData.fotoEspalda || !formData.medidas.cintura || !formData.medidas.cadera || !formData.medidas.brazos || !formData.medidas.piernas}
          className="w-2/3 py-3 bg-[#f1b80c] text-[#1e222b] font-bold rounded-xl hover:bg-[#d9a406] disabled:opacity-40 disabled:pointer-events-none transition-all text-sm"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default StepVisualRegister;