"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Lootboxes", href: "/admin/lootboxes" },
  { name: "Itens", href: "/admin/items" },
  { name: "Compras", href: "/admin/purchases" },
  { name: "Relatórios", href: "/admin/reports" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto py-10">
      <div className="px-4 sm:px-0">
        <div className="flex gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-[240px] h-fit sticky top-24"
          >
            <nav className="">
              {navigation.map((tab) => {
                return (
                  <button
                    key={tab.href}
                    onClick={() => router.push(tab.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border border-transparent rounded-lg ${
                      pathname === tab.href
                        ? "bg-neutral-5 text-neutral-12 shadow-lg border-neutral-6"
                        : "text-neutral-11 hover:bg-neutral-3 hover:text-neutral-12 hover:border-neutral-6"
                    }`}
                  >
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
