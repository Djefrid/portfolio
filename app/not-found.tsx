import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Code 404 stylisé */}
        <div className="relative mb-6">
          <p className="text-[8rem] font-bold leading-none text-dark-800 select-none">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-[8rem] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600 select-none">
            404
          </p>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <Link
          href="/"
          className="btn-primary inline-flex"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
