/**
 * @file OrderCard.tsx
 * @description Card individual de orden
 */

import React from 'react';
import { MostroOrder } from '../../services/mostro/protocol';
import { formatOrderForDisplay } from '../../services/mostro/orders';

interface OrderCardProps {
  order: MostroOrder;
  onSelect?: (order: MostroOrder) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onSelect }) => {
  const formatted = formatOrderForDisplay(order);

  const handleClick = () => {
    if (onSelect) {
      onSelect(order);
    }
  };

  const isBuyOrder = order.kind === 'buy';

  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4"
      style={{ borderLeftColor: isBuyOrder ? '#10b981' : '#ef4444' }}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{formatted.title}</h3>
          <p className="text-sm text-gray-500">{formatted.subtitle}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isBuyOrder
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isBuyOrder ? 'COMPRA' : 'VENTA'}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase">Cantidad Fiat</p>
          <p className="text-lg font-semibold text-gray-900">{formatted.fiatAmount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase">Cantidad BTC</p>
          <p className="text-lg font-semibold text-gray-900">{formatted.amount}</p>
        </div>
      </div>

      {/* Premium */}
      {order.premium !== 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 uppercase">Prima</p>
          <p
            className={`text-sm font-semibold ${
              order.premium > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatted.premium}
          </p>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase mb-2">Métodos de Pago</p>
        <div className="flex flex-wrap gap-2">
          {order.payment_method.map((method, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t">
        <span>{order.created_at_str}</span>
        <span className="text-blue-600 font-semibold hover:text-blue-800">
          Ver detalles →
        </span>
      </div>
    </div>
  );
};
