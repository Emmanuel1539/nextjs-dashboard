import NextAuth from "next-auth";
import {authConfig} from '@/auth.config';
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from '@/app/lib/definitions'
import bcrypt from "bcrypt";
import postgres from "postgres";



const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Function to find user by email
async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await sql<User[]>`SELECT * FROM users WHERE email = ${email}`;
        return user[0]; // Return the first user found
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
    }
}

const handler = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
        async authorize(credentials) {
            const parsedCredentials = z.object({
                email: z.string().email(),
                password: z.string().min(6)
            }).safeParse(credentials);

            if (parsedCredentials.success) {
                const { email, password } = parsedCredentials.data;
                const user = await getUser(email);
                if(!user) return null; // User not found

                const passwordMatch = await bcrypt.compare(password, user.password);
                if (!passwordMatch) return null; // Invalid password

               return {id: user.id, email: user.email, name: user.name}; // Return user data
            }
            return null; // Invalid credentials
        }
        })
    ],

    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({token, user}) {
            // On sign in, add user info to the token
            if(user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;

            }

            return token;
        },
        async session({session, token}) {
            // On session access, add user info to the session
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                // session.user.accessToken = token.accessToken as string; // if you set it above

        }
            return session;
        }
    },
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error',
    }
});



export { handler as GET, handler as POST };