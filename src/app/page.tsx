'use client'; // Add this at the top of the file

import { useSession } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function Page() {
  const session = useSession();

  if (!session.isLoaded) return;

  if (session.isSignedIn) {
    redirect('/chat');
  } else {
    redirect('/sign-in');
  }
}
