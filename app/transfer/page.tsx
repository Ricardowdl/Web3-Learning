'use client';

import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { sendTransaction as sendTransactionFn, estimateGas as estimateGasFn, getGasPrice as getGasPriceFn, isValidAddress as isValidAddressFn, isValidAmount as isValidAmountFn } from '@/services/transaction';
import { ethers } from 'ethers';

const TransferPage: React.FC = () => {
  const { walletInfo } = useWeb3();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [estimatedGas, setEstimatedGas] = useState<string>('0');
  const [gasPrice, setGasPrice] = useState<string>('0');

  const provider = walletInfo ? new ethers.BrowserProvider(window.ethereum) : null;

  useEffect(() => {
    if (walletInfo && provider) {
      loadGasInfo();
    }
  }, [walletInfo]);

  const loadGasInfo = async () => {
    if (!provider) return;

    try {
      const [gasPriceData, estimatedGasData] = await Promise.all([
        provider ? getGasPriceFn(provider) : '0',
        provider && toAddress && amount ? estimateGasFn(provider, toAddress, amount) : '21000'
      ]);
      setGasPrice(gasPriceData);
      setEstimatedGas(estimatedGasData);
    } catch (error) {
      console.error('获取Gas信息失败:', error);
    }
  };

  useEffect(() => {
    if (toAddress && amount && provider) {
      loadGasInfo();
    }
  }, [toAddress, amount]);

  const validateForm = (): boolean => {
    if (!provider) {
      setError('请先连接钱包');
      return false;
    }

    if (!isValidAddressFn(toAddress)) {
      setError('请输入有效的以太坊地址');
      return false;
    }

    if (!isValidAmountFn(amount)) {
      setError('请输入有效的转账金额');
      return false;
    }

    const amountInEth = parseFloat(amount);
    const balanceInEth = parseFloat(walletInfo?.balance || '0');

    if (amountInEth > balanceInEth) {
      setError('余额不足');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTransactionHash(null);

    if (!validateForm() || !provider) return;

    setIsLoading(true);

    try {
      const result = await sendTransactionFn(provider, toAddress, amount);
      setSuccess('转账成功！');
      setTransactionHash(result.hash);
      setToAddress('');
      setAmount('');
    } catch (error) {
      setError(error instanceof Error ? error.message : '转账失败');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalFee = () => {
    const gas = parseFloat(estimatedGas) || 21000;
    const price = parseFloat(gasPrice) || 20;
    return ((gas * price) / 1e9).toFixed(8);
  };

  if (!walletInfo) {
    return (
      <div className="min-h-screen gradient-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">请先连接钱包</h2>
              <p className="text-gray-600">
                连接MetaMask钱包后即可使用转账功能
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ETH 转账</h1>
          <p className="text-gray-900">安全便捷的以太坊转账服务</p>
        </div>

        {/* 余额信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">当前余额</h3>
              <p className="text-2xl font-bold text-gray-800">
                {parseFloat(walletInfo.balance).toFixed(6)} ETH
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">网络</p>
              <p className="font-medium text-gray-800">{walletInfo.network}</p>
            </div>
          </div>
        </div>

        {/* 转账表单 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">转账信息</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-2">
                接收地址
              </label>
              <input
                type="text"
                id="toAddress"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                转账金额 (ETH)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                min="0"
                max={walletInfo.balance}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Gas费用估算 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">交易费用估算</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Gas价格</p>
                  <p className="font-medium">{gasPrice} Gwei</p>
                </div>
                <div>
                  <p className="text-gray-600">Gas限制</p>
                  <p className="font-medium">{estimatedGas}</p>
                </div>
                <div>
                  <p className="text-gray-600">预估手续费</p>
                  <p className="font-medium">{calculateTotalFee()} ETH</p>
                </div>
                <div>
                  <p className="text-gray-600">总计</p>
                  <p className="font-medium">
                    {amount ? (parseFloat(amount) + parseFloat(calculateTotalFee())).toFixed(6) : '0'} ETH
                  </p>
                </div>
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* 成功信息 */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <p className="text-green-700 font-medium">{success}</p>
                </div>
                {transactionHash && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-gray-600">交易哈希:</p>
                    <div className="flex items-center">
                      <span className="text-sm font-mono text-gray-800 mr-2">
                        {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                      </span>
                      <button
                        onClick={() => window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank')}
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                        title="在Etherscan查看"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button text-gray-900 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  转账中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  确认转账
                </>
              )}
            </button>
          </form>
        </div>

        {/* 安全提醒 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            安全提醒
          </h3>
          <ul className="text-yellow-700 space-y-2 text-sm">
            <li>• 请仔细核对接收地址，区块链交易不可逆转</li>
            <li>• 确保接收地址支持ETH，避免资产损失</li>
            <li>• 建议先进行小额测试转账</li>
            <li>• 在网络拥堵时可能需要更高的Gas费用</li>
            <li>• 妥善保管好您的私钥和助记词</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
