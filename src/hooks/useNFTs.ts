"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import chuteiraMetadata from "../../public/metadata/chuteira.json";
import iphoneMetadata from "../../public/metadata/iphone.json";
import macbookMetadata from "../../public/metadata/macbook.json";
import ballMetadata from "../../public/metadata/ball.json";
import tshirt1Metadata from "../../public/metadata/t-shirt1.json";
import tshirt2Metadata from "../../public/metadata/t-shirt2.json";
import tshirt3Metadata from "../../public/metadata/t-shirt3.json";
import tshirt4Metadata from "../../public/metadata/t-shirt4.json";
import { useWallet } from "@solana/wallet-adapter-react";

interface NFTMetadata {
  name: string;
  symbol?: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  collection?: {
    name: string;
    family: string;
  };
  properties?: {
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
}

interface NFT {
  id: string;
  name: string;
  image: string;
  metadata: NFTMetadata;
  tokenId: string;
  uri: string;
  status: "owned";
  description: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export function useNFTs() {
  const { publicKey, connected } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metadataMap: Record<string, any> = {
    "chuteira.json": chuteiraMetadata,
    "iphone.json": iphoneMetadata,
    "macbook.json": macbookMetadata,
    "ball.json": ballMetadata,
    "t-shirt1.json": tshirt1Metadata,
    "t-shirt2.json": tshirt2Metadata,
    "t-shirt3.json": tshirt3Metadata,
    "t-shirt4.json": tshirt4Metadata,
  };

  const processMetadata = (metadata: any): NFTMetadata => {
    let processedImage = metadata.image;
    if (
      processedImage &&
      processedImage.startsWith("https://adr-token.vercel.app/")
    ) {
      processedImage = processedImage.replace(
        "https://adr-token.vercel.app/",
        "/"
      );
    }

    return {
      ...metadata,
      image: processedImage,
      attributes: metadata.attributes || [],
    };
  };

  const getMetadataFromURI = (uri: string): NFTMetadata | null => {
    try {
      const normalizedUri = uri.toLowerCase().replace(/^https?:\/\/[^\/]+/, "");
      const filename = uri.split("/").pop() || "";
      if (metadataMap[filename]) {
        return processMetadata(metadataMap[filename]);
      }
      if (normalizedUri.includes("/metadata/")) {
        const metadataFilename = normalizedUri.split("/metadata/").pop() || "";
        if (metadataMap[metadataFilename]) {
          return processMetadata(metadataMap[metadataFilename]);
        }
      }
      const filenameWithoutExt = filename.replace(".json", "");
      const partialMatch = Object.keys(metadataMap).find((key) => {
        const keyWithoutExt = key.replace(".json", "");
        return (
          filenameWithoutExt === keyWithoutExt ||
          normalizedUri.includes(keyWithoutExt) ||
          keyWithoutExt.includes(filenameWithoutExt)
        );
      });

      if (partialMatch) {
        return processMetadata(metadataMap[partialMatch]);
      }

      console.warn(`No metadata found for URI: ${uri}, filename: ${filename}`);
      return null;
    } catch (error) {
      console.error(`Error processing metadata for URI ${uri}:`, error);
      return null;
    }
  };

  const fetchNFTs = async () => {
    return;
    /*  if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const rpc = "https://bnb-testnet.g.alchemy.com/v2/MyJKsFQ0AIqA2MWPTRwV-";
      const provider = new ethers.JsonRpcProvider(rpc);
      const erc721Contract = ERC721__factory.connect(ERC721Address, provider);
      const nftResult = await erc721Contract.getUserNFTs(address);
      const { tokenIds, uris } = nftResult;

      if (tokenIds.length === 0) {
        setNfts([]);
        return;
      }
      const nftData = tokenIds.map((tokenId, index) => {
        const uri = uris[index];
        const metadata = getMetadataFromURI(uri);

        if (!metadata) return null;

        const nftId = Number(tokenId).toString();
        return {
          id: nftId,
          name: metadata.name,
          image: metadata.image,
          metadata,
          tokenId: nftId,
          uri,
          status: "owned" as const,
          description: metadata.description,
          attributes: metadata.attributes,
        };
      });
      const validNfts = nftData.filter((nft): nft is NFT => nft !== null);

      setNfts(validNfts);
    } catch (err: any) {
      console.error("Error fetching NFTs:", err);
      setError(err.message || "Failed to fetch NFTs");
      setNfts([]);
    } finally {
      setIsLoading(false);
    } */
  };

  const refreshNFTs = () => {
    fetchNFTs();
  };

  useEffect(() => {
    if (connected && publicKey) {
      fetchNFTs();
    } else {
      setNfts([]);
      setError(null);
    }
  }, [publicKey, connected]);

  return {
    nfts,
    isLoading,
    error,
    refreshNFTs,
  };
}
