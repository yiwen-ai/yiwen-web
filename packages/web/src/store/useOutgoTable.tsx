import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  TransactionKind,
  TransactionStatus,
  isSystem,
  useOutgoList,
  type Currency,
  type TransactionOutput,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

export function useTransactionKindLabelDict() {
  const intl = useIntl()

  return useMemo<Record<TransactionKind, string>>(
    () => ({
      [TransactionKind.Award]: intl.formatMessage({
        defaultMessage: '奖励',
      }),
      [TransactionKind.Topup]: intl.formatMessage({
        defaultMessage: '充值',
      }),
      [TransactionKind.Refund]: intl.formatMessage({
        defaultMessage: '退款',
      }),
      [TransactionKind.Withdraw]: intl.formatMessage({
        defaultMessage: '提现',
      }),
      [TransactionKind.Spend]: intl.formatMessage({
        defaultMessage: '消费',
      }),
      [TransactionKind.Sponsor]: intl.formatMessage({
        defaultMessage: '赞助',
      }),
      [TransactionKind.Subscribe]: intl.formatMessage({
        defaultMessage: '订阅',
      }),
      [TransactionKind.Redpacket]: intl.formatMessage({
        defaultMessage: '红包',
      }),
    }),
    [intl]
  )
}

export function useTransactionStatusLabelDict() {
  const intl = useIntl()

  return useMemo<Record<TransactionStatus, string>>(
    () => ({
      [TransactionStatus.Canceled]: intl.formatMessage({
        defaultMessage: '已取消',
      }),
      [TransactionStatus.Canceling]: intl.formatMessage({
        defaultMessage: '取消中',
      }),
      [TransactionStatus.Preparing]: intl.formatMessage({
        defaultMessage: '处理中',
      }),
      [TransactionStatus.Prepared]: intl.formatMessage({
        defaultMessage: '处理中',
      }),
      [TransactionStatus.Committing]: intl.formatMessage({
        defaultMessage: '处理中',
      }),
      [TransactionStatus.Committed]: intl.formatMessage({
        defaultMessage: '已完成',
      }),
    }),
    [intl]
  )
}

export function useOutgoTable(
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
        header: intl.formatMessage({ defaultMessage: '收款人' }),
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
    refresh: refreshOutgoList,
    loadMore: loadMoreOutgoList,
    ...outgoList
  } = useOutgoList()

  return {
    columns,
    refreshOutgoList,
    onLoadMore: loadMoreOutgoList,
    ...outgoList,
  } as const
}
