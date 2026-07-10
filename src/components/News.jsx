// src/components/Comments.jsx
import React from 'react';

const News = ({image, text, title}) => {

    return (
        <div className='flex-col bg-gray-700 rounded-xl p-4 m-10'>
            <div className='flex gap-4 mt-4 mb-4 '>
                <span className='text-white font-semibold text-lg uppercase'>{title}</span>
            </div>
            <div className="stars_div mt-4 mb-4">
                <img src={image} className="w-full rounded-lg" alt="" />
            </div>
            <div className='mt-4 mb-4'>
                <span className='text-white'>{text}</span>
            </div>
        </div>
    );
}

export default News;