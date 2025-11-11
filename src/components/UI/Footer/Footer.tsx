import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="m-4 rounded-lg shadow-sm bg-white-fp-400/80 ">
        <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <Link
              href="/"
              className="flex items-center mb-4 space-x-3 sm:mb-0 rtl:space-x-reverse"
            >
              <Image // <-- Usamos el componente Image de Next.js
                src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
                className="w-24 h-18"
                alt="FlowBite Logo"
                width={60} // Ancho en píxeles (igual a h-8, que es 32px)
                height={48} // Alto en píxeles (igual a h-8, que es 32px)
              />
            </Link>

            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline me-4 md:me-6">
                  Licensing
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2025
            <a href="https://flowbite.com/" className="hover:underline">
              FProducciones
            </a>
            . Todos los derechos reservados.
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;
