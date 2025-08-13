import { requireUser } from '@/lib/auth/require-user';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
      
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sketch-serif text-5xl text-sketch-text mb-4 leading-tight">My Scripts</h1>
              <p className="text-xl text-sketch-text-muted leading-relaxed">
                Manage all your generated scripts and transcripts
              </p>
            </div>
            <Link href="/studio">
              <Button size="lg">
                Create New Script
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Dashboard */}
        {totalScripts > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-sketch-soft border border-sketch-border p-6">
              <div className="text-sketch-small font-medium text-sketch-text-muted">Total Scripts</div>
              <div className="text-3xl font-bold text-sketch-text">{totalScripts}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sketch-soft border border-sketch-border p-6">
              <div className="text-sketch-small font-medium text-sketch-text-muted">This Month</div>
              <div className="text-3xl font-bold text-sketch-text">{thisMonth}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sketch-soft border border-sketch-border p-6">
              <div className="text-sketch-small font-medium text-sketch-text-muted">Preferred Style</div>
              <div className="text-lg font-semibold text-sketch-text capitalize">{mostUsedStyle.toLowerCase()}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sketch-soft border border-sketch-border p-6">
              <div className="text-sketch-small font-medium text-sketch-text-muted">Total Duration</div>
              <div className="text-3xl font-bold text-sketch-text">{totalDuration}m</div>
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