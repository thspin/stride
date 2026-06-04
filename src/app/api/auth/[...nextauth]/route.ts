import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Permitir siempre el sign-in. La sincronización con localStorage
      // se maneja en el cliente.
      return true;
    },
    async session({ session, token }) {
      // Pasar email y nombre a la sesión
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirigir al login custom
  },
});

export { handler as GET, handler as POST };
