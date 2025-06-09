"use client";
import { useState, useEffect } from "react";
import { Modal } from "../Modal";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { useWallet } from "@solana/wallet-adapter-react";
import { ApproveNFTDelegate } from "../ApproveDelegate";
import { TeamSelectionModal } from "../TeamSelectionModal";
import { Button } from "../Button";

interface ShippingAddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  itemName: string;
  refreshTransactions: () => void;
  prizeId?: number;
}

export function ShippingAddressForm({ isOpen, onClose, transactionId, itemName, refreshTransactions, prizeId }: ShippingAddressFormProps) {
  const { t } = useLanguage();
  const { publicKey } = useWallet();

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
  const [existingAddresses, setExistingAddresses] = useState<any[]>([]);
  const [isCheckingAddress, setIsCheckingAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressMode, setAddressMode] = useState<'select' | 'new'>('select');
  const [burnComplete, setBurnComplete] = useState(false);
  const [burnSignature, setBurnSignature] = useState<string | null>(null);
  const [isCheckingDelegation, setIsCheckingDelegation] = useState(false);
  const [isDelegateApproved, setIsDelegateApproved] = useState(false);
  const [delegateError, setDelegateError] = useState("");
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const isJersey = prizeId === 5;

  useEffect(() => {
    if (isOpen && publicKey) {
      setIsCheckingAddress(true);

      axios.get(`/api/check-shipping-address?wallet=${publicKey.toString()}`)
        .then(response => {
          if (response.data.success && response.data.hasAddress) {
            const addresses = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
            setExistingAddresses(addresses);
            setSelectedAddressId(addresses[0]?.id || null);
            setAddressMode('select');
          } else {
            setAddressMode('new');
          }
        })
        .catch(error => {
          console.error("Error checking for existing address:", error);
          setAddressMode('new');
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

      // Resetar a seleção do time quando o modal é aberto
      setSelectedTeam(null);
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

  const handleTeamSelect = (team: string) => {
    setSelectedTeam(team);
    setShowTeamSelection(false);
  };

  const proceedWithShipping = (useExisting: boolean, addressId?: number) => {
    if (isJersey && !selectedTeam) {
      setShowTeamSelection(true);
      return;
    }

    submitShippingInfo(useExisting, addressId);
  };

  const submitShippingInfo = async (useExisting: boolean, addressId?: number) => {
    if (!publicKey) {
      setSubmitError(t("common.walletNotConnected") || "Wallet not connected");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const payload: any = {
      walletAddress: publicKey.toString(),
      transactionId,
      itemName,
      timestamp: new Date().toISOString()
    };

    if (useExisting) {
      if (!addressId) {
        setSubmitError(t("shipping.selectAnAddress") || "Please select an address");
        setIsSubmitting(false);
        return;
      }
      payload.useExistingAddress = true;
      payload.addressId = addressId;
    } else {
      if (!formData.agreeToTerms) {
        setSubmitError(t("shipping.mustAgreeToTerms") || "You must agree to terms");
        setIsSubmitting(false);
        return;
      }
      payload.shippingDetails = {
        fullName: formData.fullName,
        country: formData.country,
        streetAddress: formData.streetAddress,
        apartment: formData.apartment,
        city: formData.city,
        stateProvince: formData.stateProvince,
        zipCode: formData.zipCode,
        phoneNumber: formData.phoneNumber,
        email: formData.email
      };
      payload.useExistingAddress = false;
    }
    if (isJersey && selectedTeam) {
      payload.teamSelected = selectedTeam;
    }

    try {
      const response = await axios.post("/api/submit-shipping", payload);

      if (response.data.success) {
        if (response.data.burnSignature) {
          setBurnComplete(true);
          setBurnSignature(response.data.burnSignature);
          refreshTransactions()
        } else {
          refreshTransactions()
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

  const handleUseExistingAddress = () => {
    proceedWithShipping(true, selectedAddressId || undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    proceedWithShipping(false);
  };

  if (isCheckingAddress) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={t("shipping.addressForm") || "Shipping Address Form"}>
        <div className="text-white text-center py-8">
          <p>{t("common.loading") || "Loading..."}</p>
        </div>
      </Modal>
    );
  }

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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("shipping.addressForm") || "Shipping Address Form"}
        showCloseButton={!isSubmitting}
        preventClose={showTeamSelection}
      >
        {burnComplete ? (
          <div className="p-2 text-center">
            <div className="">
              <h3 className="text-green-300 font-bold mb-2">{t("shipping.claimSuccessful") || "Claim Successful!"}</h3>
              <p className="text-gray-300">{t("shipping.addressSaved") || "Your shipping address has been saved."}</p>
              <p className="text-gray-300">{t("shipping.nftBurned") || "Your NFT was successfully burned as part of the claim process."}</p>
              {isJersey && selectedTeam && (
                <p className="mt-2 text-gray-300">
                  {t("teams.selectedTeam") || "Selected Team"}: {t(`teams.${selectedTeam}`) || selectedTeam}
                </p>
              )}
              {burnSignature && (
                <div className="pt-1">
                  <span className="text-sm text-gray-300 block mb-2">{t("common.transactionHash")}:</span>
                  <div className="bg-[#0F0F0F] rounded p-2 overflow-x-auto">
                    <code className="text-xs break-all text-green-300">{burnSignature}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !isDelegateApproved ? (
          <div className="p-4">
            <div className="mb-4">
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
        ) : existingAddresses.length > 0 && addressMode === 'select' ? (
          <div className="p-4">
            <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4">
              <h3 className="font-bold text-white mb-2">{t("shipping.existingAddresses") || "Existing Addresses"}</h3>
              <div className="text-gray-300 text-sm mb-4">
                {existingAddresses.map((address, index) => (
                  <div key={address.id} className={`p-2 rounded mb-2 ${selectedAddressId === address.id ? 'bg-gray-800 border border-blue-500' : 'border border-gray-700'}`}>
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={`address-${address.id}`}
                        name="addressId"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`address-${address.id}`} className="text-white font-medium">
                        {address.full_name}
                      </label>
                    </div>
                    {selectedAddressId === address.id && (
                      <div className="ml-6 text-gray-400 text-xs space-y-1">
                        <p>{address.street_address}</p>
                        {address.apartment && <p>{address.apartment}</p>}
                        <p>{address.city}, {address.state_province} {address.zip_code}</p>
                        <p>{address.country}</p>
                        <p>{address.phone_number}</p>
                        <p>{address.email}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isJersey && selectedTeam && (
              <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4">
                <h3 className="font-bold text-white mb-2">{t("teams.selectedTeam") || "Selected Team"}</h3>
                <p className="text-gray-300">{t(`teams.${selectedTeam}`) || selectedTeam}</p>
                <Button
                  variant="secondary"
                  className="mt-2 text-sm py-1 px-2"
                  onClick={() => setShowTeamSelection(true)}
                >
                  {t("common.change") || "Change"}
                </Button>
              </div>
            )}

            <div className="flex flex-col gap-2 mt-4">
              <p className="text-yellow-500 text-sm mb-2 text-center">
                {t("shipping.nftBurnWarning") || "Note: Claiming this item will burn (destroy) the NFT associated with it."}
              </p>
              <Button
                className="w-full mb-2"
                disabled={isSubmitting || !selectedAddressId}
                onClick={handleUseExistingAddress}
              >
                {isSubmitting ? t("common.processing") : t("shipping.useThisAddress") || "Use This Address"}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => {
                  setAddressMode('new');
                }}
              >
                {t("shipping.enterNewAddress") || "Enter New Address"}
              </Button>
            </div>

            {submitError && (
              <div className="mt-4 text-red-500 text-center">
                {submitError}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {existingAddresses.length > 0 && (
              <div className="mb-4">
                <Button
                  variant="secondary"
                  className="text-sm py-1 px-2 flex items-center"
                  onClick={() => setAddressMode('select')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t("shipping.backToExistingAddresses") || "Back to existing addresses"}
                </Button>
              </div>
            )}

            {isJersey && selectedTeam && (
              <div className="mb-4 p-3 bg-[#1A1A1A] rounded-lg">
                <h3 className="font-bold text-white mb-2">{t("teams.selectedTeam") || "Selected Team"}</h3>
                <p className="text-gray-300">{t(`teams.${selectedTeam}`) || selectedTeam}</p>
                <Button
                  variant="secondary"
                  className="mt-2 text-sm py-1 px-2"
                  onClick={() => setShowTeamSelection(true)}
                >
                  {t("common.change") || "Change"}
                </Button>
              </div>
            )}

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
                  <option value="">{t("shipping.selectCountry") || "Select Country"}</option>
                  <option value="Brazil">{t("shipping.country.brazil") || "Brazil"}</option>
                  <option value="United States">{t("shipping.country.unitedStates") || "United States"}</option>
                  <option value="Portugal">{t("shipping.country.portugal") || "Portugal"}</option>
                  <option value="Other">{t("shipping.country.other") || "Other"}</option>
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
              <Button
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e as React.FormEvent);
                }}
              >
                {isSubmitting ?
                  (t("common.processing") || "Processing...") :
                  (isJersey && !selectedTeam ?
                    (t("teams.selectTeam") || "Select Team") :
                    (t("shipping.confirm") || "Confirm"))}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <TeamSelectionModal
        isOpen={showTeamSelection}
        onClose={() => setShowTeamSelection(false)}
        onSelect={handleTeamSelect}
      />
    </>
  );
} 