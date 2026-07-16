/** Web-ready paths for site-wide photos. */

export const goldenBerylTrainingImages = [
  "/images/Gallery Ibadan Training/IMG_7713.jpg",
  "/images/Gallery Ibadan Training/IMG_7715.jpg",
  "/images/Gallery Ibadan Training/IMG_7738.jpg",
  "/images/Gallery Ibadan Training/IMG_7739.jpg",
  "/images/Gallery Ibadan Training/IMG_7741.jpg",
  "/images/Gallery Ibadan Training/IMG_7742.jpg",
  "/images/Gallery Ibadan Training/IMG_7743.jpg",
  "/images/Gallery Ibadan Training/IMG_7750.jpg",
  "/images/Gallery Ibadan Training/IMG_7751.jpg",
  "/images/Gallery Ibadan Training/IMG_7753.jpg",
  "/images/Gallery Ibadan Training/IMG_7759.jpg",
];

/** University of Ibadan student teacher workshop (from /images/Gallery drive upload). */
export const uniIbadanWorkshopImages = [
  "/images/Gallery/544c6903-94e5-4a4b-9d68-53a0c1d6a194.jpg",
  "/images/Gallery/9a4bbb4e-cb1f-4f27-9a7d-cec96612e25e.jpg",
  "/images/Gallery/338a7520-aed2-40a0-a4df-4eb70c4d0ff2.jpg",
  "/images/Gallery/IMG_8254_jpg.jpg",
];

/** Site-wide training photos (Uni Ibadan drive upload — not Golden Beryl). */
export const ibadanTrainingImages = uniIbadanWorkshopImages;

export const exhibitionImages = [
  "/images/Gallery/IMG_0394.jpg",
  "/images/Gallery/IMG_0399.jpg",
  "/images/Gallery/IMG_0431.jpg",
  "/images/Gallery/IMG_0451.jpg",
  "/images/Gallery/IMG_0452.jpg",
  "/images/Gallery/IMG_0453.jpg",
  "/images/Gallery/IMG_0456.jpg",
  "/images/Gallery/IMG_0457.jpg",
  "/images/Gallery/IMG_0460.jpg",
  "/images/Gallery/IMG_0462.jpg",
  "/images/Gallery/IMG_0478.jpg",
  "/images/Gallery/IMG_0496.jpg",
  "/images/Gallery/FullSizeRender.jpg",
  "/images/Gallery/FullSizeRender (1).jpg",
  "/images/Gallery/IMG_2560.jpg",
  "/images/Gallery/IMG_2562.jpg",
  "/images/Gallery/IMG_2563.jpg",
  "/images/Gallery/IMG_2613.jpg",
  "/images/Gallery/IMG_2640.jpg",
  "/images/Gallery/IMG_2644.jpg",
  "/images/Gallery/IMG_2650.jpg",
];

export const heroCarouselSlides = [
  {
    src: "/images/Gallery/IMG_0399.jpg",
    offsetY: "8%",
  },
  { src: "/images/Gallery/9a4bbb4e-cb1f-4f27-9a7d-cec96612e25e.jpg" },
  { src: "/images/Gallery/IMG_0453.jpg" },
  { src: "/images/Gallery/IMG_2650.jpg" },
  { src: "/images/Gallery Kaduna Training/IMG_5756.jpg" },
];

/** @deprecated Use heroCarouselSlides — kept for any legacy imports */
export const heroCarouselImages = heroCarouselSlides.map((slide) => slide.src);
