import React, { useState } from 'react';
import StepBiometrics from '../components/StepBiometrics';
import StepObjectives from '../components/StepObjectives';
import StepVisualRegister from '../components/StepVisualRegister';
import StepTrainerAssignment from '../components/StepTrainerAssignment';

const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    altura: '', peso: '', edad: '', diasEntrenamiento: '3',
    objetivo: '', // 'perder_grasa' | 'aumentar_masa'
    fotoFrente: null, fotoEspalda: null,
    medidas: { cintura: '', cadera: '', brazos: '', piernas: '' },
    trainerId: null
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = () => {
    console.log("Datos listos para enviar a EliteFit:", formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-4 font-sans select-none">
      {/* Contenedor con la estética exacta de la tarjeta en image_8be3de.png */}
      <div className="w-full max-w-md rounded-2xl bg-[#1e222b] p-8 shadow-2xl relative border border-slate-800/40">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-wide text-white">EliteFit</h1>
          <p className="text-xs font-bold text-[#f1b80c] mt-1 tracking-wide">
            Regístrate para comenzar tu transformación.
          </p>
          
          {/* Indicador de pasos dinámico */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Progreso del Onboarding</span>
            <span className="font-bold text-white">Paso {currentStep} de 4</span>
          </div>
          
          {/* Barra de Progreso */}
          <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-[#f1b80c] h-full transition-all duration-300 ease-out" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Render dinámico de pasos basados en image_8be6ca.png */}
        <div className="min-h-[280px] flex flex-col justify-center">
          {currentStep === 1 && <StepBiometrics formData={formData} updateData={updateFormData} next={nextStep} />}
          {currentStep === 2 && <StepObjectives formData={formData} updateData={updateFormData} next={nextStep} prev={prevStep} />}
          {currentStep === 3 && <StepVisualRegister formData={formData} updateData={updateFormData} next={nextStep} prev={prevStep} />}
          {currentStep === 4 && <StepTrainerAssignment formData={formData} updateData={updateFormData} submit={handleSubmit} prev={prevStep} />}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;