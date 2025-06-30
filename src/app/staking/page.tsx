"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StakingCard } from "@/components/StakingCard";
import { notFound } from "next/navigation";

export default function StakingPage() {
  return notFound();
  return (
    <section className="w-full min-h-screen">
      <Header />
      <div className="flex flex-col items-center md:items-end justify-start bg-[url('/images/bg-staking.png')] bg-cover bg-center min-h-screen py-8 sm:py-12 md:py-20">
        <div className="flex flex-col items-center md:items-end justify-end max-w-[1280px] mt-8 sm:mt-12 md:mt-20 w-full px-4 sm:px-6 md:mx-0 mx-auto">
          <StakingCard />
        </div>
      </div>
      <Footer />
    </section>
  );
}
