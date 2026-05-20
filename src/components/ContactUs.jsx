import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleArrowRight} from '@fortawesome/free-solid-svg-icons'

const ContactUs = () => {
  return (
    <div className="text-right "> {/* Oculto en móvil */}
      <button className="bg-gray-200 text-gray-800 px-4 py-2 hover:bg-customYellow transition duration-200 rounded-full underline uppercase text-xs flex">
        <span className='mt-1 mr-2'>Contacto</span>
        <FontAwesomeIcon icon={faCircleArrowRight} size='2x'/>
      </button>
    </div>
  );
};

export default ContactUs;