import '../types/cborg.d.ts'

import { isBlobURL } from '@yiwen-ai/util'
// missing types
import { decode as _decode, encode as _encode } from 'cborg' // eslint-disable-line import/order

// import types from the right place
import {
  type decode as Decode,
  type encode as Encode,
} from '../node_modules/cborg/types/cborg'

// re-export with the right types
export const decode = _decode as typeof Decode
export const encode = _encode as typeof Encode

export function createBlobURL(object: unknown) {
  return btoa(
    URL.createObjectURL(
      new Blob([encode(object)], { type: 'application/cbor' })
    )
  )
}

export async function parseBlobURL<T>(url: string) {
  try {
    url = atob(url)
    if (!isBlobURL(url)) return null
    const resp = await fetch(url)
    const blob = await resp.blob()
    if (blob.type !== 'application/cbor') return null
    const buffer = await blob.arrayBuffer()
    return decode(new Uint8Array(buffer)) as T
  } catch {
    return null
  }
}

export function revokeBlobURL(url: string) {
  try {
    url = atob(url)
    isBlobURL(url) && URL.revokeObjectURL(url)
  } catch {
    // ...
  }
}
