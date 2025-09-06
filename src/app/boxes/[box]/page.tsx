"use client";
import { BoxSection } from "@/components/BoxSection";
import { useParams } from "next/navigation";

export default function BoxPage() {
  const { box: id } = useParams<{ box: string }>();
  return <BoxSection id={id as string} />;
}
