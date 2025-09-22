"use client";
import { Handshake, LogOutIcon, SettingsIcon, UserIcon, WalletIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropDown";
import { HistoricIcon } from "../Icons/HistoricIcon";
import Image from "next/image";
import { useModalStore } from "../TransactionModals";

type Props = {
  user: any;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  push: (path: string) => void;
  logout: () => void;
  setMobileMenuOpen?: (open: boolean) => void;
};

export function HeaderAvatar({
  user,
  dropdownOpen,
  setDropdownOpen,
  push,
  setMobileMenuOpen,
  logout,
}: Props) {
  const { openModal } = useModalStore();
  return (
    <DropdownMenu
      modal={false}
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
    >
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2">
          <button className="relative group">
            <div className="min-w-12 min-h-12 w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-6 transition-all duration-200 group-hover:border-primary-10">
              <Image
                src={user.avatar || "/images/profile.png"}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-1"></div>
          </button>
          <div
            onClick={() => {
              push("/profile");
              setMobileMenuOpen?.(false);
            }}
            className="md:hidden block"
          >
            Profile
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 bg-neutral-2 border border-neutral-6 shadow-lg mt-1"
        align="end"
        sideOffset={8}
        onCloseAutoFocus={(event: any) => {
          event.preventDefault();
        }}
      >
        <div className="px-4 py-3 border-b border-neutral-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-6">
              <Image
                src={user.avatar || "/images/profile.png"}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-12 truncate">
                {user.username}
              </p>
              <p className="text-xs text-neutral-10 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <DropdownMenuItem
          className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
          onClick={() => push("/profile")}
        >
          <div className="flex items-center gap-3 w-full">
            <UserIcon />
            <span className="text-sm text-neutral-12">My Profile</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
          onClick={() => openModal("deposit")}
        >
          <div className="flex items-center gap-3 w-full">
            <WalletIcon />
            <span className="text-sm text-neutral-12">Deposit</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
          onClick={() => openModal("withdraw")}
        >
          <div className="flex items-center gap-3 w-full">
            <Handshake />
            <span className="text-sm text-neutral-12">Withdraw</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
          onClick={() => push("/profile#transactions")}
        >
          <div className="flex items-center gap-3 w-full">
            <HistoricIcon />
            <span className="text-sm text-neutral-12">Transactions</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
          onClick={() => push("/profile#settings")}
        >
          <div className="flex items-center gap-3 w-full">
            <SettingsIcon />
            <span className="text-sm text-neutral-12">Settings</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-neutral-6" />

        <DropdownMenuItem
          className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors"
          onClick={() => logout()}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-5 h-5 flex items-center justify-center">
              <LogOutIcon />
            </div>
            <span className="text-sm text-red-600 font-medium">Logout</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
