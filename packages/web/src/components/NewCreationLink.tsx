import { NEW_CREATION_PATH } from '#/App'
import { css } from '@emotion/react'
import { StructuredTileButton } from '@yiwen-ai/component'
import { useIntl } from 'react-intl'
import { Link, type LinkProps } from 'react-router-dom'

export default function NewCreationLink(props: Omit<LinkProps, 'to'>) {
  const intl = useIntl()

  return (
    <Link
      to={NEW_CREATION_PATH}
      {...props}
      css={css`
        display: flex;
        flex-direction: column;
      `}
    >
      <StructuredTileButton
        text={intl.formatMessage({
          defaultMessage: '我有内容，去创作',
        })}
        icon='lampon'
        description={intl.formatMessage({
          defaultMessage: '用 AI 进行语义搜索和全文智能翻译',
        })}
      />
    </Link>
  )
}
