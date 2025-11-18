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
    <footer className="m-4 mt-16 rounded-lg shadow-sm bg-white-fp-300">
      <div className="p-4 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          {/* Logo pequeño */}
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 sm:justify-start"
          >
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
              alt="FProducciones Logo"
              className="w-16 h-auto"
              width={100}
              height={100}
            />
          </Link>

          {/* Menú reducido */}
          <ul className="flex flex-wrap items-center mt-3 text-xs font-medium text-gray-600 sm:mt-0">
            <li>
              <a href="#About" className="hover:text-gray-800 me-3">
                Sobre nosotros
              </a>
            </li>
            <li>
              <a href="#Services" className="hover:text-gray-800 me-3">
                Servicios
              </a>
            </li>
            <li>
              <a href="#Gallery" className="hover:text-gray-800 me-3">
                Galería
              </a>
            </li>
            <li>
              <a href="#Contact" className="hover:text-gray-800">
                Contacto
              </a>
            </li>
          </ul>

          {/* Íconos más pequeños y más juntos */}
          {/* Íconos */}
          <div className="flex items-center mt-3 space-x-3 sm:mt-0">
            {contactsLinks.map((item) => {
              const Icon = getIcons(item.socialMedia);
              if (!Icon) return null;

              // 📌 SOLO UN ICONO DE WHATSAPP — usa el primer número
              if (item.socialMedia === "whatsapp") {
                const firstPhone = item.phone[0]; // <-- usa solo el primer número

                return (
                  <Link
                    key={firstPhone}
                    href={`https://wa.me/${firstPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    className="text-gray-600 transition-colors hover:text-gray-800"
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
                    className="text-gray-600 transition-colors hover:text-gray-800"
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
                    className="text-gray-600 transition-colors hover:text-gray-800"
                  >
                    <Icon size={18} />
                  </Link>
                );
              }
            })}
          </div>
        </div>

        {/* Línea finita */}
        <hr className="my-3 border-gray-300" />

        {/* Texto muy compacto */}
        <span className="block text-xs text-center text-gray-600">
          © 2025 <span className="font-medium">FProducciones</span>. Todos los
          derechos reservados.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
