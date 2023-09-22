import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  CreditKind,
  useCreditList,
  type CreditOutput,
  type Currency,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

function useCreditKindLabelDict() {
  const intl = useIntl()

  return useMemo<Record<CreditKind, string>>(
    () => ({
      [CreditKind.Award]: intl.formatMessage({
        defaultMessage: '奖励',
      }),
      [CreditKind.Payout]: intl.formatMessage({
        defaultMessage: '消费',
      }),
      [CreditKind.Income]: intl.formatMessage({
        defaultMessage: '收入',
      }),
    }),
    [intl]
  )
}

export function useCreditTable(
  currencyList: readonly Currency[] | null | undefined
) {
  const intl = useIntl()
  const creditKindLabelDict = useCreditKindLabelDict()

  const columnHelper = useMemo(() => createColumnHelper<CreditOutput>(), [])
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => Xid.fromValue(row.txn), {
        cell: (props) => props.getValue().toString(),
        header: intl.formatMessage({ defaultMessage: '交易号' }),
        size: 200,
      }),
      columnHelper.accessor((row) => row.created_at, {
        cell: (props) => new Date(props.getValue()).toLocaleString(),
        header: intl.formatMessage({ defaultMessage: '时间' }),
        size: 240,
      }),
      columnHelper.accessor((row) => row.kind, {
        cell: (props) => creditKindLabelDict[props.getValue()],
        header: intl.formatMessage({ defaultMessage: '类型' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.amount, {
        cell: (props) => props.getValue(),
        header: intl.formatMessage({ defaultMessage: '数量' }),
        size: 140,
      }),
    ],
    [columnHelper, creditKindLabelDict, intl]
  ) as ColumnDef<CreditOutput>[]

  const {
    refresh: refreshCreditList,
    loadMore: loadMoreCreditList,
    ...creditList
  } = useCreditList()

  return {
    columns,
    refreshCreditList,
    onLoadMore: loadMoreCreditList,
    ...creditList,
  } as const
}
