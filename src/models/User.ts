interface User {
  id: number;
  googleId: string | null;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: string;
}

export default User;
