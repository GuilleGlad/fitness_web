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
                <div className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 hover:bg-customYellow transition duration-200 rounded-full uppercase text-sm  justify-center font-bold">{defaultTitle}{icon && <FontAwesomeIcon icon={icon}/>}</div>
            </Link>
        </div>
    );
};

export default FloatingButton;