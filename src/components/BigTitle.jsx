import React from 'react';

const BigTitle = ({title, color, size, dir, uppercase}) => {
    var defaultTitle = "WE ACHIEVE YOUR GOALS. TOGETHER";
    var defaultColor = "text-white ";
    var defaultSize = "text-4xl lg:text-9xl"
    var defaultDir = "text-right";
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
        <div>
            <h1 className={`${defaultUppercase} ${defaultSize} ${defaultColor} mr-10 ${defaultDir} font-bold `}>{defaultTitle}</h1>
        </div>
    )
}

export default BigTitle;