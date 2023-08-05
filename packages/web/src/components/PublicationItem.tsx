import { css, useTheme } from '@emotion/react'
import { Button, Icon } from '@yiwen-ai/component'
import { type PublicationOutput } from '@yiwen-ai/store'
import { useIntl } from 'react-intl'

export default function PublicationItem(props: { item: PublicationOutput }) {
  const intl = useIntl()
  const theme = useTheme()

  return (
    <div
      css={css`
        padding: 32px 40px;
        border: 1px solid ${theme.color.divider.primary};
        border-radius: 12px;
      `}
    >
      <div
        css={css`
          ${theme.typography.h3}
        `}
      >
        {props.item.title}
      </div>
      {props.item.summary && (
        <div
          css={css`
            margin-top: 12px;
          `}
        >
          {props.item.summary}
        </div>
      )}
      <div
        css={css`
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        <Button color='primary' variant='outlined' size='small'>
          <Icon name='edit' size='small' />
          <span>{intl.formatMessage({ defaultMessage: '编辑' })}</span>
        </Button>
      </div>
    </div>
  )
}
