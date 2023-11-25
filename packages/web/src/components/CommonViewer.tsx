import { GROUP_DETAIL_PATH } from '#/App'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type JSONContent } from '@tiptap/core'
import { Button, Icon, RichTextViewer } from '@yiwen-ai/component'
import {
  ObjectKind,
  decode,
  isRTL,
  usePublication,
  type CollectionChildrenOutput,
  type CreationOutput,
  type PublicationOutput,
} from '@yiwen-ai/store'
import { useKeyDown } from '@yiwen-ai/util'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'
import CreatedBy from './CreatedBy'

export default function CommonViewer({
  type,
  item,
  isNarrow,
  gid,
  parent,
  prevItem,
  nextItem,
  footer,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type: GroupViewType
  item: CreationOutput | PublicationOutput | undefined
  isNarrow: boolean
  gid?: string | null | undefined
  parent?: string | null | undefined
  prevItem?: CollectionChildrenOutput | null | undefined
  nextItem?: CollectionChildrenOutput | null | undefined
  footer?: JSX.Element | null | undefined
}) {
  const intl = useIntl()
  const theme = useTheme()
  const navigate = useNavigate()

  const content = useMemo(
    () => item?.content && (decode(item.content) as JSONContent),
    [item?.content]
  )

  const [params, setParams] = useState({
    _gid: '',
    _cid: '',
    _language: '',
    _version: 0,
  })

  // preload next publication for better UX
  useEffect(() => {
    if (nextItem && nextItem.kind !== ObjectKind.Collection) {
      setParams({
        _gid: Xid.fromValue(nextItem.gid).toString(),
        _cid: Xid.fromValue(nextItem.cid).toString(),
        _language: nextItem.language,
        _version: nextItem.version,
      })
    }
  }, [nextItem, setParams])

  //#region fetch
  usePublication(params._gid, params._cid, params._language, params._version)

  // ArrowUp ArrowRight ArrowDown ArrowLeft
  const onKeyDown = useCallback(
    (key: string) => {
      switch (key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          if (prevItem) {
            navigate(genChildrenTo(prevItem))
          }
          break
        case 'ArrowDown':
        case 'ArrowRight':
          if (nextItem) {
            navigate(genChildrenTo(nextItem))
          }
          break
      }
    },
    [navigate, prevItem, nextItem]
  )

  useKeyDown(Boolean(prevItem || nextItem), onKeyDown)

  return item ? (
    <div
      dir={isRTL(item.language) ? 'rtl' : undefined}
      {...props}
      css={css`
        width: 100%;
        max-width: calc(${MAX_WIDTH} + 36px * 2);
        margin: 0 auto;
        padding: 0 36px;
        box-sizing: border-box;
        max-height: calc(100vh - 160px);
        overflow-y: auto;
        @media (max-width: ${BREAKPOINT.small}px) {
          padding: 0 16px;
          max-height: calc(100vh - 80px);
        }
      `}
    >
      <div
        role='heading'
        aria-level={1}
        css={css`
          ${theme.typography.h1}
          overflow-wrap: break-word;
          @media (max-width: ${BREAKPOINT.small}px) {
            ${theme.typography.h2}
          }
        `}
      >
        {item.title}
      </div>
      <Link
        to={{
          pathname: generatePath(GROUP_DETAIL_PATH, {
            gid: Xid.fromValue(item.gid).toString(),
            type,
          }),
        }}
        css={css`
          margin-top: 12px;
          display: flex;
          width: fit-content;
          max-width: 100%;
        `}
      >
        {item.group_info && (
          <CreatedBy
            item={item.group_info}
            timestamp={item.updated_at || item.created_at}
            css={css`
              max-width: 100%;
            `}
          />
        )}
      </Link>
      {item.summary && (
        <blockquote
          css={css`
            ${theme.typography.body}
            margin: 1em 0;
            padding: 1em 1.5em 1em 1em;
            border-left: 0.5em solid ${theme.color.body.primaryHover};
            background-color: ${theme.color.popover.background};
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
            box-shadow: ${theme.effect.card};
          `}
        >
          {item.summary}
        </blockquote>
      )}
      {content && (
        <RichTextViewer
          content={content}
          css={css`
            margin-top: 24px;
            margin-bottom: 48px;
            @media (max-width: ${BREAKPOINT.small}px) {
              margin-top: 20px;
              margin-bottom: 24px;
            }
          `}
        />
      )}
      {footer}
      {(prevItem || nextItem) && (
        <div
          css={css`
            display: flex;
            flex-direction: row;
            justify-content: center;
            width: 100%;
            gap: 24px;
            margin-bottom: 48px;
          `}
        >
          {prevItem && (
            <Link
              reloadDocument={prevItem.kind === ObjectKind.Collection}
              unstable_viewTransition={true}
              key={Xid.fromValue(prevItem.cid).toString()}
              to={genChildrenTo(prevItem)}
              css={css`
                display: block;
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '上一篇' })}
                color='secondary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
              >
                <Icon
                  name='arrow-up-s-line'
                  size={isNarrow ? 'small' : 'medium'}
                />
                <span>{intl.formatMessage({ defaultMessage: '上一篇' })}</span>
              </Button>
            </Link>
          )}
          {gid && parent && isNarrow && (
            <Link
              reloadDocument={false}
              unstable_viewTransition={true}
              key={parent}
              to={{
                pathname: generatePath(GROUP_DETAIL_PATH, {
                  gid,
                  type: GroupViewType.Collection,
                }),
                search: new URLSearchParams({
                  cid: parent,
                }).toString(),
              }}
              css={css`
                display: block;
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '目录' })}
                color='secondary'
                variant='outlined'
                size={'small'}
              >
                <Icon name='menu-line' size={'small'} />
                <span>{intl.formatMessage({ defaultMessage: '目录' })}</span>
              </Button>
            </Link>
          )}
          {nextItem && (
            <Link
              reloadDocument={nextItem.kind === ObjectKind.Collection}
              unstable_viewTransition={true}
              key={Xid.fromValue(nextItem.cid).toString()}
              to={genChildrenTo(nextItem)}
              css={css`
                display: block;
              `}
            >
              <Button
                title={intl.formatMessage({ defaultMessage: '下一篇' })}
                color='secondary'
                variant='outlined'
                size={isNarrow ? 'small' : 'large'}
              >
                <Icon
                  name='arrow-down-s-line'
                  size={isNarrow ? 'small' : 'medium'}
                />
                <span>{intl.formatMessage({ defaultMessage: '下一篇' })}</span>
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  ) : null
}

function genChildrenTo(item: CollectionChildrenOutput) {
  return {
    pathname: generatePath(GROUP_DETAIL_PATH, {
      gid: Xid.fromValue(item.gid).toString(),
      type:
        item.kind === ObjectKind.Collection
          ? GroupViewType.Collection
          : GroupViewType.Publication,
    }),
    search:
      item.kind === ObjectKind.Collection
        ? new URLSearchParams({
            cid: Xid.fromValue(item.cid).toString(),
          }).toString()
        : new URLSearchParams({
            parent: Xid.fromValue(item.parent).toString(),
            cid: Xid.fromValue(item.cid).toString(),
            language: item.language,
            version: String(item.version),
          }).toString(),
  }
}
