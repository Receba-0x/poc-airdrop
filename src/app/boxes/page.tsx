"use client";
import { useRef, useState, useMemo } from "react";
import BoxCard from "@/components/BoxCard";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { BoxIcon } from "@/components/Icons/BoxIcon";
import { SearchBar } from "@/components/SearchBar";

// Mock data for boxes
const boxesData = [
  { id: "1", title: "Crypto Box", image: "/images/boxes/cripto.webp" },
  {
    id: "2",
    title: "Super Prize Box",
    image: "/images/boxes/super-prize.webp",
  },
  { id: "3", title: "ADR Prizes Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "4", title: "Golden Box", image: "/images/boxes/cripto.webp" },
  { id: "5", title: "Diamond Box", image: "/images/boxes/super-prize.webp" },
  { id: "6", title: "Platinum Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "7", title: "Silver Box", image: "/images/boxes/cripto.webp" },
  { id: "8", title: "Bronze Box", image: "/images/boxes/super-prize.webp" },
  { id: "9", title: "Premium Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "10", title: "Elite Box", image: "/images/boxes/cripto.webp" },
  { id: "11", title: "Legendary Box", image: "/images/boxes/super-prize.webp" },
  { id: "12", title: "Epic Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "13", title: "Rare Box", image: "/images/boxes/cripto.webp" },
  { id: "14", title: "Common Box", image: "/images/boxes/super-prize.webp" },
  { id: "15", title: "Starter Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "16", title: "Mystery Box", image: "/images/boxes/cripto.webp" },
  { id: "17", title: "Treasure Box", image: "/images/boxes/super-prize.webp" },
  { id: "18", title: "Lucky Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "19", title: "Fortune Box", image: "/images/boxes/cripto.webp" },
  { id: "20", title: "Champion Box", image: "/images/boxes/super-prize.webp" },
  // Adding more boxes to test pagination
  { id: "21", title: "Warrior Box", image: "/images/boxes/cripto.webp" },
  { id: "22", title: "Heroic Box", image: "/images/boxes/super-prize.webp" },
  { id: "23", title: "Mythic Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "24", title: "Divine Box", image: "/images/boxes/cripto.webp" },
  { id: "25", title: "Celestial Box", image: "/images/boxes/super-prize.webp" },
  { id: "26", title: "Infernal Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "27", title: "Shadow Box", image: "/images/boxes/cripto.webp" },
  { id: "28", title: "Light Box", image: "/images/boxes/super-prize.webp" },
  { id: "29", title: "Dark Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "30", title: "Void Box", image: "/images/boxes/cripto.webp" },
  { id: "31", title: "Cosmic Box", image: "/images/boxes/super-prize.webp" },
  { id: "32", title: "Quantum Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "33", title: "Atomic Box", image: "/images/boxes/cripto.webp" },
  { id: "34", title: "Nuclear Box", image: "/images/boxes/super-prize.webp" },
  { id: "35", title: "Plasma Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "36", title: "Energy Box", image: "/images/boxes/cripto.webp" },
  { id: "37", title: "Power Box", image: "/images/boxes/super-prize.webp" },
  { id: "38", title: "Force Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "39", title: "Spirit Box", image: "/images/boxes/cripto.webp" },
  { id: "40", title: "Soul Box", image: "/images/boxes/super-prize.webp" },
  { id: "41", title: "Mind Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "42", title: "Heart Box", image: "/images/boxes/cripto.webp" },
  { id: "43", title: "Dream Box", image: "/images/boxes/super-prize.webp" },
  { id: "44", title: "Nightmare Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "45", title: "Fantasy Box", image: "/images/boxes/cripto.webp" },
  { id: "46", title: "Reality Box", image: "/images/boxes/super-prize.webp" },
  { id: "47", title: "Virtual Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "48", title: "Digital Box", image: "/images/boxes/cripto.webp" },
  { id: "49", title: "Analog Box", image: "/images/boxes/super-prize.webp" },
  { id: "50", title: "Hybrid Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "51", title: "Fusion Box", image: "/images/boxes/cripto.webp" },
  { id: "52", title: "Evolution Box", image: "/images/boxes/super-prize.webp" },
  { id: "53", title: "Revolution Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "54", title: "Innovation Box", image: "/images/boxes/cripto.webp" },
  { id: "55", title: "Creation Box", image: "/images/boxes/super-prize.webp" },
  {
    id: "56",
    title: "Destruction Box",
    image: "/images/boxes/adr-prizes.webp",
  },
  { id: "57", title: "Transformation Box", image: "/images/boxes/cripto.webp" },
  {
    id: "58",
    title: "Metamorphosis Box",
    image: "/images/boxes/super-prize.webp",
  },
  { id: "59", title: "Genesis Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "60", title: "Apocalypse Box", image: "/images/boxes/cripto.webp" },
  { id: "61", title: "Eternal Box", image: "/images/boxes/super-prize.webp" },
  { id: "62", title: "Temporal Box", image: "/images/boxes/adr-prizes.webp" },
  { id: "63", title: "Infinite Box", image: "/images/boxes/cripto.webp" },
  { id: "64", title: "Finite Box", image: "/images/boxes/super-prize.webp" },
  { id: "65", title: "Ultimate Box", image: "/images/boxes/adr-prizes.webp" },
];

export default function BoxesPage() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();

  const BOXES_PER_PAGE = 15;

  const filteredBoxes = useMemo(() => {
    if (!search.trim()) return boxesData;

    return boxesData.filter((box) =>
      box.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

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
      <div className="container w-full max-w-[1280px] mx-auto px-6 md:px-0">
        <div className="flex flex-col items-start">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-12">
            <BoxIcon className="h-8 w-8" /> Boxes
          </h1>
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Results count */}
        <div className="mt-4 text-neutral-10 text-sm flex justify-between items-center">
          <div>
            {search.trim() ? (
              <span>
                {filteredBoxes.length} result
                {filteredBoxes.length !== 1 ? "s" : ""} found
                {search.trim() && ` for "${search}"`}
              </span>
            ) : (
              <span>{boxesData.length} boxes available</span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="text-neutral-10">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {currentBoxes.length > 0 ? (
          <>
            <motion.div
              ref={containerRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {currentBoxes.map((box, index) => (
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
                  Previous
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
                  Next
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
              No boxes found
            </h3>
            <p className="text-neutral-9 max-w-md">
              No boxes match your search "{search}". Try searching for different
              terms.
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-4 py-2 bg-primary-9 text-neutral-1 rounded-lg hover:bg-primary-10 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
