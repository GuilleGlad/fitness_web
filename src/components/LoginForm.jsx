import React, { useState, useEffect } from 'react';
import BigTitle from '../components/BigTitle'; // Reusing the core component
import { TextField, Input, InputLabel, FormControl, FormHelperText, Button } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faDotCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { Link, useNavigate } from 'react-router-dom';
import { useServerStatus } from '../hooks/useServerStatus';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet-async';
const LoginForm = () => {
    const ROLE_MAP = {
        'admin': 1,
        'trainer': 2,
        'client': 3,
    };
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;
    const [serverStatusStr, setServerStatusStr] = useState('El servidor esta offline');
    const [fieldsEmpty, setFieldsEmpty] = useState(true);
    const [loading, setLoading] = useState(false);
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
        if (email != '' && password != '') {
            setFieldsEmpty(false);
        } else {
            setFieldsEmpty(true);
        }
    })

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

    const loginSuccessNotif = () => {
        toast.success("Login Exitoso, redirigiendo...");
    }
    const loginErrorNotif = () => {
        toast.error("Error de Login.");
    }
    const isServerOnline = useServerStatus(apiUrl + "/testApi", 5000, setServerStatusStr);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Por favor, ingresa correo y contraseña.");
            return;
        }

        const loginData = {
            email,
            password,
        };

        try {
            const response = await axios.post(apiUrl + "/auth/login", loginData);
            const { token, user } = response.data;
            localStorage.setItem('client_id', user.id);
            localStorage.setItem('token', token);
            const roleFromResponse = user.role;
            const role = typeof roleFromResponse === 'string' && /^\d+$/.test(roleFromResponse)
                ? Number(roleFromResponse)
                : ROLE_MAP[roleFromResponse?.toLowerCase()] || 3;
            localStorage.setItem('role', role);
            localStorage.setItem('name', user.name || user.email || 'Usuario EliteFit');
            localStorage.setItem('status', user.status);
            localStorage.setItem('genre', user.genre);
            loginSuccessNotif();
            setLoading(true);
            setTimeout(() => {
                if (role === 3 && user.status === 0) {
                    navigate('/wizard');
                } else {
                    navigate('/dashboard');
                }
            }, 1200);
        } catch (e) {
            loginErrorNotif();
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleLogin(event);
        }
    };

    return (
        <>
        <Helmet>
            <title>{settings.titulo || "GYM"}</title>
        </Helmet>        
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 ">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl bg-gradient-to-bl from-zinc-800 via-stone-700 to-zinc-900">
                <div className="text-center mb-10">
                    <div className='text-right'>
                        {
                            !isServerOnline && <a id='serverStatus'><FontAwesomeIcon icon={faDotCircle} color='gray' /></a>
                        }
                        {
                            isServerOnline && <a id='serverStatus'><FontAwesomeIcon icon={faDotCircle} color='lightgreen' className='text-green-400 animate-pulse' /></a>
                        }
                    </div>
                    <Tooltip anchorSelect='#serverStatus' content={serverStatusStr} />
                    <h1 className="text-4xl font-bold text-white mb-2">{settings.titulo}</h1>
                    <p className="text-xl text-yellow-400">Inicia sesión para comenzar tu transformación.</p>
                </div>

                {/* Login Form Structure (Simulated by the button handler above) */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-6 text-center">Iniciar Sesión</h2>
                    <TextField
                        label="Email"
                        variant="filled"
                        color="secondary"
                        size="small"
                        fullWidth
                        sx={{
                            backgroundColor: "lightGray",
                            "&:hover": { backgroundColor: "white" },
                            fontWeight: "bold",
                            borderRadius: 3,
                            marginBottom: 2,
                        }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <TextField
                        type='password'
                        label="Password"
                        variant="filled"
                        color="secondary"
                        size="small"
                        fullWidth
                        sx={{
                            backgroundColor: "lightGray",
                            "&:hover": { backgroundColor: "white" },
                            fontWeight: "bold",
                            borderRadius: 3,
                        }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Placeholder for the actual form, using the handler to simulate submission */}
                <button
                    onClick={handleLogin}
                    disabled={fieldsEmpty}
                    className="w-full py-3 mt-2 bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 font-bold text-lg rounded-xl shadow-md transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#eab308]"
                >
                    {!loading && <span>Continuar</span>}
                    {loading && <FontAwesomeIcon icon={faArrowsRotate} spin="1"></FontAwesomeIcon>}
                </button>

                <p className="text-center text-sm mt-6 text-gray-400">
                    ¿No tienes cuenta? <Link to="/register" className="text-yellow-400 hover:text-yellow-300">Regístrate aquí</Link>
                </p>
                <p className="text-center text-sm mt-6 text-gray-400">
                    <Link to="/" className="text-yellow-400 hover:text-yellow-300">Regresar a la página principal <FontAwesomeIcon icon={faHome} /></Link>
                </p>
            </div>
        </div>
        </>
    );
};

export default LoginForm;