
import { events } from "@/helpers/Events";

export default async function EventModal({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const event = events.find(
    (e) => e.id.toLowerCase() === decodeURIComponent(slug).toLowerCase()
  );

  if (!event) return null;

  return (
    <div>
      <div>
        <h1>{event.title}</h1>
        <p>{event.fullDescription}</p>
      </div>
    </div>
  );
}


