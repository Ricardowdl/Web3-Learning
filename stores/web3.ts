'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { lsStorage } from '@/lib/idbStorage'
import { ethers } from 'ethers'
import type { WalletInfo, ConnectState, TokenInfo } from '@/types/web3'

type Web3State = {
  walletInfo: WalletInfo | null
  connectState: ConnectState
  tokens: TokenInfo[]
  provider: ethers.BrowserProvider | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  refreshBalance: () => Promise<void>
  refreshTokens: () => Promise<void>
}

const SUPPORTED_NETWORKS: Record<number, { name: string; rpc: string }> = {
  1: { name: 'Ethereum Mainnet', rpc: 'https://eth-mainnet.g.alchemy.com/v2/demo' },
  5: { name: 'Goerli Testnet', rpc: 'https://goerli.infura.io/v3/demo' },
  11155111: { name: 'Sepolia Testnet', rpc: 'https://sepolia.infura.io/v3/demo' },
  137: { name: 'Polygon Mainnet', rpc: 'https://polygon-rpc.com' },
  80001: { name: 'Mumbai Testnet', rpc: 'https://rpc-mumbai.maticvigil.com' },
}

const COMMON_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c43108c002b30c730d9384f5117c6c43', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
  { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
]

export const useWeb3Store = create<Web3State>()(persist((set, get) => ({
  walletInfo: null,
  connectState: { isConnected: false, isConnecting: false, error: null },
  tokens: [],
  provider: null,

  connectWallet: async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      set({ connectState: { isConnected: false, isConnecting: false, error: '请安装MetaMask钱包' } })
      return
    }

    set({ connectState: { isConnected: false, isConnecting: true, error: null } })

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts: string[] = await provider.send('eth_requestAccounts', [])
      if (accounts.length === 0) throw new Error('用户拒绝了连接请求')

      const network = await provider.getNetwork()
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)

      const chainId = Number(network.chainId)
      const networkName = SUPPORTED_NETWORKS[chainId]?.name || `Chain ${chainId}`

      set({
        walletInfo: { address, balance: ethers.formatEther(balance), chainId, network: networkName },
        provider,
        connectState: { isConnected: true, isConnecting: false, error: null },
      })

      await get().refreshTokens()

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          get().disconnectWallet()
        } else {
          get().refreshBalance()
          get().refreshTokens()
        }
      }

      const handleChainChanged = () => {
        get().refreshBalance()
        get().refreshTokens()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    } catch (error) {
      set({ connectState: { isConnected: false, isConnecting: false, error: error instanceof Error ? error.message : '连接钱包失败' } })
    }
  },

  disconnectWallet: () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        window.ethereum.removeAllListeners('accountsChanged')
        window.ethereum.removeAllListeners('chainChanged')
      } catch { }
    }
    set({ walletInfo: null, tokens: [], provider: null, connectState: { isConnected: false, isConnecting: false, error: null } })
  },

  switchNetwork: async (chainId: number) => {
    if (typeof window === 'undefined' || !window.ethereum) return
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: `0x${chainId.toString(16)}` }] })
    } catch (error: any) {
      if (error?.code === 4902) {
        const network = SUPPORTED_NETWORKS[chainId]
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                chainName: network.name,
                rpcUrls: [network.rpc],
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              }],
            })
          } catch { }
        }
      }
    }
  },

  refreshBalance: async () => {
    const { provider, walletInfo } = get()
    if (!provider || !walletInfo) return
    try {
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const [balance, network] = await Promise.all([provider.getBalance(address), provider.getNetwork()])
      const chainId = Number(network.chainId)
      const networkName = SUPPORTED_NETWORKS[chainId]?.name || `Chain ${chainId}`
      set({ walletInfo: { address, balance: ethers.formatEther(balance), chainId, network: networkName } })
    } catch (e) { }
  },

  refreshTokens: async () => {
    const { provider, walletInfo } = get()
    if (!provider || !walletInfo) return
    try {
      const tokenBalances = await Promise.all(COMMON_TOKENS.map(async (t) => {
        try {
          const contract = new ethers.Contract(t.address, ['function balanceOf(address) view returns (uint256)'], provider)
          const bal = await contract.balanceOf(walletInfo.address)
          return { symbol: t.symbol, name: t.name, balance: ethers.formatUnits(bal, t.decimals), decimals: t.decimals, contractAddress: t.address }
        } catch {
          return { symbol: t.symbol, name: t.name, balance: '0', decimals: t.decimals, contractAddress: t.address }
        }
      }))
      set({ tokens: tokenBalances.filter(x => parseFloat(x.balance) > 0) })
    } catch {
      set({ tokens: [] })
    }
  },
}), {
  name: 'web3-store',
  version: 1,
  partialize: (state) => ({ walletInfo: state.walletInfo, connectState: state.connectState, tokens: state.tokens }),
  storage: createJSONStorage(() => lsStorage),
  onRehydrateStorage: () => {
    return () => { }
  },
}))
