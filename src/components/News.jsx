// src/components/News.jsx
import React, { useState } from 'react';

const News = ({image, text, title}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const textLimit = 100;

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    const displayText = isExpanded? text : `${text.substring(0, textLimit)}...`;

    return (
        <div className='flex-col bg-gray-700 rounded-xl p-4 m-5'>
            <div className='flex gap-4 mt-4 mb-4 '>
                <span className='text-white font-semibold text-lg uppercase'>{title}</span>
            </div>
            <div className="stars_div mt-4 mb-4">
                <img src={image} className="w-full rounded-lg" alt="" />
            </div>
            <div className='mt-4 mb-4'>
                <span className='text-white cursor-pointer select-none' onClick={toggleReadMore}>
                    {displayText}
                </span>
                {text.length > textLimit && (
                    <button 
                        onClick={toggleReadMore}
                        className="ml-2 text-blue-400 hover:text-blue-300 text-sm font-medium focus:outline-none"
                    >
                        {isExpanded? 'menos...' : 'mas...'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default News;