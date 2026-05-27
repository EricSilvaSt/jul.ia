import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, User } from 'lucide-react';
import { authenticateUser, getClinicInfo } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo';

const LoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authenticateUser({ identifier: loginIdentifier, password });

      let clinic;
      if (user.clinicId) {
        clinic = await getClinicInfo(user.clinicId);
      } else {
        throw new Error('Usuário não está vinculado a uma organização.');
      }

      await login(user, clinic);
      localStorage.setItem('userRole', user.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro durante o login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row min-h-[560px]">

            {/* Painel esquerdo — branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-10 text-white relative overflow-hidden">
              {/* Círculos decorativos */}
              <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />

              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="bg-white rounded-2xl p-4 shadow-xl">
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-20 w-auto object-contain"
                  />
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Bem-vindo de volta
                  </h1>
                  <p className="mt-3 text-blue-100 text-base leading-relaxed max-w-xs">
                    Gerencie seus compromissos, profissionais e clientes em um só lugar.
                  </p>
                </div>

                <div className="w-full max-w-xs space-y-3 pt-2">
                  {[
                    'Agenda inteligente',
                    'Atendimento via WhatsApp com IA',
                    'Relatórios e análises',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-blue-100">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Painel direito — formulário */}
            <div className="lg:w-1/2 bg-white flex flex-col justify-center p-8 lg:p-12">
              <div className="max-w-sm w-full mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Acessar conta
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Use seu login ou e-mail e senha para entrar
                  </p>
                </div>

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="loginIdentifier"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Login ou E-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="loginIdentifier"
                        name="loginIdentifier"
                        type="text"
                        autoComplete="username"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="seu.login ou email@empresa.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock size={16} className="text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn size={16} />
                        Entrar
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400 mb-3">Não tem uma conta?</p>
                  <a
                    href={`https://wa.me/${import.meta.env.VITE_EVOLUTION_PHONE || '5571962933388'}?text=Ol%C3%A1!%20Gostaria%20de%20conhecer%20o%20sistema%20de%20agendamento`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Fale com a Lia
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
