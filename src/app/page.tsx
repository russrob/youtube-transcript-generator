export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          YouTube Studio
        </h1>
        <p className="text-gray-600 mb-8">
          Transform YouTube videos into polished scripts
        </p>
        <a
          href="/studio"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Studio →
        </a>
      </div>
    </main>
  );
}