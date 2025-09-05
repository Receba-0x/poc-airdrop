import { leadersMock } from "@/constants";
import { LeaderBoardIcon } from "../Icons/LeaderBoardIcon";
import Image from "next/image";
import { MedalIcon } from "../Icons/MedalIcon";
import { Avatar } from "../Avatar";
import Link from "next/link";

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
  const getColours = (rank: number) => {
    if (rank > 3) return colours.default;
    return colours[rank as keyof typeof colours];
  };

  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-12">
          <LeaderBoardIcon className="h-8 w-8" /> Top leaders
        </h1>
        <Link href="/leaderboard">
          <span className="text-neutral-11 font-medium">View All</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {leadersMock.map((leader) => {
          const userColor = getColours(leader.rank);
          return (
            <div
              key={leader.id}
              className={`${userColor.bg} transition-colors duration-300 ease-in-out border ${userColor.border} group flex flex-col justify-between rounded-xl p-4 relative overflow-hidden h-[180px]`}
            >
              <div
                className={`absolute top-0 right-0 w-10 h-10 ${userColor.light} blur-xl`}
              />
              <div
                className={`absolute top-0 right-0 -rotate-[10deg] w-32 h-10 ${userColor.light} group-hover:h-20 transition-all duration-500 ease-in-out blur-xl`}
              />
              <div
                className={`absolute top-8 -right-10 -rotate-[80deg] w-32 h-4 ${userColor.light} group-hover:h-8 transition-all duration-500 ease-in-out blur-xl`}
              />
              <Avatar
                avatar={leader.avatar}
                color={userColor.avatar}
                borderColor={userColor.border}
              />
              <div
                className={`absolute w-10 h-10 top-7 right-8 text-neutral-12 border ${userColor.border} ${userColor.bg} rounded-lg flex items-center justify-center`}
              >
                <MedalIcon className={`${userColor.medal}`} />
                <p
                  className={`${userColor.text} font-semibold font-sora absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mt-1`}
                >
                  {leader.rank}
                </p>
              </div>
              <h2>{leader.username}</h2>
              <div className="flex items-center justify-between">
                <div className="leading-none">
                  <h1 className="font-bold text-neutral-12">
                    {leader.winnings}
                  </h1>
                  <p className="text-neutral-11">Last win</p>
                </div>
                <div>
                  <h1 className="font-bold text-neutral-12">
                    {leader.winnings}
                  </h1>
                  <p className="text-neutral-11">Winnings</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
