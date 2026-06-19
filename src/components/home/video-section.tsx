import { SectionHeading } from "@/components/section-heading";

export function VideoSection() {
  const videos = [
    { title: "Factory Tour", src: "/assets/videos/factory-tour.mp4" },
    { title: "Dual Power Package", src: "/assets/videos/dual-power.mp4" },
    { title: "Pump Truck Test", src: "/assets/videos/pump-truck-test.mp4" },
  ];

  return (
    <section className="section dark-gradient">
      <SectionHeading
        eyebrow="Video Center"
        title="Let buyers see the factory, testing and delivery process."
        text="Short videos are placed close to trust and conversion modules, not hidden in a media archive."
        light
      />
      <div className="container-shell grid gap-5 lg:grid-cols-3">
        {videos.map((video) => (
          <article key={video.title} className="overflow-hidden rounded-lg border border-white/10 bg-white/10">
            <video src={video.src} controls preload="metadata" className="aspect-video w-full bg-black" />
            <h3 className="p-4 text-lg font-black text-white">{video.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
