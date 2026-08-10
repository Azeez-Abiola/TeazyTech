/**
 * Album images are curated by hand rather than pulled from the full shoot
 * arrays in siteImages.js — those hold every frame, including the two or three
 * near-identical takes of each moment. Each album caps at five images and picks
 * distinct moments: a wide shot, a detail, people, and so on.
 *
 * Deliberately not reusing the siteImages exports here: Services.jsx indexes
 * into them (exhibitionImages[5], ibadanTrainingImages[0]), so trimming them
 * would change the wrong page.
 */
const galleryData = [
    {
        id: "galleryIbadan",
        title: "Ibadan Teacher Training — Golden Beryl International School",
        images: [
            "/images/Gallery Ibadan Training/IMG_7713.jpg",   // room + presenter at the screen
            "/images/Gallery Ibadan Training/IMG_7741.jpg",   // teacher working at a laptop
            "/images/Gallery Ibadan Training/IMG_7743.jpg",   // facilitator among the participants
            "/images/Gallery Ibadan Training/IMG_7750.jpg",   // full group photo
            "/images/Gallery Ibadan Training/IMG_7759.jpg",   // close portrait of participants
        ],
        description:
            "Private EdTech integration training session for teachers from Golden Beryl International School Ibadan.",
        category: "events",
    },
    {
        id: "galleryKaduna",
        title: "Kaduna Multi-School EdTech Training — 5 Partner Schools",
        images: [
            "/images/Gallery Kaduna Training/IMG_5756.jpg",   // speaker with mic, window wall
            "/images/Gallery Kaduna Training/IMG_5798.jpg",   // speaker in maroon
            "/images/Gallery Kaduna Training/IMG_5838.jpg",   // facilitator addressing the room
            "/images/Gallery Kaduna Training/IMG_6094.jpg",   // wide shot of the seated audience
            "/images/Gallery Kaduna Training/IMG_6147.jpg",   // group portrait
        ],
        description:
            "General EdTech integration training session for teachers from a group of 5 schools in Kaduna.",
        category: "events",
    },
    {
        id: "mastercardFoundation",
        title: "Mastercard Foundation EdTech Conference",
        images: [
            "/images/Mastercard Foundation Edtech Conference/IMG_6296.jpg",  // welcome backdrop
            "/images/Mastercard Foundation Edtech Conference/IMG_6338.jpg",  // outdoor signage
            "/images/Mastercard Foundation Edtech Conference/IMG_6439.jpg",  // step-and-repeat portrait
            "/images/Mastercard Foundation Edtech Conference/IMG_6449.jpg",  // group of delegates
            "/images/Mastercard Foundation Edtech Conference/IMG_6470.jpg",  // with a conference guest
        ],
        description: "Teazy Tech at the Mastercard Foundation EdTech Conference — showcasing innovative approaches to teacher professional development.",
        category: "events",
    },
    {
        id: "seminar",
        title: "Educator Technology Seminar — Teazy Tech Partner Event",
        // Four rather than five — the remaining frames are second takes of the
        // RESET stage and the summit banner already covered here.
        images: [
            "/images/workshopPhotos/IMG_7526.jpg",   // speaking on the RESET stage
            "/images/workshopPhotos/IMG_7530.jpg",   // attendees in the stairwell
            "/images/workshopPhotos/IMG_7531.jpg",   // Africa Teachers Summit banner
            "/images/workshopPhotos/IMG_8138.jpg",   // "She Could" session backdrop
        ],
        description: "A collaborative seminar event with Teazy Tech as one of the featured partners, focused on digital tools for modern educators.",
        category: "workshops",
    },
    {
        id: "uiStudentTeacherWorkshop",
        title: "University of Ibadan Student Teacher Workshop",
        // Three rather than five — this shoot only contains three distinct
        // scenes; the fourth frame repeats the lecture theatre view.
        images: [
            "/images/Gallery/544c6903-94e5-4a4b-9d68-53a0c1d6a194.jpg",  // lecture theatre session
            "/images/Gallery/338a7520-aed2-40a0-a4df-4eb70c4d0ff2.jpg",  // presenting at the screen
            "/images/Gallery/IMG_8254_jpg.jpg",                          // speaker at the podium
        ],
        description: "An immersive EdTech workshop for student teachers at the University of Ibadan, equipping the next generation of educators with practical digital skills.",
        category: "workshops",
    },
    {
        id: "exhibitions",
        title: "Exhibitions",
        images: [
            "/images/Gallery/IMG_0453.jpg",             // the team on the stand
            "/images/Gallery/IMG_0452.jpg",             // Teazy AI demo, close detail
            "/images/Gallery/IMG_0478.jpg",             // the stand itself
            "/images/Gallery/FullSizeRender (1).jpg",   // visitors at the stand
            "/images/Gallery/IMG_2650.jpg",             // celebrating on the floor
        ],
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
