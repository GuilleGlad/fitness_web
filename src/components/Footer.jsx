import React from 'react';
import Logo from './Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faXTwitter, faYoutube, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import BigLink from './BigLink';

const Footer = ({ logoPath, email, links }) => {
  const defaultLogoPath = logoPath || '/images/Logo-01-1-1.png';

  return (
    <footer className="bg-black text-white w-full px-6 py-16">

      {/* GRID PRINCIPAL */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* Columna 1: Logo + Contacto */}
        <div className="flex flex-col gap-6">
          <img src={defaultLogoPath} alt="Logo" className="w-32" />

          <p className="text-sm opacity-80">
            ¿Alguna pregunta? No dude en contactarnos.
          </p>

          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faEnvelope} className="text-customYellow" />
            <span className="text-xl font-bold">{email}</span>
          </div>

          {/* Redes sociales */}
          <div className="flex flex-col gap-3 mt-4">
            <span className="text-sm opacity-80">Síguenos en</span>
            <div className="flex gap-3">
              {[faFacebook, faXTwitter, faYoutube, faInstagram, faTiktok].map((icon, i) => (
                <button
                  key={i}
                  className="bg-gray-200 hover:bg-customYellow transition p-3 rounded-lg"
                >
                  <FontAwesomeIcon icon={icon} className="text-black" size="lg" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2: Links */}
        {links && (
          <div className="flex flex-col gap-4">
            {links.map((link, index) => (
              <BigLink
                key={index}
                text={link}
                color="text-white"
                size="text-xl"
              />
            ))}
          </div>
        )}

        {/* Columna 3: Información */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faPhone} className="text-customYellow" />
            <span className="text-sm">+1 (888) 807-5000</span>
          </div>

          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faLocationDot} className="text-customYellow" />
            <span className="text-sm">Jl. Soekarno-hatta</span>
          </div>
        </div>

      </div>

      {/* Línea inferior */}
      <div className="mt-16 border-t border-gray-700 pt-6 text-center text-sm opacity-70">
        Copyright © 2025 Musclefit | Powered by Onecontributor
      </div>

    </footer>
  );
};

export default Footer;
