import React from 'react';

const Menu = ({ isMenuOpen, toggleMenu }) => {
  return (
    <nav className="flex items-center justify-center w-full md:flex-1 lg:flex-grow">
      {/* Botón de Hamburguesa (Visible solo en móvil) */}
          {isMenuOpen}
      <button
        className="md:hidden p-2 focus:outline-none"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="menu-items"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {/* Icono de Hamburguesa */}
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Enlaces de Navegación (Visible en escritorio) */}
      <div id="menu-items" className={`md:flex space-x-6 ${isMenuOpen ? 'hidden' : 'hidden md:block'}`}>
        <a href="#" className="uppercase text-white-600 hover:text-customYellow transition">Inicio</a>
        <a href="#" className="uppercase text-white-600 hover:text-customYellow transition">Servicios</a>
        <a href="#" className="uppercase text-white-600 hover:text-customYellow transition">Acerca de</a>
        <a href="#" className="uppercase text-white-600 hover:text-customYellow transition">Blog</a>
      </div>

      {/* Menú de navegación expandido (Solo visible en móvil) */}
      {/* Esta sección se usaría para que el menú se "caiga" de forma vertical */}
      <div className={`md:hidden absolute top-16 left-0 right-0 bg-black shadow-lg transition duration-300 overflow-hidden ${isMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="flex flex-col items-center py-4 space-y-2">
            <a href="#" className="text-xl py-2 w-full text-center hover:bg-gray-100">Inicio</a>
            <a href="#" className="text-xl py-2 w-full text-center hover:bg-gray-100">Servicios</a>
            <a href="#" className="text-xl py-2 w-full text-center hover:bg-gray-100">Acerca de</a>
            <a href="#" className="text-xl py-2 w-full text-center hover:bg-gray-100">Blog</a>
        </div>
      </div>
    </nav>
  );
};

export default Menu;