import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Detects the type of video URL and returns the appropriate embed URL or original URL
 * @param {string} url - The video URL
 * @returns {object} - { type: 'youtube' | 'googledrive' | 'direct', url: string }
 */
export function detectVideoType(url) {
  if (!url) return { type: "direct", url: "" };

  // YouTube detection and conversion
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: "youtube",
      url: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Google Drive detection and conversion
  if (url.includes("drive.google.com")) {
    // Extract file ID from various Google Drive URL formats
    let fileId = "";

    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) {
      fileId = fileMatch[1];
    } else {
      // Format: https://drive.google.com/open?id=FILE_ID
      const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) {
        fileId = idMatch[1];
      }
    }

    if (fileId) {
      return {
        type: "googledrive",
        url: `https://drive.google.com/file/d/${fileId}/preview`,
      };
    }
  }

  // Vimeo detection
  const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return {
      type: "vimeo",
      url: `https://player.vimeo.com/video/${videoId}?autoplay=1`,
    };
  }

  // Direct video file (mp4, webm, ogg, etc.)
  return {
    type: "direct",
    url: url,
  };
}
