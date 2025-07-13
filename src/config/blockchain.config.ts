export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  explorerUrl: string;
}

export const blockchainConfig = {
  // Ethereum Mainnet
  ethereum: {
    name: 'Ethereum Mainnet',
    rpcUrl:
      process.env.ETHEREUM_RPC_URL ||
      'https://mainnet.infura.io/v3/your-project-id',
    chainId: 1,
    contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS || '',
    explorerUrl: 'https://etherscan.io',
  } as NetworkConfig,

  // Polygon Mainnet
  polygon: {
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    chainId: 137,
    contractAddress: process.env.POLYGON_CONTRACT_ADDRESS || '',
    explorerUrl: 'https://polygonscan.com',
  } as NetworkConfig,

  // Ethereum Sepolia Testnet
  sepolia: {
    name: 'Ethereum Sepolia',
    rpcUrl:
      process.env.SEPOLIA_RPC_URL ||
      'https://sepolia.infura.io/v3/your-project-id',
    chainId: 11155111,
    contractAddress: process.env.SEPOLIA_CONTRACT_ADDRESS || '',
    explorerUrl: 'https://sepolia.etherscan.io',
  } as NetworkConfig,

  // Polygon Mumbai Testnet
  mumbai: {
    name: 'Polygon Mumbai',
    rpcUrl: process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
    chainId: 80001,
    contractAddress: process.env.MUMBAI_CONTRACT_ADDRESS || '',
    explorerUrl: 'https://mumbai.polygonscan.com',
  } as NetworkConfig,

  // Default network
  default: 'mumbai' as keyof typeof blockchainConfig,

  // Wallet configuration
  wallet: {
    privateKey: process.env.WALLET_PRIVATE_KEY || '',
    gasLimit: 300000,
    gasPrice: 'auto', // 'auto' or specific value in wei
  },
};
