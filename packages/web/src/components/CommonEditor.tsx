import Loading from '#/components/Loading'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { type GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type Editor, type JSONContent } from '@tiptap/core'
import { RichTextEditor, Select, TextareaAutosize } from '@yiwen-ai/component'
import { type CreationDraft, type PublicationDraft } from '@yiwen-ai/store'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'

export default function CommonEditor({
  type,
  draft,
  updateDraft,
  isLoading,
  isSaving,
}: {
  type: GroupViewType
  draft: CreationDraft | PublicationDraft
  updateDraft: (draft: Partial<CreationDraft | PublicationDraft>) => void
  isLoading: boolean
  isSaving: boolean
}) {
  const intl = useIntl()
  const theme = useTheme()
  const editorRef = useRef<Editor>(null)
  const { width = 0, ref } = useResizeDetector<HTMLDivElement>()
  const isNarrow = width <= BREAKPOINT.small

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

  return isLoading ? (
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
              font-size: 42px;
              font-weight: 600;
              line-height: 60px;
              ${isNarrow &&
              css`
                padding-top: 24px;
              `}
            `}
          />
          <RichTextEditor
            ref={editorRef}
            editable={!isSaving}
            initialContent={draft.content}
            onChange={handleContentChange}
            css={css`
              .ProseMirror {
                padding-top: 24px;
                padding-bottom: 100px;
                ${isNarrow &&
                css`
                  padding-bottom: 24px;
                `}
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
        <ArticleSettings />
      </div>
    </>
  )
}

function ArticleSettings(props: React.HTMLAttributes<HTMLDivElement>) {
  const intl = useIntl()
  const theme = useTheme()

  return (
    <div
      {...props}
      css={css`
        max-width: ${MAX_WIDTH};
        margin: auto;
        padding: 16px 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      `}
    >
      <div
        css={css`
          ${theme.typography.bodyBold}
        `}
      >
        {intl.formatMessage({ defaultMessage: '文章设置' })}
      </div>
      <Field label={intl.formatMessage({ defaultMessage: '关键词：' })} />
      <Field label={intl.formatMessage({ defaultMessage: '声明：' })}>
        <Select
          placeholder={intl.formatMessage({ defaultMessage: '请选择' })}
          options={[
            {
              label: intl.formatMessage({ defaultMessage: '原创' }),
              value: 'original',
            },
            {
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
