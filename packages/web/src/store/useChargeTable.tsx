import { TABLE_ROW_ACTIONS_STYLES } from '#/components/Table'
import { css } from '@emotion/react'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import {
  ChargeProvider,
  ChargeStatus,
  formatChargeAmount,
  formatChargeCurrency,
  useChargeList,
  type ChargeOutput,
  type Currency,
} from '@yiwen-ai/store'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { Xid } from 'xid-ts'

function useChargeProviderLabelDict() {
  const intl = useIntl()

  return useMemo<Record<ChargeProvider, string>>(
    () => ({
      [ChargeProvider.Alipay]: intl.formatMessage({
        defaultMessage: '支付宝',
      }),
      [ChargeProvider.PayPal]: intl.formatMessage({
        defaultMessage: 'PayPal',
      }),
      [ChargeProvider.Stripe]: intl.formatMessage({
        defaultMessage: 'Stripe',
      }),
      [ChargeProvider.WeChat]: intl.formatMessage({
        defaultMessage: '微信支付',
      }),
    }),
    [intl]
  )
}

function useChargeStatusLabelDict() {
  const intl = useIntl()

  return useMemo<Record<ChargeStatus, string>>(
    () => ({
      [ChargeStatus.Failed]: intl.formatMessage({
        defaultMessage: '支付失败',
      }),
      [ChargeStatus.Refunded]: intl.formatMessage({
        defaultMessage: '已退款',
      }),
      [ChargeStatus.Preparing]: intl.formatMessage({
        defaultMessage: '支付中',
      }),
      [ChargeStatus.Prepared]: intl.formatMessage({
        defaultMessage: '支付中',
      }),
      [ChargeStatus.Committing]: intl.formatMessage({
        defaultMessage: '支付中',
      }),
      [ChargeStatus.Committed]: intl.formatMessage({
        defaultMessage: '支付成功',
      }),
    }),
    [intl]
  )
}

export function useChargeTable(
  currencyList: readonly Currency[] | null | undefined
) {
  const intl = useIntl()
  const chargeProviderLabelDict = useChargeProviderLabelDict()
  const chargeStatusLabelDict = useChargeStatusLabelDict()

  const columnHelper = useMemo(() => createColumnHelper<ChargeOutput>(), [])
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
      columnHelper.accessor((row) => row.provider, {
        cell: (props) => chargeProviderLabelDict[props.getValue()],
        header: intl.formatMessage({ defaultMessage: '充值渠道' }),
        size: 200,
      }),
      columnHelper.accessor((row) => row.quantity, {
        cell: (props) => props.getValue(),
        header: intl.formatMessage({ defaultMessage: '数量' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row, {
        cell: (props) => formatChargeCurrency(props.getValue(), currencyList),
        header: intl.formatMessage({ defaultMessage: '货币' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row, {
        cell: (props) => formatChargeAmount(props.getValue(), currencyList),
        header: intl.formatMessage({ defaultMessage: '金额' }),
        size: 140,
      }),
      columnHelper.accessor((row) => row.status, {
        cell: (props) => chargeStatusLabelDict[props.getValue()],
        header: intl.formatMessage({ defaultMessage: '状态' }),
        size: 200,
      }),
      columnHelper.accessor((row) => row, {
        id: '_actions',
        cell: (props) => {
          const row = props.getValue()
          return (
            <div css={TABLE_ROW_ACTIONS_STYLES}>
              {row.payment_url && (
                <a
                  href={row.payment_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  css={(theme) => css`
                    color: ${theme.color.body.link};
                  `}
                >
                  {intl.formatMessage({ defaultMessage: '查看' })}
                </a>
              )}
            </div>
          )
        },
        header: () => null,
        size: 140,
      }),
    ],
    [
      chargeProviderLabelDict,
      chargeStatusLabelDict,
      columnHelper,
      currencyList,
      intl,
    ]
  ) as ColumnDef<ChargeOutput>[]

  const {
    refresh: refreshChargeList,
    loadMore: loadMoreChargeList,
    ...chargeList
  } = useChargeList()

  return {
    columns,
    refreshChargeList,
    onLoadMore: loadMoreChargeList,
    ...chargeList,
  } as const
}
