import { css } from '@emotion/react'
import { type EditorOptions, type JSONContent } from '@tiptap/core'
import {
  Button,
  Header,
  RichTextEditor,
  Spinner,
  TextField,
} from '@yiwen-ai/component'
import { useAddCreation, type CreateCreationInput } from '@yiwen-ai/store'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'

export default function NewCreation() {
  const intl = useIntl()
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<JSONContent | undefined>()
  const onChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(ev.currentTarget.value)
  }, [])
  const onUpdate = useCallback<EditorOptions['onUpdate']>(({ editor }) => {
    setContent(editor.getJSON())
  }, [])
  const disabled = isSaving || !title || !content
  const addCreation = useAddCreation()
  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const item = await addCreation({
        title,
        content: content,
      } as CreateCreationInput)
      // TODO: redirect to the creation page
      // eslint-disable-next-line no-console
      console.log(item)
    } catch (error) {
      // TODO: show error
    } finally {
      setIsSaving(false)
    }
  }, [addCreation, content, title])

  return (
    <div
      css={css`
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      `}
    >
      <Header>
        <div
          css={css`
            flex: 1;
            margin: 0 40px;
            display: flex;
            justify-content: flex-end;
          `}
        >
          <Button disabled={disabled} onClick={onSave}>
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
            max-width: 856px;
            margin: 100px auto;
            padding: 24px;
          `}
        >
          <TextField
            size='large'
            placeholder={intl.formatMessage({ defaultMessage: '标题' })}
            value={title}
            onChange={onChange}
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
            initialContent={''}
            onUpdate={onUpdate}
            css={css`
              margin: 24px 0;
            `}
          />
        </main>
      </div>
    </div>
  )
}
