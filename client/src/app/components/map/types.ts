export interface Spice {
  id: string | number;
  name: string; // e.g., 'Cardamom', 'Cumin'
  originState: string; // e.g., 'Kerala', 'Gujarat'
  history: string; // Spice history/description
  imageUrl?: string; // S3 or Supabase bucket URL for spice thumbnail
  mapImageUrl?: string; // S3 or Supabase bucket URL for the image shown on the map pin popup
  mapImageCaption?: string; // The text shown below the image on the map pin popup
  mapX: number | null; // X coordinate percentage (0-100)
  mapY: number | null; // Y coordinate percentage (0-100)
}

