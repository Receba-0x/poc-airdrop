"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccount } from "wagmi";
import axios from "axios";
import { Button } from "../Button";
import Image from "next/image";

type ClaimStep =
  | "overview"
  | "warning"
  | "shipping"
  | "team"
  | "processing"
  | "success";

interface ClaimFlowProps {
  isOpen: boolean;
  onClose: () => void;
  nft: any;
  onBurnComplete?: () => void;
}

interface ShippingData {
  fullName: string;
  country: string;
  streetAddress: string;
  apartment: string;
  city: string;
  stateProvince: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  agreeToTerms: boolean;
}

export function ClaimFlow({
  isOpen,
  onClose,
  nft,
  onBurnComplete,
}: ClaimFlowProps) {
  const { t } = useLanguage();
  const { address } = useAccount();

  const [currentStep, setCurrentStep] = useState<ClaimStep>("overview");
  const [existingAddresses, setExistingAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [shippingData, setShippingData] = useState<ShippingData>({
    fullName: "",
    country: "",
    streetAddress: "",
    apartment: "",
    city: "",
    stateProvince: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
    agreeToTerms: false,
  });

  const isJersey =
    nft?.name?.toLowerCase().includes("jersey") ||
    nft?.name?.toLowerCase().includes("camisa");

  const steps: ClaimStep[] = isJersey
    ? ["overview", "warning", "shipping", "team", "processing", "success"]
    : ["overview", "warning", "shipping", "processing", "success"];

  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (isOpen && address) {
      fetchExistingAddresses();
    }
  }, [isOpen, address]);

  const fetchExistingAddresses = async () => {
    try {
      const response = await axios.get(
        `/api/check-shipping-address?wallet=${address}`
      );
      if (response.data.success && response.data.hasAddress) {
        const addresses = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
        setExistingAddresses(addresses);
        setSelectedAddressId(addresses[0]?.id || null);
        setUseExistingAddress(true);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const nextStep = () => {
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex]);
    }
  };

  const prevStep = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex]);
    }
  };

  const handleClose = () => {
    setCurrentStep("overview");
    setSubmitError("");
    setSelectedTeam(null);
    setUseExistingAddress(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleClaimSubmit = async () => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log("Submission already in progress, ignoring duplicate call");
      return;
    }

    setCurrentStep("processing");
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload: any = {
        walletAddress: address,
        transactionId: nft.tokenId,
        itemName: nft.name,
        timestamp: new Date().toISOString(),
      };

      if (useExistingAddress && selectedAddressId) {
        payload.useExistingAddress = true;
        payload.addressId = selectedAddressId;
      } else {
        payload.shippingDetails = shippingData;
        payload.useExistingAddress = false;
      }

      if (isJersey && selectedTeam) {
        payload.teamSelected = selectedTeam;
      }

      console.log("Submitting claim with payload:", payload);
      const response = await axios.post("/api/submit-shipping", payload);

      if (response.data.success) {
        setCurrentStep("success");
        if (response.data.burnSignature && onBurnComplete) {
          onBurnComplete();
        }
      } else {
        setSubmitError(response.data.error || "An error occurred");
        setCurrentStep("shipping");
      }
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      setSubmitError(error.response?.data?.error || "An error occurred");
      setCurrentStep("shipping");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromShipping = () => {
    if (useExistingAddress) {
      return selectedAddressId !== null;
    }
    return (
      shippingData.fullName &&
      shippingData.country &&
      shippingData.streetAddress &&
      shippingData.city &&
      shippingData.stateProvince &&
      shippingData.zipCode &&
      shippingData.phoneNumber &&
      shippingData.email &&
      shippingData.agreeToTerms
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0F0F0F] border border-[#222222] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#222222]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {t("claim.title") || "Claim Physical Item"}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          {currentStep !== "success" && (
            <div className="relative">
              <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <AnimatePresence mode="wait">
            {currentStep === "overview" && (
              <OverviewStep
                nft={nft}
                onNext={nextStep}
                onCancel={handleClose}
                t={t}
              />
            )}

            {currentStep === "warning" && (
              <WarningStep
                nft={nft}
                onNext={nextStep}
                onBack={prevStep}
                t={t}
              />
            )}

            {currentStep === "shipping" && (
              <ShippingStep
                shippingData={shippingData}
                setShippingData={setShippingData}
                existingAddresses={existingAddresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                useExistingAddress={useExistingAddress}
                setUseExistingAddress={setUseExistingAddress}
                onNext={nextStep}
                onBack={prevStep}
                canProceed={canProceedFromShipping()}
                error={submitError}
                t={t}
              />
            )}

            {currentStep === "team" && isJersey && (
              <TeamStep
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                onNext={nextStep}
                onBack={prevStep}
                t={t}
              />
            )}

            {currentStep === "processing" && (
              <ProcessingStep
                onComplete={handleClaimSubmit}
                isJersey={isJersey}
                selectedTeam={selectedTeam}
                useExistingAddress={useExistingAddress}
                nft={nft}
                t={t}
              />
            )}

            {currentStep === "success" && (
              <SuccessStep nft={nft} onDone={handleClose} t={t} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Step Components
const OverviewStep = ({ nft, onNext, onCancel, t }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="text-center space-y-6"
  >
    <div className="w-24 h-24 mx-auto relative">
      <Image
        src={nft.image}
        alt={nft.name}
        fill
        className="object-contain rounded-lg"
      />
    </div>

    <div>
      <h3 className="text-2xl font-bold text-white mb-2">{nft.name}</h3>
      <p className="text-gray-400">#{nft.tokenId}</p>
    </div>

    <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
      <h4 className="text-green-400 font-semibold mb-2">
        {t("claim.physicalItemReady") || "🎁 Physical Item Ready"}
      </h4>
      <p className="text-gray-300 text-sm">
        {t("claim.overviewDescription") ||
          "This NFT can be exchanged for a physical item. Starting the claim process will permanently burn this NFT."}
      </p>
    </div>

    <div className="flex gap-3 pt-4">
      <Button onClick={onCancel} variant="secondary" className="flex-1">
        {t("common.cancel") || "Cancel"}
      </Button>
      <Button
        onClick={onNext}
        className="flex-1 bg-green-500 hover:bg-green-600"
      >
        {t("claim.startClaim") || "Start Claim"}
      </Button>
    </div>
  </motion.div>
);

const WarningStep = ({ nft, onNext, onBack, t }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6"
  >
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {t("claim.importantWarning") || "Important Warning"}
      </h3>
    </div>

    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
        <p className="text-red-200 text-sm">
          {t("claim.burnWarning") ||
            "This NFT will be permanently burned (destroyed) and cannot be recovered."}
        </p>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
        <p className="text-red-200 text-sm">
          {t("claim.irreversibleWarning") ||
            "This action is irreversible. Make sure you want to claim the physical item."}
        </p>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
        <p className="text-red-200 text-sm">
          {t("claim.shippingWarning") ||
            "You will need to provide accurate shipping information for delivery."}
        </p>
      </div>
    </div>

    <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
      <h4 className="text-white font-semibold mb-2">
        {t("claim.whatYouWillReceive") || "What you will receive:"}
      </h4>
      <p className="text-gray-300 text-sm">{nft.name}</p>
    </div>

    <div className="flex gap-3 pt-4">
      <Button onClick={onBack} variant="secondary" className="flex-1">
        {t("common.back") || "Back"}
      </Button>
      <Button onClick={onNext} className="flex-1 bg-red-500 hover:bg-red-600">
        {t("claim.iUnderstand") || "I Understand, Continue"}
      </Button>
    </div>
  </motion.div>
);

const ShippingStep = ({
  shippingData,
  setShippingData,
  existingAddresses,
  selectedAddressId,
  setSelectedAddressId,
  useExistingAddress,
  setUseExistingAddress,
  onNext,
  onBack,
  canProceed,
  error,
  t,
}: any) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setShippingData((prev: any) => ({ ...prev, [name]: val }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {t("claim.shippingInformation") || "Shipping Information"}
        </h3>
        <p className="text-gray-400 text-sm">
          {t("claim.shippingDescription") ||
            "Provide your shipping details to receive the physical item."}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Address Selection */}
      {existingAddresses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUseExistingAddress(true)}
              className={`flex-1 p-3 rounded-lg border transition-colors ${
                useExistingAddress
                  ? "bg-green-500/20 border-green-500/50 text-green-200"
                  : "bg-[#1A1A1A] border-[#333333] text-gray-300 hover:border-gray-500"
              }`}
            >
              {t("claim.useExistingAddress") || "Use Existing Address"}
            </button>
            <button
              onClick={() => setUseExistingAddress(false)}
              className={`flex-1 p-3 rounded-lg border transition-colors ${
                !useExistingAddress
                  ? "bg-green-500/20 border-green-500/50 text-green-200"
                  : "bg-[#1A1A1A] border-[#333333] text-gray-300 hover:border-gray-500"
              }`}
            >
              {t("claim.useNewAddress") || "Enter New Address"}
            </button>
          </div>

          {useExistingAddress && (
            <div className="space-y-3">
              {existingAddresses.map((address: any) => (
                <div
                  key={address.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAddressId === address.id
                      ? "bg-green-500/20 border-green-500/50"
                      : "bg-[#1A1A1A] border-[#333333] hover:border-gray-500"
                  }`}
                  onClick={() => setSelectedAddressId(address.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {address.full_name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {address.street_address}
                      </p>
                      {address.apartment && (
                        <p className="text-gray-400 text-sm">
                          {address.apartment}
                        </p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {address.city}, {address.state_province}{" "}
                        {address.zip_code}
                      </p>
                      <p className="text-gray-400 text-sm">{address.country}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Address Form */}
      {(!useExistingAddress || existingAddresses.length === 0) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.fullName") || "Full Name"}
              </label>
              <input
                type="text"
                name="fullName"
                value={shippingData.fullName}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.country") || "Country"}
              </label>
              <select
                name="country"
                value={shippingData.country}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
              >
                <option value="">
                  {t("shipping.selectCountry") || "Select Country"}
                </option>
                <option value="Brazil">
                  {t("shipping.country.brazil") || "Brazil"}
                </option>
                <option value="United States">
                  {t("shipping.country.unitedStates") || "United States"}
                </option>
                <option value="Portugal">
                  {t("shipping.country.portugal") || "Portugal"}
                </option>
                <option value="Other">
                  {t("shipping.country.other") || "Other"}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t("shipping.streetAddress") || "Street Address"}
            </label>
            <input
              type="text"
              name="streetAddress"
              value={shippingData.streetAddress}
              onChange={handleInputChange}
              className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
              placeholder="Enter your street address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.city") || "City"}
              </label>
              <input
                type="text"
                name="city"
                value={shippingData.city}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.stateProvince") || "State/Province"}
              </label>
              <input
                type="text"
                name="stateProvince"
                value={shippingData.stateProvince}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="State/Province"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.zipCode") || "ZIP Code"}
              </label>
              <input
                type="text"
                name="zipCode"
                value={shippingData.zipCode}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="ZIP Code"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.phoneNumber") || "Phone Number"}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={shippingData.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("shipping.email") || "Email Address"}
              </label>
              <input
                type="email"
                name="email"
                value={shippingData.email}
                onChange={handleInputChange}
                className="w-full p-3 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="Email address"
              />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={shippingData.agreeToTerms}
              onChange={handleInputChange}
              className="mt-1"
            />
            <label htmlFor="agreeToTerms" className="text-gray-300 text-sm">
              {t("shipping.agreeToTerms") || "I agree to the"}{" "}
              <a href="#" className="text-green-400 hover:underline">
                {t("shipping.termsAndConditions") || "Terms and Conditions"}
              </a>
            </label>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          {t("common.back") || "Back"}
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common.continue") || "Continue"}
        </Button>
      </div>
    </motion.div>
  );
};

const TeamStep = ({
  selectedTeam,
  setSelectedTeam,
  onNext,
  onBack,
  t,
}: any) => {
  const teams = [
    { id: "arsenal", name: "Arsenal", logo: "⚽" },
    { id: "manchester-united", name: "Manchester United", logo: "🔴" },
    { id: "liverpool", name: "Liverpool", logo: "🔴" },
    { id: "chelsea", name: "Chelsea", logo: "🔵" },
    { id: "manchester-city", name: "Manchester City", logo: "🩵" },
    { id: "tottenham", name: "Tottenham", logo: "⚪" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          {t("claim.selectTeam") || "Select Your Team"}
        </h3>
        <p className="text-gray-400 text-sm">
          {t("claim.teamDescription") || "Choose the team for your jersey."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => setSelectedTeam(team.id)}
            className={`p-4 rounded-lg border transition-colors text-left ${
              selectedTeam === team.id
                ? "bg-green-500/20 border-green-500/50 text-green-200"
                : "bg-[#1A1A1A] border-[#333333] text-gray-300 hover:border-gray-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{team.logo}</span>
              <span className="font-medium">{team.name}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button onClick={onBack} variant="secondary" className="flex-1">
          {t("common.back") || "Back"}
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedTeam}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("common.continue") || "Continue"}
        </Button>
      </div>
    </motion.div>
  );
};

const ProcessingStep = ({
  onComplete,
  isJersey,
  selectedTeam,
  useExistingAddress,
  nft,
  t,
}: any) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (hasSubmitted) return;

    const timer = setTimeout(() => {
      setHasSubmitted(true);
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete, hasSubmitted]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-6 py-8"
    >
      <div className="w-20 h-20 mx-auto relative">
        <div className="w-full h-full border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {t("claim.processingClaim") || "Processing Your Claim"}
        </h3>
        <p className="text-gray-400">
          {t("claim.processingDescription") ||
            "Please wait while we process your claim and burn the NFT..."}
        </p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Item:</span>
          <span className="text-white font-medium">{nft.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Token ID:</span>
          <span className="text-white font-mono">#{nft.tokenId}</span>
        </div>
        {isJersey && selectedTeam && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Team:</span>
            <span className="text-white font-medium">{selectedTeam}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Address:</span>
          <span className="text-white font-medium">
            {useExistingAddress ? "Existing Address" : "New Address"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const SuccessStep = ({ nft, onDone, t }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="text-center space-y-6 py-8"
  >
    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
      <svg
        className="w-10 h-10 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-green-400 mb-2">
        {t("claim.claimSuccessful") || "Claim Successful!"}
      </h3>
      <p className="text-gray-300">
        {t("claim.successDescription") ||
          "Your NFT has been burned and your physical item is being processed for delivery."}
      </p>
    </div>

    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
      <h4 className="text-green-400 font-semibold mb-2">
        {t("claim.whatHappensNext") || "What happens next?"}
      </h4>
      <div className="space-y-2 text-sm text-gray-300">
        <p>
          • {t("claim.orderProcessing") || "Your order is now being processed"}
        </p>
        <p>
          •{" "}
          {t("claim.shippingNotification") ||
            "You'll receive shipping updates via email"}
        </p>
        <p>
          • {t("claim.deliveryTime") || "Expected delivery: 7-14 business days"}
        </p>
      </div>
    </div>

    <div className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
      <h4 className="text-white font-semibold mb-2">
        {t("claim.orderSummary") || "Order Summary"}
      </h4>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">Item claimed:</span>
        <span className="text-white font-medium">{nft.name}</span>
      </div>
    </div>

    <Button onClick={onDone} className="w-full bg-green-500 hover:bg-green-600">
      {t("common.done") || "Done"}
    </Button>
  </motion.div>
);
