interface IBaseContact {
  name: string;
  socialMedia: 'whatsapp' | 'instagram' | 'email';
}

export interface IWhatsappContact extends IBaseContact {
  socialMedia: 'whatsapp';
  phone: string[]; 
  url?: string; 
  email?: never; 
}

export interface IInstagramContact extends IBaseContact {
  socialMedia: 'instagram';
  url: string; 
  phone?: never; 
  email?: never;
}

export interface IEmailContact extends IBaseContact {
  socialMedia: 'email';
  mailtoLink: string; 
  url?: string; 
  phone?: never;
}

export type IContactLinks = IWhatsappContact | IInstagramContact | IEmailContact;