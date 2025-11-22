export interface IEvents {
  id: string;
  title: string;
  image: string;
  shortDescription?: string;
  fullDescription: string;
  mediaGallery?: MediaItem[]; 
}

export interface MediaItem {
  url: string;
  mediaType: 'photo' | 'video';
  altText?: string;
}