import { css, useTheme } from '@emotion/react'
import { Button, textEllipsis, type ToastAPI } from '@yiwen-ai/component'
import {
  ObjectKind,
  toMessage,
  useEnsureAuthorized,
  useMyWallet,
  usePaymentAPI,
  type PaymentCodeOutput,
  type QueryPaymentCode,
} from '@yiwen-ai/store'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import SmallDialog from './SmallDialog'

export interface PaymentConfirmDialogProps {
  pushToast: ToastAPI['pushToast']
  onClose: () => void
  payFor: Record<keyof QueryPaymentCode, string> | null
  disabled: boolean
  setDisabled: React.Dispatch<React.SetStateAction<boolean>>
  onCharge: () => void
  checkSubscription: () => void
}

export default function PaymentConfirmDialog({
  pushToast,
  onClose,
  disabled,
  setDisabled,
  payFor,
  onCharge,
  checkSubscription,
}: PaymentConfirmDialogProps) {
  const intl = useIntl()
  const theme = useTheme()
  const ensureAuthorized = useEnsureAuthorized()

  const { wallet, refresh } = useMyWallet()
  const { getPaymentCode, payByCode } = usePaymentAPI()

  const [paymentErr, setPaymentErr] = useState<unknown>(null)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<PaymentCodeOutput | null>(null)

  const open = useMemo(() => Boolean(payFor), [payFor])

  const balance = useMemo(() => {
    if (!open || !wallet) return 0
    return wallet.award + wallet.topup + wallet.income
  }, [open, wallet])

  useEffect(() => {
    if (!open || !payFor) return

    setPaymentErr(null)
    setIsPaymentLoading(true)
    ensureAuthorized(async function () {
      checkSubscription()
      await refresh()
      try {
        const { result: data } = await getPaymentCode(payFor)
        setPaymentInfo(data[0] || null)
      } catch (er) {
        setPaymentErr(er)
      } finally {
        setIsPaymentLoading(false)
      }
    })()
  }, [
    open,
    payFor,
    refresh,
    ensureAuthorized,
    checkSubscription,
    getPaymentCode,
    setPaymentErr,
    setIsPaymentLoading,
    setPaymentInfo,
  ])

  const handlePayment = useCallback(async () => {
    if (!paymentInfo) return
    try {
      setDisabled(true)
      const { result: _data } = await payByCode({ code: paymentInfo.code })
      pushToast({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '支付完成' }),
      })
      checkSubscription()
    } catch (error) {
      setDisabled(false)
      pushToast({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '支付失败' }),
        description: toMessage(error),
      })
    } finally {
      onClose()
    }
  }, [
    pushToast,
    intl,
    paymentInfo,
    payByCode,
    setDisabled,
    checkSubscription,
    onClose,
  ])

  return (
    <SmallDialog
      title={intl.formatMessage({ defaultMessage: '向作者付费' })}
      open={open}
      onClose={onClose}
    >
      {isPaymentLoading ? (
        <Loading
          css={css`
            height: 200px;
          `}
        />
      ) : paymentErr ? (
        <ErrorPlaceholder error={paymentErr} />
      ) : (
        paymentInfo && (
          <>
            <div
              css={css`
                margin-top: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
              `}
            >
              <div
                css={(theme) => css`
                  color: ${theme.color.body.primary};
                `}
              >
                {paymentInfo.kind === ObjectKind.Collection
                  ? intl.formatMessage({ defaultMessage: '为合集付费' })
                  : intl.formatMessage({ defaultMessage: '为作品付费' })}
              </div>
              <blockquote
                css={css`
                  ${textEllipsis}
                  ${theme.typography.h2}
                `}
              >
                {paymentInfo.title}
              </blockquote>
              <div
                css={(theme) => css`
                  color: ${theme.color.body.default};
                  ${theme.typography.body}

                  > strong {
                    color: ${theme.color.body.primary};
                  }
                `}
              >
                {intl.formatMessage(
                  {
                    defaultMessage: '将花费 {cost} 文，钱包余额 {balance} 文',
                  },
                  {
                    cost: <strong>{paymentInfo.amount}</strong>,
                    balance,
                  }
                )}
              </div>
            </div>
            <Button
              color='primary'
              disabled={disabled || balance < paymentInfo.amount}
              onClick={handlePayment}
              css={css`
                margin-top: 24px;
              `}
            >
              {intl.formatMessage({ defaultMessage: '确定' })}
            </Button>
            {balance < paymentInfo.amount && (
              <div
                css={css`
                  margin-top: 12px;
                `}
              >
                {intl.formatMessage(
                  { defaultMessage: '亿文币余额不足，可前往 {charge}' },
                  {
                    charge: (
                      <button
                        onClick={onCharge}
                        css={(theme) => css`
                          vertical-align: top;
                          color: ${theme.color.body.primary};
                        `}
                      >
                        {intl.formatMessage({ defaultMessage: '充值' })}
                      </button>
                    ),
                  }
                )}
              </div>
            )}
          </>
        )
      )}
    </SmallDialog>
  )
}
