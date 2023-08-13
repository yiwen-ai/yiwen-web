import { css, useTheme } from '@emotion/react'
import { UniqueID } from '@tiptap-pro/extension-unique-id'
import { type Editor } from '@tiptap/core'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { Underline } from '@tiptap/extension-underline'
import {
  BubbleMenu,
  EditorContent,
  useEditor,
  type EditorOptions,
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { nanoid } from 'nanoid'
import { forwardRef, memo, useImperativeHandle } from 'react'
import { useIntl } from 'react-intl'
import { IconButton, type IconButtonProps } from './Button'

export interface RichTextEditorProps extends Partial<EditorOptions> {
  className?: string
  initialContent?: EditorOptions['content']
}

export const RichTextEditor = memo(
  forwardRef(function RichTextEditor(
    { className, initialContent, ...props }: RichTextEditorProps,
    ref: React.Ref<Editor | null>
  ) {
    const intl = useIntl()
    const theme = useTheme()
    const editor = useEditor(
      {
        ...props,
        content: initialContent ?? props.content ?? '',
        extensions: [
          StarterKit,
          Underline,
          Table.configure({
            resizable: true,
          }),
          TableRow,
          TableHeader,
          TableCell,
          UniqueID.configure({
            attributeName: 'id',
            types: [
              'blockquote',
              'codeBlock',
              'detailsContent',
              'detailsSummary',
              'heading',
              'listItem',
              'paragraph',
              'tableCell',
              'tableHeader',
            ],
            generateID: () => nanoid(6),
          }),
          Placeholder.configure({
            placeholder: intl.formatMessage({ defaultMessage: '直接输入内容' }),
          }),
        ],
      },
      [
        props.content,
        props.autofocus,
        props.editable,
        props.editorProps,
        props.parseOptions,
        props.onBeforeCreate,
        props.onCreate,
        props.onUpdate,
        props.onSelectionUpdate,
        props.onTransaction,
        props.onFocus,
        props.onBlur,
        props.onDestroy,
      ]
    )

    useImperativeHandle(ref, () => editor, [editor])

    return (
      <>
        <EditorContent
          className={className}
          editor={editor}
          css={css`
            .ProseMirror {
              :focus {
                outline: none;
              }

              h1 {
                font-size: 28px;
                font-weight: 600;
                line-height: 36px;
              }

              h2 {
                font-size: 24px;
                font-weight: 600;
                line-height: 32px;
              }

              h3 {
                font-size: 20px;
                font-weight: 600;
                line-height: 28px;
              }

              > * {
                margin: unset;
                + * {
                  margin-top: 20px;
                }
              }

              p.is-empty:first-of-type::before {
                color: ${theme.color.input.placeholder};
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
              }
            }
          `}
        />
        {editor && (
          <BubbleMenu
            editor={editor}
            css={css`
              padding: 12px 16px;
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 4px;
              background: ${theme.color.menu.background};
              border: 1px solid ${theme.color.menu.border};
              border-radius: 12px;
            `}
          >
            <BubbleMenuItem
              iconName='h1'
              active={editor.isActive('heading', { level: 1 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            />
            <BubbleMenuItem
              iconName='h2'
              active={editor.isActive('heading', { level: 2 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
            <BubbleMenuItem
              iconName='h3'
              active={editor.isActive('heading', { level: 3 })}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            />
            <BubbleMenuItem
              iconName='bold'
              active={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <BubbleMenuItem
              iconName='underline'
              active={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
            <BubbleMenuItem
              iconName='italic'
              active={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
          </BubbleMenu>
        )}
      </>
    )
  })
)

const BubbleMenuItem = memo(
  forwardRef(function BubbleMenuItem(
    { active, ...props }: IconButtonProps & { active: boolean },
    ref: React.Ref<HTMLButtonElement>
  ) {
    const theme = useTheme()

    return (
      <IconButton
        data-active={active ? '' : undefined}
        shape='rounded'
        size='medium'
        iconSize='small'
        {...props}
        ref={ref}
        css={css`
          border-radius: 8px;
          color: ${theme.color.body.primary} !important;
          &[data-active] {
            background: ${theme.color.menu.item.hover.background};
          }
        `}
      />
    )
  })
)
