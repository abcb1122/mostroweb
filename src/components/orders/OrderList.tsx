/**
 * @file OrderList.tsx
 * @description Lista de órdenes disponibles
 */

import React, { useEffect, useState } from 'react';
import { useOrdersStore } from '../../store/orders';
import { OrderCard } from './OrderCard';
import { MostroOrder } from '../../services/mostro/protocol';

export const OrderList: React.FC = () => {
  const {
    orders,
    loading,
    error,
    isSubscribed,
    loadOrders,
    startSubscription,
    stopSubscription,
    getFilteredOrders,
    setFilters,
  } = useOrdersStore();

  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const filteredOrders = getFilteredOrders();

  useEffect(() => {
    // Load initial orders
    loadOrders();

    // Start subscription for real-time updates
    startSubscription();

    // Cleanup on unmount
    return () => {
      stopSubscription();
    };
  }, []);

  const handleFilterChange = (type: 'all' | 'buy' | 'sell') => {
    setFilterType(type);
    if (type === 'all') {
      setFilters({});
    } else {
      setFilters({ type });
    }
  };

  const handleOrderSelect = (order: MostroOrder) => {
    console.log('Selected order:', order);
    // TODO: Navigate to order details
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Órdenes Mostro</h1>
          <p className="text-gray-600 mt-2">
            {isSubscribed ? '🟢 Conectado en tiempo real' : '🔴 Desconectado'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros</h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => handleFilterChange('buy')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Compras
            </button>
            <button
              onClick={() => handleFilterChange('sell')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ventas
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && orders.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando órdenes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay órdenes disponibles
            </h3>
            <p className="text-gray-600">
              {filterType === 'all'
                ? 'No se encontraron órdenes en este momento.'
                : `No hay órdenes de ${filterType === 'buy' ? 'compra' : 'venta'} disponibles.`}
            </p>
          </div>
        )}

        {/* Orders Grid */}
        {filteredOrders.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Mostrando {filteredOrders.length} orden(es)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onSelect={handleOrderSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
