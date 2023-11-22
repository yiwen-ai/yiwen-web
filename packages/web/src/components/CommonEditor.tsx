import Loading from '#/components/Loading'
import { BREAKPOINT, MAX_WIDTH } from '#/shared'
import { type GroupViewType } from '#/store/useGroupDetailPage'
import { css, useTheme } from '@emotion/react'
import { type Editor, type JSONContent } from '@tiptap/core'
import { RichTextEditor, TextareaAutosize } from '@yiwen-ai/component'
import {
  isRTL,
  useAuth,
  type CreationDraft,
  type PublicationDraft,
  type UploadOutput,
} from '@yiwen-ai/store'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'
import { useResizeDetector } from 'react-resize-detector'
import { type Observable } from 'rxjs'

export default function CommonEditor({
  type,
  draft,
  updateDraft,
  isLoading,
  isSaving,
  upload,
}: {
  type: GroupViewType
  draft: CreationDraft | PublicationDraft
  updateDraft: (draft: Partial<CreationDraft | PublicationDraft>) => void
  isLoading: boolean
  isSaving: boolean
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
      updateDraft({ title: ev.currentTarget.value.trim() })
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
  )
}
