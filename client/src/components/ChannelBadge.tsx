import React from 'react';
import { ChannelType } from '../types';

export const ChannelBadge: React.FC<{ channel: ChannelType }> = ({ channel }) => {
  switch (channel) {
    case 'B&Q':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#FF5A00]/15 text-[#D94800] border border-[#FF5A00]/30 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] mr-1"></span>
          B&Q Marketplace
        </span>
      );
    case 'Shopify':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#96BF48]/15 text-[#5B841B] border border-[#96BF48]/30 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#96BF48] mr-1"></span>
          Shopify Direct
        </span>
      );
    case 'eBay':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#E53238]/15 text-[#B8191E] border border-[#E53238]/30 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0064D2] mr-1"></span>
          eBay Store
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
          Direct
        </span>
      );
  }
};
