import React, { useMemo } from 'react';
import { IconType } from "react-icons";
import { ImWhatsapp } from "react-icons/im";
import { BsInstagram } from "react-icons/bs";
import { AiOutlineMail } from "react-icons/ai";
import { IContactLinks } from "@/types/Contacts"; 

const ICON_MAP: { [key in IContactLinks["socialMedia"]]: IconType } = {
  whatsapp: ImWhatsapp,
  instagram: BsInstagram,
  email: AiOutlineMail,
};

const COLOR_MAP: { [key in IContactLinks["socialMedia"]]: string } = {
 whatsapp: "fill-[#25D366]",
  instagram: "fill-[url(#instagramGradient)]",
  email: "fill-[#00BFFF]", 
};

interface SocialIconProps {
  socialMedia: IContactLinks["socialMedia"];
  size?: number;
}

export const SocialIcon = ({ socialMedia, size = 64 }: SocialIconProps) => {
  const IconComponent = useMemo(() => ICON_MAP[socialMedia] || null, [socialMedia]);
  const color = COLOR_MAP[socialMedia];

  if (!IconComponent) return null;

  return (
    <div className="relative inline-block group/pin">
      {socialMedia === "instagram" && (
        <svg width="0" height="0">
          <linearGradient id="instagramGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f58529" />
            <stop offset="50%" stopColor="#dd2a7b" />
            <stop offset="100%" stopColor="#8134af" />
          </linearGradient>
        </svg>
      )}

      <IconComponent
  size={size}
  className={`transition-all duration-300 group-hover/pin:fill-white ${color}`}
 />
    </div>
  );
};



