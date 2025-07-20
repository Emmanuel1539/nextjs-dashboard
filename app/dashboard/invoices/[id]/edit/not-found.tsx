import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <FaceFrownIcon className="h-16 w-16 text-gray-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">404 Not Found</h1>
      <p className="text-gray-600 mb-4">The invoice you are looking for does not exist.</p>
      <Link href="/dashboard/invoices" className="text-blue-500 hover:underline">
        Go back to Invoices
      </Link>
    </main>
  );
}