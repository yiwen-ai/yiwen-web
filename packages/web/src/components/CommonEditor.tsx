import { GROUP_DETAIL_PATH, SetHeaderProps } from '#/App'
import Loading from '#/components/Loading'
import { type GroupDetailTabKey } from '#/pages/group/[gid]'
import { MAX_WIDTH } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { type Editor, type EditorOptions } from '@tiptap/core'
import {
  Button,
  RichTextEditor,
  Select,
  Spinner,
  TextareaAutosize,
  useToast,
} from '@yiwen-ai/component'
import {
  toMessage,
  type useEditCreation,
  type useEditPublication,
} from '@yiwen-ai/store'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'
import { generatePath, useNavigate } from 'react-router-dom'
import { Xid } from 'xid-ts'

export default function CommonEditor({
  type,
  store,
}: {
  type: GroupDetailTabKey
  store: ReturnType<typeof useEditCreation | typeof useEditPublication>
}) {
  const intl = useIntl()
  const theme = useTheme()
  const { push, render } = useToast()
  const navigate = useNavigate()
  const { draft, updateDraft, isLoading, isDisabled, isSaving, save } = store
  const editorRef = useRef<Editor>(null)

  const handleTitleUpdate = useCallback(
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

  const handleContentUpdate = useCallback<EditorOptions['onUpdate']>(
    ({ editor }) => {
      updateDraft({ content: editor.getJSON() })
    },
    [updateDraft]
  )

  const handleSave = useCallback(async () => {
    try {
      const { gid } = await save()
      push({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      navigate({
        pathname: generatePath(GROUP_DETAIL_PATH, {
          gid: Xid.fromValue(gid).toString(),
        }),
        search: new URLSearchParams({
          tab: type,
        }).toString(),
      })
    } catch (error) {
      push({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '保存失败' }),
        description: toMessage(error),
      })
    }
  }, [intl, navigate, push, save, type])

  return (
    <>
      {render()}
      <SetHeaderProps>
        <div
          css={css`
            flex: 1;
            margin: 0 40px;
            display: flex;
            justify-content: flex-end;
          `}
        >
          <Button color='primary' disabled={isDisabled} onClick={handleSave}>
            {isSaving && (
              <Spinner
                size='small'
                css={css`
                  margin-right: 8px;
                  color: inherit;
                `}
              />
            )}
            {intl.formatMessage({ defaultMessage: '保存' })}
          </Button>
        </div>
      </SetHeaderProps>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <div
            css={css`
              flex: 1;
              max-width: ${MAX_WIDTH};
              margin: 0 auto;
              padding: 0 24px;
              display: flex;
              flex-direction: column;
              overflow-y: auto;
            `}
          >
            <TextareaAutosize
              placeholder={intl.formatMessage({ defaultMessage: '标题' })}
              value={draft.title}
              onChange={handleTitleUpdate}
              onKeyDown={handleTitleKeyDown}
              css={css`
                margin-top: 100px;
                border: none;
                font-size: 42px;
                font-weight: 600;
                line-height: 60px;
              `}
            />
            <RichTextEditor
              ref={editorRef}
              initialContent={draft.content}
              editable={!isSaving}
              onUpdate={handleContentUpdate}
              css={css`
                margin: 24px 0;

                .ProseMirror {
                  padding-bottom: 100px;
                }
              `}
            />
          </div>
          <div
            css={css`
              border-top: 1px solid ${theme.color.divider.secondary};
            `}
          >
            <ArticleSettings
              css={css`
                max-width: ${MAX_WIDTH};
                margin: auto;
              `}
            />
          </div>
        </>
      )}
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
        padding: 16px 24px;
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
