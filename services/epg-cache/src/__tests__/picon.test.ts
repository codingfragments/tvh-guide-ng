import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { normalizeSNP, PiconIndex } from '../picon.js';

describe('normalizeSNP', () => {
  it('should lowercase and strip spaces', () => {
    expect(normalizeSNP('Das Erste HD')).toBe('daserstehd');
  });

  it('should replace & with "and"', () => {
    expect(normalizeSNP('Tom & Jerry')).toBe('tomandjerry');
  });

  it('should replace + with "plus"', () => {
    expect(normalizeSNP('RTL+')).toBe('rtlplus');
  });

  it('should replace * with "star"', () => {
    expect(normalizeSNP('Star*TV')).toBe('starstartv');
  });

  it('should strip diacritics', () => {
    expect(normalizeSNP('Télé München')).toBe('telemunchen');
  });

  it('should handle NFKD decomposition (e.g. ﬁ ligature)', () => {
    expect(normalizeSNP('Sci-ﬁ')).toBe('scifi');
  });

  it('should strip punctuation and special characters', () => {
    expect(normalizeSNP('N-TV (HD)')).toBe('ntvhd');
  });

  it('should return empty string for empty input', () => {
    expect(normalizeSNP('')).toBe('');
  });

  it('should handle numbers', () => {
    expect(normalizeSNP('3sat')).toBe('3sat');
  });
});

describe('PiconIndex', () => {
  let buildSourcePath: string;

  beforeAll(() => {
    // Create temp fixture replicating picons build-source structure
    buildSourcePath = join(tmpdir(), `picon-test-${Date.now()}`);
    const logosDir = join(buildSourcePath, 'logos');
    mkdirSync(logosDir, { recursive: true });

    // snp.index: normalized channel name → logo base name
    writeFileSync(
      join(buildSourcePath, 'snp.index'),
      [
        'daserstehd=daserste',
        'zdfhd=zdf',
        'rtlhd=rtl',
        'pngonly=pngchannel',
        'bothformats=bothchannel',
        'withvariants=variantchannel',
      ].join('\n'),
    );

    // srp.index: service reference → logo base name
    writeFileSync(
      join(buildSourcePath, 'srp.index'),
      ['1D5_B_1_130000=daserste', '1D8_B_1_130000=zdf'].join('\n'),
    );

    // Logo files
    writeFileSync(join(logosDir, 'daserste.default.svg'), '<svg>daserste</svg>');
    writeFileSync(join(logosDir, 'zdf.default.svg'), '<svg>zdf</svg>');
    writeFileSync(join(logosDir, 'rtl.default.svg'), '<svg>rtl</svg>');
    writeFileSync(join(logosDir, 'rtl.light.svg'), '<svg>rtl-light</svg>');
    writeFileSync(join(logosDir, 'pngchannel.default.png'), Buffer.from('PNG'));
    writeFileSync(join(logosDir, 'bothchannel.default.svg'), '<svg>both</svg>');
    writeFileSync(join(logosDir, 'bothchannel.default.png'), Buffer.from('PNG'));
    writeFileSync(join(logosDir, 'variantchannel.default.svg'), '<svg>default</svg>');
    writeFileSync(join(logosDir, 'variantchannel.dark.svg'), '<svg>dark</svg>');
  });

  afterAll(() => {
    rmSync(buildSourcePath, { recursive: true, force: true });
  });

  it('should load indices from build-source path', () => {
    const index = new PiconIndex(buildSourcePath);
    const stats = index.getStats();
    expect(stats.snpEntries).toBe(6);
    expect(stats.srpEntries).toBe(2);
  });

  it('should throw for non-existent path', () => {
    expect(() => new PiconIndex('/nonexistent/path')).toThrow('does not exist');
  });

  it('should resolve channel name to SVG logo', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('Das Erste HD');
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe('image/svg+xml');
    expect(result!.filePath).toContain('daserste.default.svg');
  });

  it('should resolve SRP reference', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByServiceRef('1D5_B_1_130000');
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe('image/svg+xml');
    expect(result!.filePath).toContain('daserste.default.svg');
  });

  it('should prefer SVG over PNG when both exist', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('bothformats');
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe('image/svg+xml');
  });

  it('should return PNG when no SVG exists', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('pngonly');
    expect(result).not.toBeNull();
    expect(result!.contentType).toBe('image/png');
  });

  it('should resolve requested variant', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('withvariants', 'dark');
    expect(result).not.toBeNull();
    expect(result!.filePath).toContain('variantchannel.dark.svg');
  });

  it('should fall back to default variant when requested variant is missing', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('withvariants', 'white');
    expect(result).not.toBeNull();
    expect(result!.filePath).toContain('variantchannel.default.svg');
  });

  it('should resolve light variant when available', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('RTL HD', 'light');
    expect(result).not.toBeNull();
    expect(result!.filePath).toContain('rtl.light.svg');
  });

  it('should return null for unknown channel', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByChannelName('nonexistent channel');
    expect(result).toBeNull();
  });

  it('should return null for unknown SRP reference', () => {
    const index = new PiconIndex(buildSourcePath);
    const result = index.resolveByServiceRef('AAAA_B_1_130000');
    expect(result).toBeNull();
  });
});
