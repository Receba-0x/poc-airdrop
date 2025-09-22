"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { AvatarIcon } from "@/components/Icons/AvatarIcon";
import { Input } from "@/components/Input";
import { BaseModal } from "@/components/TransactionModals";
import { uploadService, userService } from "@/services";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

interface ProfileTabProps {
  user: any;
  refetchUser: () => void;
}

export function ProfileTab({ user, refetchUser }: ProfileTabProps) {
  if (!user) return null;
  const { t } = useLanguage();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(user?.username);
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress);
  const [email, setEmail] = useState(user?.email);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("file", selectedImage);
      try {
        const response = await uploadService.uploadImage(formData);
        if (!response.success) throw new Error(response.error);
        const imageUrl = response.imageUrl;
        const serverUrl = process.env.NEXT_PUBLIC_API_URL;
        const avatar = serverUrl + imageUrl;
        await userService.updateUserImage(avatar);
        refetchUser();
        setIsImageModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
      } catch (error) {
        console.error("Upload error:", error);
        setIsImageModalOpen(false);
        setSelectedImage(null);
        setImagePreview(null);
      }
    }
  };

  const handleUpdateUser = async () => {
    await userService.updateUserConfig({ username, walletAddress, email });
    toast.success("User updated successfully");
    refetchUser();
  };

  const handleCancelUpload = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          {t("profile.title")}
        </h1>

        <div className="flex items-center gap-8 justify-between">
          <div className="flex items-center gap-4">
            <div className="min-w-12 min-h-12 w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-6 transition-all duration-200 group-hover:border-primary-10">
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

          <Button variant="outline" onClick={() => setIsImageModalOpen(true)}>
            {t("profile.changeImage")}
          </Button>
        </div>

        <div className="space-y-1 mt-4">
          <h2 className="text-neutral-12">{t("profile.nickname")}</h2>
          <Input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder={user?.username || t("profile.nickname")}
          />
        </div>

        <div className="space-y-1 mt-4">
          <h2 className="text-neutral-12">{t("profile.email")}</h2>
          <Input
            type="email"
            value={user?.email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("profile.email")}
          />
        </div>

        <div className="space-y-1 mt-4">
          <h2 className="text-neutral-12">Wallet</h2>
          <Input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder={"Wallet"}
          />
        </div>

        <div className="flex justify-start mt-8">
          <Button variant="default" onClick={handleUpdateUser}>
            {t("profile.saveChanges")}
          </Button>
        </div>
      </div>

      <div className="bg-neutral-3 rounded-xl border border-neutral-6 p-4 py-6">
        <h1 className="text-2xl font-bold text-neutral-12 mb-2">
          {t("profile.security.title")}
        </h1>

        <div className="flex items-center justify-between mt-4">
          <h2 className="text-neutral-12">
            {t("profile.security.changePasswordQuestion")}
          </h2>
          <Button variant="outline">
            {t("profile.security.changePassword")}
          </Button>
        </div>
      </div>

      {/* Modal de Upload de Imagem */}
      <BaseModal
        isOpen={isImageModalOpen}
        onClose={handleCancelUpload}
        title={t("profile.uploadModal.title")}
        size="lg"
      >
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
              imagePreview
                ? "border-neutral-6 bg-neutral-3"
                : "border-neutral-6 bg-neutral-3 hover:border-primary-6 hover:bg-primary-3"
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                  <Image
                    src={imagePreview}
                    alt={t("profile.uploadModal.selectedImage").replace(
                      "{name}",
                      selectedImage?.name || ""
                    )}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-full border-4 border-neutral-6"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-neutral-11">
                  {t("profile.uploadModal.selectedImage").replace(
                    "{name}",
                    selectedImage?.name || ""
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <svg
                    className="w-full h-full text-neutral-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-neutral-12 mb-2">
                    {t("profile.uploadModal.dragAndDrop")}
                  </p>
                  <p className="text-sm text-neutral-10 mb-4">
                    {t("profile.uploadModal.orClickToSelect")}
                  </p>
                  <Button variant="outline" onClick={openFileDialog}>
                    {t("profile.uploadModal.selectImage")}
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <div className="bg-neutral-4 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-12 mb-2">
              {t("profile.uploadModal.requirements.title")}
            </h4>
            <ul className="text-xs text-neutral-10 space-y-1">
              <li>{t("profile.uploadModal.requirements.formats")}</li>
              <li>{t("profile.uploadModal.requirements.maxSize")}</li>
              <li>
                {t("profile.uploadModal.requirements.recommendedResolution")}
              </li>
              <li>{t("profile.uploadModal.requirements.squareFormat")}</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancelUpload}>
              {t("profile.uploadModal.cancel")}
            </Button>
            <Button
              variant="default"
              onClick={handleImageUpload}
              disabled={!selectedImage}
            >
              {selectedImage
                ? t("profile.uploadModal.confirmUpload")
                : t("profile.uploadModal.selectAnImage")}
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
