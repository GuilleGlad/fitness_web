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

const ContadorRRSS = ({ title, logo, account, count }) => {
  let defaultLogo;
  switch (logo) {
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

  return (
    <div
      className="
        bg-gray-900
        rounded-xl
        p-4
        m-4
        hover:bg-customYellow
        group
        shadow-lg
        flex flex-col
        justify-between
        min-h-[180px]
        sm:min-h-[200px]
        md:min-h-[220px]
      "
    >
      {/* Título */}
      <div className="flex pb-2">
        <span className="text-white text-sm group-hover:text-black hidden">
          {title}
        </span>
      </div>

      {/* Logo + Usuario */}
      <div className="flex items-center gap-4 mb-3">
        <FontAwesomeIcon
          icon={defaultLogo}
          size="2x"
          className="text-white group-hover:text-black"
        />
        </div>
        <div>
        <span className="text-white font-semibold group-hover:text-black">
          @{account}
        </span>
      </div>

      {/* Contador */}
      <div className="flex items-center gap-2">
        <span
          className="
            text-white
            font-semibold
            group-hover:text-black
            text-4xl
            sm:text-5xl
            md:text-6xl
            leading-none
          "
        >
          {count}
        </span>
        <FontAwesomeIcon
          icon={faSquareArrowUpRight}
          className="text-white group-hover:text-black"
        />
      </div>
    </div>
  );
};


export default ContadorRRSS;