'use client'
import { useEffect } from 'react';

export default function Error({
     error, 
     reset 
    }: { 
    error: Error & { digest?: string };
    reset: () => void }) {
    useEffect(() => {
        if (error) {
            console.error("Error occurred:", error);
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-4 text-gray-600">{error.message}</p>
            <button
                onClick={() => reset()}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Try Again
            </button>
        </div>
    );
}