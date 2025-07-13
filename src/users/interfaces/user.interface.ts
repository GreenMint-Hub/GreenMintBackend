export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string | null;
  resetToken: string | null;
} 