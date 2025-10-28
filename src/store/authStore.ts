import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nostrClient } from '../services/nostr';

interface AuthState {
  isAuthenticated: boolean;
  publicKey: string | null;
  npub: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginWithExtension: () => Promise<void>;
  loginWithNsec: (nsec: string) => Promise<void>;
  createNewIdentity: (privateKeyHex: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      publicKey: null,
      npub: null,
      isLoading: false,
      error: null,

      loginWithExtension: async () => {
        set({ isLoading: true, error: null });

        try {
          const publicKey = await nostrClient.getPublicKey();

          if (!publicKey) {
            throw new Error('Failed to get public key');
          }

          const npub = nostrClient.encodeNpub(publicKey);

          set({
            isAuthenticated: true,
            publicKey,
            npub,
            isLoading: false,
            error: null,
          });

          console.log('Successfully logged in with extension:', publicKey);
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to authenticate with Nostr';
          set({
            isAuthenticated: false,
            publicKey: null,
            npub: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      loginWithNsec: async (nsec: string) => {
        set({ isLoading: true, error: null });

        try {
          const { publicKey, npub } = await nostrClient.loginWithNsec(nsec);

          set({
            isAuthenticated: true,
            publicKey,
            npub,
            isLoading: false,
            error: null,
          });

          console.log('Successfully logged in with nsec:', publicKey);
        } catch (error: any) {
          const errorMessage = error.message || 'Formato de nsec inválido';
          set({
            isAuthenticated: false,
            publicKey: null,
            npub: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      createNewIdentity: (privateKeyHex: string) => {
        set({ isLoading: true, error: null });

        try {
          const { publicKey, npub } = nostrClient.storeKeypair(privateKeyHex);

          set({
            isAuthenticated: true,
            publicKey,
            npub,
            isLoading: false,
            error: null,
          });

          console.log('Successfully created new identity:', publicKey);
        } catch (error: any) {
          const errorMessage = error.message || 'Error al crear identidad';
          set({
            isAuthenticated: false,
            publicKey: null,
            npub: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        nostrClient.logoutUser();
        nostrClient.disconnect();
        set({
          isAuthenticated: false,
          publicKey: null,
          npub: null,
          isLoading: false,
          error: null,
        });
        console.log('Logged out');
      },

      checkAuth: () => {
        // Check if user has stored private key
        if (nostrClient.hasStoredKey()) {
          const publicKey = nostrClient.getPublicKeyFromStorage();
          if (publicKey) {
            const npub = nostrClient.encodeNpub(publicKey);
            set({ isAuthenticated: true, publicKey, npub });
            return;
          }
        }

        // Check if extension is available
        const { publicKey } = get();
        if (publicKey && typeof window !== 'undefined' && window.nostr) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false, publicKey: null, npub: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        publicKey: state.publicKey,
        npub: state.npub,
      }),
    }
  )
);
