import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import fs from "fs";
import path from "path";

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
      const playersPath = path.join(process.cwd(), 'app/data/players.json');
      const playersData = fs.readFileSync(playersPath, 'utf-8');
      const players = JSON.parse(playersData);

      // Check if the user's email is in the list of invited players
      const userEmail = user.email;
      const isInvited = players.some(player => player.email === userEmail);

      if (!isInvited) {
        // If the user is not invited, return false to deny access
        return false;
      }

      // If the user is invited, allow sign in
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };