"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "../Button";

interface WalletConnectButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  publicKey: string;
  balance: number;
}

// Utility functions
const truncateAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatBalance = (balance: number): string => {
  return balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

// Dropdown Menu Component
function DropdownMenu({
  isOpen,
  onClose,
  buttonRef,
  publicKey,
  balance,
}: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const { disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const handleSwitchWallet = () => {
    setVisible(true);
    onClose();
  };

  const handleClearCache = () => {
    try {
      // Clear Solana wallet cache
      localStorage.removeItem("walletName");
      localStorage.removeItem("walletAdapter");

      // Clear any wallet-related localStorage keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("solana") ||
            key.includes("wallet") ||
            key.includes("phantom") ||
            key.includes("solflare"))
        ) {
          localStorage.removeItem(key);
        }
      }

      console.log("✅ Cache de wallet limpa com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);
      alert("❌ Erro ao limpar cache. Tente manualmente.");
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: 64,
        right: position.right - 20,
        width: "256px",
        backgroundColor: "#1A1A1A",
        border: "1px solid #333",
        borderRadius: "16px",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        zIndex: 999999999,
        overflow: "hidden",
      }}
    >
      {/* Wallet Info */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #333",
          backgroundColor: "#1A1A1A",
        }}
      >
        <div className="flex items-center w-full justify-between gap-2">
          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              fontFamily: "inherit",
            }}
          >
            Address:
          </p>
          <p
            style={{
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          >
            {truncateAddress(publicKey)}
          </p>
        </div>

        <div className="flex items-center w-full justify-between gap-2 mt-2">
          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              fontFamily: "inherit",
            }}
          >
            Balance:
          </p>
          <p
            style={{
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          >
            {formatBalance(balance)} SOL
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: "8px", backgroundColor: "#1A1A1A" }}>
        <button
          onClick={handleSwitchWallet}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            color: "#FFFFFF",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Switch Wallet
        </button>

        <button
          onClick={handleClearCache}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            color: "#F59E0B",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Clear Cache
        </button>

        <button
          onClick={handleDisconnect}
          style={{
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            color: "#EF4444",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Disconnect
        </button>
      </div>
    </div>,
    document.body
  );
}

function useWalletBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    const getBalance = async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        const solBalance = lamports / LAMPORTS_PER_SOL;
        setBalance(solBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      }
    };
    getBalance();
    const interval = setInterval(getBalance, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return balance;
}

export function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const balance = useWalletBalance();

  const handleConnect = () => {
    setVisible(true);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (!connected || !publicKey) {
    return (
      <Button ref={buttonRef} onClick={handleConnect} variant="default">
        Connect Wallet
      </Button>
    );
  }

  return (
    <>
      <Button ref={buttonRef} onClick={toggleDropdown} variant="default">
        <span>{truncateAddress(publicKey.toString())}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>

      <DropdownMenu
        isOpen={showDropdown}
        onClose={() => setShowDropdown(false)}
        buttonRef={buttonRef}
        publicKey={publicKey.toString()}
        balance={balance}
      />
    </>
  );
}
