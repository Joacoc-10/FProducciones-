// Define la interfaz de tus enlaces anidados para tipado
export  interface LinkItem {
  label: string;
  ariaLabel: string;
  href: string; // Usaremos Routes aquí
}

// Define la interfaz de los elementos principales del Mega-Menú
export interface NavbarItem {
  label: string;
  bgColor: string;
  textColor: string;
  links: LinkItem[];
}