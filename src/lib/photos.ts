import type { Format } from "./formats";

// Real photos for the three style cards and the home page. Free to use under the Unsplash licence.
export const PHOTOS: Record<Format, { src: string; photographer: string; page: string }> = {
  gym: { src: "/images/gym.jpg", photographer: "John Arano", page: "https://unsplash.com/photos/6078c6bfb5c5" },
  strength: { src: "/images/strength.jpg", photographer: "Gordon Cowie", page: "https://unsplash.com/photos/ca4ef48a9a71" },
  yoga: { src: "/images/yoga.jpg", photographer: "kike vega", page: "https://unsplash.com/photos/0f2fcb009e0b" },
};
