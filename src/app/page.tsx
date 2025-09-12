"use client";
import { userService } from "@/services";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function HomeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  useEffect(() => {
    if (accessToken) {
      const apiClient = (userService as any).apiClient;
      if (apiClient && apiClient.setAccessToken) {
        apiClient.setAccessToken(accessToken || "");
        if (refreshToken) {
          apiClient.setRefreshToken(refreshToken || "");
        }
      }
      localStorage.setItem("user", JSON.stringify(userService.getProfile()));
      window.history.replaceState({}, "", "/home");
      window.location.reload();
    } else {
      router.push("/home");
    }
  }, [accessToken]);

  return <></>;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
