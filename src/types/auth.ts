declare global {
  interface Window {
    google: any;
    FB: any;
    fbAsyncInit: () => void;
  }
}

export interface GoogleUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface FacebookUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface AuthUser {
  google?: GoogleUser;
  facebook?: FacebookUser;
}

export interface JwtGooglePayload {
  sub: string;
  name: string;
  email: string;
  picture: string;
}
