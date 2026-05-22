import React from 'react';

const BigTitle = ({title, color, size, dir}) => {
    var defaultTitle = "WE ACHIEVE YOUR GOALS. TOGETHER";
    var defaultColor = "text-white ";
    var defaultSize = "text-4xl lg:text-9xl"
    var defaultDir = "text-right";
    if(title){
        defaultTitle = title;
    }
    if(color){
        defaultColor = color;
    }
    if(size){
        defaultSize = size;
    }
    if(dir){
        defaultDir = dir;
    }
    return (
        <div className=''>
            <h1 className={`${defaultSize} ${defaultColor} mr-10 ${defaultDir} font-bold `}>{defaultTitle}</h1>
        </div>
    )
}

export default BigTitle;