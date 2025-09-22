"use client";

import React from "react";
import {
  UserIcon,
  CreditCard,
  PhoneIcon,
  MapPinIcon,
  HomeIcon,
  TruckIcon,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLanguage } from "@/contexts/LanguageContext";

export function DeliveriesTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          {t("deliveries.title")}
        </h1>
        <p className="text-neutral-10 mb-6">{t("deliveries.description")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  {t("deliveries.fullName")}{" "}
                  <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="text"
                placeholder={t("deliveries.placeholders.recipientName")}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  {t("deliveries.cpf")} <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="text"
                placeholder={t("deliveries.placeholders.cpf")}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  {t("deliveries.phone")} <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="tel"
                placeholder={t("deliveries.placeholders.phone")}
                className="w-full"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  {t("deliveries.zipCode")} <span className="text-red-500">*</span>
                </h2>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t("deliveries.placeholders.zipCode")}
                  className="flex-1"
                  required
                />
                <Button variant="outline" size="sm">
                  {t("deliveries.search")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-3 h-3 text-neutral-10" />
                  <h2 className="text-neutral-12 text-sm">
                    {t("deliveries.state")} <span className="text-red-500">*</span>
                  </h2>
                </div>
                <Input
                  type="text"
                  placeholder={t("deliveries.placeholders.state")}
                  className="w-full"
                  maxLength={2}
                  required
                />
              </div>

              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-3 h-3 text-neutral-10" />
                  <h2 className="text-neutral-12 text-sm">
                    {t("deliveries.city")} <span className="text-red-500">*</span>
                  </h2>
                </div>
                <Input
                  type="text"
                  placeholder={t("deliveries.placeholders.city")}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  {t("deliveries.neighborhood")} <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="text"
                placeholder={t("deliveries.placeholders.neighborhood")}
                className="w-full"
                required
              />
            </div>
          </div>
        </div>

        {/* Rua e Complemento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-neutral-10" />
              <h2 className="text-neutral-12">
                {t("deliveries.street")} <span className="text-red-500">*</span>
              </h2>
            </div>
            <Input
              type="text"
              placeholder={t("deliveries.placeholders.street")}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-neutral-10" />
              <h2 className="text-neutral-12">
                {t("deliveries.number")} <span className="text-red-500">*</span>
              </h2>
            </div>
            <Input
              type="text"
              placeholder={t("deliveries.placeholders.number")}
              className="w-full"
              required
            />
          </div>
        </div>

        <div className="space-y-1 mt-6">
          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-neutral-10" />
            <h2 className="text-neutral-12">{t("deliveries.complement")}</h2>
          </div>
          <Input
            type="text"
            placeholder={t("deliveries.placeholders.complement")}
            className="w-full"
          />
        </div>

        {/* Informações Adicionais */}
        <div className="bg-neutral-4 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <TruckIcon className="w-4 h-4 text-neutral-10" />
            <h3 className="text-neutral-12 font-medium">
              {t("deliveries.importantInfo.title")}
            </h3>
          </div>
          <ul className="text-sm text-neutral-10 space-y-1">
            <li>{t("deliveries.importantInfo.completeAddress")}</li>
            <li>{t("deliveries.importantInfo.verifyZipCode")}</li>
            <li>{t("deliveries.importantInfo.useSearchButton")}</li>
            <li>{t("deliveries.importantInfo.brazilOnly")}</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-neutral-10">
            {t("deliveries.lastUpdate").replace("{date}", t("deliveries.never"))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline">{t("deliveries.cancel")}</Button>
            <Button variant="default">{t("deliveries.saveAddress")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
