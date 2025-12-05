'use client';

import React, { useState, useEffect } from 'react';
import { FileSignature, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { signMessage as signMessageFn, verifyMessage as verifyMessageFn, generateRandomMessage as generateRandomMessageFn } from '@/services/signature';
import { ethers } from 'ethers';

const SignPage: React.FC = () => {
  const { walletInfo } = useWeb3();
  const [message, setMessage] = useState('');
  const [signature, setSignature] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; signer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provider = walletInfo ? new ethers.BrowserProvider(window.ethereum) : null;

  useEffect(() => {
    if (walletInfo) {
      const defaultMessage = generateRandomMessageFn();
      setMessage(defaultMessage);
    }
  }, [walletInfo]);

  const handleSignMessage = async () => {
    if (!provider || !message.trim()) {
      setError('请输入要签名的消息');
      return;
    }

    setIsSigning(true);
    setError(null);
    setSignature('');
    setVerificationResult(null);

    try {
      const result = await signMessageFn(provider!, message);
      setSignature(result.signature);
    } catch (error) {
      setError(error instanceof Error ? error.message : '签名失败');
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerifySignature = async () => {
    if (!message.trim() || !signature.trim()) {
      setError('请提供消息和签名进行验证');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyMessageFn(message, signature);
      setVerificationResult(result);
    } catch (error) {
      setError('验证失败');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateRandomMessage = () => {
    if (provider) {
      const randomMessage = generateRandomMessageFn();
      setMessage(randomMessage);
      setSignature('');
      setVerificationResult(null);
      setError(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletInfo) {
    return (
      <div className="min-h-screen gradient-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">请先连接钱包</h2>
              <p className="text-gray-600">
                连接MetaMask钱包后即可使用消息签名功能
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">消息签名</h1>
          <p className="text-gray-900">使用您的私钥对消息进行签名和验证</p>
        </div>

        {/* 钱包信息 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">签名地址</h3>
              <p className="text-gray-600 font-mono">{walletInfo.address}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">当前网络</p>
              <p className="font-medium text-gray-800">{walletInfo.network}</p>
            </div>
          </div>
        </div>

        {/* 消息输入 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">消息内容</h2>
            <button
              onClick={handleGenerateRandomMessage}
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              生成随机消息
            </button>
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="请输入要签名的消息..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              字符数: {message.length}
            </p>
            <button
              onClick={handleSignMessage}
              disabled={isSigning || !message.trim()}
              className="gradient-button text-gray-900 px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  签名中...
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4 mr-2" />
                  签名消息
                </>
              )}
            </button>
          </div>
        </div>

        {/* 签名结果 */}
        {signature && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">签名结果</h2>
              <button
                onClick={() => copyToClipboard(signature)}
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-mono break-all">{signature}</p>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ 消息已成功签名！您可以将此签名用于身份验证或数据完整性验证。
              </p>
            </div>
          </div>
        )}

        {/* 签名验证 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 card-hover">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">签名验证</h2>

          <div className="space-y-4">
            <button
              onClick={handleVerifySignature}
              disabled={isVerifying || !signature || !message.trim()}
              className="w-full bg-blue-600 text-gray-900 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  验证中...
                </>
              ) : (
                '验证签名'
              )}
            </button>

            {verificationResult && (
              <div className={`p-4 rounded-lg ${verificationResult.isValid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
                }`}>
                <div className="flex items-center mb-2">
                  {verificationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  )}
                  <p className={`font-medium ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {verificationResult.isValid ? '签名有效' : '签名无效'}
                  </p>
                </div>

                {verificationResult.signer && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">签名者地址:</p>
                    <p className="text-sm font-mono text-gray-800">
                      {verificationResult.signer}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      与当前地址{verificationResult.signer.toLowerCase() === walletInfo.address.toLowerCase() ? '' : '不'}匹配
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="bg-white rounded-lg shadow-lg p-6 card-hover">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">📝 消息签名</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 输入您要签名的消息内容</li>
                <li>• 点击"签名消息"按钮</li>
                <li>• 在MetaMask中确认签名请求</li>
                <li>• 获得签名结果用于验证</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">✅ 签名验证</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 确保消息和签名都已提供</li>
                <li>• 点击"验证签名"按钮</li>
                <li>• 系统会验证签名的有效性</li>
                <li>• 显示签名者地址信息</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">🔒 安全提醒</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 不要对敏感信息进行签名</li>
                <li>• 签名前仔细确认消息内容</li>
                <li>• 妥善保管您的签名结果</li>
                <li>• 不要向不信任的方提供签名</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignPage;
