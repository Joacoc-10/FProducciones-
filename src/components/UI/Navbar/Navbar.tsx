import CardNav from './CardNav'

const logoUrl = "https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278";


const Navbar = () => {
  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", ariaLabel: "About Company", href: "*" },
        { label: "Careers", ariaLabel: "About Careers", href: "*" }
      ]
    },
    {
      label: "Projects", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", ariaLabel: "Featured Projects", href: "*" },
        { label: "Case Studies", ariaLabel: "Project Case Studies", href: "*" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "*" },
        { label: "Twitter", ariaLabel: "Twitter", href: "*" },
        { label: "LinkedIn", ariaLabel: "LinkedIn", href: "*" }
      ]
    }
  ];

  return (
    <CardNav
      logo={logoUrl}
      logoAlt="Company Logo"
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />
  );
};

export default Navbar;