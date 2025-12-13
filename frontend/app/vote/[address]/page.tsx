import { Metadata } from 'next';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: { q?: string };
}): Promise<Metadata> {
  const pollQuestion = searchParams.q || 'Cast your vote on this governance poll';
  const pollAddress = params.address;

  return {
    title: `Vote: ${pollQuestion}`,
    description: `Cast your vote with reputation-weighted quadratic voting. Poll: ${pollAddress}`,
    openGraph: {
      title: pollQuestion,
      description: 'Cast your vote with reputation-weighted quadratic voting',
      images: [`/vote/${pollAddress}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: pollQuestion,
      description: 'Cast your vote with reputation-weighted quadratic voting',
      images: [`/vote/${pollAddress}/opengraph-image`],
    },
  };
}

export default function VotePage({
  params,
  searchParams,
}: {
  params: { address: string };
  searchParams: { q?: string };
}) {
  // Redirect to main page with the poll pre-selected
  if (typeof window !== 'undefined') {
    window.location.href = `/?poll=${params.address}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🗳️</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {searchParams.q || 'Loading Poll...'}
        </h1>
        <p className="text-slate-400 mb-8">
          Redirecting to voting dashboard...
        </p>
        <a
          href={`/?poll=${params.address}`}
          className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
