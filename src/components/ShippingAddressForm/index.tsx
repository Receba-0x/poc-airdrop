"use client";
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { useUser } from "@/contexts/UserContext";
import { ApproveNFTDelegate } from "../ApproveDelegate";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";

interface ShippingAddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  itemName: string;
}

export function ShippingAddressForm({ isOpen, onClose, transactionId, itemName }: ShippingAddressFormProps) {
  const { t } = useLanguage();
  const { publicKey } = useWallet();
  const { setRefreshTransactions } = useUser();

  const [formData, setFormData] = useState({
    fullName: "",
    country: "",
    streetAddress: "",
    apartment: "",
    city: "",
    stateProvince: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
    agreeToTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [existingAddress, setExistingAddress] = useState<any>(null);
  const [isCheckingAddress, setIsCheckingAddress] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);
  const [burnSignature, setBurnSignature] = useState<string | null>(null);
  const [isCheckingDelegation, setIsCheckingDelegation] = useState(false);
  const [isDelegateApproved, setIsDelegateApproved] = useState(false);
  const [delegateError, setDelegateError] = useState("");

  useEffect(() => {
    if (isOpen && publicKey) {
      setIsCheckingAddress(true);

      axios.get(`/api/check-shipping-address?wallet=${publicKey.toString()}`)
        .then(response => {
          if (response.data.success && response.data.hasAddress) {
            setExistingAddress(response.data.data);
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
          }
        })
        .catch(error => {
          console.error("Error checking for existing address:", error);
          setShowNewAddressForm(true);
        })
        .finally(() => {
          setIsCheckingAddress(false);
        });
    }
  }, [isOpen, publicKey]);

  const checkDelegation = async () => {
    if (!publicKey || !transactionId) return;

    setIsCheckingDelegation(true);
    setDelegateError("");

    try {
      try {
        const { data: tokenAccountData } = await axios.post("/api/check-delegation", {
          nftMint: transactionId,
          walletAddress: publicKey.toString()
        });

        if (tokenAccountData.success && tokenAccountData.isDelegated) {
          setIsDelegateApproved(true);
        } else {
          setIsDelegateApproved(false);
        }
      } catch (error) {
        console.error("Erro ao verificar delegação:", error);
        setIsDelegateApproved(false);
      }
    } catch (error: any) {
      console.error("Erro ao verificar delegação:", error);
      setDelegateError(error.message || "Erro ao verificar delegação");
    } finally {
      setIsCheckingDelegation(false);
    }
  };

  useEffect(() => {
    if (isOpen && publicKey) {
      checkDelegation();
    }
  }, [isOpen, publicKey, transactionId]);

  const handleDelegateSuccess = (signature: string) => {
    console.log("Delegação aprovada com sucesso:", signature);
    setIsDelegateApproved(true);
    setDelegateError("");
  };

  const handleDelegateError = (error: string) => {
    console.error("Erro na delegação:", error);
    setDelegateError(error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleUseExistingAddress = async () => {
    if (!publicKey) {
      setSubmitError(t("common.walletNotConnected") || "Wallet not connected");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await axios.post("/api/submit-shipping", {
        walletAddress: publicKey.toString(),
        transactionId,
        itemName,
        useExistingAddress: true,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        if (response.data.burnSignature) {
          setBurnComplete(true);
          setBurnSignature(response.data.burnSignature);
          setTimeout(() => {
            setRefreshTransactions(true);
            onClose();
          }, 3000);
        } else {
          setRefreshTransactions(true);
          onClose();
        }
      } else {
        setSubmitError(response.data.error || t("common.errorOccurred"));
      }
    } catch (error) {
      console.error("Error submitting with existing address:", error);
      setSubmitError(t("common.errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      setSubmitError(t("common.walletNotConnected") || "Wallet not connected");
      return;
    }

    if (!formData.agreeToTerms) {
      setSubmitError(t("shipping.mustAgreeToTerms") || "You must agree to terms");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await axios.post("/api/submit-shipping", {
        walletAddress: publicKey.toString(),
        transactionId,
        itemName,
        shippingDetails: {
          fullName: formData.fullName,
          country: formData.country,
          streetAddress: formData.streetAddress,
          apartment: formData.apartment,
          city: formData.city,
          stateProvince: formData.stateProvince,
          zipCode: formData.zipCode,
          phoneNumber: formData.phoneNumber,
          email: formData.email
        },
        useExistingAddress: false,
        timestamp: new Date().toISOString()
      });

      if (response.data.success) {
        if (response.data.burnSignature) {
          setBurnComplete(true);
          setBurnSignature(response.data.burnSignature);
          setTimeout(() => {
            setRefreshTransactions(true);
            onClose();
          }, 3000);
        } else {
          setRefreshTransactions(true);
          onClose();
        }
      } else {
        setSubmitError(response.data.error || t("common.errorOccurred"));
      }
    } catch (error: any) {
      console.error("Error submitting shipping form:", error);
      setSubmitError(error.response?.data?.error || t("common.errorOccurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we're checking for an existing address, show loading state
  if (isCheckingAddress) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t("shipping.addressForm") || "Shipping Address Form"}>
        <div className="text-white text-center py-8">
          <p>{t("common.loading") || "Loading..."}</p>
        </div>
      </Modal>
    );
  }

  // Se estamos verificando a delegação, mostrar loading
  if (isCheckingDelegation) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t("shipping.addressForm") || "Shipping Address Form"}>
        <div className="text-white text-center py-8">
          <p>{t("common.checkingDelegation") || "Verificando permissões..."}</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("shipping.addressForm") || "Shipping Address Form"}
      showCloseButton={!isSubmitting}
    >
      {burnComplete ? (
        <div className="p-6 text-center">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-4">
            <h3 className="text-green-300 font-bold mb-2">{t("shipping.claimSuccessful") || "Claim Successful!"}</h3>
            <p className="text-gray-300 mb-2">{t("shipping.addressSaved") || "Your shipping address has been saved."}</p>
            <p className="text-gray-300">{t("shipping.nftBurned") || "Your NFT was successfully burned as part of the claim process."}</p>
            {burnSignature && (
              <div className="mt-3 text-xs text-gray-400 break-all">
                <p className="mb-1">{t("common.transactionSignature") || "Transaction Signature"}:</p>
                <code className="bg-black/30 p-1 rounded">{burnSignature}</code>
              </div>
            )}
          </div>
        </div>
      ) : !isDelegateApproved ? (
        <div className="p-4">
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-4">
            <h3 className="text-yellow-300 font-bold mb-2">{t("shipping.delegateRequired") || "Aprovação Necessária"}</h3>
            <p className="text-gray-300 mb-4">{t("shipping.delegateRequiredMessage") || "Para reclamar seu prêmio físico, precisamos da sua permissão para queimar (destruir) o NFT associado a este item."}</p>

            {delegateError && (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-3 mb-4 text-sm text-red-300">
                {delegateError}
              </div>
            )}

            <ApproveNFTDelegate
              nftMint={transactionId}
              onSuccess={handleDelegateSuccess}
              onError={handleDelegateError}
            />
          </div>
        </div>
      ) : existingAddress && !showNewAddressForm ? (
        <div className="p-4">
          <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4">
            <h3 className="font-bold text-white mb-2">{t("shipping.existingAddress") || "Existing Address"}</h3>
            <div className="text-gray-300 text-sm space-y-1">
              <p>{existingAddress.full_name}</p>
              <p>{existingAddress.street_address}</p>
              {existingAddress.apartment && <p>{existingAddress.apartment}</p>}
              <p>{existingAddress.city}, {existingAddress.state_province} {existingAddress.zip_code}</p>
              <p>{existingAddress.country}</p>
              <p>{existingAddress.phone_number}</p>
              <p>{existingAddress.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <p className="text-yellow-500 text-sm mb-2 text-center">
              {t("shipping.nftBurnWarning") || "Note: Claiming this item will burn (destroy) the NFT associated with it."}
            </p>
            <button
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUseExistingAddress}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("common.processing") : t("shipping.useThisAddress") || "Use This Address"}
            </button>
            <button
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowNewAddressForm(true)}
              disabled={isSubmitting}
            >
              {t("shipping.enterNewAddress") || "Enter New Address"}
            </button>
          </div>

          {submitError && (
            <div className="mt-4 text-red-500 text-center">
              {submitError}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-gray-300 text-sm mb-6">
              {t("shipping.proceedMessage") || "To proceed with your claim, we need your shipping address details to deliver your order"}
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
              {t("shipping.fullName") || "Full Name"}
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Text"
              className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.country") || "Country"}
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              >
                <option value="">Select Country</option>
                <option value="Brazil">Brazil</option>
                <option value="United States">United States</option>
                <option value="Portugal">Portugal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.streetAddress") || "Street Address"}
              </label>
              <input
                type="text"
                id="streetAddress"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                required
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="apartment" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.apartment") || "Apartment, Suite, etc."}
              </label>
              <input
                type="text"
                id="apartment"
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.city") || "City"}
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.stateProvince") || "State/Province/Region"}
              </label>
              <input
                type="text"
                id="stateProvince"
                name="stateProvince"
                value={formData.stateProvince}
                onChange={handleChange}
                required
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.zipCode") || "ZIP/Postal Code"}
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.phoneNumber") || "Phone Number"}
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                {t("shipping.email") || "Email Address"}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Text"
                className="block w-full rounded-md bg-[#1A1A1A] border border-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 text-white py-2 px-3"
              />
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex items-center h-5">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-700 rounded bg-[#1A1A1A]"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="agreeToTerms" className="text-gray-400">
                {t("shipping.agreeToTerms") || "I agree to the"} <a href="#" className="text-blue-400 hover:underline">{t("shipping.termsAndConditions") || "Terms and Conditions"}</a>
              </label>
            </div>
          </div>

          {submitError && (
            <div className="text-red-500 text-sm mb-4">
              {submitError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (t("common.processing") || "Processing...") : 
                (t("shipping.confirm") || "Confirm")}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
} 