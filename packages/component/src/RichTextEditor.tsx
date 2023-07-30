import { css, useTheme } from '@emotion/react'
import { UniqueID } from '@tiptap-pro/extension-unique-id'
import { type Editor } from '@tiptap/core'
import { Placeholder } from '@tiptap/extension-placeholder'
import { EditorContent, useEditor, type EditorOptions } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { nanoid } from 'nanoid'
import { forwardRef, memo, useImperativeHandle } from 'react'

export interface RichTextEditorProps extends Partial<EditorOptions> {
  className?: string
  initialContent?: EditorOptions['content']
}

export const RichTextEditor = memo(
  forwardRef(function RichTextEditor(
    { className, initialContent, ...props }: RichTextEditorProps,
    ref: React.Ref<Editor | null>
  ) {
    const theme = useTheme()
    const editor = useEditor(
      {
        ...props,
        content: initialContent ?? props.content ?? '',
        extensions: [
          StarterKit,
          UniqueID.configure({
            attributeName: 'id',
            types: ['heading', 'paragraph'],
            generateID: () => nanoid(6),
          }),
          // TODO: multiple placeholders
          Placeholder.configure({
            placeholder: '直接输入内容',
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
