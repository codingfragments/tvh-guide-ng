import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type PiconVariant = 'default' | 'light' | 'dark' | 'white' | 'black';

export const PICON_VARIANTS: ReadonlySet<string> = new Set<PiconVariant>([
  'default',
  'light',
  'dark',
  'white',
  'black',
]);

export interface PiconResult {
  filePath: string;
  contentType: string;
}

/**
 * Normalize a channel name using the SNP (Service Name Picon) algorithm,
 * matching the picons/picons repository convention:
 * NFKD normalize → strip diacritics → replace &/+/* → lowercase → strip non-alphanumeric
 */
export function normalizeSNP(name: string): string {
  return (
    name
      // NFKD decomposition (splits composed chars like ü → u + combining diaeresis)
      .normalize('NFKD')
      // Strip combining diacritical marks
      .replace(/[\u0300-\u036f]/g, '')
      // Replace common conjunctions/symbols before lowercasing
      .replace(/&/g, 'and')
      .replace(/\+/g, 'plus')
      .replace(/\*/g, 'star')
      .toLowerCase()
      // Strip everything that isn't a-z or 0-9
      .replace(/[^a-z0-9]/g, '')
  );
}

function parseIndex(content: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const value = trimmed.slice(eqIdx + 1);
    if (key && value) {
      map.set(key, value);
    }
  }
  return map;
}

export class PiconIndex {
  private readonly snpIndex: Map<string, string>;
  private readonly srpIndex: Map<string, string>;
  private readonly logosDir: string;

  constructor(buildSourcePath: string) {
    if (!existsSync(buildSourcePath)) {
      throw new Error(`Picon build-source path does not exist: ${buildSourcePath}`);
    }

    const snpPath = join(buildSourcePath, 'snp.index');
    const srpPath = join(buildSourcePath, 'srp.index');

    if (!existsSync(snpPath)) {
      throw new Error(`SNP index not found: ${snpPath}`);
    }
    if (!existsSync(srpPath)) {
      throw new Error(`SRP index not found: ${srpPath}`);
    }

    this.snpIndex = parseIndex(readFileSync(snpPath, 'utf-8'));
    this.srpIndex = parseIndex(readFileSync(srpPath, 'utf-8'));
    this.logosDir = join(buildSourcePath, 'logos');
  }

  resolveByChannelName(name: string, variant: PiconVariant = 'default'): PiconResult | null {
    const normalized = normalizeSNP(name);
    const logoBase = this.snpIndex.get(normalized);
    if (!logoBase) return null;
    return this.resolveLogoFile(logoBase, variant);
  }

  resolveByServiceRef(ref: string, variant: PiconVariant = 'default'): PiconResult | null {
    const logoBase = this.srpIndex.get(ref);
    if (!logoBase) return null;
    return this.resolveLogoFile(logoBase, variant);
  }

  getStats(): { snpEntries: number; srpEntries: number } {
    return {
      snpEntries: this.snpIndex.size,
      srpEntries: this.srpIndex.size,
    };
  }

  private resolveLogoFile(logoBase: string, variant: PiconVariant): PiconResult | null {
    // Try requested variant first, then fall back to 'default'
    const variants = variant === 'default' ? [variant] : [variant, 'default' as PiconVariant];

    for (const v of variants) {
      // Prefer SVG over PNG
      const svgPath = join(this.logosDir, `${logoBase}.${v}.svg`);
      if (existsSync(svgPath)) {
        return { filePath: svgPath, contentType: 'image/svg+xml' };
      }

      const pngPath = join(this.logosDir, `${logoBase}.${v}.png`);
      if (existsSync(pngPath)) {
        return { filePath: pngPath, contentType: 'image/png' };
      }
    }

    return null;
  }
}
