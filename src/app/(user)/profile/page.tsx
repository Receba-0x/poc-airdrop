"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  ReceiptIcon,
  TruckIcon,
  PackageIcon,
} from "lucide-react";
import { useBalanceTransactions } from "@/hooks/useBalance";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ProfileTab,
  AffiliatesTab,
  TransactionsTab,
  DeliveriesTab,
  UserItemsTab,
} from "@/components/Profile";

type TabType = "profile" | "affiliates" | "transactions" | "deliveries" | "items";

export default function UserPage() {
  const { t } = useLanguage();
  const { user, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { transactions } = useBalanceTransactions({
    limit: 10,
    offset: 0,
    type: "",
    status: "",
  });

  const tabs = [
    { id: "profile" as TabType, label: t("tabs.profile"), icon: UserIcon },
    { id: "affiliates" as TabType, label: t("tabs.affiliates"), icon: UsersIcon },
    { id: "transactions" as TabType, label: t("tabs.transactions"), icon: ReceiptIcon },
    { id: "deliveries" as TabType, label: t("tabs.deliveries"), icon: TruckIcon },
    { id: "items" as TabType, label: t("tabs.items"), icon: PackageIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} refetchUser={refetchUser} />;
      case "affiliates":
        return <AffiliatesTab />;
      case "transactions":
        return <TransactionsTab transactions={transactions} />;
      case "deliveries":
        return <DeliveriesTab />;
      case "items":
        return <UserItemsTab />;
      default:
        return <ProfileTab user={user} refetchUser={refetchUser} />;
    }
  };

  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto pt-10">
      <div className="px-4 sm:px-0">
        <div className="flex gap-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-[240px] h-fit sticky top-24"
          >
            <nav className="">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border border-transparent rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-neutral-5 text-neutral-12 shadow-lg border-neutral-6"
                        : "text-neutral-11 hover:bg-neutral-3 hover:text-neutral-12 hover:border-neutral-6"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
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
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
