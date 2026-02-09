export function WebAppJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WaveSync",
    description:
      "A high-performance music player with real-time audio visualization, frequency analysis, and low-latency playback.",
    url: "https://wavesync.app",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires a modern browser with Web Audio API support",
    featureList: [
      "Real-time audio visualization",
      "Frequency spectrum analyzer",
      "Multiple visualizer modes (Bars, Wave, Circular)",
      "Keyboard shortcuts",
      "Offline support via PWA",
      "Background playback",
      "Shuffle and repeat modes",
      "Queue management",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
