import { ethers } from 'ethers';
import { SignMessage, VerifyResult } from '@/types/web3';

export class SignatureService {
  private provider: ethers.BrowserProvider;

  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider;
  }

  async signMessage(message: string): Promise<SignMessage> {
    try {
      const signer = await this.provider.getSigner();
      const address = await signer.getAddress();

      // 确保消息是字符串
      const messageString = typeof message === 'string' ? message : String(message);

      // 使用个人消息签名标准
      const signature = await signer.signMessage(messageString);

      return {
        message: messageString,
        signature,
        address,
      };
    } catch (error) {
      throw new Error(`签名失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async verifyMessage(message: string, signature: string): Promise<VerifyResult> {
    try {
      // 验证签名并恢复签名者地址
      const recoveredAddress = ethers.verifyMessage(message, signature);

      return {
        isValid: true,
        signer: recoveredAddress,
      };
    } catch (error) {
      return {
        isValid: false,
        signer: '',
      };
    }
  }

  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    try {
      const signer = await this.provider.getSigner();

      return await signer.signTypedData(domain, types, value);
    } catch (error) {
      throw new Error(`类型数据签名失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  formatMessage(message: string): string {
    // 移除前后空格和特殊字符
    return message.trim().replace(/\s+/g, ' ');
  }

  generateRandomMessage(): string {
    const timestamp = new Date().toISOString();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `Sign this message to prove you own this address. Timestamp: ${timestamp}, Random: ${randomString}`;
  }
}