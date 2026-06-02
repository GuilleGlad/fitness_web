import React, { useState } from 'react';
import BigTitle from '../components/BigTitle'; // Reusing the core component
import LoginForm from '../components/LoginForm';
import { TextField, Input, InputLabel, FormControl, FormHelperText, Button } from "@mui/material";
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!email || !password) {
            setError("Por favor, ingresa correo y contraseña.");
            return;
        }

        // Simulation: Here, you would send data to your API
        console.log("Attempting login:", { email, password });
        setError('');

        // Example: Simulate successful login after a short delay
        setTimeout(() => {
            alert('Login exitoso! Redireccionando...');
            // Redirect logic here
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
                <div className="text-center mb-10">
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
                    ¿No tienes cuenta? <a href="/register" className="text-yellow-400 hover:text-yellow-300">Regístrate aquí</a>
                </p>
            </div>
        </div>
    );
}

export default Login;