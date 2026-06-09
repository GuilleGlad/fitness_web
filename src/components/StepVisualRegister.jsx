import React from 'react';

const StepVisualRegister = ({ formData, updateData, next, prev }) => {
  const handleMeasureChange = (e) => {
    updateData({
      medidas: { ...formData.medidas, [e.target.name]: e.target.value }
    });
  };

  // Extraemos las medidas con valores por defecto para evitar errores matemáticos en el SVG
  var cintura = parseFloat(formData.medidas.cintura) || 60;
  var cadera = parseFloat(formData.medidas.cadera) || 90;
  const brazos = parseFloat(formData.medidas.brazos) || 25;
  var pierna1 = parseFloat(formData.medidas.piernas) || 20;
  var pierna2 = parseFloat(formData.medidas.piernas) || 20;

  // Factores de escala para deformar sutilmente la silueta de forma controlada y proporcional
  if(cadera < 60) cadera = 60;
  if(cadera > 120) cadera = 120;
  if(cintura < 40) cintura = 40;
  if(cintura > 200) cintura = 200;
  if(pierna1 > 80) pierna1 = 80;
  if(pierna2 > 80) pierna2 = 80;
  if(pierna1 < 20) pierna1 = 20;
  if(pierna2 < 20) pierna2 = 20;
  
  const escalaCadera_izq = Math.min(353 - cadera);
  const escalaCadera_der = Math.min(cadera + 484);
  const escalaCintura_der = Math.min(cintura + 400);
  const escalaCintura_izq = Math.min(397 + 40 - cintura);
  const escalaPiernas1_izq = Math.min(280 + 40 - pierna1);
  const escalaPiernas2_izq = Math.min(280 + 40 - pierna1);
  const escalaPiernas1_der = Math.min(522 + pierna2);
  const escalaPiernas2_der = Math.min(522 + pierna2);
  // const escalaCadera = Math.min(Math.max(cadera / 90, 0.6), 1.6);
  const escalaCintura = Math.min(Math.max(cintura / 70, 0.6), 1.6);
  const escalaBrazos = Math.min(Math.max(brazos / 30, 0.6), 1.6);
  // const escalaPiernas = Math.min(Math.max(piernas / 50, 0.6), 1.6);

  const inputMeasureStyle = "px-3 py-2 bg-[#cccccc] text-[#1e222b] font-bold rounded-lg text-xs placeholder-[#555555] w-full text-center focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all";

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-center text-white mb-1">Registro Visual Inicial</h2>

      {/* Zona de Gráfico SVG Dinámico */}
      <div className="flex justify-center bg-gray-700/60 p-4 rounded-xl border border-gray-200">
        <svg version="1.1" id="Layer_1" x="0px" y="0px" stroke='white' strokeWidth='4'
          viewBox="0 0 837.483 1819.369" enable-background="new 0 0 837.483 1819.369" fill="#f1b80c" className="w-48 h-auto">
          <path d={`M 736.728 849.786 c -0.634 -1.435 -13.566 -15.425 -33.487 -23.292 c -4.568 -1.94 -4.545 2.705 -16.944 -34.925 c -26.957 -72.647 -5.661 -112.736 -51.135 -200.791 c -6.888 -14.322 -9.901 -24.921 -16.16 -50.12 c -25.397 -104.478 -6.032 -90.98 -15.87 -135.251 c -17.961 -63.049 -50.754 -59.498 -71.782 -59.155 c -16.944 0.378 -45.224 -11.699 -52.936 -19.746 c -10.555 -11.486 -17.912 -20.548 -11.679 -58.855 c 0 0 7.037 -12.141 9.078 -34.125 c 9.284 11.287 24.572 -33.84 16.065 -42.691 c -1.745 -1.867 -5.169 -1.236 -6.289 1.015 c -1.292 1.484 -1.315 3.695 -2.888 4.964 c -2 -9.359 3.289 -28.498 -7.935 -56.968 c -5.541 -12.289 -11.235 -15.496 -21.547 -22.44 c -8.401 -6.048 -28.842 -7.595 -29.842 -7.717 h -9.461 c -1 0.122 -21.441 1.669 -29.842 7.717 c -10.312 6.944 -16.006 10.151 -21.547 22.44 c -11.224 28.47 -5.935 47.609 -7.935 56.968 c -1.573 -1.269 -1.596 -3.48 -2.888 -4.964 c -1.12 -2.251 -4.544 -2.882 -6.289 -1.015 c -8.507 8.851 6.781 53.978 16.065 42.691 c 2.041 21.984 9.078 34.125 9.078 34.125 c 6.233 38.307 -1.124 47.369 -11.679 58.855 c -7.712 8.047 -35.992 20.124 -52.935 19.746 c -21.029 -0.343 -53.822 -3.894 -71.782 59.155 c -9.838 44.271 9.527 30.773 -15.87 135.251 c -6.259 25.199 -9.272 35.798 -16.16 50.12 c -45.474 88.055 -24.178 128.144 -51.135 200.791 c -12.399 37.63 -12.376 32.985 -16.944 34.925 c -19.921 7.867 -32.853 21.857 -33.487 23.292 c -8.923 20.454 -23.328 27.412 -19.921 33.844 c 0.896 1.702 3.318 2.588 4.944 1.381 c 5.189 0.91 12.738 -4.808 16.127 -8.599 c 4.102 -4.706 3.375 -7.457 11.332 -13.86 c 1.824 2.047 -2.155 20.335 -3.12 23.398 c -4.877 14.729 -26.567 49.619 -17.595 54.417 c 0.945 0.4 2.227 0.955 3.073 0.089 c 1.553 -1.53 3.53 -2.604 4.841 -4.372 c 8.025 -10.218 17.566 -34.36 24.059 -39.238 c 3.279 0.224 1.596 2.346 -4.475 22.532 c -3.673 13.084 -5.142 19.941 -5.142 19.941 c -10.126 30.466 6.229 25.716 11.501 6.808 c 0.448 -1.537 9.722 -26.912 10.129 -28.16 c 1.241 -3.291 4.602 -17.806 8.801 -14.872 c 0.646 2.469 -0.335 3.044 -3.536 31.521 c -2.6 21.813 -3.236 8.789 -2.713 26.425 c 0.079 2.164 4.439 3.257 6.282 2.115 c 10.539 -9.723 12.692 -57.611 18.074 -61.022 c 3.669 4.293 4.272 33.754 5.982 39.221 c 2.652 9.705 7.446 4.802 7.981 3.239 c 3.825 -9.324 -0.19 -30.536 0.628 -45.388 c 0 0 4.369 -14.53 7.198 -38.676 c 4.176 -45.514 -17.861 13.267 48.59 -167.185 c 0 0 5.299 -10.218 13.794 -30.791 c 9.81 -21.31 5.988 -35.652 19.766 -73.451 
          C 267.527 588.103 284 541.345 291.529 520.953 
          C ${escalaCintura_izq} 753.598 281.786 598.021 ${escalaCadera_izq} 852 
          C ${escalaPiernas2_izq} 957.526 ${escalaPiernas1_izq} 929 ${escalaPiernas2_izq} 1076.028 
          C 312.534 1365.332 265.728 1206.189 316.467 1460.34 
          c 10.99 51.495 9.837 44.86 11.854 56.284 c 2.28 21.363 -1.788 21.528 -1.679 31.313 c -0.699 24.031 5.964 8.574 -1.712 52.53 c -4.993 24.181 -4.913 9.214 -7.677 37.417 c -3.463 13.977 -13.912 52.732 0.856 52.45 c 1.286 7.64 5.541 9.156 9.756 6.712 c -0.684 2.455 1.381 4.293 2.766 6.011 c 4.813 1.322 4.76 1.029 6.828 -0.555 c 1.495 5.791 5.173 5.742 6.748 6.16 c 4.768 1.476 5.904 -11.237 6.781 -16.16 c 0.856 -0.046 1.705 -0.096 2.551 -0.129 c -1.072 3.151 -7.161 15.833 2.634 16.835 c 7.651 1.238 8.542 0.168 12.727 -3.791 c 6.992 -7.01 5.41 -8.94 6.623 -20.685 c 0.191 -2.384 5.685 -6.58 0.872 -37.642 c -1.855 -15.952 -0.832 2.69 0.304 -35.715 c 0.371 -16.594 5.685 -19.576 6.408 -31.349 c -6.493 -27.396 -1.465 -14.55 -4.045 -30.51 c -6.145 -34.313 -7.105 -27.255 0.575 -107.316 c 6.987 -65.839 14.147 -68.677 7.72 -136.864 c -14.296 -110.15 -0.224 -68.945 1.451 -126.216 
          C 390.311 1111.76 384.61 1070.312 391.911 1010.917 
          c 4.314 -34.735 12.351 -68.835 12.215 -90.227 c 2.948 -3.639 4.984 -7.885 7.168 -11.993 c 3.172 -6.203 2.655 -0.513 2.627 -35.675 c 1.424 -0.218 2.885 -0.281 4.27 -0.677 c 0.162 -0.334 0.307 -0.661 0.436 -0.985 c 0.007 0.007 0.014 0.015 0.022 0.023 c 0.008 -0.008 0.015 -0.016 0.022 -0.023 c 0.129 0.324 0.274 0.651 0.436 0.985 c 1.385 0.396 2.846 0.459 4.27 0.677 c -0.028 35.162 -0.545 29.472 2.627 35.675 c 2.184 4.108 4.22 8.354 7.168 11.993 c -0.136 21.392 7.901 55.493 12.215 90.227 c 7.301 59.394 1.6 100.842 3.103 168.203 c 1.675 57.27 15.747 16.066 1.451 126.216 c -6.427 68.186 0.733 71.025 7.72 136.864 c 7.68 80.061 6.72 73.003 0.575 107.316 c -2.58 15.96 2.448 3.114 -4.045 30.51 c 0.723 11.773 6.037 14.755 6.408 31.349 c 1.136 38.405 2.159 19.763 0.304 35.715 c -4.813 31.062 0.681 35.258 0.872 37.642 c 1.213 11.745 -0.369 13.675 6.623 20.685 c 4.185 3.959 5.076 5.029 12.727 3.791 c 9.795 -1.002 3.706 -13.684 2.634 -16.835 c 0.846 0.033 1.695 0.083 2.551 0.129 c 0.877 4.923 2.013 17.636 6.781 16.16 c 1.575 -0.418 5.253 -0.369 6.748 -6.16 c 2.068 1.584 2.015 1.877 6.828 0.555 c 1.385 -1.718 3.45 -3.556 2.766 -6.011 c 4.215 2.444 8.47 0.928 9.756 -6.712 c 14.768 0.282 4.319 -38.473 0.856 -52.45 c -2.764 -28.203 -2.684 -13.236 -7.677 -37.417 c -7.676 -43.956 -1.013 -28.499 -1.712 -52.53 c 0.109 -9.785 -3.959 -9.95 -1.679 -31.313 c 2.017 -11.424 0.864 -4.789 11.854 -56.284 
          C 517.57 1206.189 524.764 1365.333 ${escalaPiernas2_der} 1076.028 
          C ${escalaPiernas2_der} 929.191 ${escalaPiernas2_der} 957.526 ${escalaCadera_der} 852 
          C 555.512 598.021 ${escalaCintura_der} 753 545.769 520.953 
          c 8.124 20.392 24.002 67.15 24.363 68.15 c 13.778 37.8 9.956 52.142 19.766 73.451 c 8.495 20.573 13.794 30.791 13.794 30.791 c 66.451 180.451 44.414 121.671 48.59 167.185 c 2.829 24.146 7.198 38.676 7.198 38.676 c 0.818 14.852 -3.197 36.064 0.628 45.388 c 0.535 1.563 5.329 6.466 7.981 -3.239 c 1.71 -5.467 2.313 -34.928 5.982 -39.221 c 5.382 3.411 7.535 51.3 18.074 61.022 c 1.843 1.142 6.203 0.049 6.282 -2.115 c 0.523 -17.636 -0.113 -4.612 -2.713 -26.425 c -3.201 -28.477 -4.182 -29.052 -3.536 -31.521 c 4.199 -2.934 7.56 11.581 8.801 14.872 c 0.407 1.248 9.681 26.623 10.129 28.16 c 5.272 18.908 21.627 23.658 11.501 -6.808 c 0 0 -1.469 -6.857 -5.142 -19.941 c -6.071 -20.186 -7.754 -22.308 -4.475 -22.532 c 6.493 4.878 16.034 29.02 24.059 39.238 c 1.311 1.768 3.288 2.842 4.841 4.372 c 0.846 0.866 2.128 0.311 3.073 -0.089 c 8.972 -4.798 -12.718 -39.688 -17.595 -54.417 c -0.965 -3.063 -4.944 -21.351 -3.12 -23.398 c 7.957 6.403 7.23 9.154 11.332 13.86 c 3.389 3.791 10.938 9.509 16.127 8.599 c 1.626 1.207 4.048 0.321 4.944 -1.381 C 760.056 877.198 745.651 870.24 736.728 849.786 z`}/>
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