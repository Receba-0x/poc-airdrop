import { NextRequest, NextResponse } from 'next/server';
import { generateToken, getExpirationDate } from '@/utils/auth';

// Configuração de runtime para garantir execução no servidor
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username e senha são obrigatórios'
      }, { status: 400 });
    }

    const isValidCredentials =
      username === 'admin' &&
      password === process.env.ADMIN_SECRET;

    if (!isValidCredentials) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais inválidas'
      }, { status: 401 });
    }

    // Usar o utilitário para gerar o token
    const token = await generateToken({ username, role: 'admin' });
    const expiresAt = getExpirationDate();

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          username,
          role: 'admin'
        },
        expiresAt
      }
    });

  } catch (error) {
    console.error('Erro no login de administrador:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
} 