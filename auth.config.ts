import type {NextAuthConfig} from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({auth, request: {nextUrl}}: any) {
            const isLoggedIn = auth?.user;
            // what if i want to protect other pages like /dashboard, /profile, etc.?
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnProfile = nextUrl.pathname.startsWith('/profile');
            if (isOnDashboard || isOnProfile) {
                if (isLoggedIn) return true;
                return false; // Redirect to login page if not logged in

            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true; // Allow access to other pages if not logged in
        },
    },
    providers: [], // Add your authentication providers here
} satisfies NextAuthConfig;

export default authConfig;