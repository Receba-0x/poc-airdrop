import { ArrowButton } from "../ArrowButton";

export function HomeBanners() {
  return (
    <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <div className="bg-neutral-3 rounded-xl p-7 h-[262px] w-full border-2 border-transparent hover:border-primary-8 transition-all duration-300 ease-in-out">
        <h1 className="text-neutral-12 font-bold text-3xl">
          A próxima Box <br /> pode surpreender você!
        </h1>
        <div className="text-neutral-12 font-medium text-lg flex items-center gap-2 mt-2">
          <ArrowButton />{" "}
          <p>
            De itens <span className="text-primary-10">comuns</span> a{" "}
            <span className="text-primary-10">lendários</span>
          </p>
        </div>
      </div>

      <div className="relative rounded-xl h-[262px] w-full overflow-hidden border-2 border-transparent hover:border-primary-8 transition-all duration-300 ease-in-out group">
        <div className="absolute inset-0 bg-[url('/images/banner2.png')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"></div>
        <div className="relative z-10 p-7 h-full flex flex-col items-start justify-end">
          <h1 className="text-neutral-12 font-bold text-3xl">
            Suba no Leaderboard. <br /> Conquiste os prêmios!
          </h1>
          <p className="text-neutral-12 font-medium text-lg flex items-center gap-2 mt-2">
            <ArrowButton /> Só os melhores alcançam o topo
          </p>
        </div>
      </div>

      <div className="relative rounded-xl h-[262px] w-full overflow-hidden border-2 border-transparent hover:border-primary-8 transition-all duration-300 ease-in-out group">
        <div className="absolute inset-0 bg-[url('/images/banner3.png')] bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"></div>
        <div className="relative z-10 p-7 h-full flex flex-col items-start justify-start">
          <h1 className="text-neutral-12 font-bold text-3xl">
            Ganhe junto <br /> com a Loot4Fun!
          </h1>
          <p className="text-neutral-12 font-medium text-lg flex items-center gap-2 mt-2">
            <ArrowButton /> Indique jogadores e receba comissão
          </p>
        </div>
      </div>
    </div>
  );
}
