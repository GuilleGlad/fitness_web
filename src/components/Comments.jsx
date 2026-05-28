// src/components/Comments.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const Comments = ({ stars, text, account, picture, role }) => {
    // Ensure the number of stars is between 1 and 5
    const minStars = Math.max(1, stars);
    const maxStars = Math.min(5, stars);

    return (
        <div className='flex-col bg-gray-700 rounded-xl p-4 m-10'>
            <div className="stars_div mt-4 mb-4">
                {/* Render the FontAwesomeIcon for the number of stars */}
                {[...Array(maxStars)].map((_, index) => (
                    <FontAwesomeIcon key={index} icon={faStar} className='text-customYellow' />
                ))}
            </div>
            <div className='mt-4 mb-4'>
                <span className='text-white'>{text}</span>
            </div>
            <div className='flex gap-4 mt-4 mb-4 '>
                <div>
                    <img src={picture} className="w-12 rounded-full" alt="" />
                </div>
                <div className="flex flex-col">
                    <span className='text-white font-semibold text-lg'>{account}</span>
                    <span className='text-white'>{role}</span>
                </div>
            </div>
        </div>
    );
}

export default Comments;