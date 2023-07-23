declare module 'cborg' {
  export function encode(
    data: unknown,
    options?: EncodeOptions | undefined
  ): Uint8Array

  export function decode(
    data: Uint8Array,
    options?: DecodeOptions | undefined
  ): unknown

  export interface DecodeOptions {}

  export interface EncodeOptions {}
}
