import React from 'react';

const BigTitle = ({title, color, size, dir, uppercase}) => {
    var defaultTitle = "WE ACHIEVE YOUR GOALS. TOGETHER";
    var defaultColor = "text-white ";
    var defaultSize = "text-4xl md:text-5xl lg:text-7xl xl:text-8xl"
    var defaultDir = "";
    var defaultUppercase = "";
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
    if(uppercase){
        defaultUppercase = "uppercase";
    }
    return (
        <div className='w-full lg:w-2/3 justify-self-end px-4 lg:px-0'>
            <h1 className={`${defaultUppercase} ${defaultSize} ${defaultColor} mr-4 lg:mr-10 ${defaultDir} font-bold `}>{defaultTitle}</h1>
        </div>
    )
}

export default BigTitle;