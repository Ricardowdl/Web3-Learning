export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  network: string;
}

export interface ConnectState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface TransferForm {
  toAddress: string;
  amount: string;
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  blockNumber: number;
}

export interface SignMessage {
  message: string;
  signature: string;
  address: string;
}

export interface VerifyResult {
  isValid: boolean;
  signer: string;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress: string;
}