import CardNav from './CardNav'

const logoUrl = "https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278";


const Navbar = () => {
  const items = [
    {
      label: "Sobre nostros",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Quienes somos", ariaLabel: "Quienes somos", href: "*" },
        { label: "Historia", ariaLabel: "Nuestra historia", href: "*" }
      ]
    },
    {
      label: "Servicios", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Catálogo", ariaLabel: "Nuestros servicios", href: "*" },
        { label: "Galería", ariaLabel: "Project Case Studies", href: "*" }
      ]
    },
    {
      label: "Contacto",
      bgColor: "#271E37", 
      textColor: "#fff",
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
      baseColor="#F3F4F6"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />
  );
};

export default Navbar;