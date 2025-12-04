import WalletConnect from '@/components/WalletConnect';
import NetworkSwitch from '@/components/NetworkSwitch';

export default function Home() {
  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            欢迎来到 Web3 DApp
          </h1>
          <p className="text-xl text-gray-900 max-w-2xl mx-auto">
            体验去中心化金融的魅力，连接你的MetaMask钱包开始探索区块链世界
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 钱包连接组件 */}
          <WalletConnect />

          {/* 网络切换组件 */}
          <NetworkSwitch />
        </div>

        {/* 功能介绍 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-900 text-xl font-bold">💰</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">资产管理</h3>
            <p className="text-gray-900 text-sm">
              查看ETH余额和ERC-20代币资产，实时掌握财富状况
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-900 text-xl font-bold">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">快速转账</h3>
            <p className="text-gray-900 text-sm">
              安全便捷的ETH转账功能，支持自定义Gas费用
            </p>
          </div>

          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-900 text-xl font-bold">✍️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">消息签名</h3>
            <p className="text-gray-900 text-sm">
              使用私钥对消息进行签名，验证身份和数据完整性
            </p>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-16 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">使用说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-accent-300 mb-3">🚀 快速开始</h3>
              <ol className="text-gray-900 space-y-2 text-sm">
                <li>1. 点击"连接 MetaMask"按钮</li>
                <li>2. 在弹出的MetaMask窗口中授权</li>
                <li>3. 连接成功后查看钱包信息</li>
                <li>4. 切换到不同页面体验功能</li>
              </ol>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent-300 mb-3">⚠️ 安全提醒</h3>
              <ul className="text-gray-900 space-y-2 text-sm">
                <li>• 请确保在安全的网络环境下使用</li>
                <li>• 不要向陌生人转账或签名</li>
                <li>• 仔细核对交易信息后再确认</li>
                <li>• 妥善保管好你的私钥</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
