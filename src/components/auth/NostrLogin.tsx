import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';
import { nostrClient } from '../../services/nostr';
import Button from '../ui/Button';

type LoginMode = 'new' | 'existing' | 'extension';

const NostrLogin: React.FC = () => {
  const { isLoading, loginWithExtension, loginWithNsec, createNewIdentity, checkAuth } = useAuthStore();
  const toast = useToast();
  const [mode, setMode] = useState<LoginMode>('new');
  const [nsecInput, setNsecInput] = useState('');
  const [generatedKeys, setGeneratedKeys] = useState<{
    nsec: string;
    npub: string;
    privateKey: string;
    publicKey: string;
  } | null>(null);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleGenerateKeys = () => {
    const keys = nostrClient.generateKeypair();
    setGeneratedKeys(keys);
    setKeySaved(false);
  };

  const handleCopyNsec = () => {
    if (generatedKeys) {
      navigator.clipboard.writeText(generatedKeys.nsec);
      toast.success('Clave privada (nsec) copiada!');
    }
  };

  const handleCopyNpub = () => {
    if (generatedKeys) {
      navigator.clipboard.writeText(generatedKeys.npub);
      toast.success('Clave pública (npub) copiada!');
    }
  };

  const handleConfirmNewIdentity = () => {
    if (generatedKeys && keySaved) {
      createNewIdentity(generatedKeys.privateKey);
      toast.success('Identidad creada exitosamente!');
    }
  };

  const handleLoginWithNsec = async () => {
    if (!nsecInput.trim()) {
      toast.error('Por favor ingresa tu clave nsec');
      return;
    }

    try {
      await loginWithNsec(nsecInput.trim());
      toast.success('Inicio de sesión exitoso!');
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
    }
  };

  const handleLoginWithExtension = async () => {
    try {
      await loginWithExtension();
      toast.success('Conectado con extensión Nostr!');
    } catch (error: any) {
      toast.error(error.message || 'Error al conectar con extensión');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido a Mostro</h1>
          <p className="text-gray-600">Elige cómo quieres iniciar sesión</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setMode('new')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              mode === 'new'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear Nueva Identidad
          </button>
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              mode === 'existing'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ya Tengo Clave
          </button>
          <button
            onClick={() => setMode('extension')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              mode === 'extension'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Extensión
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Crear Nueva Identidad */}
          {mode === 'new' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Nuevo en Nostr?</strong> Genera tu identidad ahora. Es gratis e instantáneo!
                </p>
              </div>

              {!generatedKeys ? (
                <Button onClick={handleGenerateKeys} fullWidth size="lg">
                  🎲 Generar Mi Identidad
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Warning */}
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <p className="text-sm font-bold text-red-900 mb-2">⚠️ MUY IMPORTANTE</p>
                    <p className="text-sm text-red-800">
                      <strong>Guarda tu clave privada (nsec)</strong> en un lugar seguro. Es como tu contraseña.
                      Si la pierdes, pierdes acceso a tus órdenes y mensajes para siempre.
                    </p>
                  </div>

                  {/* Keys Display */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 uppercase mb-1 block">
                        🔒 Clave Privada (nsec) - GUÁRDALA!
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatedKeys.nsec}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                        />
                        <button
                          onClick={handleCopyNsec}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 uppercase mb-1 block">
                        🔑 Clave Pública (npub)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={generatedKeys.npub}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                        />
                        <button
                          onClick={handleCopyNpub}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keySaved}
                      onChange={(e) => setKeySaved(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      ✅ Ya guardé mi clave privada (nsec) en un lugar seguro. Entiendo que si la pierdo, pierdo acceso a mi cuenta.
                    </span>
                  </label>

                  {/* Continue Button */}
                  <Button
                    onClick={handleConfirmNewIdentity}
                    disabled={!keySaved}
                    fullWidth
                    size="lg"
                  >
                    Continuar con Mi Nueva Identidad
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Ya Tengo Clave */}
          {mode === 'existing' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ <strong>Perfecto!</strong> Ingresa tu clave privada (nsec) para acceder.
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Clave Privada (nsec)
                </label>
                <input
                  type="password"
                  value={nsecInput}
                  onChange={(e) => setNsecInput(e.target.value)}
                  placeholder="nsec1..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <Button
                onClick={handleLoginWithNsec}
                isLoading={isLoading}
                disabled={isLoading || !nsecInput.trim()}
                fullWidth
                size="lg"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </div>
          )}

          {/* Extensión */}
          {mode === 'extension' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  🔌 <strong>Usuario avanzado?</strong> Conecta con tu extensión Nostr (Alby, nos2x, etc.)
                </p>
              </div>

              <Button
                onClick={handleLoginWithExtension}
                isLoading={isLoading}
                disabled={isLoading}
                fullWidth
                size="lg"
              >
                {isLoading ? 'Conectando...' : 'Conectar con Extensión'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                No tienes extensión?{' '}
                <a
                  href="https://getalby.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Descarga Alby
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">💡 Recibe Notificaciones en tu Móvil</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              Puedes usar apps como <strong>Primal</strong> o <strong>Damus</strong> para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Recibir notificaciones cuando alguien tome tus órdenes</li>
              <li>Ver y responder mensajes de Mostro desde tu móvil</li>
              <li>Gestionar tus órdenes sobre la marcha</li>
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Solo usa la misma clave (nsec) en esas apps para sincronizar todo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NostrLogin;
