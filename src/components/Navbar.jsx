import React, { useState } from 'react';
import Logo from './Logo';
import Menu from './Menu';
import ContactUs from './ContactUs';

const Navbar = () => {
  // Estado para controlar si el menú está abierto o cerrado en móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoPath = '/images/Logo-01-1-1.png';
  // Función para cambiar el estado del menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    // Contenedor principal del Navbar. 
    // h-24 es la clase de Tailwind para 100px (4rem * 2 = 8 unidades = 100px)
    // sticky y fixed hacen que permanezca en la vista.
    <header className="sticky top-0 z-50 w-full h-24 flex items-center">
      
      {/* COLUMNA 1: LOGO */}
      <div className="w-1/4 flex items-center justify-start">
        <Logo 
            logoSrc={logoPath} 
            isMenuOpen={isMenuOpen} />
      </div>

      {/* COLUMNA 2: MENÚ */}
      <div className="w-1/2 flex items-center justify-between">
        <Menu 
          isMenuOpen={isMenuOpen} 
          toggleMenu={toggleMenu} 
        />
      </div>

      {/* COLUMNA 3: CONTACT US */}
      <div className="w-1/4 flex items-center justify-end">
        <ContactUs />
      </div>
      
    </header>
  );
};

export default Navbar;