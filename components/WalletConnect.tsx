'use client';

import React from 'react';
import { Wallet, LogOut, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const WalletConnect: React.FC = () => {
  const { walletInfo, connectState, connectWallet, disconnectWallet, refreshBalance } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0 ETH';
    if (num < 0.001) return '< 0.001 ETH';
    return `${num.toFixed(4)} ETH`;
  };

  if (connectState.isConnecting) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">连接钱包中...</span>
        </div>
      </div>
    );
  }

  if (!connectState.isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-gray-900" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">连接你的钱包</h3>
          <p className="text-gray-600 mb-6">使用MetaMask开始探索Web3世界</p>
          <button
            onClick={connectWallet}
            className="gradient-button text-gray-900 px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            连接 MetaMask
          </button>
          {connectState.error && (
            <p className="mt-4 text-red-500 text-sm">{connectState.error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">钱包信息</h3>
        <button
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="断开连接"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {walletInfo && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">钱包地址</span>
              <button
                onClick={() => navigator.clipboard.writeText(walletInfo.address)}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                复制
              </button>
            </div>
            <p className="font-mono text-sm text-gray-800">
              {formatAddress(walletInfo.address)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">ETH 余额</span>
              <button
                onClick={refreshBalance}
                className="text-gray-400 hover:text-primary-600 transition-colors"
                title="刷新余额"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {formatBalance(walletInfo.balance)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-2">
              <span className="text-sm text-gray-600">网络信息</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-800">{walletInfo.network}</p>
              <span className="text-xs text-gray-500">Chain ID: {walletInfo.chainId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;