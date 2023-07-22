import { css } from '@emotion/react'
import { type Editor, type EditorOptions, type JSONContent } from '@tiptap/core'
import {
  Button,
  Header,
  RichTextEditor,
  Spinner,
  TextField,
} from '@yiwen-ai/component'
import { encode, useAddCreation, useMyGroupList } from '@yiwen-ai/store'
import { nanoid } from 'nanoid'
import { useCallback, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

export default function NewCreation() {
  const intl = useIntl()
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const editorRef = useRef<Editor>(null)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<JSONContent | undefined>()
  const onChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(ev.currentTarget.value)
  }, [])
  const onUpdate = useCallback<EditorOptions['onUpdate']>(({ editor }) => {
    setContent(editor.getJSON())
  }, [])
  const { groupList } = useMyGroupList()
  const defaultGroupId = groupList?.[0]?.id
  const disabled = isSaving || !title || !content || !defaultGroupId
  const addCreation = useAddCreation()
  const onSave = useCallback(async () => {
    try {
      setIsSaving(true)
      const item = await addCreation({
        gid: defaultGroupId!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
        title,
        description: 'description...',
        summary: 'summary - wiwi',
        content: encode(
          (() => {
            const content2 = { ...content }
            content2.content = (content2.content ?? []).map(addId)
            return content2

            // TODO: remove this temporary solution
            function addId(node: JSONContent): JSONContent {
              const node2: JSONContent = {
                ...node,
                attrs: { id: nanoid(6), ...node.attrs },
              }
              if (node.content) {
                node2.content = node.content.map(addId)
              }
              return node2
            }
          })()
        ),
        language: 'eng',
        original_url: 'https://www.yiwen.ltd/',
        cover: 'https://placehold.co/600x400',
        license: 'https://www.yiwen.ltd/',
      })
      // TODO: redirect to the creation page
      // eslint-disable-next-line no-console
      console.log(item)
      setTitle('')
      editorRef.current?.commands.clearContent(true)
    } catch (error) {
      // TODO: show error
    } finally {
      setIsSaving(false)
    }
  }, [addCreation, content, defaultGroupId, title])

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
            ref={editorRef}
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
