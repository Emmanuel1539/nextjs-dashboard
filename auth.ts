// auth.ts
import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Destructure everything from the NextAuth instance
const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { GET, POST, auth, signIn, signOut };