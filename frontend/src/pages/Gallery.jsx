"use client";

import { useEffect, useMemo, useState } from "react";
import "../styles/Gallery.css";
import galleryData from "../lib/galleryData";
import LazyImage from "../components/LazyImage";

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
      id: "volunteers",
      name: "Volunteers",
    },
    {
      id: "testimonials",
      name: "Testimonials",
    },
    {
      id: "workshops",
      name: "Workshops",
    },
  ];
  const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

 

  const filteredItems =
    activeFilter === "all"
      ? galleryData
      : galleryData.filter((item) => item.category === activeFilter);

  const groupedGallery = useMemo(() => {
    return {
      events: galleryData.filter((item) => item.category === "events"),

      volunteers: galleryData.filter((item) => item.category === "volunteers"),

      testimonials: galleryData.filter(
        (item) => item.category === "testimonials",
      ),

      workshops: galleryData.filter((item) => item.category === "workshops"),
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
        <h2>{title}</h2>
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
      {/* ================= HERO ================= */}

      <section className="gallery-hero">
        <div className="gallery-hero-bg"></div>

        <div className="gallery-overlay"></div>

        <div className="container">
          <div className="gallery-hero-content">
            <span className="gallery-badge">OUR JOURNEY</span>

            <h1>
              Capturing
              <br />
              Every Milestone
            </h1>

            <p>
              Explore memorable workshops, volunteer activities, classroom
              moments and inspiring success stories from educators transforming
              learning with technology.
            </p>
          </div>
        </div>
      </section>

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

      <section className="gallery-content">
        <div className="container">
          {activeFilter === "all" ? (
            <>
              <GallerySection title="Events" items={groupedGallery.events} />

              <GallerySection
                title="Volunteers"
                items={groupedGallery.volunteers}
              />

              <GallerySection
                title="Testimonials"
                items={groupedGallery.testimonials}
              />

              <GallerySection
                title="Workshops"
                items={groupedGallery.workshops}
              />
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

      {/* ================= CTA ================= */}

      {/* <section className="gallery-cta">
        <div className="gallery-cta-bg"></div>

        <div className="gallery-cta-overlay"></div>

        <div className="container">
          <div className="gallery-cta-content">
            <span className="section-tag">LET'S CREATE SOMETHING AMAZING</span>

            <h2>
              Your School Could Be
              <br />
              Featured Here Next
            </h2>

            <p>
              Partner with Teazy Tech to empower educators, inspire learners,
              and create unforgettable classroom experiences that deserve to be
              celebrated.
            </p>

            <div className="gallery-cta-buttons">
              <a href="/contact" className="btn btn-primary">
                Book a Training
              </a>

              <a href="/services" className="btn btn-outline">
                Explore Services
              </a>
            </div>
          </div>
        </div>
      </section> */}
    </main>
  );
};

export default Gallery;
