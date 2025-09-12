"use client";
import { LeaderBoardIcon } from "../Icons/LeaderBoardIcon";
import { MedalIcon } from "../Icons/MedalIcon";
import { Avatar } from "../Avatar";
import Link from "next/link";
import { useTopLeaders } from "@/hooks/useLeaderboard";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Leaderboard } from "@/services";

const colours = {
  1: {
    border: "border-warning-6",
    bg: "bg-warning-2 hover:bg-warning-3",
    light: "bg-warning-9",
    avatar: "text-warning-9",
    medal: "text-warning-12",
    text: "text-warning-2",
  },
  2: {
    border: "border-link-6",
    bg: "bg-link-2 hover:bg-link-3",
    light: "bg-link-10",
    avatar: "text-link-10",
    medal: "text-link-12",
    text: "text-link-2",
  },
  3: {
    border: "border-green-6",
    bg: "bg-green-2 hover:bg-green-3",
    light: "bg-green-9",
    avatar: "text-green-9",
    medal: "text-green-12",
    text: "text-green-2",
  },
  default: {
    border: "border-neutral-6",
    bg: "bg-neutral-3 hover:bg-neutral-4",
    light: "bg-neutral-9",
    avatar: "text-neutral-9",
    medal: "text-neutral-12",
    text: "text-neutral-3",
  },
};

export function TopLeaders() {
  const { topLeaders = [], isLoading } = useTopLeaders();
  const { t } = useLanguage();

  const getColours = (rank: number) => {
    if (rank > 3) return colours.default;
    return colours[rank as keyof typeof colours];
  };

  if (isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto">
        <div className="animate-pulse">
          <h1 className="bg-neutral-6 h-10 w-1/4 rounded-lg mb-4"></h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-6 flex flex-col justify-between rounded-xl p-2 sm:p-4 relative overflow-hidden h-[160px] sm:h-[180px]"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-12">
          <LeaderBoardIcon className="h-6 w-6" /> {t("leaderboard.topLeaders")}
        </h1>
        <Link href="/leaderboard">
          <span className="text-neutral-11 font-medium text-sm sm:text-base hover:text-primary-10 transition-colors">
            {t("leaderboard.viewAll")}
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {topLeaders.map((leader: Leaderboard) => {
          const userColor = getColours(leader.rank);
          return (
            <div
              key={leader.rank}
              className={`${userColor.bg} transition-colors duration-300 ease-in-out border ${userColor.border} group flex flex-col justify-between rounded-xl p-3 sm:p-4 relative overflow-hidden h-[160px] sm:h-[180px]`}
            >
              <div
                className={`absolute top-0 right-0 w-8 h-8 sm:w-10 sm:h-10 ${userColor.light} blur-xl`}
              />
              <div
                className={`absolute top-0 right-0 -rotate-[10deg] w-24 h-8 sm:w-32 sm:h-10 ${userColor.light} group-hover:h-16 sm:group-hover:h-20 transition-all duration-500 ease-in-out blur-xl`}
              />
              <div
                className={`absolute top-6 sm:top-8 -right-8 sm:-right-10 -rotate-[80deg] w-24 h-3 sm:w-32 sm:h-4 ${userColor.light} group-hover:h-6 sm:group-hover:h-8 transition-all duration-500 ease-in-out blur-xl`}
              />
              <Avatar
                avatar={leader.imageUrl}
                color={userColor.avatar}
                borderColor={userColor.border}
              />
              <div
                className={`absolute w-8 h-8 sm:w-10 sm:h-10 top-6 sm:top-7 right-6 sm:right-8 text-neutral-12 border ${userColor.border} ${userColor.bg} rounded-lg flex items-center justify-center`}
              >
                <MedalIcon
                  className={`${userColor.medal} h-4 w-4 sm:h-5 sm:w-5`}
                />
                <p
                  className={`${userColor.text} font-semibold font-sora absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mt-0.5 sm:mt-1 text-xs sm:text-sm`}
                >
                  {leader.rank}
                </p>
              </div>
              <h2 className="text-sm sm:text-base font-medium text-neutral-12">
                {leader.username}
              </h2>
              <div className="flex items-center justify-between">
                <div className="leading-none">
                  <h1 className="font-bold text-neutral-12 text-sm sm:text-base">
                    {leader.lastWinAmount}
                  </h1>
                  <p className="text-neutral-11 text-xs sm:text-sm">{t("leaderboard.lastWin")}</p>
                </div>
                <div>
                  <h1 className="font-bold text-neutral-12 text-sm sm:text-base">
                    {leader.totalWinAmount}
                  </h1>
                  <p className="text-neutral-11 text-xs sm:text-sm">{t("leaderboard.winnings")}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
