import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  TransactionKind,
  TransactionRole,
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
      columnHelper.accessor((row) => [row.kind, row.role], {
        cell: (props) => {
          const [kind, role] = props.getValue()
          if (
            kind != TransactionKind.Sponsor &&
            kind != TransactionKind.Subscribe
          ) {
            return transactionKindLabelDict[kind as TransactionKind]
          }

          const txnRole =
            role == TransactionRole.SubPayee
              ? intl.formatMessage({ defaultMessage: '（分成）' })
              : intl.formatMessage({ defaultMessage: '（收入）' })
          return transactionKindLabelDict[kind as TransactionKind] + txnRole
        },
        header: intl.formatMessage({ defaultMessage: '类型' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.income || 0, {
        cell: (props) => props.getValue(),
        header: intl.formatMessage({ defaultMessage: '数量' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.payer_info, {
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
