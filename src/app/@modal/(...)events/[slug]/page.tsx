import { events } from "@/helpers/Events";

interface EventModalProps {
  params: Promise<{ slug: string }>;
}

export default async function EventModal({ params }: EventModalProps) {
  const { slug } = await params;

  const event = events.find(
    (e) => e.id.toLowerCase() === decodeURIComponent(slug).toLowerCase()
  );

  if (!event) return null;

  return null;
}
