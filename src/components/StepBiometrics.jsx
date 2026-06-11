import React from 'react';

const StepBiometrics = ({ formData, updateData, next }) => {
    const handleChange = (e) => {
        updateData({ [e.target.name]: e.target.value });
    };

    // Clases compartidas para replicar el input gris de image_8be3de.png
    const inputStyle = "w-full px-4 py-3.5 bg-[#cccccc] text-[#1e222b] font-semibold rounded-xl placeholder-[#555555] focus:outline-none focus:ring-2 focus:ring-[#f1b80c] transition-all text-sm";

    return (
        <div className="space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-center text-white mb-2">Formulario Biométrico</h2>

            <div className="grid grid-cols-2 gap-3">
                <input type="number" name="height" placeholder="Altura (cm)" value={formData.height} onChange={handleChange} className={inputStyle} />
                <input type="number" name="weight" placeholder="Peso (kg)" value={formData.weight} onChange={handleChange} className={inputStyle} />
            </div>

            <input type="number" name="age" placeholder="Edad" value={formData.age} onChange={handleChange} className={inputStyle} />

            <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Días de entrenamiento:</label>
                <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((dias) => (
                        <button
                            key={dias} type="button" onClick={() => updateData({ training_days: String(dias) })}
                            className={`py-3 rounded-xl font-bold text-sm transition-all ${formData.training_days === String(dias)
                                    ? 'bg-[#f1b80c] text-[#1e222b] shadow-lg shadow-[#f1b80c]/20'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            {dias} días
                        </button>
                    ))}
                </div>
            </div>

            {/* Botón Principal Estilo image_8be3de.png */}
                <button
                    disabled={!formData.height || !formData.weight || !formData.age}
                    onClick={next}
                    className="w-full py-3.5 mt-2 bg-[#f1b80c] text-[#1e222b] font-bold text-base rounded-xl hover:bg-[#d9a406] active:scale-[0.99] transition-all shadow-md disabled:opacity-40 disabled:pointer-events-none"
                >
                    Siguiente
                </button>
        </div>
    );
};

export default StepBiometrics;