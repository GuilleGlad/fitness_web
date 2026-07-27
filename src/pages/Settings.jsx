import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';
import { verifyToken } from '../utils/tokenUtils';

const STORAGE_KEY = 'elitefit_settings';

const defaultSettings = {
  logoUrl: '',
  homeCarouselUrls: '',
  adsCarouselUrls: '',
  titulo: '',
  videoUrl: '',
  aboutUrl: '',
};

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState('logo');
  const token = localStorage.getItem('token');
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const checkToken = async () => {
      const redirectPath = await verifyToken();
      if (redirectPath) {
        navigate(redirectPath);
      }
    };

    checkToken();

    const fetchSettings = async () => {
      try {
        await axios.get(`${apiUrl}/admin/settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then((response) => {
          const { data } = response;
          if (data) {
            const { result } = data;
            const result_arr = result[0];
            const { logo, title, video } = result_arr;
            setSettings({
              logoUrl: result_arr.logo || '',
              homeCarouselUrls: (JSON.parse(result_arr.gallery) || []).join('\n'),
              adsCarouselUrls: (JSON.parse(result_arr.ads) || []).join('\n'),
              titulo: result_arr.title || '',
              videoUrl: result_arr.video_background || '',
              aboutUrl: result_arr.about || '',
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
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('No se pudieron recuperar los ajustes:', error);
        }
      }
    };
    fetchSettings();
  }, []);

  const previewUrls = useMemo(() => {
    return {
      video: settings.videoUrl || '',
      logo: settings.logoUrl || '',
      gallery: (settings.homeCarouselUrls || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      ads: (settings.adsCarouselUrls || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      about: settings.aboutUrl || '',
    };
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((previous) => ({ ...previous, [name]: value }));
  };

  const handleClear = (fieldName) => {
    setSettings((previous) => ({ ...previous, [fieldName]: '' }));
  };

  const openLibraryPicker = (target) => {
    setLibraryTarget(target);
    setIsLibraryOpen(true);
  };

  const handleSelectLibraryItem = (payload) => {
    const selectedItems = Array.isArray(payload) ? payload : [payload];
    const validItems = selectedItems.filter(Boolean);

    if (libraryTarget === 'logo' || libraryTarget === 'video' || libraryTarget === 'about') {
      if (libraryTarget === 'logo') {
        const logoItem = validItems.find((item) => item.mediaType === 'image') || validItems[0];
        if (!logoItem) {
          toast.error('Selecciona una imagen para el logotipo.');
          return;
        }
        setSettings((previous) => ({ ...previous, logoUrl: logoItem.url }));
      }
      if (libraryTarget === 'video') {
        const videoItem = validItems.find((item) => item.mediaType === 'video') || validItems[0];
        if (!videoItem) {
          toast.error('Selecciona un video para el fondo de cabecera.');
          return;
        }
        setSettings((previous) => ({ ...previous, videoUrl: videoItem.url }));
      }
      if (libraryTarget === 'about') {
        const aboutItem = validItems.find((item) => item.mediaType === 'image') || validItems[0];
        if (!aboutItem) {
          toast.error('Selecciona una imagen para Acerca de Nosotros.');
          return;
        }
        setSettings((previous) => ({ ...previous, aboutUrl: aboutItem.url }));
      }
    } else {
      const urls = validItems.map((item) => item.url).filter(Boolean);
      if (urls.length === 0) {
        toast.error('No se seleccionó ningún elemento válido.');
        return;
      }

      if (libraryTarget === 'gallery') {
        setSettings((previous) => ({
          ...previous,
          homeCarouselUrls: urls.join('\n'),
        }));
      } else {
        setSettings((previous) => ({
          ...previous,
          adsCarouselUrls: previous.adsCarouselUrls ? `${previous.adsCarouselUrls}\n${urls.join('\n')}` : urls.join('\n'),
        }));
      }
    }

    setIsLibraryOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error('No hay sesión activa. Inicia sesión nuevamente.');
      return;
    }

    const payload = {
      logo: settings.logoUrl || '',
      gallery: (settings.homeCarouselUrls || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      ads: (settings.adsCarouselUrls || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      title: settings.titulo || '',
      video: settings.videoUrl || '',
      about: settings.aboutUrl || '',
    };

    try {
      await axios.post(`${apiUrl}/admin/settings`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).then(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        toast.success('Ajustes guardados correctamente.');
      });
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      toast.error('No se pudieron guardar los ajustes.');
    }
  };

  // ---- reusable pair row component ----
  const PairRow = ({ icon, label, description, controlsLeft, previewRight }) => (
    <div className="rounded-[32px] border border-slate-800 bg-[#141820]/90 shadow-xl overflow-hidden transition-all hover:border-slate-700/60">
      <div className="flex flex-col md:flex-row">
        {/* LEFT — controls */}
        <div className="flex-1 p-6 lg:p-8 border-b md:border-b-0 md:border-r border-slate-800/50">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f1b80c]/15 text-lg">
              {icon}
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">{label}</h3>
              {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-3">{controlsLeft}</div>
        </div>

        {/* RIGHT — preview */}
        <div className="flex-[1.2] p-6 lg:p-8 bg-gradient-to-br from-slate-900/40 to-transparent">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-slate-500">Vista previa</p>
          {previewRight}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff', borderRadius: 16 } }} />
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">

          {/* Header */}
          <div className="flex flex-col gap-5 rounded-[40px] border border-slate-800 bg-[#141820] p-6 lg:p-8 shadow-2xl">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Admin</p>
              <h1 className="mt-3 text-4xl font-bold text-white">Ajustes de la web</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                Configura el logotipo, títulos, galerías y anuncios. Cada control muestra su vista previa en tiempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-fit rounded-3xl bg-[#f1b80c] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
            >
              Volver al dashboard
            </button>
          </div>

          {/* ---- SINGLE COLUMN PAIRED ROWS ---- */}
          <form onSubmit={handleSubmit}>

            {/* 1 — Título */}
            <PairRow
              icon="📝"
              label="Título"
              description="El título principal de la página."
              controlsLeft={
                <>
                  <input
                    name="titulo"
                    value={settings.titulo}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f1b80c]"
                    placeholder="Ejemplo de título"
                  />
                  <button type="button" onClick={() => handleClear('titulo')} className="w-fit rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                    Limpiar
                  </button>
                </>
              }
              previewRight={
                settings.titulo ? (
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
                    <p className="text-lg font-extrabold text-white leading-tight">{settings.titulo}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
                    <span className="text-xl text-slate-600">⚠️</span>
                    <p className="text-sm text-slate-500">Sin título establecido.</p>
                  </div>
                )
              }
            />

            {/* 2 — Logotipo */}
            <PairRow
              icon="🖼"
              label="Logotipo"
              description="Imagen del logotipo principal."
              controlsLeft={
                <>
                  <input hidden name="logoUrl" value={settings.logoUrl} onChange={handleChange} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openLibraryPicker('logo')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      📚 Biblioteca
                    </button>
                    <button type="button" onClick={() => handleClear('logoUrl')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      Limpiar
                    </button>
                  </div>
                </>
              }
              previewRight={
                previewUrls.logo ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
                    <img src={previewUrls.logo} alt="Logotipo" className="h-14 w-auto rounded-xl object-contain" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
                    <span className="text-xl text-slate-600">🖼</span>
                    <p className="text-sm text-slate-500">Sin logotipo seleccionado.</p>
                  </div>
                )
              }
            />

            {/* 3 — Acerca de Nosotros */}
            <PairRow
              icon="ℹ️"
              label="Acerca de Nosotros"
              description="Imagen para la sección 'Acerca de Nosotros'."
              controlsLeft={
                <>
                  <input hidden name="aboutUrl" value={settings.aboutUrl} onChange={handleChange} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openLibraryPicker('about')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      📚 Biblioteca
                    </button>
                    <button type="button" onClick={() => handleClear('aboutUrl')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      Limpiar
                    </button>
                  </div>
                </>
              }
              previewRight={
                previewUrls.about ? (
                  <div className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
                    <img src={previewUrls.about} alt="Acerca de nosotros" className="h-14 w-auto rounded-xl object-contain" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
                    <span className="text-xl text-slate-600">ℹ️</span>
                    <p className="text-sm text-slate-500">Sin imagen seleccionada.</p>
                  </div>
                )
              }
            />

            {/* 4 — Video de Fondo */}
            <PairRow
              icon="🎬"
              label="Video de Fondo"
              description="URL del video para el fondo de cabecera."
              controlsLeft={
                <>
                  <input hidden name="videoUrl" value={settings.videoUrl} onChange={handleChange} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openLibraryPicker('video')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      📚 Biblioteca
                    </button>
                    <button type="button" onClick={() => handleClear('videoUrl')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      Limpiar
                    </button>
                  </div>
                </>
              }
              previewRight={
                settings.videoUrl ? (
                  <video src={settings.videoUrl} className="w-full max-w-xs rounded-xl object-cover" autoPlay loop muted playsInline />
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
                    <span className="text-xl text-slate-600">🎬</span>
                    <p className="text-sm text-slate-500">Sin video seleccionado.</p>
                  </div>
                )
              }
            />

            {/* 5 — Galería del carrusel principal */}
            <PairRow
              icon="🖼"
              label="Galería del Carrusel Principal"
              description="Imágenes para el slider principal. Puedes pegar URLs separadas por coma."
              controlsLeft={
                <>
                  <textarea hidden name="homeCarouselUrls" value={settings.homeCarouselUrls} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f1b80c]" placeholder="https://.../foto-1.jpg, https://.../foto-2.jpg" />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openLibraryPicker('gallery')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      📚 Biblioteca
                    </button>
                    <button type="button" onClick={() => handleClear('homeCarouselUrls')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      Limpiar
                    </button>
                  </div>
                </>
              }
              previewRight={
                previewUrls.gallery.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.gallery.map((item) => (
                      <img key={item} src={item} alt="Carrusel" className="h-16 w-16 rounded-xl border border-slate-700/50 object-cover bg-slate-900" />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
                    <span className="text-xl text-slate-600">🖼</span>
                    <p className="text-sm text-slate-500">Sin imágenes cargadas.</p>
                  </div>
                )
              }
            />

            {/* 6 — Imágenes para anuncios */}
            <PairRow
              icon="📢"
              label="Imágenes para Anuncios"
              description="URLs de las imágenes promocionales del carrusel de anuncios."
              controlsLeft={
                <>
                  <textarea hidden name="adsCarouselUrls" value={settings.adsCarouselUrls} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f1b80c]" placeholder="https://.../ad-1.jpg, https://.../ad-2.jpg" />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => openLibraryPicker('ads')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      📚 Biblioteca
                    </button>
                    <button type="button" onClick={() => handleClear('adsCarouselUrls')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800">
                      Limpiar
                    </button>
                  </div>
                </>
              }
              previewRight={
                previewUrls.ads.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {previewUrls.ads.map((item) => (
                      <img key={item} src={item} alt="Anuncio" className="h-16 w-16 rounded-xl border border-slate-700/50 object-cover bg-slate-900" />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/30 px-4 py-8">
                    <span className="text-xl text-slate-600">📢</span>
                    <p className="text-sm text-slate-500">Sin anuncios cargados.</p>
                  </div>
                )
              }
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-3xl bg-gradient-to-r from-[#f1b80c] to-[#e5a50a] px-6 py-4 text-sm font-bold tracking-wide text-slate-950 shadow-lg shadow-[#f1b80c]/20 transition hover:from-[#d69e2e] hover:to-[#c7940a]"
            >
              Guardar ajustes
            </button>
          </form>

          {/* Library Modal */}
          {isLibraryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-6xl animate-[scaleIn_0.25s_ease-out]">
                <TrainerLibrary
                  isModal
                  selectionMode={libraryTarget === 'gallery' || libraryTarget === 'ads' ? 'multiple' : 'single'}
                  onSelectMedia={handleSelectLibraryItem}
                  onClose={() => setIsLibraryOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* scale-in animation for modal */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default Settings;
