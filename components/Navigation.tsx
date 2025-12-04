'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, Send, FileSignature, Wallet } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { connectState, walletInfo } = useWeb3();

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/assets', label: '资产', icon: DollarSign },
    { href: '/transfer', label: '转账', icon: Send },
    { href: '/sign', label: '签名', icon: FileSignature },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Wallet className="w-8 h-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-800">Web3 DApp</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            {connectState.isConnected && walletInfo && (
              <div className="hidden sm:flex items-center space-x-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  已连接
                </div>
                <div className="text-sm text-gray-600">
                  {formatAddress(walletInfo.address)}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {parseFloat(walletInfo.balance).toFixed(4)} ETH
                </div>
              </div>
            )}

            {!connectState.isConnected && (
              <div className="hidden sm:flex items-center">
                <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  未连接
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 移动端导航 */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors ${isActive
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;