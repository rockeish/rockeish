import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const digest = (value) => createHash('sha256').update(value).digest('hex');

/** GitHub owns repository enumeration; the product registry supplies known paths. */
export function repositoryInventory(env = process.env, home = homedir()) {
  let registry;
  let registryBytes;
  try {
    registryBytes = readFileSync(env.SHOWCASE_REGISTRY_FILE
      || join(home, 'ai', 'standards', 'portfolio.json'), 'utf8');
    registry = JSON.parse(registryBytes);
  } catch {
    throw new Error('Repository registry unavailable; refusing profile refresh');
  }
  if (registry?.schema !== 1 || !Array.isArray(registry.products)) {
    throw new Error('Repository registry invalid; refusing profile refresh');
  }
  const registered = new Map();
  for (const row of registry.products) {
    if (!row || typeof row !== 'object' || Array.isArray(row) || !Object.hasOwn(row, 'repo')) {
      throw new Error('Repository registry invalid; refusing profile refresh');
    }
    if (row.repo === null) continue; // Retired deployed surfaces are not repositories.
    if (typeof row.repo !== 'string' || !/^rockeish\/[A-Za-z0-9_.-]+$/.test(row.repo)) {
      throw new Error('Repository registry has an invalid owner or repository');
    }
    const repo = row.repo.toLowerCase();
    if (registered.has(repo)) throw new Error('Repository registry contains duplicate repositories');
    if (row.dir != null && (typeof row.dir !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(row.dir)
        || row.dir === '.' || row.dir === '..')) {
      throw new Error('Repository registry has an invalid checkout directory');
    }
    registered.set(repo, row.dir || null);
  }
  if (!registered.size) throw new Error('Repository registry contains no repositories');

  const limit = 1000;
  let rows;
  try {
    rows = JSON.parse(execFileSync('gh', ['repo', 'list', 'rockeish', '--limit', String(limit),
      '--json', 'nameWithOwner,isArchived'], {
      env, encoding: 'utf8', timeout: 30000, maxBuffer: 2 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }));
  } catch {
    throw new Error('GitHub repository inventory unavailable; refusing profile refresh');
  }
  // gh enumerates up to the bound. Reaching it cannot prove completeness.
  if (!Array.isArray(rows) || !rows.length || rows.length >= limit) {
    throw new Error('GitHub repository inventory incomplete; refusing profile refresh');
  }
  const seen = new Set();
  for (const row of rows) {
    if (typeof row?.nameWithOwner !== 'string'
        || !/^rockeish\/[A-Za-z0-9_.-]+$/.test(row.nameWithOwner)
        || typeof row.isArchived !== 'boolean') {
      throw new Error('GitHub repository inventory invalid; refusing profile refresh');
    }
    const name = row.nameWithOwner.toLowerCase();
    if (seen.has(name)) throw new Error('GitHub repository inventory contains duplicates');
    seen.add(name);
  }
  if ([...registered.keys()].some((name) => !seen.has(name))) {
    throw new Error('GitHub inventory omits a registered repository; refusing profile refresh');
  }
  const active = rows.filter((row) => !row.isArchived);
  if (!active.length) throw new Error('GitHub repository inventory has no active repositories');
  const receipt = {
    source: 'github', method: 'gh-repo-list', asOf: new Date().toISOString(),
    count: active.length, complete: true, enumerationLimit: limit,
    digest: digest(JSON.stringify(rows.map((row) => [row.nameWithOwner.toLowerCase(), row.isArchived]).sort())),
    productRegistry: { source: 'local-product-registry', schema: 1,
      count: registered.size, digest: digest(registryBytes) },
  };
  return { receipt, repositories: active.map((row) => ({
    repo: row.nameWithOwner.toLowerCase(),
    dir: registered.get(row.nameWithOwner.toLowerCase()) || row.nameWithOwner.split('/')[1],
  })) };
}

export function requireCheckoutRoot(env = process.env, home = homedir()) {
  try {
    if (statSync(env.SHOWCASE_REPOS_ROOT || join(home, 'repos')).isDirectory()) return;
  } catch { /* Missing input must not become a successful declared fallback. */ }
  throw new Error('Checkout input unavailable; refusing profile refresh');
}

export function requireCountReceipt(activity, expected) {
  const receipt = activity?.repoCount;
  const coverage = activity?.metrics?.historyCoverage;
  if (receipt?.source !== 'github' || receipt?.method !== 'gh-repo-list'
      || receipt.complete !== true || receipt.enumerationLimit !== expected.enumerationLimit
      || !Number.isInteger(receipt.count) || receipt.count !== expected.count
      || !/^[a-f0-9]{64}$/.test(receipt.digest || '') || receipt.digest !== expected.digest
      || receipt.productRegistry?.source !== expected.productRegistry.source
      || receipt.productRegistry?.schema !== expected.productRegistry.schema
      || receipt.productRegistry?.count !== expected.productRegistry.count
      || receipt.productRegistry?.digest !== expected.productRegistry.digest
      || typeof receipt.asOf !== 'string' || !Number.isFinite(Date.parse(receipt.asOf))
      || new Date(receipt.asOf).toISOString() !== receipt.asOf
      || Date.parse(receipt.asOf) > Date.now()
      || activity?.metrics?.repos !== receipt.count
      || coverage?.scope !== 'owned non-archived repositories'
      || coverage.expected !== receipt.count || coverage.inventoryDigest !== receipt.digest
      || !/^[a-f0-9]{64}$/.test(coverage.revisionDigest || '')
      || !Number.isInteger(coverage.commitsMeasured) || coverage.commitsMeasured < 1
      || coverage.commitsMeasured > receipt.count
      || !Number.isInteger(coverage.sourceMeasured) || coverage.sourceMeasured < 0
      || coverage.sourceMeasured > coverage.commitsMeasured
      || !Number.isFinite(activity.metrics.commits) || activity.metrics.commits < 1
      || (coverage.sourceMeasured === 0 ? activity.metrics.linesOfSource !== null
        : !Number.isFinite(activity.metrics.linesOfSource) || activity.metrics.linesOfSource < 0)) {
    throw new Error('Repository count evidence unavailable or changed; collect before generating');
  }
}
