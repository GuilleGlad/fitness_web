import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const BigLink = ({ text, color, highlight="text-customYellow", href="#", size }) => {
    var defaultSize = "text-7xl";
    var extraCSS = "pt-12 pb-12  border-solid border-t-2";
    var iconSize = "3x";
    if(size){
        defaultSize = size;
        extraCSS = "";
        iconSize = "2x";
    }

    return (
        <div className={`flex justify-end mt-12 mr-16 ${extraCSS}`}>
            <a href={href} className="flex gap-12">
            <div>
                <span className={`font-bold hover:${highlight} ${defaultSize} ${color}`}>{text}</span>
            </div>
            <div className="flex items-center">
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} color="white" size={iconSize} />
            </div>
            </a>
        </div>
    )
}

export default BigLink;