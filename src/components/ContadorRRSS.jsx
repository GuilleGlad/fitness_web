import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons/faUpRightFromSquare";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";

const ContadorRRSS = ({title,logo,account,count}) => {
    return(
    <div className="flex-1">
        <div className="flex">
            <span className="text-white">{title}</span>
            <div></div>
        </div>
        <div className="flex">
            <div></div>
            <span className="text-white">{account}</span>
        </div>
        <div className="flex">
            <span className="text-white">{count}</span>
            <FontAwesomeIcon icon={faYoutube} color="white"/>
        </div>
    </div> 
    )  
}

export default ContadorRRSS;