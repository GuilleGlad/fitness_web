import React, {useState, useEffect} from 'react';
import BigTitle from '../components/BigTitle'; // Reusing the core component
import { TextField, Input, InputLabel, FormControl, FormHelperText, Button } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import {Link, useNavigate} from 'react-router-dom';
import { useServerStatus } from '../hooks/useServerStatus';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const apiUrl = process.env.REACT_APP_API_URL;
    const [serverStatusStr, setServerStatusStr] = useState('El servidor esta offline');
    const loginSuccessNotif = () => {
        toast("Login Exitoso, redirigiendo...",
            {
                icon: '👍',
                style: {
                    color: 'white',
                    background: 'green'
                }
            }
        );
    }
    const loginErrorNotif = () => {
        toast("Error de Login.",
            {
                icon: '👎',
                style: {
                    color: 'white',
                    background: 'red'
                }
            }
        )
    }
    const isServerOnline = useServerStatus(apiUrl + "/testApi", 5000,setServerStatusStr);
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
            localStorage.setItem('token', token);
            localStorage.setItem('role', user.role || 3);
            localStorage.setItem('name', user.name || user.email || 'Usuario EliteFit');
            loginSuccessNotif();
            setTimeout(() => {
                if (Number(user.role) === 3) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-10">
                    <Toaster />
                    <div className='text-right'>
                        {
                            !isServerOnline && <a id='serverStatus'><FontAwesomeIcon icon={faDotCircle} color='gray' /></a>
                        }
                        {
                            isServerOnline && <a id='serverStatus'><FontAwesomeIcon icon={faDotCircle} color='lightgreen' className='text-green-400 animate-pulse' /></a>
                        }
                    </div>
                    <Tooltip anchorSelect='#serverStatus' content={serverStatusStr} />
                    <h1 className="text-4xl font-bold text-white mb-2">EliteFit</h1>
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
                    className="w-full bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition duration-200 text-lg shadow-lg"
                >
                    Continuar
                </button>

                <p className="text-center text-sm mt-6 text-gray-400">
                    ¿No tienes cuenta? <Link to="/register" className="text-yellow-400 hover:text-yellow-300">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;