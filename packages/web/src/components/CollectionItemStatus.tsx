import { css, useTheme } from '@emotion/react'
import { CollectionStatus } from '@yiwen-ai/store'
import { useMemo, type HTMLAttributes } from 'react'
import { useIntl } from 'react-intl'

interface CollectionItemStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: CollectionStatus
}

export default function CollectionItemStatus({
  status,
  ...props
}: CollectionItemStatusProps) {
  const intl = useIntl()
  const theme = useTheme()

  const { label, color } = useMemo(() => {
    switch (status) {
      case CollectionStatus.Deleted:
        return {
          label: intl.formatMessage({ defaultMessage: '已删除' }),
          color: theme.palette.orange,
        }
      case CollectionStatus.Archived:
        return {
          label: intl.formatMessage({ defaultMessage: '已归档' }),
          color: theme.palette.grayLight,
        }
      case CollectionStatus.Private:
        return {
          label: intl.formatMessage({ defaultMessage: '群管理员可见' }),
          color: theme.palette.primaryNormal,
        }
      case CollectionStatus.Internal:
        return {
          label: intl.formatMessage({ defaultMessage: '群内可见' }),
          color: theme.palette.green,
        }
      case CollectionStatus.Public:
        return {
          label: intl.formatMessage({
            defaultMessage: '已公开，外部可见',
          }),
          color: theme.palette.green,
        }
    }
  }, [
    intl,
    status,
    theme.palette.grayLight,
    theme.palette.green,
    theme.palette.orange,
    theme.palette.primaryNormal,
  ])

  return (
    <span
      {...props}
      css={css`
        color: ${color};
      `}
    >
      {label}
    </span>
  )
}
