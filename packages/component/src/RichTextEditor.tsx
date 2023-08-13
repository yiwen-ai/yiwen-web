import { css, useTheme } from '@emotion/react'
import { UniqueID } from '@tiptap-pro/extension-unique-id'
import { type Editor } from '@tiptap/core'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { EditorContent, useEditor, type EditorOptions } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { nanoid } from 'nanoid'
import { forwardRef, memo, useImperativeHandle } from 'react'
import { useIntl } from 'react-intl'

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
      <EditorContent
        className={className}
        editor={editor}
        css={css`
          .ProseMirror {
            :focus {
              outline: none;
            }

            > * + * {
              margin-top: 0.75em;
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
    )
  })
)
