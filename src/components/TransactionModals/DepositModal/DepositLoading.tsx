import React from "react";
import { motion } from "framer-motion";

interface DepositLoadingProps {
  title: string;
  message: string;
  description?: string;
  preventClose?: boolean;
}

export function DepositLoading({
  message,
  description,
}: DepositLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary-8 border-t-transparent rounded-full mb-4"
      />
      <p className="text-neutral-12 font-medium">{message}</p>
      {description && (
        <p className="text-neutral-11 text-sm mt-2 text-center">
          {description}
        </p>
      )}
    </div>
  );
}
