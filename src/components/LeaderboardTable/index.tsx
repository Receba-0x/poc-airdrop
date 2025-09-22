"use client";
import { useState } from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { formatDate } from "@/utils/dateFormat";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const {
    leaderboard = [],
    totalCount = 0,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading,
  } = useLeaderboard({ page: currentPage, limit: ITEMS_PER_PAGE });

  const getColours = (rank: number) => {
    if (rank > 3) return colours.default;
    return colours[rank as keyof typeof colours];
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-6 md:px-0">
      <div className="bg-neutral-3 rounded-lg overflow-hidden border border-neutral-6">
        {/* Header */}
        <div className="bg-neutral-4 border-b border-neutral-6">
          <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-neutral-11 px-10">
            <div className="col-span-1 flex justify-center">{t("leaderboard.place")}</div>
            <div className="col-span-4">{t("leaderboard.playerName")}</div>
            <div className="col-span-2">{t("leaderboard.value")}</div>
            <div className="col-span-3">{t("leaderboard.itemsObtained")}</div>
            <div className="col-span-2">{t("leaderboard.lastActivity")}</div>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-neutral-6">
          {isLoading ? (
            Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 p-4 items-center px-10 animate-pulse"
              >
                <div className="col-span-1 h-6 bg-neutral-6 rounded"></div>
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-6 rounded-lg"></div>
                  <div className="h-4 bg-neutral-6 rounded w-24"></div>
                </div>
                <div className="col-span-2 h-4 bg-neutral-6 rounded"></div>
                <div className="col-span-3 h-4 bg-neutral-6 rounded"></div>
                <div className="col-span-2 h-4 bg-neutral-6 rounded"></div>
              </div>
            ))
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-neutral-11">
              {t("leaderboard.noPlayersFound")}
            </div>
          ) : (
            leaderboard.map((leader: any) => {
              const userColor = getColours(leader.rank);

              return (
                <div
                  key={leader.rank}
                  className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-neutral-4/50 ${userColor.bg} px-10`}
                >
                  {/* Place */}
                  <div className="col-span-1 relative flex justify-center">
                    <div className="text-neutral-12 font-semibold relative">
                      {leader.rank}
                      <div
                        className={`absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-t-lg w-10 h-[4px] ${userColor.bar}`}
                      />
                    </div>
                  </div>

                  {/* Player name */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="min-w-12 min-h-12 w-12 h-12 relative">
                      <img
                        src={leader.imageUrl || "/images/avatar_default.png"}
                        alt={leader.username}
                        className={`w-full h-full rounded-lg object-cover border-2 ${userColor.border}`}
                        onError={(e) => {
                          e.currentTarget.src = "/images/avatar_default.png";
                        }}
                      />
                    </div>
                    <span className="text-neutral-12 font-medium">
                      {leader.username}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-12 font-semibold">
                        $
                        {leader.totalWinAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Items obtained */}
                  <div className="col-span-3">
                    <span className="text-neutral-11">
                      {leader.totalItemsWon?.toLocaleString() || "0"}
                    </span>
                  </div>

                  {/* Last activity */}
                  <div className="col-span-2">
                    <span className="text-neutral-11">
                      {formatDate(leader.lastActivity)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Info and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-neutral-10 text-sm">
          {t("leaderboard.showing")
            .replace("{start}", ((currentPage - 1) * ITEMS_PER_PAGE + 1).toString())
            .replace("{end}", Math.min(currentPage * ITEMS_PER_PAGE, totalCount || 0).toString())
            .replace("{total}", totalCount.toLocaleString())}
        </div>

        {totalPages && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="px-3 py-2 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {t("leaderboard.previous")}
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
              disabled={!hasNextPage}
              className="px-3 py-2 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {t("leaderboard.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
