import { ReactComponent as PhantomIcon } from './phantom.svg?react';
import { ReactComponent as SolflareIcon } from './solflare.svg?react';
import { ReactComponent as BackpackIcon } from './backpack.svg?react';
import { ReactComponent as MagicEdenIcon } from './mewallet.svg?react';

export const walletIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Phantom: PhantomIcon,
  Solflare: SolflareIcon,
  Backpack: BackpackIcon,
  'Magic Eden Wallet': MagicEdenIcon,
};
