import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import TrainerLibrary from './TrainerLibrary';
import { verifyToken } from '../utils/tokenUtils';
import PairRow from '../components/PairRow';
import PairRowText from '../components/PairRowText';

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

const NAV_SECTIONS = [
  { id: 'general', label: 'General', icon: '📝' },
  { id: 'multimedia', label: 'Marca y multimedia', icon: '🖼' },
  { id: 'galerias', label: 'Galerías', icon: '🖼' },
  { id: 'contacto', label: 'Contacto', icon: '👤' },
  { id: 'redes', label: 'Redes sociales', icon: '🔗' },
];

// ---- lightweight section wrapper used for standard settings groups ----
const SettingsSection = ({ id, icon, title, description, children }) => (
  <section id={id} className="scroll-mt-24">
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f1b80c]/15 text-lg">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

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
        setSettings((previous) => ({ ...previous, aboutUrl: selectedItems[0].url }));
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
      username: settings.username || '',
      email: settings.email || '',
      phone: settings.phone || '',
      address: settings.address || '',
      x_link: settings.xLink || '',
      instagram_link: settings.instagramLink || '',
      youtube_link: settings.youtubeLink || '',
      facebook_link: settings.facebookLink || '',
      tiktok_link: settings.tiktokLink || '',
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

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff', borderRadius: 16 } }} />
      <div className="min-h-screen bg-[#0d1117] text-white">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:max-w-6xl lg:p-10 2xl:max-w-7xl">

          {/* Header */}
          <div className="flex flex-col gap-5 rounded-[32px] border border-slate-800 bg-[#141820] p-6 shadow-2xl sm:rounded-[40px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Admin</p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Ajustes de la web</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400 lg:max-w-2xl">
                Configura el logotipo, títulos, galerías, contacto y redes sociales. Los cambios se reflejan en tiempo real.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-fit shrink-0 rounded-3xl bg-[#f1b80c] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#d69e2e]"
            >
              Volver al dashboard
            </button>
          </div>

          {/* Mobile quick-jump pills */}
          <nav className="sticky top-2 mt-6 flex gap-2 overflow-x-auto p-2 lg:hidden bg-slate-800 -ml-4">
            {NAV_SECTIONS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="shrink-0 rounded-2xl border border-slate-800 bg-[#141820] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-[#f1b80c]/50 hover:text-white"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </nav>

          {/* ---- MAIN LAYOUT: sticky sidebar nav + content ---- */}
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">

            {/* Sidebar nav (desktop only) */}
            <nav className="hidden lg:block">
              <div className="sticky top-10 space-y-1 rounded-[28px] border border-slate-800 bg-[#141820] p-3">
                {NAV_SECTIONS.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Form content */}
            <form onSubmit={handleSubmit} className="space-y-10">

              {/* ============================================== */}
              {/* GENERAL                                          */}
              {/* ============================================== */}
              <SettingsSection id="general" icon="📝" title="General" description="El título principal de tu página.">
                <PairRowText
                  icon="📝"
                  label="Título"
                  description="El título principal de la página."
                  name="titulo"
                  placeholder="Ejemplo de título"
                  settings={settings}
                  handleChange={handleChange}
                  handleClear={handleClear}
                />
              </SettingsSection>

              {/* ============================================== */}
              {/* MARCA Y MULTIMEDIA                               */}
              {/* ============================================== */}
              <SettingsSection id="multimedia" icon="🖼" title="Marca y multimedia" description="Logotipo, foto personal y video de fondo con vista previa en tiempo real.">

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

                <PairRow
                  icon="ℹ️"
                  label="Mi foto"
                  description="Foto Personal."
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
              </SettingsSection>

              {/* ============================================== */}
              {/* GALERÍAS                                         */}
              {/* ============================================== */}
              <SettingsSection id="galerias" icon="🖼" title="Galerías" description="Imágenes del carrusel principal y de la sección de anuncios.">

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
              </SettingsSection>

              {/* ============================================== */}
              {/* CONTACTO                                         */}
              {/* ============================================== */}
              <SettingsSection id="contacto" icon="👤" title="Contacto" description="Datos públicos de usuario y contacto directo.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <PairRowText
                    icon="👤"
                    label="Username"
                    description="Nombre de usuario público."
                    name="username"
                    placeholder="Ejemplo: johndoe123"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="📧"
                    label="Email"
                    description="Correo electrónico de contacto principal."
                    name="email"
                    type="email"
                    placeholder="Ejemplo: admin@example.com"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="📞"
                    label="Teléfono"
                    description="Número de teléfono de contacto."
                    name="phone"
                    type="tel"
                    placeholder="Ejemplo: +52 123 456 7890"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="📍"
                    label="Dirección"
                    description="Dirección física de la ubicación."
                    name="address"
                    placeholder="Ejemplo: Av. Reforma 222, CDMX"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                </div>
              </SettingsSection>

              {/* ============================================== */}
              {/* REDES SOCIALES                                   */}
              {/* ============================================== */}
              <SettingsSection id="redes" icon="🔗" title="Redes sociales" description="Enlaces a tus perfiles. Déjalos vacíos si no aplican.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <PairRowText
                    icon="𝕏"
                    label="X (Twitter)"
                    description="URL completa de tu perfil en X."
                    name="xLink"
                    type="url"
                    placeholder="https://x.com/tu-usuario"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="📸"
                    label="Instagram"
                    description="URL completa de tu perfil de Instagram."
                    name="instagramLink"
                    type="url"
                    placeholder="https://instagram.com/tu-usuario"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="▶️"
                    label="YouTube"
                    description="URL completa de tu canal de YouTube."
                    name="youtubeLink"
                    type="url"
                    placeholder="https://youtube.com/@tu-canal"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="📘"
                    label="Facebook"
                    description="URL completa de tu página de Facebook."
                    name="facebookLink"
                    type="url"
                    placeholder="https://facebook.com/tu-pagina"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                  <PairRowText
                    icon="🎵"
                    label="TikTok"
                    description="URL completa de tu perfil de TikTok."
                    name="tiktokLink"
                    type="url"
                    placeholder="https://tiktok.com/@tu-usuario"
                    settings={settings}
                    handleChange={handleChange}
                    handleClear={handleClear}
                  />
                </div>
              </SettingsSection>

              {/* Submit */}
              <div className="sticky bottom-4 flex flex-col gap-3 rounded-[28px] border border-slate-800 bg-[#141820]/95 p-4 shadow-2xl backdrop-blur sm:flex-row-reverse sm:p-5">
                <button
                  type="submit"
                  className="w-full rounded-3xl bg-gradient-to-r from-[#f1b80c] to-[#e5a50a] px-6 py-4 text-sm font-bold tracking-wide text-slate-950 shadow-lg shadow-[#f1b80c]/20 transition hover:from-[#d69e2e] hover:to-[#c7940a] sm:flex-1"
                >
                  Guardar ajustes
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-6 py-4 text-sm font-bold tracking-wide text-slate-300 transition hover:bg-slate-800 sm:flex-1"
                >
                  Volver al dashboard
                </button>
              </div>
            </form>
          </div>

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
