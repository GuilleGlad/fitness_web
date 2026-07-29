import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons';
import toast, { Toaster } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';
import { useServerStatus } from '../hooks/useServerStatus';
import {useNavigate } from 'react-router-dom';
import {faHome} from '@fortawesome/free-solid-svg-icons';
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
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'role' ? parseInt(value, 10) : value,
        }));
        setIsOpen(false)
    };

    const isServerOnline = useServerStatus(apiUrl + "/testApi", 5000, setServerStatusStr);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // 1. Validaciones básicas
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.genre || formData.role === 0) {
            // setError('Todos los campos son obligatorios.');
            registroErrorNotif('Todos los campos son obligatorios.');
            return;
        }

        // 2. Validación de Email (Regex estándar)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            // setError('Por favor, ingresa un correo electrónico válido.');
            registroErrorNotif('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        // 3. Validación de contraseñas coincidentes
        if (formData.password !== formData.confirmPassword) {
            // setError('Las contraseñas no coinciden.');
            registroErrorNotif('Las contraseñas no coinciden.');
            return;
        }

        // 4. Validación de longitud mínima de contraseña (opcional pero recomendada)
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            registroErrorNotif('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        // 5. Validación de selección de género
        if (!formData.genre) {
            // setError('Debe seleccionar un género');
            registroErrorNotif('Debe seleccionar un género');
            return;
        }
        if(formData.role == 0){
            // setError('Debe seleccionar un rol');
            registroErrorNotif('Debe seleccionar un rol');
            return;
        }
        // Si todo está correcto
        try{
            const response = await axios.post(apiUrl + "/auth/register",formData);
            console.log('Datos enviados con éxito:', formData);
            console.log(response.data);
            localStorage.setItem('client_id', response.data.user.id);
            setSuccess(true);
            registroSuccessNotif("Registro Exitoso, redirigiendo...");
            //guardar el token en localStorage o en un contexto global para futuras solicitudes
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', formData.role);
            localStorage.setItem('name', formData.name);
            const redirectUrl = formData.role === ROLES.CLIENT ? "/wizard" : "/dashboard";
            //redireccionar al dashboard o a la página principal después del login exitoso
            setTimeout(() => {
                navigate(redirectUrl);
            }, 1500);            
        }catch(e){
            // console.error("error: " + e.status);
            setSuccess(false);
            if(e.status == 409)
                registroErrorNotif("El email ya existe, por favor revise los campos del formulario.");
            else
                registroErrorNotif("Error de registro.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0d1424] p-4">
            <div className="w-full max-w-md rounded-2xl bg-[#1e2638] p-8 shadow-xl text-center relative">
                {/* Indicador visual de la esquina superior derecha */}
                {isServerOnline && <FontAwesomeIcon id='serverStatus' icon={faDotCircle} className='absolute top-6 right-6 text-green-400 animate-pulse' />}
                {!isServerOnline && <FontAwesomeIcon id='serverStatus' icon={faDotCircle} className='absolute top-6 right-6 text-gray-400 animate-pulse' />}
                <Tooltip anchorSelect='#serverStatus' content={serverStatusStr} />
                {/* Logo y Encabezado */}
                <h1 className="text-3xl font-extrabold text-white tracking-tight">EliteFit</h1>
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
                            placeholder="Nombre completo"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 placeholder-slate-500 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all"
                        />
                    </div>

                    {/* Campo: Email */}
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 placeholder-slate-500 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all"
                        />
                    </div>

                    {/* Campo: Contraseña */}
                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 placeholder-slate-500 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all"
                        />
                    </div>

                    {/* Campo: Confirmar Contraseña */}
                    <div>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmar Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 placeholder-slate-500 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all"
                        />
                    </div>

                    {/* Campo: Telefono */}
                    <div>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Teléfono (opcional)"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 placeholder-slate-500 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all"
                        />
                    </div>

                    {/* Campo: Género (Dropdown) */}
                    <div>
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all cursor-pointer"
                        >
                            <option value="">Seleccionar Género...</option>
                            <option value="f">Femenino</option>
                            <option value="m">Masculino</option>
                            <option value="n">Prefiere no decirlo</option>
                        </select>
                    </div>

                    {/* Campo: Rol (Dropdown) */}
                    <div>
                        <div className="relative">
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                onMouseDown={() => setIsOpen(true)}
                                onBlur={() => setIsOpen(false)}
                                className="w-full px-4 py-3 bg-[#c4c4c4] text-slate-800 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all cursor-pointer appearance-none pr-10"
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
                    </div>

                    {/* Botón de Enviar */}
                    <button
                        type="submit"
                        className="w-full py-3 mt-2 bg-[#eab308] hover:bg-[#ca8a04] text-slate-900 font-bold text-lg rounded-xl shadow-md transition-colors duration-200"
                    >
                        Registrarse
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
                    <Link to="/" className="text-yellow-400 hover:text-yellow-300">Regresar a la página principal <FontAwesomeIcon icon={faHome}/></Link>
                </p>
            </div>
        </div>
    );
}