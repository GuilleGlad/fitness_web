import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const FloatingCard = ({trainerPic, trainerName, trainerPhone, trainerEmail}) => {
    return(
        <div className='p-4 flex backdrop-blur bg-gradient-to-bl from-zinc-500 via-stone-800 to-zinc-600 rounded-lg items-center justify-evenly gap-4 lg:max-w-[60%] md:w-[60%] md:ml-10 mr-6'>
            <div id='pictureDiv' >
                <img src={trainerPic} alt="" className='w-16 rounded-full'/>
            </div>
            <div id='nameDiv'>
                <div className='flex flex-col'>
                    <span className='text-md'>{trainerName}</span>
                    <span className='text-xs'>Personal Trainer</span>
                </div>
            </div>
            <div className='flex gap-2 lg:gap-4 w-16 mr-10 lg:ml-6'>
                <div id="phoneDiv">
                    <a href={`tel:${trainerPhone}`}><FontAwesomeIcon icon={faPhone} className='bg-gray-500 rounded-full p-4 hover:border-yellow-400 hover:border-2 border-2 border-transparent' /></a>
                </div>
                <div id="emailDiv">
                    <a href={`mailto:${trainerEmail}`}><FontAwesomeIcon icon={faEnvelope} className='bg-gray-500 rounded-full p-4 hover:border-yellow-400 hover:border-2 border-2 border-transparent' /></a>
                </div>
            </div>
        </div>
    )
}

export default FloatingCard;