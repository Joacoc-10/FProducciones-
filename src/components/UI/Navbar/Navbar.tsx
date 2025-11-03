import CardNav from './CardNav'

const logoUrl = "https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278";


const Navbar = () => {
  const items = [
    {
      label: "Sobre nostros",
      bgColor: "bg-red-fp-800/90",
      textColor: "text-white-fp-100",
      links: [
        { label: "Quienes somos", ariaLabel: "Quienes somos", href: "*" },
        { label: "Historia", ariaLabel: "Nuestra historia", href: "*" }
      ]
    },
    {
      label: "Servicios", 
      bgColor: "bg-red-fp-700/90",
      textColor: "text-white-fp-100",
      links: [
        { label: "Catálogo", ariaLabel: "Nuestros servicios", href: "*" },
        { label: "Galería", ariaLabel: "Project Case Studies", href: "*" }
      ]
    },
    {
      label: "Contacto",
      bgColor: "bg-red-fp-600/85", 
      textColor: "text-white-fp-100",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "*" },
        { label: "Whatsapp", ariaLabel: "Whatsapp", href: "*" },
        { label: "Instagram", ariaLabel: "Instagram", href: "*" }
      ]
    }
  ];

  return (
    <CardNav
      logo={logoUrl}
      logoAlt="Company Logo"
      items={items}
      baseColor="bg-white-fp-300" // El fondo de la nav
      menuColor="text-black-fp-800" // El color del hamburguesa
      buttonBgColor="bg-white-fp-300" // El color de fondo del botón 
      buttonTextColor="text-black-fp-800" // El color del texto del botón
      ease="power3.out"
    />
  );
};

export default Navbar;