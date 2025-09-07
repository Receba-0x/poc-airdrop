import { ArrowButton } from "../ArrowButton";

export function HomeBanners() {
  return (
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <div className="bg-neutral-3 rounded-xl p-4 sm:p-6 h-[220px] sm:h-[240px] lg:h-[262px] w-full border-2 border-transparent hover:border-primary-8 transition-all duration-300 ease-in-out">
        <h1 className="text-neutral-12 font-bold text-xl sm:text-2xl lg:text-3xl">
          A próxima Box <br className="hidden sm:block" /> pode surpreender você!
        </h1>
        <div className="text-neutral-12 font-medium flex items-center gap-2 mt-2">
          <ArrowButton />
          <p className="text-sm sm:text-base">
            De itens <span className="text-primary-10">comuns</span> a{" "}
            <span className="text-primary-10">lendários</span>
          </p>
        </div>
      </div>

      <div className="relative rounded-xl h-[220px] sm:h-[240px] lg:h-[262px] w-full overflow-hidden border-2 border-transparent hover:border-primary-8 transition-all duration-300 ease-in-out group">
        <div className="absolute inset-0 bg-[url('/images/banner2.png')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"></div>
        <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col items-start justify-end">
          <h1 className="text-neutral-12 font-bold text-xl sm:text-2xl lg:text-3xl">
            Suba no Leaderboard. <br className="hidden sm:block" /> Conquiste os prêmios!
          </h1>
          <p className="text-neutral-12 font-medium flex items-center gap-2 mt-2 font-sora text-sm sm:text-base">
            <ArrowButton /> Só os melhores alcançam o topo
          </p>
        </div>
      </div>

      <div className="relative rounded-xl h-[220px] sm:h-[240px] lg:h-[262px] w-full overflow-hidden border-2 border-transparent hover:border-primary-8 transition-all duration-300 ease-in-out group sm:col-span-2 xl:col-span-1">
        <div className="absolute inset-0 bg-[url('/images/banner3.png')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"></div>
        <div className="relative z-10 p-4 sm:p-6 h-full flex flex-col items-start justify-start">
          <h1 className="text-neutral-12 font-bold text-xl sm:text-2xl lg:text-3xl">
            Ganhe junto <br className="hidden sm:block" /> com a Loot4Fun!
          </h1>
          <p className="text-neutral-12 font-medium flex items-center gap-2 mt-2 font-be-vietnam-pro text-sm sm:text-base">
            <ArrowButton /> Indique jogadores e receba comissão
          </p>
        </div>
      </div>
    </div>
  );
}
