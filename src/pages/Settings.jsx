import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';

const STORAGE_KEY = 'elitefit_settings';

const defaultSettings = {
  logoUrl: '',
  homeCarouselUrls: '',
  adsCarouselUrls: '',
};

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState('logo');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setSettings({ ...defaultSettings, ...parsed });
    } catch (error) {
      console.error('No se pudieron recuperar los ajustes:', error);
    }
  }, []);

  const previewUrls = useMemo(() => {
    return {
      logo: settings.logoUrl || '',
      gallery: (settings.homeCarouselUrls || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      ads: (settings.adsCarouselUrls || '')
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }, [settings]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((previous) => ({ ...previous, [name]: value }));
  };

  const openLibraryPicker = (target) => {
    setLibraryTarget(target);
    setIsLibraryOpen(true);
  };

  const handleSelectLibraryItem = (payload) => {
    const selectedItems = Array.isArray(payload) ? payload : [payload];
    const validItems = selectedItems.filter(Boolean);

    if (libraryTarget === 'logo') {
      const logoItem = validItems.find((item) => item.mediaType === 'image') || validItems[0];
      if (!logoItem) {
        toast.error('Selecciona una imagen para el logotipo.');
        return;
      }
      setSettings((previous) => ({ ...previous, logoUrl: logoItem.url }));
    } else {
      const urls = validItems.map((item) => item.url).filter(Boolean);
      if (urls.length === 0) {
        toast.error('No se seleccionó ningún elemento válido.');
        return;
      }

      if (libraryTarget === 'gallery') {
        // setSettings((previous) => ({
        //   ...previous,
        //   homeCarouselUrls: previous.homeCarouselUrls ? `${previous.homeCarouselUrls}\n${urls.join('\n')}` : urls.join('\n'),
        // }));
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

    const token = localStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;

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
    };

    try {
      await axios.post(`${apiUrl}/admin/settings`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success('Ajustes guardados correctamente.');
    } catch (error) {
      console.error('Error guardando ajustes:', error);
      toast.error('No se pudieron guardar los ajustes.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#fff',
            border: '1px solid #334155',
          },
        }}
      />

      <div className="mx-auto max-w-[1400px] space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Admin</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Ajustes de la web</h1>
            <p className="mt-2 max-w-2xl text-slate-400">
              Configura el logotipo, la galería del carrusel principal y las imágenes de anuncios desde la biblioteca.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
          >
            Volver al dashboard
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Configuración</h2>
              <p className="text-sm text-slate-400">Cada campo acepta URLs directas que puedes seleccionar desde la biblioteca modal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label htmlFor="logoUrl" className="block space-y-2 text-sm text-slate-200">
                <span>Logotipo</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="logoUrl"
                    name="logoUrl"
                    value={settings.logoUrl}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                    placeholder="https://.../logo.png"
                  />
                  <button
                    type="button"
                    onClick={() => openLibraryPicker('logo')}
                    className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Biblioteca
                  </button>
                </div>
              </label>

              <label htmlFor="homeCarouselUrls" className="block space-y-2 text-sm text-slate-200">
                <span>Galería del carrusel principal</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea
                    id="homeCarouselUrls"
                    name="homeCarouselUrls"
                    value={settings.homeCarouselUrls}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                    placeholder="https://.../foto-1.jpg
https://.../foto-2.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => openLibraryPicker('gallery')}
                    className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Biblioteca
                  </button>
                </div>
              </label>

              <label htmlFor="adsCarouselUrls" className="block space-y-2 text-sm text-slate-200">
                <span>Imágenes para anuncios</span>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <textarea
                    id="adsCarouselUrls"
                    name="adsCarouselUrls"
                    value={settings.adsCarouselUrls}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-3xl border border-slate-700 bg-[#0f172a] px-4 py-3 text-white outline-none transition focus:border-[#f1b80c]"
                    placeholder="https://.../ad-1.jpg
https://.../ad-2.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => openLibraryPicker('ads')}
                    className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                  >
                    Biblioteca
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="w-full rounded-3xl bg-[#f1b80c] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
              >
                Guardar ajustes
              </button>
            </form>
          </section>

          <section className="rounded-[40px] border border-slate-800 bg-[#141820] p-6 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white">Vista previa</h2>
              <p className="text-sm text-slate-400">Así se verán las URLs seleccionadas en la página principal.</p>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-slate-200">Logotipo</p>
                {previewUrls.logo ? (
                  <img src={previewUrls.logo} alt="Vista previa del logotipo" className="mt-4 h-20 w-auto rounded-2xl object-contain" />
                ) : (
                  <p className="mt-4 text-sm text-slate-400">Aún no hay logotipo seleccionado.</p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-slate-200">Galería del carrusel principal</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewUrls.gallery.length > 0 ? previewUrls.gallery.map((item) => (
                    <span key={item} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200">
                      {/* {item} */}
                    <img src={item} alt="Vista previa del carrusel" className="mt-2 h-16 w-auto rounded-2xl object-contain" />
                    </span>
                  )) : <span className="text-sm text-slate-400">No hay URLs cargadas.</span>}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="text-sm font-semibold text-slate-200">Imágenes para anuncios</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {previewUrls.ads.length > 0 ? previewUrls.ads.map((item) => (
                    <span key={item} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200">
                      {/* {item} */}
                      <img src={item} alt="Vista previa del anuncio" className="mt-2 h-16 w-auto rounded-2xl object-contain" />
                    </span>
                  )) : <span className="text-sm text-slate-400">No hay URLs cargadas.</span>}
                </div>
              </div>
            </div>
          </section>
        </div>

        {isLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-6xl">
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
  );
};

export default Settings;
