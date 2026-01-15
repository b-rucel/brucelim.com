import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  rabbyWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, coinbaseWallet, rabbyWallet],
    },
  ],
  {
    appName: 'Bruce Lim',
    projectId: 'not-needed-for-injected-only',
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, base, arbitrum, optimism, polygon],
  ssr: true,
  multiInjectedProviderDiscovery: true,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
});
