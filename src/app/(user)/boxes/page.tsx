"use client";
import { useRef, useState, useMemo } from "react";
import BoxCard from "@/components/BoxCard";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BoxIcon } from "@/components/Icons/BoxIcon";
import { SearchBar } from "@/components/SearchBar";
import { useLootboxes } from "@/hooks/useLootbox";

export default function BoxesPage() {
  const containerRef = useRef(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { lootboxes, isLoading } = useLootboxes();
  const { t } = useLanguage();

  const BOXES_PER_PAGE = 15;

  const filteredBoxes = useMemo(() => {
    if (!search.trim()) return lootboxes;

    return lootboxes.filter((box: any) =>
      box.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, isLoading]);

  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredBoxes.length / BOXES_PER_PAGE);
  const startIndex = (currentPage - 1) * BOXES_PER_PAGE;
  const endIndex = startIndex + BOXES_PER_PAGE;
  const currentBoxes = filteredBoxes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center text-neutral-12 pb-24 w-full mt-10">
      <div className="container w-full max-w-screen-2xl mx-auto px-6 md:px-0">
        <div className="flex flex-col items-start">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-12">
            <BoxIcon className="h-8 w-8" /> {t("boxes.page.title")}
          </h1>
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        <div className="mt-4 text-neutral-10 text-sm flex justify-between items-center">
          <div>
            {search.trim() ? (
              <span>
                {filteredBoxes.length} {filteredBoxes.length === 1 ? t("boxes.search.result") : t("boxes.search.results")} {t("boxes.search.found")}
                {search.trim() && ` ${t("boxes.search.for")} "${search}"`}
              </span>
            ) : (
              <span>{lootboxes.length} {t("boxes.available")}</span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-neutral-10">
              {t("boxes.page.of")} {currentPage} {t("boxes.page.of.total")} {totalPages}
            </div>
          )}
        </div>

        {currentBoxes.length > 0 ? (
          <>
            <motion.div
              ref={containerRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4"
              variants={containerVariants}
            >
              {currentBoxes.map((box: any, index: number) => (
                <motion.div
                  key={box.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BoxCard box={box} />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("boxes.pagination.previous")}
                </button>

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
                        className={`w-10 h-10 rounded-lg border transition-colors ${
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
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("boxes.pagination.next")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-neutral-8 mb-4">
              <BoxIcon className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-11 mb-2">
              {t("boxes.empty.title")}
            </h3>
            <p className="text-neutral-9 max-w-md">
              {t("boxes.empty.description")} "{search}". {t("boxes.empty.search")}.
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-4 py-2 bg-primary-9 text-neutral-1 rounded-lg hover:bg-primary-10 transition-colors"
            >
              {t("boxes.empty.clear")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
