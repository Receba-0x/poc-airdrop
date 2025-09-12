"use client";
import { userService } from "@/services";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const params = useSearchParams();
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
    }
  }, [accessToken]);
  return <></>;
}
