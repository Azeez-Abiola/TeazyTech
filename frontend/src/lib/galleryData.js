import {
  exhibitionImages,
  goldenBerylTrainingImages,
  uniIbadanWorkshopImages,
} from "./siteImages";

const galleryData = [
    {
        id: "galleryIbadan",
        title: "Ibadan Teacher Training — Golden Beryl International School",
        images: goldenBerylTrainingImages,
        description:
            "Private EdTech integration training session for teachers from Golden Beryl International School Ibadan.",
        category: "events",
    },
    {
        id: "galleryKaduna",
        title: "Kaduna Multi-School EdTech Training — 5 Partner Schools",
        images: [
            "/images/Gallery Kaduna Training/IMG_5706.jpg",
            "/images/Gallery Kaduna Training/IMG_5756.jpg",
            "/images/Gallery Kaduna Training/IMG_5791.jpg",
            "/images/Gallery Kaduna Training/IMG_5798.jpg",
            "/images/Gallery Kaduna Training/IMG_5799.jpg",
            "/images/Gallery Kaduna Training/IMG_5838.jpg",
            "/images/Gallery Kaduna Training/IMG_5839.jpg",
            "/images/Gallery Kaduna Training/IMG_5852.JPG",
            "/images/Gallery Kaduna Training/IMG_6071.jpg",
            "/images/Gallery Kaduna Training/IMG_6094.jpg",
            "/images/Gallery Kaduna Training/IMG_6147.jpg",
        ],
        description:
            "General EdTech integration training session for teachers from a group of 5 schools in Kaduna.",
        category: "events",
    },
    {
        id: "mastercardFoundation",
        title: "Mastercard Foundation EdTech Conference",
        images: [
            "/images/Mastercard Foundation Edtech Conference/IMG_6296.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6299.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6333.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6334.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6338.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6342.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6357.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6439.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6449.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6469.jpg",
            "/images/Mastercard Foundation Edtech Conference/IMG_6470.jpg",
        ],
        description: "Teazy Tech at the Mastercard Foundation EdTech Conference — showcasing innovative approaches to teacher professional development.",
        category: "events",
    },
    {
        id: "seminar",
        title: "Educator Technology Seminar — Teazy Tech Partner Event",
        images: [
            "/images/workshopPhotos/IMG_7521.jpg",
            "/images/workshopPhotos/IMG_7526.jpg",
            "/images/workshopPhotos/IMG_7528.jpg",
            "/images/workshopPhotos/IMG_7530.jpg",
            "/images/workshopPhotos/IMG_7531.jpg",
            "/images/workshopPhotos/IMG_7532.jpg",
            "/images/workshopPhotos/IMG_8138.jpg",
        ],
        description: "A collaborative seminar event with Teazy Tech as one of the featured partners, focused on digital tools for modern educators.",
        category: "workshops",
    },
    {
        id: "uiStudentTeacherWorkshop",
        title: "University of Ibadan Student Teacher Workshop",
        images: uniIbadanWorkshopImages,
        description: "An immersive EdTech workshop for student teachers at the University of Ibadan, equipping the next generation of educators with practical digital skills.",
        category: "workshops",
    },
    {
        id: "exhibitions",
        title: "Exhibitions",
        images: exhibitionImages,
        description: "Teazy Tech exhibition showcasing educational technology tools and resources for educators across Nigeria.",
        category: "exhibitions",
    },
];
/**
 * Curated shortlist for the homepage-style slider on the Gallery page.
 *
 * The slider used to show every photo from every album, which is where the
 * repeats came from — most shoots have two or three near-identical frames of
 * the same moment. This keeps one frame per moment, per the client's marked-up
 * screenshots. The albums below still hold the full sets.
 */
export const sliderImages = [
  // Ibadan Teacher Training — Golden Beryl
  "/images/Gallery Ibadan Training/IMG_7713.jpg",
  "/images/Gallery Ibadan Training/IMG_7738.jpg",
  "/images/Gallery Ibadan Training/IMG_7741.jpg",
  "/images/Gallery Ibadan Training/IMG_7743.jpg",
  "/images/Gallery Ibadan Training/IMG_7750.jpg",
  "/images/Gallery Ibadan Training/IMG_7759.jpg",
  // Exhibitions
  "/images/Gallery/IMG_0399.jpg",
  "/images/Gallery/IMG_0452.jpg",
  "/images/Gallery/IMG_0453.jpg",
  "/images/Gallery/IMG_0478.jpg",
  "/images/Gallery/IMG_0496.jpg",
  "/images/Gallery/FullSizeRender (1).jpg",
  "/images/Gallery/IMG_2560.jpg",
  "/images/Gallery/IMG_2650.jpg",
  // Kaduna Multi-School Training
  "/images/Gallery Kaduna Training/IMG_5756.jpg",
  "/images/Gallery Kaduna Training/IMG_5798.jpg",
  "/images/Gallery Kaduna Training/IMG_5838.jpg",
  "/images/Gallery Kaduna Training/IMG_6147.jpg",
  // Mastercard Foundation EdTech Conference
  "/images/Mastercard Foundation Edtech Conference/IMG_6296.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6334.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6338.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6439.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6449.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6470.jpg",
  // Educator Technology Seminar
  "/images/workshopPhotos/IMG_7526.jpg",
  "/images/workshopPhotos/IMG_7530.jpg",
  "/images/workshopPhotos/IMG_7531.jpg",
];

export default galleryData;
