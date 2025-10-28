import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/Toast';
import NostrLogin from './components/auth/NostrLogin';
import { OrderList } from './components/orders/OrderList';
import { useAuthStore } from './store/authStore';

function App() {
  const { isAuthenticated, logout } = useAuthStore();

  return (
    <ToastProvider>
      <div className="App min-h-screen bg-gray-50">
        <ToastContainer />

        {!isAuthenticated ? (
          <NostrLogin />
        ) : (
          <div>
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Mostro Web</h1>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </nav>

            {/* Main Content */}
            <OrderList />
          </div>
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
