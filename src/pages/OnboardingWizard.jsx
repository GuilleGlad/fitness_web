import React, { useState } from 'react';
import StepBiometrics from '../components/StepBiometrics';
import StepObjectives from '../components/StepObjectives';
import StepVisualRegister from '../components/StepVisualRegister';
import StepTrainerAssignment from '../components/StepTrainerAssignment';
import axios from 'axios';
import toast from 'react-hot-toast';
import {Toaster} from 'react-hot-toast';

const OnboardingWizard = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(
    {
      height: '',
      weight: '',
      age: '',
      training_days: '3',
      goal: '', // 'perder_grasa' | 'aumentar_masa'
      photo_front_url: null,
      photo_back_url: null,
      waist: '',
      hips: '',
      arms: '',
      legs: '',
      trainerId: null,
      client_id: localStorage.getItem('client_id') || null
    });
  const registroSuccessNotif = (text) => {
    toast(text,
      {
        icon: '👍',
        style: {
          color: 'white',
          background: 'green'
        }
      }
    );
  }
  const registroErrorNotif = (text) => {
    toast(text,
      {
        icon: '👎',
        style: {
          color: 'white',
          background: 'red'
        }
      }
    )
  }
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    console.log(formData);
  };

  const handleSubmit = () => {
    console.log("Datos listos para enviar a EliteFit:", formData);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": "Bearer " + localStorage.getItem('token')
      }
    }
    const response_progress = axios.post(apiUrl + "/progress/add", formData, config)
      .then((res) => {
        console.log("Respuesta del servidor:", res.data);
        registroSuccessNotif("Registro de datos Exitoso.");
      })
      .catch((err) => {
        console.error("Error al enviar datos:", err);
        registroErrorNotif("Hubo un error al registrar los datos. Por favor, inténtalo de nuevo.");
      });

  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-4 font-sans select-none">
      {/* Contenedor con la estética exacta de la tarjeta en image_8be3de.png */}
      <div className="w-full max-w-md rounded-2xl bg-[#1e222b] p-8 shadow-2xl relative border border-slate-800/40">
<Toaster />
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