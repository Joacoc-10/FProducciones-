import React from "react";
import { PinContainer } from "./UI/3d-pin";
import { contactsLinks } from "@/helpers/Contacts";
import {
  IContactLinks,
  IWhatsappContact,
  IInstagramContact,
  IEmailContact,
} from "@/types/Contacts";
import { SocialIcon } from "./UI/SocialIcon";
import ScrollFloat from "./UI/ScrollFloat";

const getContactInfo = (contact: IContactLinks) => {
  if (contact.socialMedia === "whatsapp") {
    const c = contact as IWhatsappContact;
    return {
      title: "Enviar Mensaje",
      href: `https://wa.me/${c.phone[0].replace(/\+/g, "")}`,
      description: `Contacta a nuestro equipo por WhatsApp.`,
    };
  } else if (contact.socialMedia === "email") {
    const c = contact as IEmailContact;
    return {
      title: "Enviar Correo",
      href: `mailto:${c.mailtoLink}`,
      description: `Envíanos un correo.`,
    };
  } else if (contact.socialMedia === "instagram") {
    const c = contact as IInstagramContact;
    return {
      title: `Ver Perfil`,
      href: c.url,
      description: `Síguenos y mira nuestro trabajo.`,
    };
  }

  return {
    title: "Error de Enlace",
    href: "#",
    description: "Enlace no válido.",
  };
};

const Contact = () => {
  return (
    <section className="container px-4 py-24 mx-auto max-w-7xl" id="Contact">
      <ScrollFloat direction="left">
        <h3 className="mb-10 text-4xl font-semibold uppercase text-white-fp-300 font-electrolize">
          Contacto
        </h3>
      </ScrollFloat>

      <ScrollFloat direction="right">
      <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-12 ">
        {contactsLinks.map((contact, index) => {
          const info = getContactInfo(contact);

          return (
            <PinContainer
              key={index}
              title={info.title}
              href={info.href}
              containerClassName="w-full sm:w-80 h-96 "
            >
              <div className="flex basis-full flex-col p-4 tracking-tight text-red-fp-500 w-[20rem] h-[20rem] items-center justify-center text-center  ">
                {/* 1. Logo, Icono y Nombre */}
                <div className="flex flex-col items-center justify-center p-4 ">
                  <SocialIcon socialMedia={contact.socialMedia} size={64} />

                  <h3 className="max-w-xs !pb-2 !m-0 font-bold text-lg text-white-fp-400 mt-4 capitalize font-electrolize">
                    {contact.name}
                  </h3>
                </div>

                {/* 2. Descripción */}
                <div className="text-sm !m-0 !p-0 font-normal mt-2 h-10">
                  <span className="text-slate-500 font-inter">
                    {info.description}
                  </span>
                </div>
              </div>
            </PinContainer>
          );
        })}
      </div>
      </ScrollFloat>
    </section>
  );
};

export default Contact;
