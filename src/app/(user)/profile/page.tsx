"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  UserIcon,
  UsersIcon,
  ReceiptIcon,
  TruckIcon,
  SettingsIcon,
  CreditCardIcon,
  TrophyIcon,
  BarChart3Icon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  CreditCard,
  HomeIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { AvatarIcon } from "@/components/Icons/AvatarIcon";
import { Input } from "@/components/Input";
import { WalletIcon } from "@/components/Icons/WalletIcon";
import { EarningIcon } from "@/components/Icons/EarningIcon";

type TabType = "profile" | "affiliates" | "transactions" | "deliveries";

export default function UserPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile" as TabType, label: "Perfil", icon: UserIcon },
    { id: "affiliates" as TabType, label: "Afiliados", icon: UsersIcon },
    { id: "transactions" as TabType, label: "Transações", icon: ReceiptIcon },
    { id: "deliveries" as TabType, label: "Deliveries", icon: TruckIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab user={user} />;
      case "affiliates":
        return <AffiliatesTab />;
      case "transactions":
        return <TransactionsTab />;
      case "deliveries":
        return <DeliveriesTab />;
      default:
        return <ProfileTab user={user} />;
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

function ProfileTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          Conta e perfil
        </h1>

        <div className="flex items-center gap-8 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-w-12 rounded-full overflow-hidden border-2 border-neutral-6 transition-all duration-200 group-hover:border-primary-10">
              {user?.avatar ? (
                <Image
                  src={user?.avatar || "/images/profile.png"}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarIcon className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-sm text-neutral-10">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-neutral-10">{user?.email}</p>
            </div>
          </div>

          <Button variant="outline">Alterar Imagem</Button>
        </div>

        <div className="space-y-1 mt-4">
          <h2 className="text-neutral-12">Apelido</h2>
          <Input type="text" value={user?.username} placeholder="Apelido" />
        </div>

        <div className="space-y-1 mt-4">
          <h2 className="text-neutral-12 ">Email</h2>
          <Input type="email" value={user?.email} placeholder="Email" />
        </div>

        <div className="flex justify-start mt-8">
          <Button variant="default">Salvar Alterações</Button>
        </div>
      </div>

      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">Segurança</h1>

        <div className="flex items-center justify-between mt-4">
          <h2 className="text-neutral-12">Deseja alterar sua senha?</h2>
          <Button variant="outline">Alterar Senha</Button>
        </div>
      </div>
    </div>
  );
}

function AffiliatesTab() {
  return (
    <div className="space-y-6 w-full">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 px-4 py-6 w-full">
        <h1 className="text-xl font-bold text-neutral-12 mb-2">Afiliados</h1>

        <div className="flex items-end gap-4 justify-between w-full">
          <div className="space-y-1 w-full">
            <h2 className="text-neutral-12 ">Referral code</h2>
            <Input
              type="text"
              placeholder="Insira o código de referência"
              className="w-full"
            />
          </div>

          <div className="space-y-1 w-full">
            <h2 className="text-neutral-12 ">Referral link</h2>
            <Input
              type="text"
              disabled
              placeholder="https://loot-for-fun/CódigoAleatorio"
              className="w-full"
            />
          </div>

          <Button variant="secondary">Copiar</Button>
        </div>
      </div>

      <div className="bg-neutral-3 rounded-xl border border-neutral-6 px-4 py-6 w-full h-full">
        <h1 className="text-xl font-bold text-neutral-12 mb-2">Dashboard</h1>

        <div className="flex items-center justify-between w-full bg-neutral-4 border border-neutral-6 rounded-xl p-4 h-full">
          <div className="space-y-1 w-1/2 h-full flex items-center gap-4">
            <div className="w-10 h-10 rounded-full relative">
              <div className="absolute bottom-1/2 translate-x-1/2 right-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-[#68432C] z-10 blur-md" />
              <Image
                src="/images/emblems/bronze.png"
                alt="Dashboard"
                width={40}
                height={40}
                draggable={false}
                className="object-cover z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div className="w-full">
              <p className="text-neutral-12 font-medium">Bronze</p>
              <p className="text-green-11">5% Commission</p>
            </div>
          </div>

          <div className="flex items-center justify-center w-1/2">
            <div className="w-[1px] h-12 bg-neutral-6" />
          </div>

          <div className="space-y-1 w-full flex items-center gap-4">
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-center justify-between w-full">
                <p className="text-neutral-12">$00,00</p>
                <p className="text-neutral-11 font-medium">
                  $10.000,00 <span className="font-normal">Next level</span>
                </p>
              </div>
              <div className="flex items-center bg-neutral-7 h-3 w-full rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-10 rounded-r-full"
                  style={{ width: "40%" }}
                />
              </div>
            </div>

            <div className="w-10 h-10 rounded-full relative">
              <div className="absolute bottom-1/2 translate-x-1/2 right-1/2 translate-y-1/2 w-12 h-12 rounded-full bg-neutral-8 z-10 blur-md" />
              <Image
                src="/images/emblems/prata.png"
                alt="Dashboard"
                width={47}
                height={47}
                draggable={false}
                className="object-cover z-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div className="flex items-center justify-center w-1/2">
            <div className="w-[1px] h-12 bg-neutral-6" />
          </div>

          <Button variant="secondary">View Tiers</Button>
        </div>

        <div className="flex items-center justify-between w-full gap-5">
          <div className="flex flex-col gap-2 w-1/2 bg-neutral-4 border border-neutral-6 rounded-xl p-4 h-full mt-4">
            <h1 className="text-neutral-12">Available earnings</h1>
            <div className="flex items-center gap-2">
              <WalletIcon className="w-6 h-6 text-green-11" />
              <p className="text-green-12 text-xl font-semibold">$0,00</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-1/2 bg-neutral-4 border border-neutral-6 rounded-xl p-4 h-full mt-4">
            <h1 className="text-neutral-12">Total Earnings</h1>
            <div className="flex items-center gap-2">
              <EarningIcon className="w-6 h-6 text-primary-11" />
              <p className="text-primary-12 text-xl font-semibold">$0,00</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-neutral-12">
          <div className="bg-neutral-4 rounded-xl border border-neutral-6 p-3 flex items-center justify-between">
            <h1 className="font-be-vietnam-pro">Deposit</h1>
            <p className="font-sora">$0,00</p>
          </div>
          <div className="bg-neutral-4 rounded-xl border border-neutral-6 p-3 flex items-center justify-between">
            <h1 className="font-be-vietnam-pro">Spent</h1>
            <p className="font-sora">$0,00</p>
          </div>
          <div className="bg-neutral-4 rounded-xl border border-neutral-6 p-3 flex items-center justify-between">
            <h1 className="font-be-vietnam-pro">Referalls</h1>
            <p className="font-sora">0 Users</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-neutral-12 mb-4">History</h2>

        <div className="bg-neutral-4 rounded-xl border border-neutral-6 overflow-hidden">
          <div className="grid grid-cols-5 gap-4 p-4 bg-neutral-4 border-b border-neutral-6 text-sm font-medium text-neutral-11">
            <div>Afiliado</div>
            <div>Data</div>
            <div>Valor Gasto</div>
            <div>Sua Comissão</div>
            <div>Status</div>
          </div>

          <div className="divide-y divide-neutral-6">
            {[
              {
                id: 1,
                affiliate: "João Silva",
                date: "2024-01-15",
                type: "Loot Box",
                spent: 150.0,
                commission: 7.5,
                status: "Pago",
              },
              {
                id: 2,
                affiliate: "Maria Santos",
                date: "2024-01-14",
                type: "Upgrade VIP",
                spent: 299.99,
                commission: 15.0,
                status: "Pago",
              },
            ].map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-5 gap-4 p-4 text-sm hover:bg-neutral-4 transition-colors bg-neutral-3`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-10 flex items-center justify-center">
                    <span className="text-neutral-1 text-xs font-bold">
                      {item.affiliate
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <span className="text-neutral-12 font-medium truncate">
                    {item.affiliate}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-neutral-11">
                    {new Date(item.date).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-neutral-12 font-medium">
                    ${item.spent.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span className="text-green-500 font-semibold">
                    +${item.commission.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Pago"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer da Tabela */}
          <div className="p-4 bg-neutral-4 border-t border-neutral-6">
            <div className="flex items-center justify-between text-sm">
              <div className="text-neutral-11">Mostrando 2 de 2 registros</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                  Anterior
                </button>
                <button className="px-3 py-1 bg-primary-10 text-neutral-1 rounded">
                  1
                </button>
                <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                  2
                </button>
                <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                  Próximo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsTab() {
  const transactions = [
    {
      id: 1,
      type: "Compra",
      amount: -50,
      description: "Loot Box Premium",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      type: "Ganho",
      amount: 150,
      description: "Vitória no sorteio",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      type: "Saque",
      amount: -100,
      description: "Transferência para conta",
      date: "2024-01-13",
      status: "pending",
    },
    {
      id: 4,
      type: "Depósito",
      amount: 200,
      description: "Depósito via PIX",
      date: "2024-01-12",
      status: "error",
    },
  ];

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-neutral-12 mb-4">
        Histórico de transações
      </h2>

      <div className="bg-neutral-4 rounded-xl border border-neutral-6 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 bg-neutral-4 border-b border-neutral-6 text-sm font-medium text-neutral-11">
          <div>Tipo</div>
          <div>ID</div>
          <div>Valor</div>
          <div>Data</div>
          <div>Status</div>
        </div>

        <div className="divide-y divide-neutral-6">
          {transactions.map((item, index) => (
            <div
              key={item.id}
              className={`grid grid-cols-5 gap-4 p-4 text-sm hover:bg-neutral-4 transition-colors bg-neutral-3`}
            >
              <div className="flex items-center gap-2">
                <span className="text-neutral-11 font-medium truncate">
                  {item.type}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-11">
                  {new Date(item.date).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-12 font-medium">
                  ${item.amount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center">
                <span className="text-neutral-11 font-semibold">
                  {item.date}
                </span>
              </div>

              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded-full border text-xs font-medium ${
                    item.status === "completed"
                      ? "bg-green-3 border-green-6 text-green-11"
                      : item.status === "pending"
                      ? "bg-primary-3 border-primary-6 text-primary-11"
                      : "bg-error-3 border-error-6 text-error-11"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer da Tabela */}
        <div className="p-4 bg-neutral-4 border-t border-neutral-6">
          <div className="flex items-center justify-between text-sm">
            <div className="text-neutral-11">Mostrando 2 de 2 registros</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                Anterior
              </button>
              <button className="px-3 py-1 bg-primary-10 text-neutral-1 rounded">
                1
              </button>
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                2
              </button>
              <button className="px-3 py-1 bg-neutral-3 text-neutral-12 rounded hover:bg-neutral-4 transition-colors">
                Próximo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveriesTab() {
  const deliveries = [
    {
      id: 1,
      item: "iPhone 15 Pro",
      status: "delivered",
      tracking: "BR123456789",
      date: "2024-01-15",
      address: "Rua das Flores, 123",
    },
    {
      id: 2,
      item: "MacBook Pro M3",
      status: "in_transit",
      tracking: "BR987654321",
      date: "2024-01-10",
      address: "Av. Paulista, 456",
    },
    {
      id: 3,
      item: "AirPods Pro",
      status: "processing",
      tracking: "BR456789123",
      date: "2024-01-08",
      address: "Rua Verde, 789",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-500 bg-green-50";
      case "in_transit":
        return "text-blue-500 bg-blue-50";
      case "processing":
        return "text-yellow-500 bg-yellow-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregue";
      case "in_transit":
        return "Em Trânsito";
      case "processing":
        return "Processando";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          Endereço de Entrega
        </h1>
        <p className="text-neutral-10 mb-6">
          Configure seu endereço para receber suas recompensas
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  Nome Completo <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="text"
                placeholder="Nome completo do destinatário"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  CPF <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="text"
                placeholder="000.000.000-00"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  Telefone <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
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
                  CEP <span className="text-red-500">*</span>
                </h2>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="00000-000"
                  className="flex-1"
                  required
                />
                <Button variant="outline" size="sm">
                  Buscar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-3 h-3 text-neutral-10" />
                  <h2 className="text-neutral-12 text-sm">
                    UF <span className="text-red-500">*</span>
                  </h2>
                </div>
                <Input
                  type="text"
                  placeholder="SP"
                  className="w-full"
                  maxLength={2}
                  required
                />
              </div>

              <div className="space-y-1 col-span-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-3 h-3 text-neutral-10" />
                  <h2 className="text-neutral-12 text-sm">
                    Cidade <span className="text-red-500">*</span>
                  </h2>
                </div>
                <Input
                  type="text"
                  placeholder="São Paulo"
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <HomeIcon className="w-4 h-4 text-neutral-10" />
                <h2 className="text-neutral-12">
                  Bairro <span className="text-red-500">*</span>
                </h2>
              </div>
              <Input
                type="text"
                placeholder="Centro"
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
                Rua <span className="text-red-500">*</span>
              </h2>
            </div>
            <Input
              type="text"
              placeholder="Nome da rua"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HomeIcon className="w-4 h-4 text-neutral-10" />
              <h2 className="text-neutral-12">
                Número <span className="text-red-500">*</span>
              </h2>
            </div>
            <Input type="text" placeholder="123" className="w-full" required />
          </div>
        </div>

        <div className="space-y-1 mt-6">
          <div className="flex items-center gap-2">
            <HomeIcon className="w-4 h-4 text-neutral-10" />
            <h2 className="text-neutral-12">Complemento</h2>
          </div>
          <Input
            type="text"
            placeholder="Apartamento, bloco, etc. (opcional)"
            className="w-full"
          />
        </div>

        {/* Informações Adicionais */}
        <div className="bg-neutral-4 rounded-lg p-4 mt-6">
          <div className="flex items-center gap-2 mb-2">
            <TruckIcon className="w-4 h-4 text-neutral-10" />
            <h3 className="text-neutral-12 font-medium">
              Informações Importantes
            </h3>
          </div>
          <ul className="text-sm text-neutral-10 space-y-1">
            <li>• Certifique-se de que o endereço está completo e correto</li>
            <li>• Verifique se o CEP corresponde ao endereço informado</li>
            <li>
              • Use o botão "Buscar" para preencher automaticamente os campos
            </li>
            <li>• As entregas são feitas apenas para endereços no Brasil</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-neutral-10">
            Última atualização: Nunca
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Cancelar</Button>
            <Button variant="default">Salvar Endereço</Button>
          </div>
        </div>
      </div>

      <div className="bg-neutral-2 rounded-xl border border-neutral-6 p-8">
        <h1 className="text-3xl font-bold text-neutral-12 mb-2">
          Minhas Deliveries
        </h1>
        <p className="text-neutral-10 mb-8">
          Acompanhe o status das suas entregas
        </p>

        {/* Delivery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-3 rounded-lg p-6 text-center">
            <TruckIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-neutral-12">8</div>
            <div className="text-sm text-neutral-10">Entregues</div>
          </div>

          <div className="bg-neutral-3 rounded-lg p-6 text-center">
            <MapPinIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-neutral-12">3</div>
            <div className="text-sm text-neutral-10">Em Trânsito</div>
          </div>

          <div className="bg-neutral-3 rounded-lg p-6 text-center">
            <SettingsIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-3xl font-bold text-neutral-12">2</div>
            <div className="text-sm text-neutral-10">Processando</div>
          </div>
        </div>

        {/* Delivery List */}
        <div className="space-y-6">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="border border-neutral-6 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-neutral-3 rounded-lg flex items-center justify-center">
                    <TruckIcon className="w-8 h-8 text-neutral-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-12 mb-1">
                      {delivery.item}
                    </h3>
                    <p className="text-sm text-neutral-10 mb-2">
                      Pedido em {delivery.date}
                    </p>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {getStatusText(delivery.status)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-neutral-10 mb-1">
                    Rastreamento
                  </div>
                  <div className="font-mono text-sm text-neutral-12">
                    {delivery.tracking}
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-10">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{delivery.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
