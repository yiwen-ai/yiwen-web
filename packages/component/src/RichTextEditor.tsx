import { css, useTheme } from '@emotion/react'
import { Details } from '@tiptap-pro/extension-details'
import { DetailsContent } from '@tiptap-pro/extension-details-content'
import { DetailsSummary } from '@tiptap-pro/extension-details-summary'
import { Emoji } from '@tiptap-pro/extension-emoji'
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import { UniqueID } from '@tiptap-pro/extension-unique-id'
import { type Editor, type Extensions } from '@tiptap/core'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Mention } from '@tiptap/extension-mention'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Typography } from '@tiptap/extension-typography'
import { Underline } from '@tiptap/extension-underline'
import { Youtube } from '@tiptap/extension-youtube'
import {
  BubbleMenu,
  EditorContent,
  useEditor,
  type EditorOptions,
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { nanoid } from 'nanoid'
import { forwardRef, memo, useImperativeHandle, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { IconButton, type IconButtonProps } from './Button'

export interface RichTextEditorProps extends Partial<EditorOptions> {
  className?: string
  initialContent?: EditorOptions['content']
}

export const RichTextEditor = memo(
  forwardRef(function RichTextEditor(
    {
      className,
      initialContent,
      content = null,
      ...props
    }: RichTextEditorProps,
    ref: React.Ref<Editor | null>
  ) {
    const intl = useIntl()
    const theme = useTheme()

    const extensions = useMemo<Extensions>(
      () => [
        Color,
        Details.configure({ persist: true }),
        DetailsContent,
        DetailsSummary,
        Emoji.configure({ enableEmoticons: true }),
        FontFamily,
        Image,
        Link.configure({
          protocols: ['mailto'],
          HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
        }),
        Mathematics,
        Mention,
        Placeholder.configure({
          placeholder: intl.formatMessage({ defaultMessage: '直接输入内容' }),
        }),
        StarterKit,
        Subscript,
        Superscript,
        Table.configure({ resizable: true }),
        TableCell,
        TableHeader,
        TableRow,
        TaskItem.configure({ nested: true }),
        TaskList,
        TextAlign,
        TextStyle,
        Typography,
        Underline,
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
            'taskItem',
          ],
          generateID: () => nanoid(6), // TODO: avoid collision
        }),
        Youtube,
      ],
      [intl]
    )

    const editor = useEditor(
      { ...props, content: initialContent ?? content, extensions },
      Object.values(props)
    )

    useImperativeHandle(ref, () => editor, [editor])

    const bubbleMenuItems: BubbleMenuItemProps[] | null = editor && [
      {
        iconName: 'h1',
        active: editor.isActive('heading', { level: 1 }),
        onClick: () => {
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        },
      },
      {
        iconName: 'h2',
        active: editor.isActive('heading', { level: 2 }),
        onClick: () => {
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        },
      },
      {
        iconName: 'h3',
        active: editor.isActive('heading', { level: 3 }),
        onClick: () => {
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        },
      },
      {
        iconName: 'bold',
        active: editor.isActive('bold'),
        onClick: () => {
          editor.chain().focus().toggleBold().run()
        },
      },
      {
        iconName: 'underline',
        active: editor.isActive('underline'),
        onClick: () => {
          editor.chain().focus().toggleUnderline().run()
        },
      },
      {
        iconName: 'italic',
        active: editor.isActive('italic'),
        onClick: () => {
          editor.chain().focus().toggleItalic().run()
        },
      },
    ]

    return (
      <>
        <EditorContent
          className={className}
          editor={editor}
          css={css`
            .ProseMirror {
              ${theme.typography.body};

              &:focus {
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

              a {
                display: inline-block;
                cursor: pointer;
                color: ${theme.color.link.normal};
                :hover {
                  color: ${theme.color.link.hover};
                }
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
            {bubbleMenuItems?.map(({ iconName, active, onClick, ...props }) => (
              <BubbleMenuItem
                key={iconName}
                iconName={iconName}
                active={active}
                onClick={onClick}
                {...props}
              />
            ))}
          </BubbleMenu>
        )}
      </>
    )
  })
)

interface BubbleMenuItemProps extends IconButtonProps {
  active: boolean
}

const BubbleMenuItem = memo(
  forwardRef(function BubbleMenuItem(
    { active, ...props }: BubbleMenuItemProps,
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
