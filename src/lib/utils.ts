import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates an optimized image URL from Supabase Storage.
 * This function uses Supabase's Image Transformation CDN to resize,
 * compress, and convert images to the modern WebP format on the fly.
 * * @param path The path to the image file in your Supabase Storage bucket.
 * @param width The desired width of the image in pixels.
 * @param height The desired height of the image in pixels.
 * @returns A URL for the optimized image, or a placeholder if the path is invalid.
 */
export function getOptimizedImageUrl(path: string, width: number, height: number) {
  // Return a placeholder if no valid image path is provided.
  if (!path) {
    return `https://placehold.co/${width}x${height}/f5f5f0/36454F?text=Zayna`;
  }
  
  try {
    // IMPORTANT: Make sure 'product_images' matches your Supabase Storage bucket name.
    const { data } = supabase
      .storage
      .from('product_images') 
      .getPublicUrl(path, {
        transform: {
          width,
          height,
          resize: 'cover', // 'cover' crops to fill the space. 'contain' would fit inside.
          quality: 75,      // Standard quality for web images.
          format: 'webp',   // Serve modern, efficient WebP format to supported browsers.
        },
      });

    return data?.publicUrl || `https://placehold.co/${width}x${height}/f5f5f0/36454F?text=Error`;
  } catch (error) {
    console.error("Error generating optimized image URL:", error);
    return `https://placehold.co/${width}x${height}/f5f5f0/36454F?text=Error`;
  }
}