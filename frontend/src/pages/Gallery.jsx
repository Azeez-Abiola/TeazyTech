"use client";

import { useEffect, useMemo, useState } from "react";
import "../styles/Gallery.css";
import galleryData from "../lib/galleryData";
import LazyImage from "../components/LazyImage";
import CircularGallery from "../components/ui/CircularGallery";
import Grainient from "../components/ui/Grainient";
const galleryItems = galleryData.flatMap((item) =>
  item.images.map((image) => ({ image }))
);
const filters = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "events",
    name: "Events",
  },
  {
    id: "workshops",
    name: "Workshops",
  },
  {
    id: "exhibitions",
    name: "Exhibitions",
  },
];
const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches,
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (event) => setIsDesktop(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const filteredItems =
    activeFilter === "all"
      ? galleryData
      : galleryData.filter((item) => item.category === activeFilter);

  const groupedGallery = useMemo(() => {
    return {
      events: galleryData.filter((item) => item.category === "events"),
      workshops: galleryData.filter((item) => item.category === "workshops"),
      exhibitions: galleryData.filter((item) => item.category === "exhibitions"),
    };
  }, []);

  const openLightbox = (item) => {
    setSelectedItem(item);
    setCurrentImage(0);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    setCurrentImage(0);
    setLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    if (!selectedItem) return;

    setCurrentImage((prev) => (prev + 1) % selectedItem.images.length);
  };

  const previousImage = () => {
    if (!selectedItem) return;

    setCurrentImage(
      (prev) =>
        (prev - 1 + selectedItem.images.length) % selectedItem.images.length,
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") closeLightbox();

      if (e.key === "ArrowRight") nextImage();

      if (e.key === "ArrowLeft") previousImage();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, selectedItem]);

  const GalleryCard = ({ item }) => (
    <article className="gallery-item" onClick={() => openLightbox(item)}>
      <div className="gallery-item-image">
        <LazyImage src={item.images[0]} alt={item.title} />

        <div className="gallery-gradient"></div>
      </div>

      <div className="gallery-item-overlay">
        <span className="gallery-category">
          {filters.find((f) => f.id === item.category)?.name}
        </span>

        <h3>{item.title}</h3>

        <p className="line-clamp-2">{item.description}</p>
      </div>
    </article>
  );

  const GallerySection = ({ title, items }) => (
    <section className="gallery-category-section">
      <div className="section-header">
        <h2 className="!text-white">{title}</h2>
      </div>

      <div className="gallery-grid">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );

  return (
    <main className="gallery-page">
      {/* Desktop circular hero — WebGL only on large screens */}
      {isDesktop && (
        <div
          className="gallery-hero-desktop"
          style={{ height: "100vh", position: "relative", backgroundColor: "#849abb" }}
        >
          <CircularGallery
            bend={1}
            borderRadius={0.05}
            scrollEase={0.05}
            scrollSpeed={2}
            items={galleryItems}
          />
        </div>
      )}

      {/* Mobile hero — static fallback (no WebGL) */}
      {!isDesktop && (
        <section className="gallery-hero-mobile">
          <div className="gallery-hero-mobile__overlay" aria-hidden="true" />
          <div className="container gallery-hero-mobile__content">
            <span className="gallery-hero-mobile__eyebrow">Our Gallery</span>
            <h1>Moments from trainings, workshops &amp; events</h1>
            <p>Explore photos from Teazy Tech programs across Nigeria.</p>
          </div>
        </section>
      )}

      {/* ================= FILTER ================= */}

      <section className="gallery-filter">
        <div className="container">
          <div className="filter-tabs">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`filter-tab ${
                  activeFilter === filter.id ? "active" : ""
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GALLERY CONTENT ================= */}

      <section className="gallery-content relative overflow-hidden">
        {/* Animated gradient background (same as blog page) */}
        <div className="absolute inset-0 z-0">
          {isDesktop ? (
            <Grainient
              color1="#9ca9cc"
              color2="#4a6bc5"
              timeSpeed={0.25}
              colorBalance={0}
              warpStrength={1}
              warpFrequency={5}
              warpSpeed={2}
              warpAmplitude={50}
              blendAngle={0}
              blendSoftness={0.05}
              rotationAmount={500}
              noiseScale={2}
              grainAmount={0.1}
              grainScale={2}
              grainAnimated={false}
              contrast={1.5}
              gamma={1}
              saturation={1.15}
              centerX={0}
              centerY={0}
              zoom={1.3}
            />
          ) : (
            <div className="gallery-content-fallback-bg" aria-hidden="true" />
          )}
        </div>

        <div className="container relative z-10">
          {activeFilter === "all" ? (
            <>
              <GallerySection title="Events" items={groupedGallery.events} />

              <GallerySection
                title="Workshops"
                items={groupedGallery.workshops}
              />

              {groupedGallery.exhibitions.length > 0 && (
                <GallerySection
                  title="Exhibitions"
                  items={groupedGallery.exhibitions}
                />
              )}
            </>
          ) : (
            <>
              <div className="gallery-grid">
                {filteredItems.map((item) => (
                  <GalleryCard key={item.id} item={item} />
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="no-items">
                  <h3>No gallery items found.</h3>
                  <p>We couldn't find any images for this category yet.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ================= LIGHTBOX ================= */}

      {lightboxOpen && selectedItem && (
        <div className="lightbox">
          <div className="lightbox-overlay" onClick={closeLightbox} />

          <div className="lightbox-content">
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>

            <div className="lightbox-image">
              <LazyImage
                src={selectedItem.images[currentImage]}
                alt={selectedItem.title}
              />
            </div>

            <div className="lightbox-details">
              <span className="lightbox-category">
                {filters.find((f) => f.id === selectedItem.category)?.name}
              </span>

              <h2>{selectedItem.title}</h2>

              <p>{selectedItem.description}</p>

              {(selectedItem.category === "events" ||
                selectedItem.category === "workshops") &&
                selectedItem.images.length > 1 && (
                  <div className="lightbox-counter">
                    {currentImage + 1} / {selectedItem.images.length}
                  </div>
                )}
            </div>

            {(selectedItem.category === "events" ||
              selectedItem.category === "workshops") &&
              selectedItem.images.length > 1 && (
                <>
                  <button
                    className="lightbox-nav lightbox-prev"
                    onClick={previousImage}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>

                  <button
                    className="lightbox-nav !bg-blue-500 lightbox-next"
                    onClick={nextImage}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </>
              )}
          </div>
        </div>
      )}

    </main>
  );
};

export default Gallery;
