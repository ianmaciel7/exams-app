import type { MetadataRoute } from "next";
import messages from "@/messages/en.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: messages.Metadata.title,
    short_name: messages.Metadata.title,
    description: messages.Metadata.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
