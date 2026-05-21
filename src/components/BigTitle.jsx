import React from 'react';

const BigTitle = ({title}) => {
    var defaultTitle = "WE ACHIEVE YOUR GOALS. TOGETHER";
    if(title){
        defaultTitle = title;
    }

    return (
        <div className=''>
            <h1 className={`mt-10 mr-20 text-right text-3xl md:text-9xl font-bold uppercase`}>{defaultTitle}</h1>
        </div>
    )
}

export default BigTitle;