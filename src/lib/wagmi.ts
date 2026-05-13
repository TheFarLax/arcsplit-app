import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from './chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'ArcSplit',
  projectId: 'f63682bfe2f99bf9937c8d28afde909e',
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
  ssr: true,
});
