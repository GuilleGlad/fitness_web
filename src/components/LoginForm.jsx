import React from 'react';
import { User, Lock } from 'lucide-react';
import AccentButton from './AccentButton';

const LoginForm = ({ onLogin }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Assuming local state manages the inputs before calling onLogin
        // For simplicity here, we just pass a placeholder handler
        onLogin(); 
    };

    return (
        <div className="w-full max-w-md p-8 md:p-12 bg-[#121212] shadow-2xl rounded-xl border border-[#222] text-white">
            <h2 className="text-3xl font-extrabold text-center mb-8 text-[#b8fb00]">
                Iniciar Sesión
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Correo Electrónico
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full p-3 pl-10 rounded-lg bg-[#1f1f1f] text-white border border-gray-700 focus:ring-2 focus:ring-[#b8fb00] focus:border-[#b8fb00] transition duration-150"
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Contraseña
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full p-3 pl-10 rounded-lg bg-[#1f1f1f] text-white border border-gray-700 focus:ring-2 focus:ring-[#b8fb00] focus:border-[#b8fb00] transition duration-150"
                        />
                    </div>
                </div>

                {/* Options and Forgot Link */}
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-[#b8fb00] border-gray-600 bg-[#1f1f1f] focus:ring-[#b8fb00]"/>
                        <label htmlFor="remember-me" className="ml-2 text-gray-300">Recordarme</label>
                    </div>
                    <a href="#" className="text-[#b8fb00] hover:text-white transition duration-150">¿Olvidaste tu contraseña?</a>
                </div>

                {/* Submit Button */}
                <AccentButton type="submit" primary={true}>
                    ACCEDER A TU CUENTA
                </AccentButton>
            </form>
        </div>
    );
};

export default LoginForm;