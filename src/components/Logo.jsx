import React from 'react';

const Logo = ({ logoPath, isMenuOpen, settingsLoading }) => {
    let defaultLogo;

    if (logoPath) {
        defaultLogo = logoPath;
    }
    return (
        (settingsLoading ? (
            <div className="video-background bg-gray-800 animate-pulse" />
        ) : (
            <div className='text-xl font-bold text-indigo-600 tracking-wider'>
                <img
                    src={logoPath}
                    alt="Logo"
                    className="lg:ml-20 h-44 w-auto object-contain drop-shadow-2xl rounded-xl"
                />
            </div>
        ))
    )
}

export default Logo;