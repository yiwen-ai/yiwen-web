import { useCallback } from 'react'
import {
  type GroupInfo,
  type ObjectKind,
  type SubscriptionOutput,
} from './common'
import { useFetcher } from './useFetcher'

export interface PaymentCodeOutput {
  kind: ObjectKind
  title: string
  duration: number
  amount: number
  expire_at: number
  code: string
  group_info: GroupInfo
}

export interface QueryPaymentCode {
  cid: Uint8Array
  gid: Uint8Array // 触发支付的 group，如果不是订阅对象所属 group，则收益分成给该 group 的 owner
  kind: ObjectKind
}

export interface PaymentInput {
  code: string
}

const path = '/v1/payment/code'

export function usePaymentAPI() {
  const request = useFetcher()

  const getPaymentCode = useCallback(
    (params: Record<keyof QueryPaymentCode, string>) => {
      return request.get<{ result: PaymentCodeOutput[] }>(`${path}`, params)
    },
    [request]
  )

  const payByCode = useCallback(
    (body: PaymentInput) => {
      return request.post<{ result: SubscriptionOutput }>(`${path}`, body)
    },
    [request]
  )

  return {
    getPaymentCode,
    payByCode,
  } as const
}
