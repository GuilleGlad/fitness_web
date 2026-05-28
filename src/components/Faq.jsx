import React from 'react'
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';



const Faq = ({ title, text }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [textColor, setTextColor] = useState("text-white");
    const [bgColor, setBgColor] = useState("");
    const toggleState = () => {
        if(isOpen){
            setIsOpen(false);
            setTextColor("text-white");
            setBgColor("");
        }else{
            setIsOpen(true);
            setTextColor("text-black");            
            setBgColor("bg-yellow-300");
        }
    }

    return (
        <div className={`p-4 bg-gray-800 rounded-lg mt-4 mb-4 transition-all duration-500 ease-in-out ${isOpen ? 'h-full' : 'h-24'}`}>
            <div className={`${bgColor} flex p-4 rounded-lg`}>
                <span className={`${textColor} text-lg uppercase font-bold w-[50%]`}>{title}</span>
                {!isOpen && <div className={`flex w-[50%] justify-end`} >
                    <button onClick={toggleState}>
                        <FontAwesomeIcon icon={faChevronCircleDown} color='white' size='2x' />
                    </button>
                </div>}
                {isOpen && <div className={`flex w-[50%] justify-end`} >
                    <button  onClick={toggleState}>
                        <FontAwesomeIcon icon={faChevronCircleUp} color='black' size='2x'/>
                    </button>
                </div>}
            </div>
            <div className={`mt-4`}>
                <span className={`text-white transition-opacity duration-500 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{text}</span>
            </div>
        </div>
    )
}

export default Faq;