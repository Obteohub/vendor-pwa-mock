// app/page.jsx

import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <h1>✅ Success! Your Homepage is Loading.</h1>
      <p>This is the content for the `/` route.</p>
      
      {/* CORRECTION: Change href to the actual URL path /dashboard */}
      <Link href="/dashboard">Continue to Dashboard</Link>
    </main>
  );
}