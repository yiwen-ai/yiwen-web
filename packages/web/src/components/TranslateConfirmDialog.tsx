import { WALLET_PATH } from '#/App'
import { ReactComponent as SvgTranslate } from '#/assets/translate.svg'
import { useModelLabelDict } from '#/store/useTranslateConfirmDialog'
import { css } from '@emotion/react'
import {
  Button,
  Clickable,
  Select,
  type SelectOptionProps,
} from '@yiwen-ai/component'
import {
  type GPT_MODEL,
  type ModelCost,
  type UILanguageItem,
} from '@yiwen-ai/store'
import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import ErrorPlaceholder from './ErrorPlaceholder'
import Loading from './Loading'
import SmallDialog from './SmallDialog'

export interface TranslateConfirmDialogProps {
  open: boolean
  onClose: () => void
  language: UILanguageItem | undefined
  isLoading: boolean | undefined
  error: unknown
  tokenCount: number | undefined
  balance: number | undefined
  modelList: ModelCost[] | undefined
  currentModel: ModelCost | undefined
  onModelChange: (model: ModelCost) => void
  disabled: boolean
  onCharge: () => void
  onTranslate: (language: UILanguageItem, model: GPT_MODEL) => void
}

export default function TranslateConfirmDialog({
  open,
  onClose,
  language,
  isLoading,
  error,
  tokenCount,
  balance,
  modelList,
  currentModel,
  onModelChange,
  disabled,
  onCharge,
  onTranslate,
}: TranslateConfirmDialogProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  const modelLabelDict = useModelLabelDict()
  const handleTranslate = useCallback(
    () => language && currentModel && onTranslate(language, currentModel.id),
    [currentModel, language, onTranslate]
  )
  const balanceNotEnough = useMemo(
    () => balance == null || !currentModel || balance < currentModel.cost,
    [balance, currentModel]
  )

  const navigateToWallet = useCallback(() => {
    navigate({
      pathname: WALLET_PATH,
    })
  }, [navigate])

  return language ? (
    <SmallDialog
      title={intl.formatMessage(
        { defaultMessage: '翻译成 {language}' },
        { language: language.nativeName + ` (${language.name})` }
      )}
      open={open}
      onClose={onClose}
    >
      {isLoading ? (
        <Loading
          css={css`
            height: 200px;
          `}
        />
      ) : error ? (
        <ErrorPlaceholder error={error} />
      ) : modelList && currentModel ? (
        <>
          <SvgTranslate
            css={css`
              display: block;
              margin: 12px auto 0;
            `}
          />
          <div
            css={css`
              margin-top: 24px;
            `}
          >
            {intl.formatMessage({
              defaultMessage:
                '使用 AI 模型进行翻译需要消耗亿文币，内容越长消耗的亿文币越多。亿文币可通过充值、创作内容获得收益、平台活动奖励等方式获得。',
            })}
          </div>
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
              {intl.formatMessage({ defaultMessage: '选择 AI 模型' })}
            </div>
            <Select
              size='large'
              placeholder={intl.formatMessage({ defaultMessage: '请选择' })}
              options={modelList.map<SelectOptionProps<ModelCost>>((item) => ({
                key: item.id,
                label: modelLabelDict[item.id],
                value: item,
              }))}
              value={currentModel}
              onChange={onModelChange}
              css={css`
                max-width: 100%;
              `}
            />
            {modelList.length <= 1 && (
              <Clickable onClick={navigateToWallet}>
                <span
                  css={(theme) => css`
                    color: ${theme.color.body.primary};
                    ${theme.typography.tooltip}
                  `}
                >
                  {intl.formatMessage({
                    defaultMessage: 'LV2 以上会员可以使用 GPT-4 模型',
                  })}
                </span>
              </Clickable>
            )}
            {tokenCount != null && balance != null && (
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
                    defaultMessage:
                      '当前翻译约 {tokens} Tokens，预计花费 {cost} 文，钱包余额 {balance} 文',
                  },
                  {
                    tokens: tokenCount,
                    cost: <strong>{currentModel.cost}</strong>,
                    balance,
                  }
                )}
              </div>
            )}
          </div>
          <Button
            color='primary'
            disabled={disabled || balanceNotEnough}
            onClick={handleTranslate}
            css={css`
              margin-top: 24px;
            `}
          >
            {intl.formatMessage({ defaultMessage: '开始翻译' })}
          </Button>
          {balanceNotEnough && (
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
      ) : null}
    </SmallDialog>
  ) : null
}
