export interface IGallery {
  id: number,
  url: string;
  mediaType: 'photo' | 'video';
  altText?: string;
}