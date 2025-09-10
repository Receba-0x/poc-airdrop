"use client";
import { useState } from "react";
import { BaseModal } from "../TransactionModals";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "../Button";

interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (team: string) => void;
}

export function TeamSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: TeamSelectionModalProps) {
  const { t } = useLanguage();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const teams = [
    { id: "corinthians", name: t("teams.corinthians") || "Corinthians" },
    { id: "brasil", name: t("teams.brasil") || "Brasil" },
    { id: "flamengo", name: t("teams.flamengo") || "Flamengo" },
    { id: "inter", name: t("teams.inter") || "Inter" },
  ];

  function onSelectTeam(team: string) {
    setSelectedTeam(team);
  }

  const handleSelect = () => {
    if (selectedTeam) onSelect(selectedTeam);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("teams.selectJersey") || "Select Jersey"}
      showCloseButton={false}
      preventClose={true}
    >
      <div className="p-4">
        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-4">
            {t("teams.jerseySelectionMessage") ||
              "Please select which team jersey you would like to receive:"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTeam === team.id
                  ? "bg-blue-900/30 border-blue-500"
                  : "bg-gray-800/30 border-gray-700 hover:border-gray-500"
              }`}
              onClick={() => onSelectTeam(team.id)}
            >
              <div className="text-center">
                <div className="font-bold text-white">{team.name}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" className="mr-2" onClick={onClose}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button disabled={!selectedTeam} onClick={handleSelect}>
            {t("common.confirm") || "Confirm"}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
