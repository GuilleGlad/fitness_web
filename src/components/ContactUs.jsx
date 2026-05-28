import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCircleArrowRight} from '@fortawesome/free-solid-svg-icons'

const ContactUs = ({title}) => {
  var defaultTitle = "Contacto"
  if(title){
    defaultTitle = title;
  }
  return (
    <div className="text-center">
      <button className="bg-gray-200 text-gray-800 px-4 py-2 hover:bg-customYellow transition duration-200 rounded-full uppercase text-xs flex items-start justify-center">
        <span className='mt-1 mr-2'>{defaultTitle}</span>
        <FontAwesomeIcon icon={faCircleArrowRight} size='2x'/>
      </button>
    </div>
  );
};

export default ContactUs;