import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons/faUpRightFromSquare";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faFacebook } from "@fortawesome/free-brands-svg-icons";
import { faTiktok } from "@fortawesome/free-brands-svg-icons";
import { faEarth } from "@fortawesome/free-solid-svg-icons";
import { faSquareArrowUpRight } from "@fortawesome/free-solid-svg-icons";

const ContadorRRSS = ({title,logo,account,count}) => {
    var defaultLogo;
    switch(logo){
        case "instagram":
            defaultLogo = faInstagram;
            break;
        case "youtube":
            defaultLogo = faYoutube;
            break;
        case "x":
            defaultLogo = faXTwitter;
            break;
        case "facebook":
            defaultLogo = faFacebook;
            break;
        case "tiktok":
            defaultLogo = faTiktok;
            break;
        default:
            defaultLogo = faEarth;
            break;
    }

    return(
    <div className="flex-1 p-4 bg-gray-900 m-4 rounded-lg hover:bg-customYellow group">
        <div className="flex pt-4 pb-4 ">
            <span className="text-white text-sm group-hover:text-black">{title}</span>
            <div></div>
        </div>
        <div className="flex justify-start gap-4">
            <div>
                <FontAwesomeIcon icon={defaultLogo} size="2x" color="white" className="group-hover:text-black"/>
            </div>
            <span className="text-white font-semibold group-hover:text-black">@{account}</span>
        </div>
        <div className="flex items-baseline">
            <span className="text-white text-6xl font-semibold group-hover:text-black">{count}</span>
            <FontAwesomeIcon icon={faSquareArrowUpRight} color="white" className="group-hover:text-black"/>
        </div>
    </div> 
    )  
}

export default ContadorRRSS;