import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

const FloatingText = ({text, color}) => {
    return (
        <div className='p-4 '>
            <span className={`${color} uppercase `}><FontAwesomeIcon color={`${color}`} icon={faCircle}/> {text}</span>
        </div>
    )
}

export default FloatingText;