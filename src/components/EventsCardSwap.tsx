import CardSwap, { Card } from "./UI/CardSwap";
import Image from "next/image";
import ScrollFloat from "./UI/ScrollFloat";
import { events } from "@/helpers/Events"; 
import { IEvents } from "@/types/Events"; 

interface EventsCardSwapProps {
    onEventClick: (event: IEvents) => void; 
}


const EventsCardSwap: React.FC<EventsCardSwapProps> = ({ onEventClick }) => {
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
            {events.map((event) => (
              <Card 
                key={event.id} 
                className="flex flex-col p-0 cursor-pointer"
                onClick={() => onEventClick(event)} 
              >
                <h3 className="pt-2 pl-2 text-3xl font-semibold border-b font-electrolize border-white-fp-600">
                  {event.title}
                </h3>

                <div className="relative flex-grow overflow-hidden rounded-b-xl">
                  <Image
                    src={event.image} 
                    alt={event.title || `Imagen de ${event.id}`}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </ScrollFloat>
    </>
  );
};

export default EventsCardSwap;
