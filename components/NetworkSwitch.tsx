'use client';

import React, { useState } from 'react';
import { Network, ChevronDown } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const NetworkSwitch: React.FC = () => {
  const { walletInfo, switchNetwork } = useWeb3();
  const [isOpen, setIsOpen] = useState(false);

  const networks = [
    { chainId: 1, name: 'Ethereum Mainnet', color: 'bg-blue-500' },
    { chainId: 5, name: 'Goerli Testnet', color: 'bg-green-500' },
    { chainId: 11155111, name: 'Sepolia Testnet', color: 'bg-purple-500' },
    { chainId: 137, name: 'Polygon Mainnet', color: 'bg-purple-600' },
    { chainId: 80001, name: 'Mumbai Testnet', color: 'bg-yellow-500' },
  ];

  const currentNetwork = networks.find(n => n.chainId === walletInfo?.chainId);

  const handleNetworkSwitch = async (chainId: number) => {
    setIsOpen(false);
    await switchNetwork(chainId);
  };

  if (!walletInfo) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
        <div className="flex items-center">
          <Network className="w-5 h-5 text-gray-400 mr-3" />
          <span className="text-gray-500">请先连接钱包</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 card-hover relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">网络切换</h3>
        <Network className="w-5 h-5 text-gray-600" />
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${currentNetwork?.color || 'bg-gray-400'} mr-3`}></div>
            <span className="text-gray-800">{walletInfo.network}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {networks.map((network) => (
              <button
                key={network.chainId}
                onClick={() => handleNetworkSwitch(network.chainId)}
                className={`w-full flex items-center p-3 hover:bg-gray-50 transition-colors ${network.chainId === walletInfo.chainId ? 'bg-primary-50' : ''
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${network.color} mr-3`}></div>
                <span className={`text-gray-800 ${network.chainId === walletInfo.chainId ? 'font-medium' : ''
                  }`}>
                  {network.name}
                </span>
                {network.chainId === walletInfo.chainId && (
                  <span className="ml-auto text-xs text-primary-600">当前</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 提示：切换网络后需要重新连接钱包
        </p>
      </div>
    </div>
  );
};

export default NetworkSwitch;