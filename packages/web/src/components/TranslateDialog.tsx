import { css } from '@emotion/react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  Spinner,
} from '@yiwen-ai/component'
import { type Language } from '@yiwen-ai/store'
import { useIntl } from 'react-intl'
import ErrorPlaceholder from './ErrorPlaceholder'

export interface TranslateDialogProps {
  open: boolean
  onClose: () => void
  language: Language | undefined
  isLoading: boolean | undefined
  error: unknown
}

export default function TranslateDialog({
  open,
  onClose,
  language,
  isLoading,
  error,
}: TranslateDialogProps) {
  const intl = useIntl()

  return language ? (
    <AlertDialog open={open} onClose={onClose}>
      <AlertDialogBody
        css={css`
          padding: 48px 56px;
        `}
      >
        {isLoading ? (
          <>
            <Spinner />
            <div
              css={css`
                margin-top: 16px;
              `}
            >
              {intl.formatMessage(
                {
                  defaultMessage:
                    '「{language}」正在翻译，请稍后，翻译好后可在你的发布列表里进行修改和提交。',
                },
                { language: language.nativeName }
              )}
            </div>
          </>
        ) : error ? (
          <ErrorPlaceholder error={error} />
        ) : null}
      </AlertDialogBody>
      <AlertDialogClose />
    </AlertDialog>
  ) : null
}
