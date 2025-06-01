import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://amtronics.co",
      lastModified: new Date(),
      alternates: {
        languages: {
          en: "https://amtronics.co/en",
          ar: "https://amtronics.co/ar",
        },
      },
    },
    {
      url: "https://amtronics.co/products/raspberry-pi-5",
      lastModified: new Date(),
      alternates: {
        languages: {
          en: "https://amtronics.co/en/products/raspberry-pi-5",
          ar: "https://amtronics.co/ar/products/raspberry-pi-5",
        },
      },
    },
    {
      url: "https://amtronics.co/services/3d-printing",
      lastModified: new Date(),
      alternates: {
        languages: {
          en: "https://amtronics.co/en/services/3d-printing",
          ar: "https://amtronics.co/ar/services/3d-printing",
        },
      },
    },
    // Add more pages dynamically (e.g., products, services)
  ];
}