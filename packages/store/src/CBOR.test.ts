import { expect, test } from 'vitest'
import { Xid } from 'xid-ts'
import { decode, encode } from './CBOR'
import { type Group } from './useGroup'
import { type User } from './useUser'

test('CBOR', () => {
  const binary = new Uint8Array([
    161, 102, 114, 101, 115, 117, 108, 116, 129, 173, 98, 105, 100, 76, 100,
    170, 170, 42, 234, 79, 65, 137, 238, 1, 139, 28, 98, 99, 110, 107, 99, 104,
    100, 53, 100, 50, 114, 106, 56, 56, 99, 100, 110, 97, 109, 101, 99, 70, 97,
    105, 100, 108, 111, 103, 111, 96, 103, 119, 101, 98, 115, 105, 116, 101, 96,
    102, 115, 116, 97, 116, 117, 115, 0, 100, 107, 105, 110, 100, 0, 106, 99,
    114, 101, 97, 116, 101, 100, 95, 97, 116, 27, 0, 0, 1, 137, 58, 168, 182,
    134, 106, 117, 112, 100, 97, 116, 101, 100, 95, 97, 116, 27, 0, 0, 1, 137,
    58, 168, 182, 134, 107, 100, 101, 115, 99, 114, 105, 112, 116, 105, 111,
    110, 64, 101, 95, 114, 111, 108, 101, 2, 105, 95, 112, 114, 105, 111, 114,
    105, 116, 121, 2, 101, 111, 119, 110, 101, 114, 165, 98, 99, 110, 107, 99,
    104, 100, 53, 100, 50, 114, 106, 56, 56, 99, 100, 110, 97, 109, 101, 99, 70,
    97, 105, 103, 112, 105, 99, 116, 117, 114, 101, 120, 52, 104, 116, 116, 112,
    115, 58, 47, 47, 99, 100, 110, 46, 121, 105, 119, 101, 110, 46, 112, 117,
    98, 47, 100, 101, 118, 47, 112, 105, 99, 47, 85, 110, 97, 72, 109, 66, 121,
    90, 68, 84, 65, 69, 85, 113, 110, 76, 102, 107, 49, 78, 101, 81, 102, 115,
    116, 97, 116, 117, 115, 0, 100, 107, 105, 110, 100, 0,
  ])

  const object: { result: Group[] } = {
    'result': [
      {
        'id': Xid.fromValue('cilakana9t0ojrg1hce0').toBytes(), // Uint8Array
        'cn': 'chd5d2rj88c',
        'name': 'Fai',
        'logo': '',
        'website': '',
        'status': 0,
        'kind': 0,
        'created_at': 1688906282630,
        'updated_at': 1688906282630,
        'description': new Uint8Array(),
        '_role': 2,
        '_priority': 2,
        'owner': {
          'cn': 'chd5d2rj88c',
          'name': 'Fai',
          'picture': 'https://cdn.yiwen.pub/dev/pic/UnaHmByZDTAEUqnLfk1NeQ',
          'status': 0,
          'kind': 0,
        } as Omit<User, 'locale'> as User,
      },
    ],
  }

  // case 1 - decode to object from HTTP response (ArrayBuffer or Uint8Array)
  const decoded = decode(binary) as typeof object
  expect(decoded).toEqual(object)
  expect(decoded.result[0]?.id).instanceOf(Uint8Array)
  expect(
    Xid.fromValue(decoded.result[0]?.id as Uint8Array).equals(
      Xid.fromValue(object.result[0]?.id as Uint8Array)
    )
  ).toBeTruthy()

  // case 2 - encode to Uint8Array for HTTP request
  const encoded = encode(object)
  expect(encoded).instanceOf(Uint8Array)
  expect(decode(encoded)).toEqual(object) // can decode properly
})
