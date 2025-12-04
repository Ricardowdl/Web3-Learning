'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletInfo, ConnectState, TokenInfo } from '@/types/web3';

interface Web3ContextType {
  walletInfo: WalletInfo | null;
  connectState: ConnectState;
  tokens: TokenInfo[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum Mainnet', rpc: 'https://eth-mainnet.g.alchemy.com/v2/demo' },
  5: { name: 'Goerli Testnet', rpc: 'https://goerli.infura.io/v3/demo' },
  11155111: { name: 'Sepolia Testnet', rpc: 'https://sepolia.infura.io/v3/demo' },
  137: { name: 'Polygon Mainnet', rpc: 'https://polygon-rpc.com' },
  80001: { name: 'Mumbai Testnet', rpc: 'https://rpc-mumbai.maticvigil.com' },
};

const COMMON_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c43108c002b30c730d9384f5117c6c43', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
];

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [connectState, setConnectState] = useState<ConnectState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (walletInfo && walletInfo.address !== accounts[0]) {
      refreshWalletInfo();
    }
  };

  const handleChainChanged = (chainId: string) => {
    refreshWalletInfo();
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setConnectState({
        isConnected: false,
        isConnecting: false,
        error: '请安装MetaMask钱包',
      });
      return;
    }

    setConnectState({
      isConnected: false,
      isConnecting: true,
      error: null,
    });

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('用户拒绝了连接请求');
      }

      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      const chainId = Number(network.chainId);
      const networkName = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name || `Chain ${chainId}`;

      setWalletInfo({
        address,
        balance: ethers.formatEther(balance),
        chainId,
        network: networkName,
      });

      setProvider(provider);
      setConnectState({
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      await refreshTokens();
    } catch (error) {
      setConnectState({
        isConnected: false,
        isConnecting: false,
        error: error instanceof Error ? error.message : '连接钱包失败',
      });
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    setTokens([]);
    setProvider(null);
    setConnectState({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  };

  const refreshWalletInfo = async () => {
    if (!provider || !walletInfo) return;

    try {
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();

      const chainId = Number(network.chainId);
      const networkName = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name || `Chain ${chainId}`;

      setWalletInfo({
        address,
        balance: ethers.formatEther(balance),
        chainId,
        network: networkName,
      });
    } catch (error) {
      console.error('刷新钱包信息失败:', error);
    }
  };

  const switchNetwork = async (chainId: number) => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                chainName: network.name,
                rpcUrls: [network.rpc],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              }],
            });
          } catch (addError) {
            console.error('添加网络失败:', addError);
          }
        }
      } else {
        console.error('切换网络失败:', error);
      }
    }
  };

  const refreshBalance = async () => {
    await refreshWalletInfo();
  };

  const refreshTokens = async () => {
    if (!provider || !walletInfo) return;

    try {
      const tokenPromises = COMMON_TOKENS.map(async (token) => {
        try {
          const contract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)'],
            provider
          );

          const balance = await contract.balanceOf(walletInfo.address);
          return {
            symbol: token.symbol,
            name: token.name,
            balance: ethers.formatUnits(balance, token.decimals),
            decimals: token.decimals,
            contractAddress: token.address,
          };
        } catch (error) {
          console.error(`获取${token.symbol}余额失败:`, error);
          return {
            symbol: token.symbol,
            name: token.name,
            balance: '0',
            decimals: token.decimals,
            contractAddress: token.address,
          };
        }
      });

      const tokenBalances = await Promise.all(tokenPromises);
      setTokens(tokenBalances.filter(token => parseFloat(token.balance) > 0));
    } catch (error) {
      console.error('刷新代币余额失败:', error);
      setTokens([]);
    }
  };

  const value = {
    walletInfo,
    connectState,
    tokens,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
    refreshTokens,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3必须在Web3Provider中使用');
  }
  return context;
};