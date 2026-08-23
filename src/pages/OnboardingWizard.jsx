import React, { useState, useEffect } from 'react';
import StepBiometrics from '../components/StepBiometrics';
import StepObjectives from '../components/StepObjectives';
import StepVisualRegister from '../components/StepVisualRegister';
import StepTrainerAssignment from '../components/StepTrainerAssignment';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { verifyToken } from '../utils/tokenUtils';

const OnboardingWizard = () => {
  const navigate = useNavigate();
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
      client_id: localStorage.getItem('client_id'),
    });

    const [settings, setSettings] = useState([]);

    const STORAGE_KEY = 'elitefit_settings';

    const defaultSettings = {
    logoUrl: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    homeCarouselUrls: '',
    adsCarouselUrls: '',
    titulo: '',
    videoUrl: '',
    aboutUrl: '',
    xLink: '',
    instagramLink: '',
    youtubeLink: '',
    facebookLink: '',
    tiktokLink: '',
    };

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

  const isSubmittingRef = React.useRef(false);

  const handleSubmit = () => {
    // Guarda adicional (defensa en profundidad) para no disparar dos
    // POST /progress/add si esta función se llegara a invocar dos veces
    // seguidas, además del guard que ya tiene el botón en
    // StepTrainerAssignment.
    if (isSubmittingRef.current) {
      return Promise.resolve();
    }
    isSubmittingRef.current = true;

    console.log("Datos listos para enviar a EliteFit:", formData);
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": "Bearer " + localStorage.getItem('token')
      }
    }
    // Se retorna la promesa para que el botón "Registrarse" (en
    // StepTrainerAssignment) pueda hacer `await submit()` y quedarse
    // deshabilitado hasta que la petición realmente termine.
    return axios.post(apiUrl + "/progress/add", formData, config)
      .then((res) => {
        console.log("Respuesta del servidor:", res.data);
        localStorage.setItem('status', 1);
        registroSuccessNotif("Registro de datos Exitoso, redirigiendo...");
      }).then(() => {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      })
      .catch((err) => {
        console.error("Error al enviar datos:", err);
        registroErrorNotif("Hubo un error al registrar los datos. Por favor, inténtalo de nuevo.");
      })
      .finally(() => {
        isSubmittingRef.current = false;
      });

  };
  useEffect(() => {
    var redirectPath;
    const checkToken = async () => {
      redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };

    checkToken();

    const fetchSettings = async () => {
      try {
        await axios.get(`${apiUrl}/admin/settings`).then((response) => {
          const { data } = response;
          console.log(data);
          if (data) {
            const { result } = data;
            const result_arr = result[0];
            const { logo, title, video_background } = result_arr;
            setSettings({
              logoUrl: logo || '',
              homeCarouselUrls: (JSON.parse(result_arr.gallery) || []).join('\n'),
              adsCarouselUrls: (JSON.parse(result_arr.ads) || []).join('\n'),
              titulo: title || '',
              videoUrl: video_background || '',
              aboutUrl: result_arr.about || '',
              username: result_arr.username || '',
              email: result_arr.email || '',
              phone: result_arr.phone || '',
              address: result_arr.address || '',
              xLink: result_arr.x_link || '',
              instagramLink: result_arr.instagram_link || '',
              youtubeLink: result_arr.youtube_link || '',
              facebookLink: result_arr.facebook_link || '',
              tiktokLink: result_arr.tiktok_link || '',
            });
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Error cargando ajustes:', error);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
          const parsed = JSON.parse(saved);
          console.log(parsed);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('No se pudieron recuperar los ajustes:', error);
        }
      }
    };
    fetchSettings();
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] p-4 font-sans select-none">
      {/* Contenedor con la estética exacta de la tarjeta en image_8be3de.png */}
      <div className="w-full max-w-md rounded-2xl bg-[#1e222b] p-8 shadow-2xl relative border border-slate-800/40 bg-gradient-to-bl from-zinc-800 via-stone-700 to-zinc-900">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-wide text-white">{settings.titulo}</h1>
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
          {currentStep === 1 && <StepBiometrics formData={formData} updateData={updateFormData} next={nextStep}  />}
          {currentStep === 2 && <StepObjectives formData={formData} updateData={updateFormData} next={nextStep} prev={prevStep} />}
          {currentStep === 3 && <StepVisualRegister formData={formData} updateData={updateFormData} next={nextStep} prev={prevStep} />}
          {currentStep === 4 && <StepTrainerAssignment formData={formData} updateData={updateFormData} submit={handleSubmit} prev={prevStep} />}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;