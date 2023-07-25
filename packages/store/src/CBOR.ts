import '../types/cborg.d.ts'

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
