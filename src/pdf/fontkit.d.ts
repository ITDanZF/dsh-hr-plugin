declare module 'fontkit' {
  export function create(bytes: Buffer): { hasGlyphForCodePoint(codePoint: number): boolean } | null
}
