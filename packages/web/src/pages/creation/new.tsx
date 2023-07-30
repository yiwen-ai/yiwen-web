import { css, useTheme } from '@emotion/react'
import { type Editor, type EditorOptions } from '@tiptap/core'
import {
  Button,
  Header,
  RichTextEditor,
  Select,
  Spinner,
  TextField,
  useToast,
} from '@yiwen-ai/component'
import { toMessage, useAddCreation } from '@yiwen-ai/store'
import type React from 'react'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'

const MAX_WIDTH = 800

export default function NewCreation() {
  const intl = useIntl()
  const theme = useTheme()
  const { push, render } = useToast()
  const editorRef = useRef<Editor>(null)

  const { draft, updateDraft, isDisabled, isSaving, save, reset } =
    useAddCreation()

  const handleTitleUpdate = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      updateDraft({ title: ev.currentTarget.value })
    },
    [updateDraft]
  )

  const handleContentUpdate = useCallback<EditorOptions['onUpdate']>(
    ({ editor }) => {
      updateDraft({ content: editor.getJSON() })
    },
    [updateDraft]
  )

  const handleSave = useCallback(async () => {
    try {
      await save()
      reset()
      editorRef.current?.commands.clearContent(true)
      push({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      // TODO: redirect to the creation page
    } catch (error) {
      push({
        type: 'warning',
        message: intl.formatMessage({ defaultMessage: '保存失败' }),
        description: toMessage(error),
      })
    }
  }, [intl, push, reset, save])

  return (
    <div
      css={css`
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `}
    >
      {render()}
      <Header>
        <div
          css={css`
            flex: 1;
            margin: 0 40px;
            display: flex;
            justify-content: flex-end;
          `}
        >
          <Button disabled={isDisabled} onClick={handleSave}>
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
      </Header>
      <div
        css={css`
          flex: 1;
          overflow-y: auto;
        `}
      >
        <main
          css={css`
            max-width: ${MAX_WIDTH}px;
            margin: 100px auto;
            padding: 24px;
          `}
        >
          <TextField
            size='large'
            placeholder={intl.formatMessage({ defaultMessage: '标题' })}
            value={draft.title}
            onChange={handleTitleUpdate}
            css={css`
              height: 60px;
              padding: 0;
              border: none;
              font-size: 42px;
              font-weight: 600;
              line-height: 60px;
            `}
          />
          <RichTextEditor
            ref={editorRef}
            initialContent={''}
            onUpdate={handleContentUpdate}
            css={css`
              margin: 24px 0;
            `}
          />
        </main>
      </div>
      <div
        css={css`
          border-top: 1px solid ${theme.color.divider.secondary};
        `}
      >
        <ArticleSettings
          css={css`
            max-width: ${MAX_WIDTH}px;
            margin: auto;
          `}
        />
      </div>
    </div>
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
