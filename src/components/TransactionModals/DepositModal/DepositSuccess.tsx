import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/Button";

interface DepositSuccessProps {
  onCloseModal: () => void;
  onInitDeposit: () => void;
}

export function DepositSuccess({
  onCloseModal,
  onInitDeposit,
}: DepositSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center mt-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 10, stiffness: 300 }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4"
      >
        <CheckCircle className="w-8 h-8 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold text-green-11">
        Deposit Successful!
      </h3>
      <p className="text-neutral-11 text-center">
        Your funds have been received and will be credited to your account
        balance shortly
      </p>
      <div className="flex gap-2 w-full mt-4 pt-4">
        <Button className="flex-1" variant="default" onClick={onCloseModal}>
          Nice!
        </Button>
      </div>
    </div>
  );
}
