'use client';

import React, { useEffect } from 'react';
import { DollarSign, TrendingUp, RefreshCw, Copy } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const AssetsPage: React.FC = () => {
  const { walletInfo, tokens, refreshBalance, refreshTokens } = useWeb3();

  useEffect(() => {
    if (walletInfo?.address) {
      refreshTokens();
    }
  }, [walletInfo?.address, walletInfo?.chainId]);

  const formatBalance = (balance: string, decimals: number = 4) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < Math.pow(10, -decimals)) return `< ${Math.pow(10, -decimals)}`;
    return num.toFixed(decimals);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!walletInfo) {
    return (
      <div className="min-h-screen gradient-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">请先连接钱包</h2>
              <p className="text-gray-600">
                连接MetaMask钱包后即可查看您的资产信息
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">资产管理</h1>
          <p className="text-gray-900">查看您的ETH余额和ERC-20代币资产</p>
        </div>

        {/* ETH余额卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-gray-900 font-bold text-lg">Ξ</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Ethereum</h2>
                <p className="text-sm text-gray-600">ETH</p>
              </div>
            </div>
            <button
              onClick={refreshBalance}
              className="text-gray-400 hover:text-primary-600 transition-colors"
              title="刷新余额"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-800">
                {formatBalance(walletInfo.balance, 6)}
              </p>
              <p className="text-sm text-gray-600 mt-1">ETH</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">当前价格</p>
              <p className="text-lg font-semibold text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                $2,345.67
              </p>
            </div>
          </div>
        </div>

        {/* 代币资产 */}
        <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">代币资产</h2>
            <button
              onClick={refreshTokens}
              className="text-gray-400 hover:text-primary-600 transition-colors"
              title="刷新代币余额"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">暂无代币资产</h3>
              <p className="text-gray-600">
                您当前钱包地址没有持有任何支持的ERC-20代币
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div key={token.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-900 font-bold text-sm">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{token.name}</h3>
                      <p className="text-sm text-gray-600">{token.symbol}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatBalance(token.balance, 4)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 mr-2">
                        {formatAddress(token.contractAddress)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(token.contractAddress)}
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 资产统计 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6 card-hover">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">资产统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">总资产价值</p>
              <p className="text-2xl font-bold text-blue-800">$2,345.67</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">24h 变化</p>
              <p className="text-2xl font-bold text-green-800">+2.34%</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">代币种类</p>
              <p className="text-2xl font-bold text-purple-800">{tokens.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsPage;
