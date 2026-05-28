// src/components/CardTile.jsx

import React from 'react';
import ContactUs from './ContactUs';
/**
 * Componente reutilizable para las tarjetas de secciones.
 * @param {object} props
 * @param {string} props.imageUrl - URL de la imagen de fondo.
 * @param {string} props.title - Título principal de la sección.
 * @param {string} props.description - Descripción secundaria.
 * @param {boolean} [props.isCTA=false] - Indica si debe ser un Call-to-Action de color sólido.
 * @param {string} [props.ctaText] - Texto del botón CTA.
 * @param {string} [props.ctaLink] - URL de destino del botón.
 */
const CardTile = ({
  imageUrl,
  title,
  description,
  isCTA = false,
  ctaText,
  ctaLink,
}) => {
  // Estilos comunes para mantener la altura en el grid
  const cardClasses = "relative overflow-hidden rounded-xl shadow-lg cursor-pointer min-h-[300px] h-[90%]";

  // Si es CTA, usamos el diseño de color sólido en lugar de imagen
  if (isCTA) {
    return (
      <div className="bg-yellow-400 rounded-xl shadow-xl p-10 flex flex-col justify-center items-center text-center min-h-[300px] h-full">
        <div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-xl text-gray-700 mb-8">{description}</p>
        <div className="flex-col justify-items-center mb-10">
            <ContactUs title={ctaText} />
        </div>
        {/* <a 
          href={ctaLink || '#'} 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-yellow-900 bg-yellow-500 hover:bg-yellow-600 transition duration-300"
        >
          {ctaText}
          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </a> */}
        </div>
        <div>
        <img 
            src={imageUrl} 
            className="w-full h-full object-contain " 
        />   
        </div>     
      </div>
    );
  }

  // Diseño de Imagen + Overlay (Por defecto)
  return (
    <div className={cardClasses}>
      {/* Imagen de Fondo */}
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-full object-cover" 
      />
      
      {/* Overlay de Texto Oscuro */}
      <div className="absolute inset-0 bg-gray-700 bg-opacity-25 flex items-end p-8 rounded-xl">
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-1">{title}</h2>
          <p className="text-lg font-medium">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default CardTile;
