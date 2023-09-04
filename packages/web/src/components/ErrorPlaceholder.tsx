import { ReactComponent as SvgKnowledgeGraph } from '#/assets/knowledge-graph.svg'
import { css, useTheme } from '@emotion/react'
import { Button } from '@yiwen-ai/component'
import { RequestError, toMessage } from '@yiwen-ai/store'
import { useMemo, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

export default function ErrorPlaceholder({
  error,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  error: unknown
}) {
  const intl = useIntl()
  const theme = useTheme()

  const [status, , message] = useMemo(() => {
    return error instanceof RequestError
      ? [error.status, error.name, error.message]
      : [undefined, undefined, toMessage(error)]
  }, [error])

  const [title, description] = useMemo(() => {
    switch (status) {
      case 403:
        return [
          intl.formatMessage({
            defaultMessage: '你访问的内容暂时无法查看，请稍后再试',
          }),
          undefined,
        ]
      case 404:
        return [
          intl.formatMessage({ defaultMessage: '你访问的内容不存在' }),
          undefined,
        ]
      default:
        return [
          intl.formatMessage({ defaultMessage: '发生错误，请稍后再试' }),
          message,
        ]
    }
  }, [intl, message, status])

  return (
    <div
      {...props}
      css={css`
        display: flex;
        flex-direction: column;
        text-align: center;
      `}
    >
      <SvgKnowledgeGraph role='img' aria-hidden={true} />
      <div
        css={css`
          margin-top: 24px;
          ${theme.typography.h1}
        `}
      >
        {title}
      </div>
      {description && (
        <pre
          css={css`
            margin-top: 20px;
            color: ${theme.color.body.secondary};
            white-space: pre-wrap;
            word-break: break-all;
          `}
        >
          <code>{description}</code>
        </pre>
      )}
      <Link
        to='/'
        css={css`
          margin-top: 32px;
        `}
      >
        <Button color='primary'>
          {intl.formatMessage({ defaultMessage: '返回首页' })}
        </Button>
      </Link>
    </div>
  )
}
