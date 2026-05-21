import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const FloatingCard = ({trainerPic, trainerName, trainerPhone, trainerEmail}) => {
    return(
        <div className='p-4 flex backdrop-blur bg-gray-600 rounded-lg items-center gap-4 md:w-2/3 mr-10 md:ml-10'>
            <div id='pictureDiv' >
                <img src={trainerPic} alt="" className='w-16 rounded-full'/>
            </div>
            <div id='nameDiv'>
                <div className='flex flex-col'>
                    <span className='text-md'>{trainerName}</span>
                    <span className='text-xs'>Personal Trainer</span>
                </div>
            </div>
            <div id="phoneDiv">
                <FontAwesomeIcon icon={faPhone} className='bg-gray-500 rounded-full p-4' />
            </div>
            <div id="emailDiv">
                <FontAwesomeIcon icon={faEnvelope} className='bg-gray-500 rounded-full p-4' />
            </div>
        </div>
    )
}

export default FloatingCard;