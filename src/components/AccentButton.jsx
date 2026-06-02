import React from 'react';
import Button from '@mui/material/Button';

const AccentButton = ({ children, onClick, type = 'button', primary = true }) => {
    // Logic to apply the distinct dark-mode, yellow-accent style
    const baseClasses = "w-full py-3 text-lg font-semibold uppercase tracking-wider transition-all duration-300 ease-in-out focus:outline-none focus:ring-4";
    
    const primaryClasses = "bg-[#b8fb00] text-black hover:bg-opacity-90 focus:ring-[#b8fb00]/50";
    const secondaryClasses = "border-2 border-[#b8fb00] text-[#b8fb00] hover:bg-opacity-10 hover:text-white";

    const classes = primary ? primaryClasses : secondaryClasses;

    return (
        <Button 
            type={type} 
            className={`${baseClasses} ${classes}`} 
            onClick={onClick}
        >
            {children}
        </Button>
    );
};

export default AccentButton;