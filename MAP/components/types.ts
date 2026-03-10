export interface Spice {
  id: string; // From Supabase
  name: string; // e.g., 'Cardamom', 'Cumin'
  origin_state: string; // e.g., 'Kerala', 'Gujarat'
  history: string; // Spice history/description
  image_url?: string; // S3 or Supabase bucket URL for spice thumbnail
  map_image_url?: string; // S3 or Supabase bucket URL for the image shown on the map pin popup
  map_image_caption?: string; // The text shown below the image on the map pin popup
  map_x: number | null; // X coordinate percentage (0-100)
  map_y: number | null; // Y coordinate percentage (0-100)
}
