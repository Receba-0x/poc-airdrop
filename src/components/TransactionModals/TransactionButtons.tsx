"use client";
import React from 'react';
import { Button } from '@/components/Button';
import { useDepositModal, useWithdrawModal } from '@/stores/modalStore';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface TransactionButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  disabled?: boolean;
}

export function DepositButton({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  disabled = false
}: TransactionButtonProps) {
  const { openDepositModal } = useDepositModal();

  return (
    <Button
      onClick={openDepositModal}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      <ArrowDown className="w-4 h-4 mr-2" />
      {children || 'Deposit'}
    </Button>
  );
}

export function WithdrawButton({
  className = '',
  variant = 'secondary',
  size = 'default',
  children,
  disabled = false
}: TransactionButtonProps) {
  const { openWithdrawModal } = useWithdrawModal();

  return (
    <Button
      onClick={openWithdrawModal}
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
    >
      <ArrowUp className="w-4 h-4 mr-2" />
      {children || 'Withdraw'}
    </Button>
  );
}

// Componente combinado para ações rápidas
export function TransactionActions({
  className = '',
  showLabels = true
}: {
  className?: string;
  showLabels?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <DepositButton
        variant="default"
        size="sm"
        className="flex-1"
      >
        {showLabels && 'Deposit'}
      </DepositButton>
      <WithdrawButton
        variant="secondary"
        size="sm"
        className="flex-1"
      >
        {showLabels && 'Withdraw'}
      </WithdrawButton>
    </div>
  );
}
