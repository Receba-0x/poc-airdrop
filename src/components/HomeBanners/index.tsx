import { ArrowButton } from "../ArrowButton";

export function HomeBanners() {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="relative group bg-neutral-3 overflow-hidden rounded-xl h-[240px] sm:h-[300px] lg:h-[400px] w-full transition-all duration-300 ease-in-out">
        <video
          src="/videos/banner.mp4"
          autoPlay
          muted
          loop
          controls={false}
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-in-out"
        />

        <div className="absolute inset-0 top-4 md:top-12 left-4 p-4 sm:p-6 z-20">
          <h1 className="text-neutral-12 font-bold text-xl sm:text-2xl lg:text-3xl">
            A próxima Box <br className="hidden sm:block" /> pode surpreender
            você!
          </h1>
          <div className="text-neutral-12 font-medium flex items-center gap-2 mt-10">
            <ArrowButton />
            <p className="text-sm sm:text-base">
              De itens <span className="text-primary-10">comuns</span> a{" "}
              <span className="text-primary-10">lendários</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
