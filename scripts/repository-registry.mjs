import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

/** External source of truth; only its aggregate count is public. */
export function repositoryCount(env = process.env, home = homedir()) {
  let registry;
  try {
    registry = JSON.parse(readFileSync(env.SHOWCASE_REGISTRY_FILE
      || join(home, 'ai', 'standards', 'portfolio.json'), 'utf8'));
  } catch {
    throw new Error('Repository registry unavailable; refusing profile refresh');
  }
  if (registry?.schema !== 1 || !Array.isArray(registry.products)) {
    throw new Error('Repository registry invalid; refusing profile refresh');
  }
  const repos = new Set();
  for (const row of registry.products) {
    if (!row || typeof row !== 'object' || Array.isArray(row) || !Object.hasOwn(row, 'repo')) {
      throw new Error('Repository registry invalid; refusing profile refresh');
    }
    if (row.repo === null) continue; // Retired deployed surfaces are not repositories.
    if (typeof row.repo !== 'string' || !/^rockeish\/[A-Za-z0-9_.-]+$/.test(row.repo)) {
      throw new Error('Repository registry has an invalid owner or repository');
    }
    const repo = row.repo.toLowerCase();
    if (repos.has(repo)) throw new Error('Repository registry contains duplicate repositories');
    repos.add(repo);
  }
  if (!repos.size) throw new Error('Repository registry contains no repositories');
  return { source: 'github', method: 'registry', asOf: new Date().toISOString(), count: repos.size };
}

export function requireCheckoutRoot(env = process.env, home = homedir()) {
  try {
    if (statSync(env.SHOWCASE_REPOS_ROOT || join(home, 'repos')).isDirectory()) return;
  } catch { /* Missing input must not become a successful declared fallback. */ }
  throw new Error('Checkout input unavailable; refusing profile refresh');
}

export function requireCountReceipt(activity, expected) {
  const receipt = activity?.repoCount;
  if (receipt?.source !== 'github' || receipt?.method !== 'registry'
      || !Number.isInteger(receipt.count) || receipt.count !== expected.count
      || typeof receipt.asOf !== 'string' || !Number.isFinite(Date.parse(receipt.asOf))
      || new Date(receipt.asOf).toISOString() !== receipt.asOf
      || Date.parse(receipt.asOf) > Date.now()
      || activity?.metrics?.repos !== receipt.count) {
    throw new Error('Repository count evidence unavailable or changed; collect before generating');
  }
}
