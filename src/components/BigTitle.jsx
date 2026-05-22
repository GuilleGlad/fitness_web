import React from 'react';

const BigTitle = ({title, color, size}) => {
    var defaultTitle = "WE ACHIEVE YOUR GOALS. TOGETHER";
    var defaultColor = "text-white ";
    var defaultSize = "text-4xl lg:text-9xl"
    if(title){
        defaultTitle = title;
    }
    if(color){
        defaultColor = color;
    }
    if(size){
        defaultSize = size;
    }
    return (
        <div className=''>
            <h1 className={`${defaultSize} ${defaultColor} mr-10 text-right font-bold `}>{defaultTitle}</h1>
        </div>
    )
}

export default BigTitle;