import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';
import { useServerStatus } from '../hooks/useServerStatus';
import { useNavigate } from 'react-router-dom';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet-async';
// Simulación del enum para los roles

const ROLES = {
    ADMIN: 1,
    TRAINER: 2,
    CLIENT: 3,
};


export default function RegisterForm() {
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const [serverStatusStr, setServerStatusStr] = useState('El servidor esta offline');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        genre: '',
        role: 0, // Valor por defecto
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [online, setOnline] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Errores de validación por campo, mostrados debajo de cada input.
    const [fieldErrors, setFieldErrors] = useState({});
    // Solo mostramos el error de un campo una vez que el usuario ya
    // interactuó con él (blur) o intentó enviar el formulario, para no
    // pintar todo de rojo apenas se abre la pantalla.
    const [touched, setTouched] = useState({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Teléfono opcional: si se completa, validamos un formato básico
    // (dígitos, espacios, +, guiones y paréntesis).
    const phoneRegex = /^[0-9+()\-\s]{6,20}$/;
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
    useEffect(() => {
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


    // Devuelve el mensaje de error para un campo dado, en base al
    // formData actual. `data` permite validar con un valor "adelantado"
    // (por ejemplo, la contraseña recién tipeada) antes de que el estado
    // termine de actualizarse.
    const validateField = (name, data = formData) => {
        switch (name) {
            case 'name':
                return data.name.trim() ? '' : 'El nombre es obligatorio.';
            case 'email':
                if (!data.email.trim()) return 'El email es obligatorio.';
                if (!emailRegex.test(data.email)) return 'Ingresa un correo electrónico válido.';
                return '';
            case 'password':
                if (!data.password) return 'La contraseña es obligatoria.';
                if (data.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
                return '';
            case 'confirmPassword':
                if (!data.confirmPassword) return 'Confirma tu contraseña.';
                if (data.password !== data.confirmPassword) return 'Las contraseñas no coinciden.';
                return '';
            case 'phone':
                if (!data.phone) return ''; // opcional
                return phoneRegex.test(data.phone) ? '' : 'Ingresa un teléfono válido.';
            case 'genre':
                return data.genre ? '' : 'Selecciona un género.';
            case 'role':
                return data.role !== 0 ? '' : 'Selecciona un rol.';
            default:
                return '';
        }
    };

    // Valida todos los campos y devuelve el objeto de errores completo.
    const validateAll = (data = formData) => {
        const fields = ['name', 'email', 'password', 'confirmPassword', 'phone', 'genre', 'role'];
        const errors = {};
        fields.forEach((field) => {
            const message = validateField(field, data);
            if (message) errors[field] = message;
        });
        return errors;
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextData = {
            ...formData,
            [name]: name === 'role' ? parseInt(value, 10) : value,
        };
        setFormData(nextData);
        setIsOpen(false);

        // Revalida el campo tocado y, si es la contraseña, revalida
        // también "confirmar contraseña" ya que depende de ella.
        setFieldErrors((prev) => {
            const next = { ...prev, [name]: validateField(name, nextData) };
            if (name === 'password') {
                next.confirmPassword = validateField('confirmPassword', nextData);
            }
            return next;
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setFieldErrors((prev) => ({ ...prev, [name]: validateField(name) }));
        setIsOpen(false);
    };

    const isServerOnline = useServerStatus(apiUrl + "/testApi", 5000, setServerStatusStr);

    // Clase base de los inputs, agregando un borde rojo cuando el campo
    // fue tocado y tiene un error de validación.
    const getInputClass = (name) => {
        const base = "w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 placeholder-slate-500 font-medium rounded-xl focus:outline-none focus:ring-2 transition-all";
        const hasError = touched[name] && fieldErrors[name];
        return `${base} ${hasError ? 'ring-2 ring-red-500 focus:ring-red-500' : 'focus:ring-[#facc15]'}`;
    };

    // Mensaje de error debajo de un campo, si corresponde.
    const FieldError = ({ name }) => (
        touched[name] && fieldErrors[name] ? (
            <p className="mt-1 text-xs text-red-400">{fieldErrors[name]}</p>
        ) : null
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Evita doble submit (doble click, o Enter + click) mientras
        // ya hay un registro en curso.
        if (isSubmitting) {
            return;
        }

        setError('');
        setSuccess(false);

        // Valida todos los campos y marca todos como "touched" para que
        // se muestren los mensajes de error debajo de cada input.
        const errors = validateAll();
        setFieldErrors(errors);
        setTouched({ name: true, email: true, password: true, confirmPassword: true, phone: true, genre: true, role: true });

        if (Object.keys(errors).length > 0) {
            registroErrorNotif('Revisa los campos marcados en rojo.');
            return;
        }

        // Si todo está correcto
        setIsSubmitting(true);
        try {
            const response = await axios.post(apiUrl + "/auth/register", formData);
            console.log('Datos enviados con éxito:', formData);
            console.log(response.data);
            const { token, user } = response.data;
            localStorage.setItem('client_id', user.id);
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role);
            localStorage.setItem('name', user.name || user.email || 'Usuario EliteFit');
            localStorage.setItem('status', user.status);
            localStorage.setItem('genre', user.genre);
            setSuccess(true);
            registroSuccessNotif("Registro Exitoso, redirigiendo...");
            // Verificar si es cliente (rol 3) y status 0 para redirigir a wizard
            const role = typeof user.role === 'string' && /^\d+$/.test(user.role)
                ? Number(user.role)
                : user.role;
            const redirectUrl = (role === 3 && user.status === 0) ? "/wizard" : "/dashboard";
            //redireccionar al dashboard o a la página principal después del login exitoso
            setTimeout(() => {
                navigate(redirectUrl);
            }, 1500);
        } catch (e) {
            // console.error("error: " + e.status);
            setSuccess(false);
            setIsSubmitting(false);
            if (e.status == 409) {
                setFieldErrors((prev) => ({ ...prev, email: 'Este email ya está registrado.' }));
                registroErrorNotif("El email ya existe, por favor revise los campos del formulario.");
            }
            else
                registroErrorNotif("Error de registro.");
        }
    };

    return (
        <>
            <Helmet>
                <title>{settings.titulo || "GYM"}</title>
            </Helmet>
            <div className="flex min-h-screen items-center justify-center  bg-[#0d1424] p-4">
                <div className="w-full max-w-md rounded-2xl bg-[#1e2638] p-8 shadow-xl text-center relative bg-gradient-to-bl from-zinc-800 via-stone-700 to-zinc-900">
                    {/* Indicador visual de la esquina superior derecha */}
                    {isServerOnline && <FontAwesomeIcon id='serverStatus' icon={faDotCircle} className='absolute top-6 right-6 text-green-400 animate-pulse' />}
                    {!isServerOnline && <FontAwesomeIcon id='serverStatus' icon={faDotCircle} className='absolute top-6 right-6 text-gray-400 animate-pulse' />}
                    <Tooltip anchorSelect='#serverStatus' content={serverStatusStr} />
                    {/* Logo y Encabezado */}
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{settings.titulo}</h1>
                    <p className="text-[#facc15] font-medium mt-2 text-sm">
                        Regístrate para comenzar tu transformación.
                    </p>

                    <h2 className="text-xl font-semibold text-white mt-6 mb-6">Crear Cuenta</h2>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">

                        {/* Campo: Nombre */}
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Nombre y Apellido"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('name')}
                            />
                            <FieldError name="name" />
                        </div>

                        {/* Campo: Email */}
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('email')}
                            />
                            <FieldError name="email" />
                        </div>

                        {/* Campo: Contraseña */}
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('password')}
                            />
                            <FieldError name="password" />
                        </div>

                        {/* Campo: Confirmar Contraseña */}
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirmar Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('confirmPassword')}
                            />
                            <FieldError name="confirmPassword" />
                        </div>

                        {/* Campo: Telefono */}
                        <div>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Teléfono (opcional)"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={getInputClass('phone')}
                            />
                            <FieldError name="phone" />
                        </div>

                        {/* Campo: Género (Dropdown) */}
                        <div>
                            <select
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${getInputClass('genre')} cursor-pointer`}
                            >
                                <option value="">Seleccionar Género...</option>
                                <option value="f">Femenino</option>
                                <option value="m">Masculino</option>
                                <option value="n">Prefiere no decirlo</option>
                            </select>
                            <FieldError name="genre" />
                        </div>

                        {/* Campo: Rol (Dropdown) */}
                        <div>
                            <div className="relative">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    onMouseDown={() => setIsOpen(true)}
                                    onBlur={handleBlur}
                                    className={`${getInputClass('role')} cursor-pointer appearance-none pr-10`}
                                >
                                    <option value={0}>Seleccionar Rol...</option>
                                    <option value={ROLES.CLIENT}>Cliente</option>
                                    <option value={ROLES.TRAINER}>Entrenador (Trainer)</option>
                                    {/* <option value={ROLES.ADMIN}>Administrador</option> */}
                                </select>

                                {/* Contenedor de los Chevrons absolute */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-700">
                                    {isOpen ? (
                                        // Icono: Chevron Up (Flecha arriba)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                        </svg>
                                    ) : (
                                        // Icono: Chevron Down (Flecha abajo)
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <FieldError name="role" />
                        </div>

                        {/* Botón de Enviar */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 mt-2 bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 font-bold text-lg rounded-xl shadow-md transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#eab308]"
                        >
                            {isSubmitting ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </form>

                    {/* Enlace de retorno */}
                    <p className="text-xs text-slate-400 mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-[#facc15] hover:underline font-semibold">
                            Inicia sesión aquí
                        </Link>
                    </p>
                    <p className="text-center text-sm mt-6 text-gray-400">
                        <Link to="/" className="text-yellow-400 hover:text-yellow-300">Regresar a la página principal <FontAwesomeIcon icon={faHome} /></Link>
                    </p>
                </div>
            </div>
        </>
    );
}