"use client";

import { contactsLinks } from "@/helpers/Contacts";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AiOutlineMail } from "react-icons/ai";
import { BsInstagram } from "react-icons/bs";
import { ImWhatsapp } from "react-icons/im";

const getIcons = (iconName: string) => {
  switch (iconName) {
    case "whatsapp":
      return ImWhatsapp;
    case "instagram":
      return BsInstagram;
    case "email":
      return AiOutlineMail;
    default:
      return null;
  }
};

const Footer = () => {
  return (
    <footer className="m-4 mx-auto mt-16 rounded-lg shadow-sm bg-white-fp-300 max-w-7xl">
      <div className="p-3 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between mb-1 sm:flex-row">
          
          {/* Logo pequeño */}
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 sm:justify-start"
          >
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
              alt="FProducciones Logo"
              className="w-20 h-auto"
              width={100}
              height={100}
            />
          </Link>

          {/* Menú reducido */}
          <ul className="flex flex-wrap items-center mt-3 text-xs font-medium text-slate-600 sm:mt-0">
            <li>
              <a href="#AboutUs" className="hover:text-slate-800 me-3">
                Sobre nosotros
              </a>
            </li>
            <li>
              <a href="#Events" className="hover:text-slate-800 me-3">
                Servicios
              </a>
            </li>
            <li>
              <a href="#Gallery" className="hover:text-slate-800 me-3">
                Galería
              </a>
            </li>
            <li>
              <a href="#Contact" className="hover:text-slate-800">
                Contacto
              </a>
            </li>
          </ul>

          {/* Íconos */}
          <div className="flex items-center mt-2 space-x-3 sm:mt-0">
            {contactsLinks.map((item) => {
              const Icon = getIcons(item.socialMedia);
              if (!Icon) return null;

              //WHATSAPP
              if (item.socialMedia === "whatsapp") {
                const firstPhone = item.phone[0]; 

                return (
                  <Link
                    key={firstPhone}
                    href={`https://wa.me/${firstPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="transition-colors text-slate-500 hover:text-slate-800"
                  >
                    <Icon size={18} />
                  </Link>
                );
              }

              // INSTAGRAM
              if (item.socialMedia === "instagram") {
                return (
                  <Link
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    className="transition-colors text-slate-500 hover:text-slate-800"
                  >
                    <Icon size={18} />
                  </Link>
                );
              }

              // EMAIL
              if (item.socialMedia === "email") {
                return (
                  <Link
                    key={item.name}
                    href={`mailto:${item.mailtoLink}`}
                    className="transition-colors text-slate-500 hover:text-slate-800"
                  >
                    <Icon size={20} />
                  </Link>
                );
              }
            })}
          </div>
        </div>

        <hr className="mt-1 mb-3 border-gray-300" />

        <span className="block text-xs text-center text-slate-600">
          © 2025 <span className="font-medium">FProducciones</span>. Todos los
          derechos reservados.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
