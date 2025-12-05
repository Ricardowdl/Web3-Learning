"use client";

import { useWeb3Store } from "@/stores/web3";
import { useShallow } from "zustand/react/shallow";
import type { WalletInfo, ConnectState, TokenInfo } from "@/types/web3";

type Web3Hook = {
  walletInfo: WalletInfo | null;
  connectState: ConnectState;
  tokens: TokenInfo[];
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
  refreshTokens: () => Promise<void>;
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return children as React.ReactElement;
};

const selector = (s: any) => ({
  walletInfo: s.walletInfo,
  connectState: s.connectState,
  tokens: s.tokens,
  connectWallet: s.connectWallet,
  disconnectWallet: s.disconnectWallet,
  switchNetwork: s.switchNetwork,
  refreshBalance: s.refreshBalance,
  refreshTokens: s.refreshTokens,
});

export const useWeb3 = (): Web3Hook => {
  return useWeb3Store(useShallow(selector)) as Web3Hook;
};
