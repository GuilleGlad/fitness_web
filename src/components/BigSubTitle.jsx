import React from 'react'
import ContactUs from './ContactUs';

const BigSubTitle = ({title, subtitle, button_text, link}) => {
    return (
        <div className='flex flex-col gap-4'>
            <span className='text-customYellow text-4xl font-bold'>{title}</span>
            <span className='text-2xl'>{subtitle}</span>
            <ContactUs title={button_text}/>

        </div>
    )
}

export default BigSubTitle;