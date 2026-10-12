import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Shaz",
    short_name: "Shaz",
    description: "Car care on your terms",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#F7F4EF",
    theme_color: "#082A30",
    icons: [
      {
        src: "/shaz/icon.png",
        sizes: "1024x1024",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
