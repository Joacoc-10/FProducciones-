import { contactsLinks } from "@/helpers/Contacts";
import { Routes } from "@/routes";
import { NavbarItem } from "@/types/Navbar";

const emailContact = contactsLinks.find((c) => c.socialMedia === "email");
const whatsappContact = contactsLinks.find((c) => c.socialMedia === "whatsapp");
const instagramContact = contactsLinks.find(
  (c) => c.socialMedia === "instagram"
);

export const NavbarItems: NavbarItem[] = [
  {
    label: "Sobre nostros",
    bgColor: "bg-red-fp-800/90",
    textColor: "text-white-fp-100",
    links: [
      {
        label: "Quienes somos",
        ariaLabel: "Quienes somos",
        href: Routes.about_us,
      },
      { label: "Historia", ariaLabel: "Nuestra historia", href: "#" },
    ],
  },
  {
    label: "Servicios",
    bgColor: "bg-red-fp-700/90",
    textColor: "text-white-fp-100",
    links: [
      {
        label: "Nuestros Servicios",
        ariaLabel: "Nuestros servicios",
        href: Routes.events,
      },
      {
        label: "Galería",
        ariaLabel: "Galeria de fotos y videos",
        href: Routes.gallery,
      },
    ],
  },
  {
    label: "Contacto",
    bgColor: "bg-red-fp-600/85",
    textColor: "text-white-fp-100",
    links: [
      {
        label: "Email",
        ariaLabel: "Email",
        href: emailContact ? `mailto:${emailContact.mailtoLink}` : "#",
      },
      {
        label: "Whatsapp",
        ariaLabel: "Whatsapp",
        href: whatsappContact
          ? `https://wa.me/${whatsappContact.phone[0].replace(/\D/g, "")}`
          : "#",
      },
      {
        label: "Instagram",
        ariaLabel: "Instagram",
        href: instagramContact ? instagramContact.url : "#",
      },
    ],
  },
];
