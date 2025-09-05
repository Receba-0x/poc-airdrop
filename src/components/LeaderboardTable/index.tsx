"use client";
import { useState, useMemo } from "react";
import { leadersMock } from "@/constants";
import { LogoIcon } from "../Icons/LogoIcon";

const colours = {
  1: {
    border: "border-warning-6",
    bg: "bg-warning-2",
    avatar: "text-warning-9",
    bar: "bg-warning-9",
  },
  2: {
    border: "border-link-6",
    bg: "bg-link-2",
    avatar: "text-link-10",
    bar: "bg-link-9",
  },
  3: {
    border: "border-green-6",
    bg: "bg-green-2",
    avatar: "text-green-9",
    bar: "bg-green-9",
  },
  default: {
    border: "border-neutral-6",
    bg: "bg-neutral-3",
    avatar: "text-neutral-9",
    bar: "bg-neutral-9",
  },
};

export function LeaderboardTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const getColours = (rank: number) => {
    if (rank > 3) return colours.default;
    return colours[rank as keyof typeof colours];
  };

  const extendedLeaders = useMemo(
    () => [
      ...leadersMock,
      ...Array.from({ length: 95 }, (_, i) => ({
        id: leadersMock.length + i + 1,
        avatar: "/images/avatar_default.png",
        username: "John Doe",
        rank: leadersMock.length + i + 1,
        winnings: Math.floor(Math.random() * 500) + 50,
        last_win: Math.floor(Math.random() * 24) + 1,
      })),
    ],
    []
  );

  const totalPages = Math.ceil(extendedLeaders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeaders = extendedLeaders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-0">
      <div className="bg-neutral-3 rounded-lg overflow-hidden border border-neutral-6">
        {/* Header */}
        <div className="bg-neutral-4 border-b border-neutral-6">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-neutral-11 px-10">
            <div className="col-span-1 flex justify-center">Place</div>
            <div className="col-span-4">Player name</div>
            <div className="col-span-2">Value</div>
            <div className="col-span-3">Items obtained</div>
            <div className="col-span-2">Last activity</div>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-neutral-6">
          {currentLeaders.map((leader, index) => {
            const userColor = getColours(leader.rank);

            return (
              <div
                key={leader.id}
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-neutral-4/50 ${userColor.bg} px-10`}
              >
                {/* Place */}
                <div className="col-span-1 relative flex justify-center">
                  <div className="text-neutral-12 font-semibold relative">
                    {leader.rank}
                    <div
                      className={`absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-t-lg w-10 h-[4px] ${userColor.bar}`}
                    />
                  </div>
                </div>

                {/* Player name */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 relative">
                    <img
                      src={leader.avatar}
                      alt={leader.username}
                      className={`w-full h-full rounded-lg object-cover border-2 ${userColor.border}`}
                    />
                  </div>
                  <span className="text-neutral-12 font-medium">
                    {leader.username}
                  </span>
                </div>

                {/* Value */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1">
                    <LogoIcon className="w-4 h-4" />
                    <span className="text-neutral-12 font-semibold">
                      {leader.winnings.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items obtained */}
                <div className="col-span-3">
                  <span className="text-neutral-11">60</span>
                </div>

                {/* Last activity */}
                <div className="col-span-2">
                  <span className="text-neutral-11">
                    {leader.last_win}h ago
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Info and Controls */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-neutral-10 text-sm">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, extendedLeaders.length)} of{" "}
          {extendedLeaders.length} players
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg border transition-colors text-sm ${
                      currentPage === pageNum
                        ? "bg-primary-9 border-primary-9 text-neutral-1"
                        : "border-neutral-6 bg-neutral-3 hover:bg-neutral-4 text-neutral-12"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
