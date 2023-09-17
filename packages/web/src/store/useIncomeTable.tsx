import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  isSystem,
  useIncomeList,
  type Currency,
  type TransactionOutput,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'
import {
  useTransactionKindLabelDict,
  useTransactionStatusLabelDict,
} from './useOutgoTable'

export function useIncomeTable(
  currencyList: readonly Currency[] | null | undefined
) {
  const intl = useIntl()
  const transactionKindLabelDict = useTransactionKindLabelDict()
  const transactionStatusLabelDict = useTransactionStatusLabelDict()

  const columnHelper = useMemo(
    () => createColumnHelper<TransactionOutput>(),
    []
  )
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => Xid.fromValue(row.id), {
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
        cell: (props) => transactionKindLabelDict[props.getValue()],
        header: intl.formatMessage({ defaultMessage: '类型' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.amount, {
        cell: (props) => props.getValue(),
        header: intl.formatMessage({ defaultMessage: '数量' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.payee_info, {
        cell: (props) => {
          const info = props.getValue()
          return isSystem(info)
            ? intl.formatMessage({ defaultMessage: '系统' })
            : info?.name
        },
        header: intl.formatMessage({ defaultMessage: '支付人' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.status, {
        cell: (props) => transactionStatusLabelDict[props.getValue()],
        header: intl.formatMessage({ defaultMessage: '状态' }),
        size: 200,
      }),
    ],
    [columnHelper, intl, transactionKindLabelDict, transactionStatusLabelDict]
  ) as ColumnDef<TransactionOutput>[]

  const {
    refresh: refreshIncomeList,
    loadMore: loadMoreIncomeList,
    ...incomeList
  } = useIncomeList()

  return {
    columns,
    refreshIncomeList,
    onLoadMore: loadMoreIncomeList,
    ...incomeList,
  } as const
}
