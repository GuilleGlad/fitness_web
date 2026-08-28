import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FloatingButton = ({ title, link, icon }) => {
    var defaultTitle = "Click Me"
    if (title) {
        defaultTitle = title;
    }
    return (
        <div className="text-center">
            <Link to={link} className="uppercase text-white-600 hover:text-customYellow transition">
                <div className="text-nowrap flex items-center gap-2 bg-customYellow text-gray-800 lg:px-4 lg:py-2 px-2 py-1 hover:bg-gray-200 transition duration-200 rounded-full uppercase lg:text-lg text-md justify-center font-bold">{defaultTitle}{icon && <FontAwesomeIcon icon={icon} size=''/>}</div>
            </Link>
        </div>
    );
};

export default FloatingButton;