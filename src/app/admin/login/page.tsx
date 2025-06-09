"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import axios from "axios";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt && new Date(expiresAt) > new Date()) {
        router.push('/admin');
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('adminUser');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Chamar a API de login
      const response = await axios.post('/api/admin/login', {
        username,
        password
      });

      if (response.data.success) {
        // Salvar token e informações do usuário no localStorage
        const { token, user, expiresAt } = response.data.data;
        localStorage.setItem('adminToken', token);
        localStorage.setItem('tokenExpiresAt', expiresAt);
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        // Redirecionar para o painel admin
        router.push('/admin');
      } else {
        setError(response.data.error || "Erro desconhecido no login");
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || "Credenciais inválidas");
      } else {
        setError("Ocorreu um erro ao tentar fazer login. Tente novamente.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A1A] rounded-lg shadow-lg p-6 border border-[#333]">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Acesso Administrativo</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-md p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block text-gray-400 text-sm mb-1">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Usuário"
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-gray-400 text-sm mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Senha"
              autoComplete="off"
              disabled={loading}
            />
          </div>
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Apenas para administradores autorizados.</p>
          <p>O acesso não autorizado é proibido.</p>
        </div>
      </div>
    </div>
  );
} 