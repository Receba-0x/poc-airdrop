"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useUser } from "@/contexts/UserContext";

interface WalletConnectButtonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function WalletConnectButton({
  className = "",
  style,
}: WalletConnectButtonProps) {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const { balance } = useUser();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  if (!address) {
    return (
      <motion.button
        ref={buttonRef}
        onClick={handleConnect}
        className={`${className}`}
        style={style}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Connect Wallet
      </motion.button>
    );
  }

  const DropdownContent = () => (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: 64,
        right: dropdownPosition.right - 20,
        width: "256px",
        backgroundColor: "#1A1A1A",
        border: "1px solid #333",
        borderRadius: "16px",
        boxShadow:
          "0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        zIndex: 999999999,
        opacity: 1,
        visibility: "visible" as const,
        pointerEvents: "auto" as const,
        transform: "none",
        filter: "none",
        overflow: "hidden",
      }}
    >
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
              opacity: 1,
              fontFamily: "inherit",
            }}
          >
            Wallet:
          </p>
          <p
            style={{
              color: "#FFFFFF",
              fontWeight: 500,
              fontSize: "14px",
              opacity: 1,
              fontFamily: "inherit",
            }}
          >
            {truncateAddress(address)}
          </p>
        </div>

        <div className="flex items-center w-full justify-between gap-2">
          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              opacity: 1,
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
              opacity: 1,
              fontFamily: "inherit",
            }}
          >
            {balance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div style={{ padding: "8px", backgroundColor: "#1A1A1A" }}>
        <button
          onClick={handleConnect}
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
            opacity: 1,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Switch Network
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
            opacity: 1,
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
    </div>
  );

  return (
    <>
      <motion.button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`${className} flex items-center gap-2`}
        style={style}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{truncateAddress(address)}</span>
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
      </motion.button>

      {showDropdown &&
        typeof window !== "undefined" &&
        createPortal(<DropdownContent />, document.body)}
    </>
  );
}

export function StyledWalletConnectButton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <WalletConnectButton
      className={`px-6 py-2 bg-gradient-to-r from-[#0B3B10] to-[#24682B] text-[#ADF0B4] font-bold text-sm border border-[#28D939] rounded-md hover:from-[#0F4114] hover:to-[#2A7A31] transition-all duration-200 ${className}`}
    />
  );
}
