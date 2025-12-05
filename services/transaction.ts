import { ethers } from 'ethers';
import { TransactionResult } from '@/types/web3';

export const createTransactionService = (provider: ethers.BrowserProvider) => {
  const sendTransaction = async (toAddress: string, amount: string): Promise<TransactionResult> => {
    try {
      const signer = await provider.getSigner();
      const amountInWei = ethers.parseEther(amount);
      const tx = await signer.sendTransaction({ to: toAddress, value: amountInWei });
      const receipt = await tx.wait();
      return {
        hash: tx.hash,
        from: await signer.getAddress(),
        to: toAddress,
        value: amount,
        gasUsed: receipt ? ethers.formatUnits(receipt.gasUsed, 'wei') : '0',
        blockNumber: receipt ? receipt.blockNumber : 0,
      };
    } catch (error) {
      throw new Error(`转账失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const estimateGas = async (toAddress: string, amount: string): Promise<string> => {
    try {
      const signer = await provider.getSigner();
      const amountInWei = ethers.parseEther(amount);
      const estimatedGas = await provider.estimateGas({ from: await signer.getAddress(), to: toAddress, value: amountInWei });
      return ethers.formatUnits(estimatedGas, 'wei');
    } catch (error) {
      throw new Error(`估算Gas费用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const getGasPrice = async (): Promise<string> => {
    try {
      const gasPrice = await provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      throw new Error(`获取Gas价格失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const isValidAddress = (address: string): boolean => ethers.isAddress(address);

  const isValidAmount = (amount: string): boolean => {
    try {
      const value = parseFloat(amount);
      return value > 0 && !isNaN(value);
    } catch {
      return false;
    }
  };

  return { sendTransaction, estimateGas, getGasPrice, isValidAddress, isValidAmount };
};
