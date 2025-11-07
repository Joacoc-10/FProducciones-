import { NavbarItems } from '@/constants/Navbar';
import CardNav from './CardNav'

const logoUrl = "https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278";


const Navbar = () => {
 
  return (
    <CardNav
      logo={logoUrl}
      logoAlt="Company Logo"
      items={NavbarItems}
      baseColor="bg-white-fp-300" // El fondo de la nav
      menuColor="text-black-fp-800" // El color del hamburguesa
      buttonBgColor="bg-white-fp-300" // El color de fondo del botón 
      buttonTextColor="text-black-fp-800" // El color del texto del botón
      ease="power3.out"
      className='font-semibold font-electrolize'
    />
  );
};

export default Navbar;