import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import path from "path";
import fs from "fs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: { encryption: true },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Load the list of invited players
      const playersPath = path.join(process.cwd(), "app/data/players.json");
      const playersData = fs.readFileSync(playersPath, "utf-8");
      const players = JSON.parse(playersData);

      // Check if the user's email is in the list of invited players
      const userEmail = user.email;
      const isInvited = players.some((player) => player.email === userEmail);

      if (!isInvited) {
        // If the user is not invited, return false to deny access
        return false;
      }

      // If the user is invited, allow sign in
      return true;
    },
    async session({ session, token }) {
      // Add the Google OAuth ID token to the session
      session.user = {
        ...session.user,
        googleIdToken: token.idToken, // Google OAuth ID token
      };
      return session;
    },
    async jwt({ token, account }) {
      // Add the Google OAuth ID token to the JWT
      if (account) {
        token.idToken = account.id_token; // Use the ID token from the Google account
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };