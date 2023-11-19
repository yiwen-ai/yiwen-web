import { currencyFormatter, waitUntilClosed } from '@yiwen-ai/util'
import { useCallback, useMemo, useState } from 'react'
import {
  concatMap,
  filter,
  finalize,
  lastValueFrom,
  map,
  merge,
  take,
  takeUntil,
  timer,
} from 'rxjs'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { Xid } from 'xid-ts'
import {
  usePagination,
  type Page,
  type UIDPagination,
  type UserInfo,
} from './common'
import { useFetcher, useFetcherConfig } from './useFetcher'

export interface Currency {
  name: string
  alpha: string
  decimals: number
  code: number
  exchange_rate: number
}

export interface WalletOutput {
  sequence: number
  award: number
  topup: number
  income: number
  credits: number
  level: number
  txn: Uint8Array
}

export enum CreditKind {
  Award = 'award',
  Payout = 'payout',
  Income = 'income',
}

export interface CreditOutput {
  txn: Uint8Array
  kind: CreditKind
  amount: number
  created_at: number
  description?: string
}

export interface ExpendInput {
  payee: Uint8Array
  amount: number
  uid?: Uint8Array
  sub_payee?: Uint8Array
  description?: string
  payload?: Uint8Array
}

export enum TransactionStatus {
  Canceled = -2,
  Canceling = -1,
  Preparing = 0,
  Prepared = 1,
  Committing = 2,
  Committed = 3,
}

export enum TransactionRole {
  Payer = 0,
  Payee = 1,
  SubPayee = 2,
}

export enum TransactionKind {
  Award = 'award',
  Topup = 'topup',
  Refund = 'refund',
  Withdraw = 'withdraw',
  Spend = 'spend',
  Sponsor = 'sponsor',
  Subscribe = 'subscribe',
  Redpacket = 'redpacket',
}

export interface TransactionOutput {
  id: Uint8Array
  sequence: number
  payer?: Uint8Array
  payee?: Uint8Array
  sub_payee?: Uint8Array
  status: TransactionStatus
  kind: TransactionKind
  role: TransactionRole
  amount: number
  sys_fee: number
  sub_shares: number
  income?: number
  created_at: number
  description?: string
  payload?: Uint8Array
  payer_info?: UserInfo
  payee_info?: UserInfo
  sub_payee_info?: UserInfo
}

export interface CheckoutConfig {
  provider: string
  public_key: string
  unit_amount: number
  currency: string
}

export enum ChargeStatus {
  Failed = -2,
  Refunded = -1,
  Preparing = 0,
  Prepared = 1,
  Committing = 2,
  Committed = 3,
}

export enum ChargeProvider {
  Alipay = 'alipay',
  PayPal = 'paypal',
  Stripe = 'stripe',
  WeChat = 'wechat',
}

export interface ChargeOutput {
  id: Uint8Array
  provider: ChargeProvider
  status: ChargeStatus
  quantity: number
  created_at: number
  updated_at?: number
  expire_at?: number
  currency?: string
  amount?: number
  amount_refunded?: number
  charge_id?: string
  charge_payload?: Uint8Array
  txn?: Uint8Array
  txn_refunded?: Uint8Array
  failure_code?: string
  failure_msg?: string
  payment_url?: string
}

export interface CheckoutInput {
  quantity: number
  currency?: string
}

export interface CheckoutOutput {
  id: Uint8Array
  payment_url: string
}

export interface QueryId {
  id?: Uint8Array
  fields?: string
}

// 1 港元 == 10 亿文币
export const YIWEN_COIN_RATE = 10

export function formatChargeCurrency(
  charge: ChargeOutput,
  currencyList: readonly Currency[] | null | undefined
) {
  const { currency: currencyCode } = charge
  const currency = currencyList?.find(
    (currency) => currency.alpha.toLowerCase() === currencyCode?.toLowerCase()
  )
  return currency?.name ?? charge.currency
}

