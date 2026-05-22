import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

const BigLink = ({ text, color, highlight="text-customYellow", href="#" }) => {
    return (
        <div className="flex justify-end mt-12 pt-12 pb-12 mr-16 border-solid border-t-2">
            <a href={href} className="flex gap-12">
            <div>
                <span className={`font-bold hover:${highlight} text-7xl ${color}`}>{text}</span>
            </div>
            <div className="flex items-center">
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} color="white" size="3x" />
            </div>
            </a>
        </div>
    )
}

export default BigLink;