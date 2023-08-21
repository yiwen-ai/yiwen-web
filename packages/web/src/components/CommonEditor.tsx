import { GROUP_VIEW_PATH, SetHeaderProps } from '#/App'
import Loading from '#/components/Loading'
import { GroupDetailTabKey } from '#/pages/group/[gid]'
import { MAX_WIDTH } from '#/shared'
import { css, useTheme } from '@emotion/react'
import { type Editor, type JSONContent } from '@tiptap/core'
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
  type CreationOutput,
  type PublicationOutput,
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

  const handleSave = useCallback(async () => {
    try {
      const item = await save()
      const gid = item.gid
      let cid: Uint8Array
      const searchParams = new URLSearchParams({ tab: type })
      switch (type) {
        case GroupDetailTabKey.Creation:
          cid = (item as CreationOutput).id
          break
        case GroupDetailTabKey.Publication:
          cid = (item as PublicationOutput).cid
          searchParams.set('language', item.language)
          searchParams.set('version', item.version.toString())
          break
      }
      push({
        type: 'success',
        message: intl.formatMessage({ defaultMessage: '保存成功' }),
      })
      navigate({
        pathname: generatePath(GROUP_VIEW_PATH, {
          gid: Xid.fromValue(gid).toString(),
          cid: Xid.fromValue(cid).toString(),
          type,
        }),
        search: searchParams.toString(),
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