export function formatChargeAmount(
  charge: ChargeOutput,
  currencyList: readonly Currency[] | null | undefined
) {
  const { amount, currency: currencyCode } = charge
  const currency = currencyList?.find(
    (currency) => currency.alpha.toLowerCase() === currencyCode?.toLowerCase()
  )
  if (amount == null || currency == null) return null
  return currencyFormatter(amount / 10 ** currency.decimals, currency.decimals)
}

export function useWalletAPI() {
  const config = useFetcherConfig()
  const request = useFetcher(config.WALLET_URL)

  const readCurrencyList = useCallback(() => {
    return request.get<{ result: Currency[] }>('/currencies')
  }, [request])

  const readMyWallet = useCallback(() => {
    return request.get<{ result: WalletOutput }>('/v1/wallet')
  }, [request])

  const createSponsor = useCallback(
    (body: ExpendInput) => {
      return request.post<{ result: WalletOutput }>('/v1/wallet/sponsor', body)
    },
    [request]
  )

  /**
   * 信用记录
   */
  const readCreditList = useCallback(
    (body: UIDPagination) => {
      return request.post<Page<CreditOutput>>('/v1/wallet/list_credits', body)
    },
    [request]
  )

  /**
   * 支出记录
   */
  const readTransactionOutgoList = useCallback(
    (body: UIDPagination) => {
      return request.post<Page<TransactionOutput>>(
        '/v1/transaction/list_outgo',
        body
      )
    },
    [request]
  )

  /**
   * 收入记录
   */
  const readTransactionIncomeList = useCallback(
    (body: UIDPagination) => {
      return request.post<Page<TransactionOutput>>(
        '/v1/transaction/list_income',
        body
      )
    },
    [request]
  )

  const readChargeConfig = useCallback(() => {
    return request.get<{ result: CheckoutConfig }>('/v1/checkout/config')
  }, [request])

  const readChargeList = useCallback(
    (body: UIDPagination) => {
      return request.post<Page<ChargeOutput>>('/v1/checkout/list', body)
    },
    [request]
  )

  const readCharge = useCallback(
    (
      params: Record<keyof QueryId, string | undefined>,
      signal?: AbortSignal
    ) => {
      return request.get<{ result: ChargeOutput }>(
        '/v1/checkout',
        params,
        signal
      )
    },
    [request]
  )

  const createCharge = useCallback(
    (body: CheckoutInput) => {
      return request.post<{ result: CheckoutOutput }>('/v1/checkout', body)
    },
    [request]
  )

  return {
    readCurrencyList,
    readMyWallet,
    createSponsor,
    readCreditList,
    readTransactionOutgoList,
    readTransactionIncomeList,
    readChargeConfig,
    readChargeList,
    readCharge,
    createCharge,
  } as const
}

export function useCurrencyList() {
  const { readCurrencyList } = useWalletAPI()

  const getKey = useCallback(() => {
    return ['/currencies'] as const
  }, [])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    () => readCurrencyList(),
    {}
  )

  const refresh = useCallback(
    async () => getKey() && (await mutate())?.result,
    [getKey, mutate]
  )

  return {
    isLoading,
    isValidating,
    error,
    currencyList: data?.result,
    refresh,
  } as const
}

export function useMyWallet() {
  const { readMyWallet } = useWalletAPI()

  const getKey = useCallback(() => {
    return ['/v1/wallet'] as const
  }, [])

  const { data, error, mutate, isValidating, isLoading } = useSWR(
    getKey,
    ([path]) => readMyWallet(),
    {}
  )

  const wallet = useMemo(() => {
    if (!data?.result) return null
    return {
      ...data.result,
      total: data.result.award + data.result.topup + data.result.income,
      nextCredits: 10 ** data.result.level * 10,
    }
  }, [data?.result])

  const refresh = useCallback(
    async () => getKey() && (await mutate()),
    [getKey, mutate]
  )

  return {
    isLoading,
    isValidating,
    error,
    wallet,
    refresh,
  } as const
}

