import { css } from '@emotion/react'
import { Button, Spinner, TextareaAutosize } from '@yiwen-ai/component'
import { useCallback, useId } from 'react'
import { useIntl } from 'react-intl'
import SmallDialog from './SmallDialog'

interface CreateFromLinkDialogProps {
  open: boolean
  onClose: () => void
  link: string
  onLinkChange: (link: string) => void
  isCrawling: boolean
  disabled: boolean
  onCrawl: () => void
}

export default function CreateFromLinkDialog({
  open,
  onClose,
  link,
  onLinkChange,
  disabled,
  isCrawling,
  onCrawl,
}: CreateFromLinkDialogProps) {
  const intl = useIntl()
  const id = useId()

  const handleChange = useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      onLinkChange(ev.currentTarget.value)
    },
    [onLinkChange]
  )

  return (
    <SmallDialog
      open={open}
      onClose={onClose}
      title={intl.formatMessage({ defaultMessage: '从链接创作' })}
    >
      {isCrawling ? (
        <>
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 16px;
            `}
          >
            <span>
              {intl.formatMessage({
                defaultMessage: '正在通过以下链接获取，请稍后',
              })}
            </span>
            <Spinner />
          </div>
          <div
            css={(theme) => css`
              margin-top: 12px;
              color: ${theme.color.body.secondary};
            `}
          >
            {link}
          </div>
        </>
      ) : (
        <>
          <div id={id}>
            {intl.formatMessage({ defaultMessage: '输入文章链接来获取' })}
          </div>
          <TextareaAutosize
            aria-labelledby={id}
            minRows={2}
            value={link}
            onChange={handleChange}
            css={(theme) => css`
              margin-top: 12px;
              padding: 4px 8px;
              border-radius: 8px;
              border: 1px solid ${theme.color.divider.default};
              background: ${theme.color.body.background};
            `}
          />
          <Button
            color='primary'
            disabled={disabled}
            onClick={onCrawl}
            css={css`
              margin-top: 24px;
            `}
          >
            {intl.formatMessage({ defaultMessage: '确定' })}
          </Button>
        </>
      )}
    </SmallDialog>
  )
}
