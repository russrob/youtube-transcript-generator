import { requireUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ScriptsClient } from './scripts-client';

export default async function ScriptsPage() {
  const { clerkUser, dbUser } = await requireUser();

  // Fetch user's scripts with stats
  const scripts = await prisma.script.findMany({
    where: {
      video: {
        userId: clerkUser.id
      }
    },
    include: {
      video: {
        select: {
          id: true,
          youtubeId: true,
          title: true,
          thumbnailUrl: true,
          createdAt: true,
          duration: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate user stats
  const totalScripts = scripts.length;
  const thisMonth = scripts.filter(script => {
    const scriptDate = new Date(script.createdAt);
    const now = new Date();
    return scriptDate.getMonth() === now.getMonth() && scriptDate.getFullYear() === now.getFullYear();
  }).length;

  const styleStats = scripts.reduce((acc, script) => {
    acc[script.style] = (acc[script.style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostUsedStyle = Object.keys(styleStats).reduce((a, b) => 
    styleStats[a] > styleStats[b] ? a : b, 'PROFESSIONAL'
  );

  const totalDuration = scripts.reduce((sum, script) => sum + script.durationMin, 0);

  return (
    <>
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Scripts</h1>
              <p className="mt-2 text-gray-600">
                Manage all your generated scripts and transcripts
              </p>
            </div>
            <Link
              href="/studio"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Script
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        {totalScripts > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-600">Total Scripts</div>
              <div className="text-3xl font-bold text-blue-600">{totalScripts}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-600">This Month</div>
              <div className="text-3xl font-bold text-green-600">{thisMonth}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-600">Preferred Style</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">{mostUsedStyle.toLowerCase()}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-sm font-medium text-gray-600">Total Duration</div>
              <div className="text-3xl font-bold text-purple-600">{totalDuration}m</div>
            </div>
          </div>
        )}

        <ScriptsClient 
          scripts={scripts} 
          userName={clerkUser.firstName || 'User'}
        />
      </div>
    </>
  );
}