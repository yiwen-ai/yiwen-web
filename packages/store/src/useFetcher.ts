import { joinURL, type URLSearchParamsInit } from '@yiwen-ai/util'
import { compact } from 'lodash-es'
import { createContext, useContext, useMemo } from 'react'
import { decode, encode } from './CBOR'
import { useLogger, type Logger } from './logger'
import { useUserAPI } from './UserContext'

//#region fetcher config
export interface FetcherConfig {
  PUBLIC_PATH: string
  API_URL: string
  AUTH_URL: string
}

const FetcherConfigContext = createContext<Partial<FetcherConfig>>({})

export const FetcherConfigProvider = FetcherConfigContext.Provider

export function useFetcherConfig() {
  return useContext(FetcherConfigContext)
}
//#endregion

//#region request
const CBOR_MIME_TYPE = 'application/cbor'
const JSON_MIME_TYPE = 'application/json'

export function createRequest(
  logger: Logger,
  baseURL: string,
  defaultOptions: RequestInit
) {
  const request = async <T>(
    path: string,
    params?: URLSearchParamsInit,
    options?: RequestInit
  ) => {
    const url = joinURL(baseURL, path, params)
    const headers = new Headers(defaultOptions.headers)
    new Headers(options?.headers).forEach((value, key) =>
      headers.set(key, value)
    )
    if (!headers.has('Accept')) headers.set('Accept', CBOR_MIME_TYPE)
    const resp = await fetch(url, { ...defaultOptions, ...options, headers })
    const { status } = resp
    const body =
      resp.headers.get('Content-Type') === CBOR_MIME_TYPE
        ? decode(new Uint8Array(await resp.arrayBuffer()))
        : resp.headers.get('Content-Type')?.startsWith(JSON_MIME_TYPE)
        ? await resp.json()
        : await resp.text()
    if (status >= 200 && status < 300) {
      return body as T
    } else {
      const error = createRequestError(status, body) ?? body
      logger.error('fetch error', { url, status, error })
      throw error
    }
  }
  request.defaultOptions = Object.freeze(defaultOptions)
  request.get = <T>(path: string, params?: URLSearchParamsInit) => {
    return request<T>(path, params, {
      method: 'GET',
    })
  }
  request.post = <T>(path: string, body?: object) => {
    return request<T>(path, undefined, {
      method: 'POST',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.put = <T>(path: string, body?: object) => {
    return request<T>(path, undefined, {
      method: 'PUT',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.patch = <T>(path: string, body?: object) => {
    return request<T>(path, undefined, {
      method: 'PATCH',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  request.delete = <T>(
    path: string,
    params?: URLSearchParamsInit,
    body?: object
  ) => {
    return request<T>(path, params, {
      method: 'DELETE',
      body: body ? encode(body) : null,
      headers: { 'Content-Type': CBOR_MIME_TYPE },
    })
  }
  return request
}

export function useRequest(baseURL: string, options: RequestInit) {
  const logger = useLogger()
  const headers = Array.from(new Headers(options.headers).entries())
  const stringifiedOptions = JSON.stringify({ ...options, headers })
  return useMemo(
    () => createRequest(logger, baseURL, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseURL, logger, stringifiedOptions]
  )
}
//#endregion

//#region fetcher
export function useFetcher(baseURL?: string) {
  const { API_URL } = useFetcherConfig()
  const accessToken = useUserAPI()?.accessToken
  const logger = useLogger()
  return useMemo(() => {
    if (!API_URL) {
      logger.debug('fetcher config is not ready', { config: { API_URL } })
      throw new Error('fetcher config is not ready')
    }
    return createRequest(logger, baseURL ?? API_URL, {
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
  }, [API_URL, accessToken, baseURL, logger])
}
//#endregion

export function useAuthFetcher() {
  const { AUTH_URL } = useFetcherConfig()
  const logger = useLogger()
  return useMemo(() => {
    if (!AUTH_URL) {
      logger.debug('fetcher config is not ready', { config: { AUTH_URL } })
      return undefined
    }
    return createRequest(logger, AUTH_URL, {
      credentials: 'include',
    })
  }, [AUTH_URL, logger])
}

//#region request error
function createRequestError(status: number, body: unknown) {
  if (
    typeof body === 'object' &&
    !!body &&
    'error' in body &&
    typeof body.error === 'string' &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return new RequestError(status, body.error, body.message)
  }
  return null
}

export class RequestError extends Error {
  constructor(public status: number, name: string, message: string) {
    super(message)
    this.name = name
  }
}

export function toMessage(error: unknown) {
  if (error instanceof RequestError) {
    return compact([
      compact([error.status, error.name]).join(' '),
      error.message,
    ]).join('\n')
  }
  if (typeof error === 'string') {
    return error
  }
  if (
    typeof error === 'object' &&
    !!error &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  return undefined
}
//#endregion
