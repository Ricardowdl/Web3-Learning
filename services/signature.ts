import { ethers } from 'ethers';
import { SignMessage, VerifyResult } from '@/types/web3';

export async function signMessage(provider: ethers.BrowserProvider, message: string): Promise<SignMessage> {
  try {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const messageString = typeof message === 'string' ? message : String(message);
    const signature = await signer.signMessage(messageString);
    return { message: messageString, signature, address };
  } catch (error) {
    throw new Error(`签名失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

export async function verifyMessage(message: string, signature: string): Promise<VerifyResult> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return { isValid: true, signer: recoveredAddress };
  } catch {
    return { isValid: false, signer: '' };
  }
}

export async function signTypedData(provider: ethers.BrowserProvider, domain: any, types: any, value: any): Promise<string> {
  try {
    const signer = await provider.getSigner();
    return await signer.signTypedData(domain, types, value);
  } catch (error) {
    throw new Error(`类型数据签名失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

export function formatMessage(message: string): string {
  return message.trim().replace(/\s+/g, ' ');
}

export function generateRandomMessage(): string {
  const timestamp = new Date().toISOString();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `Sign this message to prove you own this address. Timestamp: ${timestamp}, Random: ${randomString}`;
}
