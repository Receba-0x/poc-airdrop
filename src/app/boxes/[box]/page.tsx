"use client";
import { BoxSection } from "@/components/BoxSection";
import { useParams } from "next/navigation";

export default function BoxPage() {
  const { box } = useParams();
  const boxName = box as string;

  return <BoxSection boxName={boxName} />;
}
