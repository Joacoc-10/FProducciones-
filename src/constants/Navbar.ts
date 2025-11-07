import { Routes } from "@/routes";
import { NavbarItem } from "@/types/Navbar";


export const NavbarItems: NavbarItem[] = [
  {
    label: "Sobre nostros",
    bgColor: "bg-red-fp-800/90",
    textColor: "text-white-fp-100",
    links: [
      { label: "Quienes somos", ariaLabel: "Quienes somos", href: Routes.about_us },
      { label: "Historia", ariaLabel: "Nuestra historia", href: "#" } 
    ]
  },
  {
    label: "Servicios", 
    bgColor: "bg-red-fp-700/90",
    textColor: "text-white-fp-100",
    links: [
      { label: "Catálogo", ariaLabel: "Nuestros servicios", href: Routes.events},
      { label: "Galería", ariaLabel: "Project Case Studies", href: "#" }
    ]
  },
  {
    label: "Contacto",
    bgColor: "bg-red-fp-600/85", 
    textColor: "text-white-fp-100",
    links: [
      { label: "Email", ariaLabel: "Email us", href: "#" },
      { label: "Whatsapp", ariaLabel: "Whatsapp", href: "#" },
      { label: "Instagram", ariaLabel: "Instagram", href: "#" }
    ]
  }
];