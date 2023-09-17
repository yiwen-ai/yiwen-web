import { css } from '@emotion/react'
import {
  Button,
  Select,
  Spinner,
  type SelectOptionProps,
} from '@yiwen-ai/component'
import { type Currency } from '@yiwen-ai/store'
import { currencyFormatter } from '@yiwen-ai/util'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import SmallDialog from './SmallDialog'

interface ChargeDialogProps {
  open: boolean
  onClose: () => void
  isLoading: boolean
  error: unknown
  currencyList: Currency[] | undefined
  currentCurrency: Currency | undefined
  onCurrencyChange: (currency: Currency) => void
  chargeAmountList: readonly number[]
  chargeAmount: number
  onChargeAmountChange: (value: number) => void
  isCharging: boolean
  disabled: boolean
  onCharge: () => void
}

export default function ChargeDialog({
  open,
  onClose,
  isLoading,
  error,
  currencyList,
  currentCurrency,
  onCurrencyChange,
  chargeAmountList,
  chargeAmount,
  onChargeAmountChange,
  isCharging,
  disabled,
  onCharge,
}: ChargeDialogProps) {
  const intl = useIntl()

  return (
    <SmallDialog
      title={intl.formatMessage({ defaultMessage: '充值亿文币' })}
      open={open}
      onClose={onClose}
      css={css`
        > [data-dialog-body] {
          padding: 24px 36px 36px;
        }
      `}
    >
      {isLoading ? (
        <Loading
          css={css`
            height: 200px;
          `}
        />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : currencyList && currentCurrency ? (
        <>
          <div
            css={css`
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            `}
          >
            <div
              css={(theme) => css`
                color: ${theme.color.body.link};
              `}
            >
              {intl.formatMessage({ defaultMessage: '选择充值货币类型' })}
            </div>
            <Select
              size='large'
              placeholder={intl.formatMessage({ defaultMessage: '请选择' })}
              options={currencyList.map<SelectOptionProps<Currency>>(
                (currency) => ({
                  key: currency.name,
                  label: `${currency.name} (${currency.alpha})`,
                  value: currency,
                })
              )}
              value={currentCurrency}
              disabled={isCharging}
              onChange={onCurrencyChange}
              css={css`
                width: 240px;
              `}
            />
            <div
              css={(theme) => css`
                color: ${theme.color.body.secondary};
                ${theme.typography.tooltip}
              `}
            >
              {intl.formatMessage(
                { defaultMessage: '1 {name} = {rate} 文' },
                {
                  name: currentCurrency.name,
                  rate: currencyFormatter(
                    1 / currentCurrency.exchange_rate,
                    currentCurrency.decimals
                  ),
                }
              )}
            </div>
          </div>
          <div
            css={css`
              margin-top: 24px;
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
            `}
          >
            {chargeAmountList.map((amount) => (
              <Choice
                key={amount}
                value={amount}
                currency={currentCurrency}
                selected={amount === chargeAmount}
                disabled={isCharging}
                onSelect={onChargeAmountChange}
              />
            ))}
          </div>
          <Button
            color='primary'
            disabled={disabled}
            onClick={onCharge}
            css={css`
              margin-top: 24px;
            `}
          >
            {isCharging && <Spinner size='small' />}
            {intl.formatMessage({ defaultMessage: '确定充值' })}
          </Button>
        </>
      ) : null}
    </SmallDialog>
  )
}

function Choice({
  value,
  currency,
  selected,
  disabled,
  onSelect,
}: {
  value: number
  currency: Currency
  selected: boolean
  disabled: boolean
  onSelect: (value: number) => void
}) {
  const intl = useIntl()

  const handleClick = useCallback(() => {
    if (!selected) {
      onSelect(value)
    }
  }, [onSelect, selected, value])

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      css={(theme) => css`
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border-radius: 12px;
        border: 1px solid ${theme.color.body.secondary};
        :disabled {
          cursor: not-allowed;
        }
        ${selected &&
        css`
          border-color: ${theme.color.body.link};
        `}
      `}
    >
      <span>
        {intl.formatMessage({ defaultMessage: '{value} 文' }, { value })}
      </span>
      <span
        css={(theme) => css`
          color: ${theme.color.body.secondary};
          ${theme.typography.tooltip}
        `}
      >
        {intl.formatMessage(
          { defaultMessage: '约 {value} {name}' },
          {
            value: currencyFormatter(
              value * currency.exchange_rate,
              currency.decimals
            ),
            name: currency.name,
          }
        )}
      </span>
    </button>
  )
}
