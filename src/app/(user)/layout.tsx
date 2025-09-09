import { FloatingTransactionButton } from "@/components/FloatingTransactionButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OnLive } from "@/components/OnLive";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="mt-[64px] md:mt-[72px] mb-12 bg-neutral-2">
        <OnLive />
        {children}
      </div>
      <FloatingTransactionButton />
      <Footer />
    </div>
  );
}
