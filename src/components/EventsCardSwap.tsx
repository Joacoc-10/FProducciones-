import React from "react";
import CardSwap, { Card } from "./UI/CardSwap";
import Image from "next/image";

const EventsCardSwap = () => {
  return (
    <>
      <div
        style={{ height: "600px", position: "relative" }}
        className="relative z-50 mb-48"
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
          <Card>
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Cumpleaños de 15
            </h3>
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
              alt="Logo FP"
              width={480}
              height={300}
              className="object-cover w-full h-full rounded-xl"
            />
          </Card>
          <Card>
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Eventos corporativos
            </h3>
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
              alt="Logo FP"
              width={480}
              height={300}
              className="object-cover w-full h-full rounded-xl"
            />
          </Card>
          <Card>
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Fiestas privadas
            </h3>
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
              alt="Logo FP"
              width={480}
              height={300}
              className="object-cover w-full h-full rounded-xl"
            />
          </Card>
          <Card>
            <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
              Festivales
            </h3>
            <Image
              src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278"
              alt="Logo FP"
              width={480}
              height={300}
              className="object-cover w-full h-full rounded-xl"
            />
          </Card>
        </CardSwap>
      </div>
    </>
  );
};

export default EventsCardSwap;