export function useNewCharge() {
  const { readCharge, createCharge } = useWalletAPI()

  const [isCharging, setIsCharging] = useState(false)

  const charge = useCallback(
    async (body: CheckoutInput, signal?: AbortSignal) => {
      try {
        setIsCharging(true)

        const { result } = await createCharge(body)

        const popup = window.open(
          result.payment_url,
          'popup',
          'popup=true,width=600,height=600,menubar=false,toolbar=false,location=false'
        )

        if (!popup) {
          // throw new Error('popup blocked')
          window.location.assign(result.payment_url) // redirect if popup is blocked
          return await new Promise<never>(() => {})
        }

        return await lastValueFrom(
          merge(
            timer(10000, 2000).pipe(takeUntil(waitUntilClosed(popup))),
            waitUntilClosed(popup)
          ).pipe(
            concatMap(() => {
              return readCharge(
                { id: Xid.fromValue(result.id).toString(), fields: undefined },
                signal
              )
            }),
            map(({ result }) => {
              const ok = result.status === ChargeStatus.Committed
              return {
                result: ok ? result : undefined,
                aborted: ok ? false : popup.closed,
              }
            }),
            filter(({ result, aborted }) => !!result || aborted),
            take(1),
            finalize(() => {
              popup.close()
            })
          )
        )
      } finally {
        setIsCharging(false)
      }
    },
    [createCharge, readCharge]
  )

  return {
    isCharging,
    charge,
  } as const
}

export function useChargeList() {
  const { readChargeList } = useWalletAPI()

  const getKey = useCallback(
    (_: number, prevPage: Page<ChargeOutput> | null) => {
      if (prevPage && !prevPage.next_page_token) return null
      const body: UIDPagination = {
        page_token: prevPage?.next_page_token,
      }
      return ['/v1/checkout/list', body] as const
    },
    []
  )

  const response = useSWRInfinite(
    getKey,
    ([path, body]) => readChargeList(body),
    { revalidateFirstPage: true }
  )

  return usePagination({
    getKey,
    ...response,
  })
}

export function useOutgoList() {
  const { readTransactionOutgoList } = useWalletAPI()

  const getKey = useCallback(
    (_: number, prevPage: Page<TransactionOutput> | null) => {
      if (prevPage && !prevPage.next_page_token) return null
      const body: UIDPagination = {
        page_token: prevPage?.next_page_token,
      }
      return ['/v1/transaction/list_outgo', body] as const
    },
    []
  )

  const response = useSWRInfinite(
    getKey,
    ([path, body]) => readTransactionOutgoList(body),
    { revalidateFirstPage: true }
  )

  return usePagination({
    getKey,
    ...response,
  })
}

export function useIncomeList() {
  const { readTransactionIncomeList } = useWalletAPI()

  const getKey = useCallback(
    (_: number, prevPage: Page<TransactionOutput> | null) => {
      if (prevPage && !prevPage.next_page_token) return null
      const body: UIDPagination = {
        page_token: prevPage?.next_page_token,
      }
      return ['/v1/transaction/list_income', body] as const
    },
    []
  )

  const response = useSWRInfinite(
    getKey,
    ([path, body]) => readTransactionIncomeList(body),
    { revalidateFirstPage: true }
  )

  return usePagination({
    getKey,
    ...response,
  })
}

export function useCreditList() {
  const { readCreditList } = useWalletAPI()

  const getKey = useCallback(
    (_: number, prevPage: Page<CreditOutput> | null) => {
      if (prevPage && !prevPage.next_page_token) return null
      const body: UIDPagination = {
        page_token: prevPage?.next_page_token,
      }
      return ['/v1/wallet/list_credits', body] as const
    },
    []
  )

  const response = useSWRInfinite(
    getKey,
    ([path, body]) => readCreditList(body),
    { revalidateFirstPage: true }
  )

  return usePagination({
    getKey,
    ...response,
  })
}
