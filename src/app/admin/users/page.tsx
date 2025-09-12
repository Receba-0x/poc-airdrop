"use client";

import React, { useState } from "react";
import { AdminUser, UsersFilters } from "@/services";
import { Button } from "@/components/Button";
import { BaseModal } from "@/components/TransactionModals";
import { Checkbox } from "@/components/CheckBox";
import {
  useAdminUsersWithSearch,
  useAdminUsersStats,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useBanUser,
  useUnbanUser,
  useVerifyUserEmail,
  useResetUserPassword,
  usePrefetchAdminUsers,
} from "@/hooks/useAdminUsers";
import Image from "next/image";

interface UserFormData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  balance: number;
  isActive: boolean;
  isAdmin: boolean;
}

export default function AdminUsers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [filters, setFilters] = useState<UsersFilters>({});
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    balance: 0,
    isActive: true,
    isAdmin: false,
  });

  const { users, isLoading, refetch, searchTerm, setSearchTerm } = useAdminUsersWithSearch(filters);
  console.log(users);
  const { createUser, isLoading: isCreateLoading } = useCreateAdminUser();
  const { updateUser, isLoading: isUpdateLoading } = useUpdateAdminUser();
  const { deleteUser, isLoading: isDeleteLoading } = useDeleteAdminUser();
  const { banUser, isLoading: isBanLoading } = useBanUser();
  const { unbanUser, isLoading: isUnbanLoading } = useUnbanUser();
  const { verifyEmail, isLoading: isVerifyLoading } = useVerifyUserEmail();
  const { resetPassword, isLoading: isResetLoading } = useResetUserPassword();

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      balance: 0,
      isActive: true,
      isAdmin: false,
    });
  };

  const handleCreate = async () => {
    try {
      await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        balance: formData.balance,
        isActive: formData.isActive,
        isAdmin: formData.isAdmin,
      });
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateUser({
        id: editingUser.id,
        data: {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          balance: formData.balance,
          isActive: formData.isActive,
          isAdmin: formData.isAdmin,
        },
      });
      setEditingUser(null);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      balance: user.balance,
      isActive: user.isActive,
      isAdmin: user.isAdmin || false,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleBan = async (id: string) => {
    try {
      await banUser(id);
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const handleUnban = async (id: string) => {
    try {
      await unbanUser(id);
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };

  const handleVerifyEmail = async (id: string) => {
    try {
      await verifyEmail(id);
    } catch (error) {
      console.error("Error verifying email:", error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt("Digite a nova senha:");
    if (newPassword) {
      try {
        await resetPassword({ userId, newPassword });
        alert("Senha resetada com sucesso!");
      } catch (error) {
        console.error("Error resetting password:", error);
        alert("Erro ao resetar senha.");
      }
    }
  };


  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-6 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-6 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-12">
              Gerenciar Usuários
            </h1>
            <p className="text-neutral-11 mt-2">
              Crie e gerencie usuários do sistema
            </p>
          </div>
          <Button variant="default" onClick={() => setIsCreateModalOpen(true)}>
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">
              Total de Usuários
            </h3>
            <span className="text-lg font-semibold text-neutral-12">
              {users?.length || 0}
            </span>
          </div>
        </div>

        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">Ativos</h3>
            <span className="text-lg font-semibold text-green-11">
              {users?.filter((user: AdminUser) => user.isActive).length || 0}
            </span>
          </div>
        </div>

        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">
              Emails Verificados
            </h3>
            <span className="text-lg font-semibold text-blue-11">
              {users?.filter((user: AdminUser) => user.emailVerified).length ||
                0}
            </span>
          </div>
        </div>

        <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-12">
              Administradores
            </h3>
            <span className="text-lg font-semibold text-purple-11">
              {users?.filter((user: AdminUser) => user.isAdmin).length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-6">
        <h3 className="text-lg font-semibold text-neutral-12 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
              placeholder="Nome, email ou username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Status
            </label>
            <select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive.toString()
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive:
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-11 mb-1">
              Email Verificado
            </label>
            <select
              value={
                filters.emailVerified === undefined
                  ? ""
                  : filters.emailVerified.toString()
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  emailVerified:
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                })
              }
              className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
            >
              <option value="">Todos</option>
              <option value="true">Verificado</option>
              <option value="false">Não Verificado</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchTerm("");
              }}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-6">
          <h3 className="text-lg font-semibold text-neutral-12">
            Usuários ({users.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-6">
            <thead className="bg-neutral-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-11 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-3 divide-y divide-neutral-6">
              {users.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-neutral-4">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-neutral-5 flex items-center justify-center">
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.username}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-neutral-11 text-sm">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-12">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-neutral-11">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">{user.email}</div>
                    {user.emailVerified && (
                      <div className="text-xs text-green-11">✓ Verificado</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-12">
                      {user.balance} USD
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? "bg-green-3 border border-green-6 text-green-11"
                          : "bg-error-3 border border-error-6 text-error-11"
                      }`}
                    >
                      {user.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isAdmin
                          ? "bg-purple-3 border border-purple-6 text-purple-11"
                          : "bg-neutral-3 border border-neutral-6 text-neutral-11"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "Usuário"}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant={"secondary"}
                      onClick={() => handleEdit(user)}
                      className="text-xs"
                    >
                      Editar
                    </Button>
                    {user.isActive ? (
                      <Button
                        variant={"outline"}
                        onClick={() => handleBan(user.id)}
                        className="text-xs"
                        disabled={isBanLoading}
                      >
                        Banir
                      </Button>
                    ) : (
                      <Button
                        variant={"outline"}
                        onClick={() => handleUnban(user.id)}
                        className="text-xs text-green-11"
                        disabled={isUnbanLoading}
                      >
                        Desbanir
                      </Button>
                    )}
                    {!user.emailVerified && (
                      <Button
                        variant={"outline"}
                        onClick={() => handleVerifyEmail(user.id)}
                        className="text-xs text-blue-11"
                        disabled={isVerifyLoading}
                      >
                        Verificar
                      </Button>
                    )}
                    <Button
                      variant={"outline"}
                      onClick={() => handleResetPassword(user.id)}
                      className="text-xs"
                      disabled={isResetLoading}
                    >
                      Reset Senha
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={() => handleDelete(user.id)}
                      className="text-xs text-red-11"
                      disabled={isDeleteLoading}
                    >
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-neutral-11">Nenhum usuário encontrado</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 text-primary-11 hover:text-primary-12 font-medium"
            >
              Criar primeiro usuário
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <BaseModal
          size="lg"
          showCloseButton={false}
          preventClose={true}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
        >
          <div className="mt-3">
            <h3 className="text-lg font-semibold text-neutral-12 mb-4">
              {editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                    placeholder="Primeiro nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                    placeholder="Sobrenome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                    placeholder="Digite a senha"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-11 mb-1">
                    Saldo (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-neutral-6 rounded-lg bg-neutral-3 text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-10"
                  />
                </div>

                <div className="flex items-center space-x-4 pt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-primary-10 focus:ring-primary-10 border-neutral-6 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 text-sm text-neutral-11"
                    >
                      Ativo
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAdmin"
                      checked={formData.isAdmin}
                      onChange={(e) =>
                        setFormData({ ...formData, isAdmin: e.target.checked })
                      }
                      className="h-4 w-4 text-primary-10 focus:ring-primary-10 border-neutral-6 rounded"
                    />
                    <label
                      htmlFor="isAdmin"
                      className="ml-2 text-sm text-neutral-11"
                    >
                      Administrador
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingUser(null);
                  resetForm();
                }}
                variant="outline"
                disabled={isCreateLoading || isUpdateLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={editingUser ? handleUpdate : handleCreate}
                disabled={isCreateLoading || isUpdateLoading}
              >
                {isCreateLoading || isUpdateLoading
                  ? "Salvando..."
                  : editingUser
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
