import CardSwap, { Card } from "./UI/CardSwap";
import Image from "next/image";
import ScrollFloat from "./UI/ScrollFloat";

const EventsCardSwap = () => {
  return (
    <>
    <ScrollFloat direction="right">
      <div
        style={{ height: "600px", position: "relative" }}
        className="relative z-10 mb-48 h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px]"
      >
        <CardSwap
          cardDistance={60}
          verticalDistance={70}
          delay={5000}
          pauseOnHover={false}
        >
          <Card className="flex flex-col p-0">
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Bodas
            </h3>

            <div className="relative flex-grow overflow-hidden rounded-b-xl">
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/pexels-frentescuphotography-7360983.jpg?updatedAt=1762288479056"
                alt="Luces lasers rojas"
                fill
                className="object-cover"
              />
            </div>
          </Card>
          <Card className="flex flex-col p-0">
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Cumpleaños de 15
            </h3>

            <div className="relative flex-grow overflow-hidden rounded-b-xl">
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
                alt="Luces lasers rojas"
                fill
                className="object-cover"
              />
            </div>
          </Card>
          <Card className="flex flex-col p-0">
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Corporativos
            </h3>

            <div className="relative flex-grow overflow-hidden rounded-b-xl">
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/1fb3af46-9b79-4ed7-8fa0-d5bdc87fafe0.JPG?updatedAt=1762622515826"
                alt="Luces lasers rojas"
                fill
                className="object-cover"
              />
            </div>
          </Card>
          <Card className="flex flex-col p-0">
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Fiestas privadas
            </h3>

            <div className="relative flex-grow overflow-hidden rounded-b-xl">
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-removebg-preview.png?updatedAt=1762882577322"
                alt="Luces lasers rojas"
                fill
                className="object-cover"
              />
            </div>
          </Card>
          <Card className="flex flex-col p-0">
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Festivales
            </h3>

            <div className="relative flex-grow overflow-hidden rounded-b-xl">
              <Image
                src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/pexels-wsilvasjb-16085578.jpg?updatedAt=1762288449786"
                alt="Luces lasers rojas"
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </CardSwap>
      </div>
      </ScrollFloat>
    </>
  );
};

export default EventsCardSwap;
