"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/CheckBox";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { BackgroundBeams } from "@/components/BackgroundBeams";
import {
  LoginFormData,
  RegisterFormData,
  loginSchema,
  registerSchema,
} from "@/validators/Auth.validator";

export default function LoginPage() {
  const router = useRouter();
  const { login, register: authRegister, user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    setMessage(null);
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setMessage({
        type: "success",
        text: "Login successful! Redirecting...",
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }
  }, [isAuthenticated, user, router]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setMessage(null);
      await login(data);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setMessage(null);
      await authRegister({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setMessage({
        type: "success",
        text: "Account created successfully! Check your email.",
      });
      setActiveTab("login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setMessage({
        type: "error",
        text: error.message || "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      // await authService.loginWithGoogle();
      setMessage({
        type: "error",
        text:
          activeTab === "login"
            ? "Google login is currently disabled"
            : "Google registration is currently disabled",
      });
    } catch (error: any) {
      console.error("Google authentication failed:", error);
      setMessage({
        type: "error",
        text: error.message || "Google authentication failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    /*  const email = loginForm.getValues("email");
    if (!email) {
      setMessage({ type: "error", text: "Enter your email first" });
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);
      await authService.forgotPassword({ email });
      setMessage({
        type: "success",
        text: "Recovery email sent! Check your inbox.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to send recovery email",
      });
    } finally {
      setIsLoading(false);
    } */
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative bg-neutral-2 p-8">
      <BackgroundBeams />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[500px] md:h-[186px] h-[250px] bg-[url('/images/login_bg.png')] bg-cover bg-center z-10 mx-auto" />
      <div className="flex flex-col items-center justify-center bg-neutral-2 w-full max-w-2xl mx-auto z-20 rounded-3xl border border-neutral-6 py-8 md:px-6 px-4">
        <Image
          src="/images/logo_loot_orange.png"
          alt="Login"
          width={200}
          height={52}
          className="mx-auto w-24 sm:w-32 md:w-40"
          draggable={false}
        />

        <p className="text-neutral-12 text-center font-bold text-lg sm:text-2xl md:text-3xl mt-2 md:mt-8">
          {activeTab === "login" ? "Bem-vindo de volta!" : "Crie sua conta"}
        </p>

        {activeTab === "login" ? (
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="mt-8 space-y-4 w-full"
          >
            <div className="space-y-2">
              <h1 className="text-sm text-neutral-12">Email</h1>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                {...loginForm.register("email")}
                className={
                  loginForm.formState.errors.email ? "border-red-500" : ""
                }
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-sm text-neutral-12">Senha</h1>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...loginForm.register("password")}
                className={
                  loginForm.formState.errors.password ? "border-red-500" : ""
                }
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="text-center w-full flex flex-col md:flex-row gap-4 md:gap-0 items-start md:items-center justify-between">
              <div className="text-sm text-neutral-11 flex items-center gap-2">
                <Checkbox />
                Lembrar da minha conta
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-neutral-11 hover:underline"
              >
                Esqueci minha senha
              </a>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" variant="default" className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Entrar na plataforma"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full"
              >
                <Image
                  src="/images/google_icon.png"
                  alt="Google"
                  width={20}
                  height={20}
                />
                {activeTab === "login"
                  ? "Connect Google"
                  : "Cadastrar com Google"}
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
            className="mt-8 space-y-4 w-full"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h1 className="text-sm text-neutral-12">Nome</h1>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Seu nome"
                  {...registerForm.register("firstName")}
                  className={
                    registerForm.formState.errors.firstName
                      ? "border-red-500"
                      : ""
                  }
                />
                {registerForm.formState.errors.firstName && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-sm text-neutral-12">Sobrenome</h1>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Seu sobrenome"
                  {...registerForm.register("lastName")}
                  className={
                    registerForm.formState.errors.lastName
                      ? "border-red-500"
                      : ""
                  }
                />
                {registerForm.formState.errors.lastName && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-sm text-neutral-12">Nome de usuário</h1>
              <Input
                id="username"
                type="text"
                placeholder="Seu nome de usuário"
                {...registerForm.register("username")}
                className={
                  registerForm.formState.errors.username ? "border-red-500" : ""
                }
              />
              {registerForm.formState.errors.username && (
                <p className="text-sm text-red-500">
                  {registerForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-sm text-neutral-12">Email</h1>
              <Input
                id="registerEmail"
                type="email"
                placeholder="Seu email"
                {...registerForm.register("email")}
                className={
                  registerForm.formState.errors.email ? "border-red-500" : ""
                }
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-sm text-neutral-12">Senha</h1>
              <Input
                id="registerPassword"
                type="password"
                placeholder="••••••••"
                {...registerForm.register("password")}
                className={
                  registerForm.formState.errors.password ? "border-red-500" : ""
                }
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-sm text-neutral-12">Confirmar Senha</h1>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...registerForm.register("confirmPassword")}
                className={
                  registerForm.formState.errors.confirmPassword
                    ? "border-red-500"
                    : ""
                }
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {registerForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="default" className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </div>
          </form>
        )}

        {message && (
          <div
            className={`mt-4 p-2 rounded-lg flex items-center space-x-2 ${
              message.type === "success"
                ? "border border-green-8 text-neutral-12"
                : "border border-red-600 text-neutral-12"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle color="#00FF00" className="w-4 h-4" />
            ) : (
              <AlertCircle color="#dc2626" className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="flex justify-center gap-2 text-xs w-full mt-6">
          {activeTab === "login" ? (
            <>
              <span className="text-neutral-11">
                Ainda não possui uma conta?
              </span>
              <span
                className="text-primary-10 underline cursor-pointer"
                onClick={() => setActiveTab("register")}
              >
                Cadastre-se
              </span>
            </>
          ) : (
            <>
              <span className="text-neutral-11">Já possui uma conta?</span>
              <span
                className="text-primary-10 underline cursor-pointer"
                onClick={() => setActiveTab("login")}
              >
                Faça login
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
