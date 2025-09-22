"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Image,
  Package,
  Box,
  ShoppingCart,
  FileText,
  LogOut,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Usuários", href: "/admin/users", icon: Users },
  { name: "Imagens", href: "/admin/images", icon: Image },
  { name: "Lootboxes", href: "/admin/lootboxes", icon: Package },
  { name: "Itens", href: "/admin/items", icon: Box },
  { name: "Compras", href: "/admin/purchases", icon: ShoppingCart },
  { name: "Relatórios", href: "/admin/reports", icon: FileText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-2">
      <div className="bg-neutral-3 border-b border-neutral-6">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-9 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-neutral-1" />
              </div>
              <h1 className="text-xl font-bold text-neutral-12">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/home")}
                className="p-2 text-neutral-11 hover:text-neutral-12 hover:bg-neutral-4 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto py-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-[280px] h-fit sticky top-24"
            >
              <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
                <h2 className="text-sm font-semibold text-neutral-11 uppercase tracking-wider mb-4">
                  Navigation
                </h2>
                <nav className="space-y-2">
                  {navigation.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;

                    return (
                      <button
                        key={tab.href}
                        onClick={() => router.push(tab.href)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary-9 text-neutral-1 shadow-lg"
                            : "text-neutral-11 hover:bg-neutral-4 hover:text-neutral-12"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? "text-neutral-1" : "text-neutral-10"
                          }`}
                        />
                        <span className="font-medium">{tab.name}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-neutral-1 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
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
    </div>
  );
}
