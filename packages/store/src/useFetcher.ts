import {
  joinURL,
  toURLSearchParams,
  type URLSearchParamsInit,
} from '@yiwen-ai/util'
import { createContext, useContext, useMemo } from 'react'
import { useLogger, type Logger } from './logger'
import { useAccessToken } from './useAccessToken'

export interface FetcherConfig {
  PUBLIC_PATH: string
  API_URL: string
  AUTH_URL: string
}

const FetcherConfigContext = createContext({} as FetcherConfig)

export const FetcherConfigProvider = FetcherConfigContext.Provider

export function useFetcherConfig() {
  return useContext(FetcherConfigContext)
}

interface RequestOptions extends Pick<RequestInit, 'credentials' | 'headers'> {
  baseURL: string
  logger: Logger
}

export function createRequest(options: RequestOptions) {
  const request = async <T>(url: string, init?: RequestInit) => {
    const headers = new Headers(options.headers)
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value))
    url = joinURL(options.baseURL, url)
    const resp = await fetch(url, { ...options, ...init, headers })
    if (resp.status >= 200 && resp.status < 300) {
      return resp.json() as Promise<T>
    } else {
      const error = await resp.json()
      options.logger.error('fetch error', { url, status: resp.status, error })
      throw error
    }
  }
  request.get = <T>(url: string, query?: URLSearchParamsInit) => {
    return request<T>(url, {
      method: 'GET',
      body: query ? toURLSearchParams(query) : null,
    })
  }
  request.post = <T>(url: string, body?: object) => {
    return request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : null,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  request.put = <T>(url: string, body?: object) => {
    return request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : null,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  request.patch = <T>(url: string, body?: object) => {
    return request<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : null,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  request.delete = <T>(url: string, query?: URLSearchParamsInit) => {
    return request<T>(url, {
      method: 'DELETE',
      body: query ? toURLSearchParams(query) : null,
    })
  }
  return request
}

export function useRequest(options: RequestOptions) {
  const headers = Array.from(new Headers(options.headers).entries())
  const stringifiedOptions = JSON.stringify({ ...options, headers })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => createRequest(options), [stringifiedOptions])
}

export function useFetcher(baseURL?: string) {
  const { API_URL } = useFetcherConfig()
  const { accessToken } = useAccessToken()
  const logger = useLogger()
  return useMemo(() => {
    if (!accessToken) logger.debug('missing access token', undefined)
    return createRequest({
      baseURL: baseURL ?? API_URL,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      logger,
    })
  }, [API_URL, accessToken, baseURL, logger])
}

export function useAuthFetcher() {
  const { AUTH_URL } = useFetcherConfig()
  const logger = useLogger()
  return useMemo(() => {
    return createRequest({
      baseURL: AUTH_URL,
      credentials: 'include',
      logger,
    })
  }, [AUTH_URL, logger])
}
