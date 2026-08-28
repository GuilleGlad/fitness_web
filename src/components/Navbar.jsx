import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Menu from './Menu';
import ContactUs from './ContactUs';
import FloatingButton from './FloatingButton';
import { verifyToken } from '../utils/tokenUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRunning } from '@fortawesome/free-solid-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ logoPath: providedLogoPath, loading = false }) => {
  // Estado para controlar si el menú está abierto o cerrado en móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const CerrarSesionTexto = "Salir";
  const logoPath = providedLogoPath;
  // Función para cambiar el estado del menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [ingresarTexto, setIngresarText] = useState('Ingresar');
  const [logged, setLogged] = useState(false);
  useEffect(() => {
    const checkToken = async () => {
      const redirectPath = await verifyToken();
      if (redirectPath == null) {
        setIngresarText('Tu Cuenta')
        setLogged(true);
      }
    };

    checkToken();
  })

  return (
    // Contenedor principal del Navbar. 
    // h-24 es la clase de Tailwind para 100px (4rem * 2 = 8 unidades = 100px)
    // sticky y fixed hacen que permanezca en la vista.
    <header className="sticky top-0 z-50 w-full h-24 flex items-center justify-between px-4 lg:px-0">
      {/* COLUMNA 1: LOGO */}
      <div className="flex items-center justify-start flex-shrink-0 lg:w-1/4">
        <Logo
          logoPath={logoPath}
          isMenuOpen={isMenuOpen} 
          settingsLoading={loading}
          />
      </div>

      {/* COLUMNA 2: MENÚ */}
      {/* Vacía mientras <Menu> esté comentado: se oculta en mobile para no
          robarle espacio al logo y a los botones de la derecha. */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-between">
        {/* <Menu 
          isMenuOpen={isMenuOpen} 
          toggleMenu={toggleMenu} 
        /> */}
      </div>

      {/* COLUMNA 3: CONTACT US */}
      <div className="flex flex-row flex-wrap items-center justify-end gap-2 lg:w-1/4 lg:ml-[7%] mr-10">
        <FloatingButton link="/login" title={ingresarTexto} icon={logged ? faRunning : null} />
        {!logged && <FloatingButton link="/register" title="Registro" />}
        {logged && <FloatingButton link="/auth/logout" title={CerrarSesionTexto} icon={faClose} />}
      </div>

    </header>
  );
};

export default Navbar;