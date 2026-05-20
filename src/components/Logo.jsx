import React from 'react';

const Logo = ({logoSrc, isMenuOpen}) => {
    return (
        <div className='text-xl font-bold text-indigo-600 tracking-wider'>
            <img className={`${isMenuOpen ? 'min-w-24' : 'min-w-32'}`} src={logoSrc} alt='AdrianFitness'></img>
        </div>
    )
}

export default Logo;