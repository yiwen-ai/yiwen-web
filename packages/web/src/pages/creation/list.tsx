import { NEW_CREATION_PATH, SetHeaderProps } from '#/App'
import { css, useTheme } from '@emotion/react'
import {
  Avatar,
  Button,
  Icon,
  Menu,
  Spinner,
  useToast,
  type MenuItemProps,
  type ToastAPI,
} from '@yiwen-ai/component'
import { useMyDefaultGroup, type Group } from '@yiwen-ai/store'
import { type ModalRef } from '@yiwen-ai/util'
import { useCallback, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

export default function CreationList() {
  const intl = useIntl()
  const toast = useToast()
  const group = useMyDefaultGroup()

  return (
    <>
      {toast.render()}
      <SetHeaderProps>
        <div
          css={css`
            flex: 1;
            margin: 0 40px 0 12px;
            display: flex;
            align-items: center;
            gap: 40px;
          `}
        >
          {group?.name && (
            <span>
              {intl.formatMessage(
                { defaultMessage: '{name} 的创作群组' },
                { name: group.name }
              )}
            </span>
          )}
          <Link
            to={NEW_CREATION_PATH}
            css={css`
              margin-left: auto;
            `}
          >
            <Button variant='outlined'>
              {intl.formatMessage({ defaultMessage: '创作内容' })}
            </Button>
          </Link>
        </div>
      </SetHeaderProps>
      {!group ? (
        <div
          css={css`
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <Spinner />
        </div>
      ) : (
        <div>
          <GroupPart toast={toast} group={group} />
        </div>
      )}
    </>
  )
}

function GroupPart({
  toast: { push },
  group,
}: {
  toast: ToastAPI
  group: Group
}) {
  const intl = useIntl()
  const theme = useTheme()
  const logo = group.logo || group.owner?.picture

  //#region menu
  const menuRef = useRef<ModalRef>(null)
  const handleDelete = useCallback(() => {
    // TODO
    push({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '删除' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
    menuRef.current?.close()
  }, [intl, push])
  const handleSubscribe = useCallback(() => {
    // TODO
    push({
      type: 'warning',
      message: intl.formatMessage({ defaultMessage: '订阅' }),
      description: intl.formatMessage({ defaultMessage: '功能暂未实现' }),
    })
    menuRef.current?.close()
  }, [intl, push])
  const menuItems = useMemo<readonly MenuItemProps[]>(
    () => [
      {
        label: intl.formatMessage({ defaultMessage: '删除' }),
        onClick: handleDelete,
      },
      {
        label: intl.formatMessage({ defaultMessage: '订阅' }),
        onClick: handleSubscribe,
      },
    ],
    [handleDelete, handleSubscribe, intl]
  )
  //#endregion

  return (
    <div
      css={css`
        max-width: 1080px;
        margin: 0 auto;
        padding: 40px 24px;
        border-bottom: 1px solid ${theme.color.divider.primary};
      `}
    >
      {group.slogan && (
        <h2
          css={css`
            margin-bottom: 12px;
            ${theme.typography.h3}
          `}
        >
          {group.slogan}
        </h2>
      )}
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        {logo && (
          <Avatar
            src={logo}
            alt={group.name}
            css={css`
              margin-right: 12px;
            `}
          />
        )}
        <span
          css={css`
            color: ${theme.color.body.secondary};
          `}
        >
          {intl.formatMessage(
            { defaultMessage: '{owner} · {count} 篇公开文章' },
            { owner: group.owner?.name || group.name, count: 0 }
          )}
        </span>
      </div>
      <div
        css={css`
          margin-top: 24px;
          display: flex;
          align-items: center;
          gap: 24px;
        `}
      >
        <Button variant='outlined'>
          {intl.formatMessage({ defaultMessage: '编辑简介' })}
        </Button>
        <Menu
          ref={menuRef}
          anchor={(props) => (
            <div
              {...props}
              css={css`
                display: flex;
                align-items: center;
                cursor: pointer;
              `}
            >
              <Icon name='more' />
            </div>
          )}
          items={menuItems}
        />
      </div>
    </div>
  )
}
