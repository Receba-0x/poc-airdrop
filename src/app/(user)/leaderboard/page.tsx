import { ScrollAnimation } from "@/components/ScrollAnimation";
import { TopLeaders } from "@/components/TopLeaders";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { TrophyIcon } from "@/components/Icons/TrophyIcon";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-neutral-2 space-y-10 mt-10">
      <TopLeaders />

      <ScrollAnimation type="fade" direction="up" delay={0.4} duration={0.7}>
        <div className="max-w-screen-2xl mx-auto px-6 md:px-0">
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-12 mb-6">
            <TrophyIcon className="h-6 w-6" /> Full Leaderboard
          </h2>
          <LeaderboardTable />
        </div>
      </ScrollAnimation>
    </div>
  );
}
