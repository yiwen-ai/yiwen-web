import CollectionSelector from '#/components/CollectionSelector'
import Loading from '#/components/Loading'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { type GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type Editor, type JSONContent } from '@tiptap/core'
import { RichTextEditor, Select, TextareaAutosize } from '@yiwen-ai/component'
import {
  isRTL,
  useAuth,
  type CreationDraft,
  type PublicationDraft,
  type UploadOutput,
} from '@yiwen-ai/store'
import { useCallback, useMemo, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { type Observable } from 'rxjs'
import { Xid } from 'xid-ts'

export default function CommonEditor({
  type,
  draft,
  updateDraft,
  isLoading,
  isSaving,
  withParent,
  upload,
}: {
  type: GroupViewType
  draft: CreationDraft | PublicationDraft
  updateDraft: (draft: Partial<CreationDraft | PublicationDraft>) => void
  isLoading: boolean
  isSaving: boolean
  withParent?: boolean
  upload?: (file: File) => Observable<UploadOutput>
}) {
  const intl = useIntl()
  const theme = useTheme()
  const { isAuthorized } = useAuth()
  const editorRef = useRef<Editor>(null)
  const { ref } = useResizeDetector<HTMLDivElement>()
  // const isNarrow = width <= BREAKPOINT.small

  const handleTitleChange = useCallback(
    (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateDraft({ title: ev.currentTarget.value })
    },
    [updateDraft]
  )

  const handleTitleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        editorRef.current?.commands.focus()
      }
    },
    []
  )

  const handleContentChange = useCallback(
    (content: JSONContent) => updateDraft({ content }),
    [updateDraft]
  )

  const handleParent = useCallback(
    (parent: string) => updateDraft({ parent: Xid.fromValue(parent) }),
    [updateDraft]
  )

  const gid = useMemo(
    () => (withParent && draft.gid ? Xid.fromValue(draft.gid).toString() : ''),
    [withParent, draft.gid]
  )

  const lang = document.documentElement.lang || window.navigator.language

  return !isAuthorized ? (
    <div
      css={(theme) => css`
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: ${theme.color.body.secondary};
      `}
    >
      {intl.formatMessage({ defaultMessage: '请登录后再操作' })}
    </div>
  ) : isLoading ? (
    <Loading />
  ) : (
    <>
      <div
        ref={ref}
        css={css`
          flex: 1;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
        `}
      >
        <div
          dir={isRTL(lang) ? 'rtl' : undefined}
          css={css`
            flex: 1;
            width: 100%;
            max-width: ${MAX_WIDTH};
            display: flex;
            flex-direction: column;
          `}
        >
          <TextareaAutosize
            placeholder={intl.formatMessage({ defaultMessage: '标题' })}
            value={draft.title}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            css={css`
              padding-top: 100px;
              border: none;
              ${theme.typography.h0}
              @media (max-width: ${BREAKPOINT.small}px) {
                padding-top: 24px;
              }
            `}
          />
          <RichTextEditor
            ref={editorRef}
            editable={!isSaving}
            content={draft.content}
            onChange={handleContentChange}
            upload={upload}
            css={css`
              .ProseMirror {
                padding-top: 24px;
                padding-bottom: 100px;
                @media (max-width: ${BREAKPOINT.small}px) {
                  padding-bottom: 24px;
                }
              }
            `}
          />
        </div>
      </div>
      <div
        css={css`
          padding: 0 24px;
          border-top: 1px solid ${theme.color.divider.secondary};
        `}
      >
        <ArticleSettings gid={gid} updateParent={handleParent} />
      </div>
    </>
  )
}

export interface ArticleSettingsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  gid?: string
  updateParent?: ((parent: string) => void) | undefined
}

function ArticleSettings({
  gid,
  updateParent,
  ...props
}: ArticleSettingsProps) {
  const intl = useIntl()
  const theme = useTheme()

  return (
    <div
      {...props}
      css={css`
        max-width: ${MAX_WIDTH};
        margin: auto;
        padding: 36px 0;
        display: none;
        flex-direction: column;
        gap: 24px;
      `}
    >
      <div
        css={css`
          ${theme.typography.bodyBold}
        `}
      >
        {intl.formatMessage({ defaultMessage: '文稿设置' })}
      </div>
      {gid && updateParent && (
        <Field label={intl.formatMessage({ defaultMessage: '归属合集：' })}>
          <CollectionSelector gid={gid} onSelect={updateParent} />
        </Field>
      )}
      <Field label={intl.formatMessage({ defaultMessage: '声明：' })}>
        <Select
          placeholder={intl.formatMessage({ defaultMessage: '请选择' })}
          options={[
            {
              key: 'original',
              label: intl.formatMessage({ defaultMessage: '原创' }),
              value: 'original',
            },
            {
              key: 'non-original',
              label: intl.formatMessage({ defaultMessage: '非原创' }),
              value: 'non-original',
            },
          ]}
        />
      </Field>
    </div>
  )

  function Field({
    label,
    ...props
  }: React.PropsWithChildren<{
    label: string
  }>) {
    return (
      <div
        css={css`
          display: flex;
          align-items: flex-start;
        `}
      >
        <span
          css={css`
            min-width: 80px;
            text-align: right;
          `}
        >
          {label}
        </span>
        <div
          css={css`
            display: flex;
            flex-wrap: wrap;
            align-items: center;
          `}
        >
          {props.children}
        </div>
      </div>
    )
  }
}
