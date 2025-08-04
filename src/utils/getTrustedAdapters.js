import { PhantomAdapter } from '../adapters/PhantomAdapter.js';
import { BackpackAdapter } from '../adapters/BackpackAdapter.js';
import { MagicEdenAdapter } from '../adapters/MagicEdenAdapter.js';
import { SolflareAdapter } from '../adapters/SolflareAdapter.js';

/**
 * Devuelve dos listas de adaptadores:
 * - trusted: han sido autorizados antes (isTrusted === true)
 * - untrusted: están disponibles pero no autorizados
 */
export async function getTrustedAdapters() {
  const adapters = [
    new PhantomAdapter(),
    new BackpackAdapter(),
    new MagicEdenAdapter(),
    new SolflareAdapter(),
  ];

  const checks = await Promise.all(
    adapters.map(async (adapter) => {
      const trusted = await adapter.isUnlocked?.();
      return { adapter, trusted };
    })
  );

  return {
    trusted: checks.filter((r) => r.trusted).map((r) => r.adapter),
    untrusted: checks.filter((r) => !r.trusted).map((r) => r.adapter),
  };
}
