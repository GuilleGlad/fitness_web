import React from 'react';

const Logo = ({logoPath, isMenuOpen}) => {
    var defaultLogo = '/images/Logo-01-1-1.png';

    if(logoPath){
        defaultLogo = logoPath;
    }
    return (
        <div className='text-xl font-bold text-indigo-600 tracking-wider'>
            <img className={`${isMenuOpen ? 'min-w-24' : 'min-w-32'}`} src={defaultLogo} alt='AdrianFitness'></img>
        </div>
    )
}

export default Logo;