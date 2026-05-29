import React from 'react';
import Logo from './Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import BigLink from './BigLink';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faLocation } from '@fortawesome/free-solid-svg-icons';

const Footer = ({logoPath, email, links}) => {
    var defaultlogoPath = '/images/Logo-01-1-1.png';
    if(logoPath){
        defaultlogoPath = logoPath;
    }
    return (
        <div className="flex flex-col">
            <div className="flex bg-black mr-32">
                <div className="flex flex-col w-1/4">
                    <img className="w-1/4" src={defaultlogoPath} alt='AdrianFitness'></img>
                    <span className='text-white'>Have any question? Reach out to us!</span>
                    <div className="flex gap-2 items-center">
                        <FontAwesomeIcon icon={faEnvelope} className='text-customYellow'/><span className='text-white font-bold text-2xl'>{email}</span>
                    </div>
                    <div className="flex flex-col mt-20">
                        <span className='text-white text-sm'>Folow us on</span>
                        <div className="flex gap-2">
                            <button className="bg-gray-200 rounded p-2"><FontAwesomeIcon icon={faFacebook} color='black' size='2x'></FontAwesomeIcon></button>
                            <button className="bg-gray-200 rounded p-2"><FontAwesomeIcon icon={faXTwitter} color='black' size='2x'></FontAwesomeIcon></button>
                            <button className="bg-gray-200 rounded p-2"><FontAwesomeIcon icon={faYoutube} color='black' size='2x'></FontAwesomeIcon></button>
                            <button className="bg-gray-200 rounded p-2"><FontAwesomeIcon icon={faInstagram} color='black' size='2x'></FontAwesomeIcon></button>
                            <button className="bg-gray-200 rounded p-2"><FontAwesomeIcon icon={faTiktok} color='black' size='2x'></FontAwesomeIcon></button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-3/4 ">
                    {
                        links.map((link, index) => (
                            <BigLink key={index} text={link} color="text-white" size="text-2xl" />
                    ))}                
                </div>            
            </div>
            <div className='flex mt-10 justify-around'>
                <div className="w-1/3 flex">
                    <div className='ml-2'>
                        <FontAwesomeIcon icon={faPhone} className='text-customYellow'/> 
                        <span className='text-white text-sm'>+1 (888) 807-5000</span>
                    </div>
                    <div className='ml-2'>
                        <FontAwesomeIcon icon={faLocation} className='text-customYellow'/> 
                        <span className='text-white text-sm'>Jl. Soekarno-hatta</span>                        
                    </div>
                </div>
                <div className="w-1/3 ">
                    <span className='text-white text-sm'>Copyright © 2025 Musclefit | Powered by Onecontributor</span>
                </div>
            </div>
        </div>
    )
}

export default Footer;