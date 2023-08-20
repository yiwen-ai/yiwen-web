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
  FloatingMenu,
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
  placeholder?: string
  initialContent?: EditorOptions['content'] | undefined
}

export const RichTextEditor = memo(
  forwardRef(function RichTextEditor(
    {
      className,
      placeholder,
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
          placeholder:
            placeholder ??
            intl.formatMessage({ defaultMessage: '输入内容开始创作' }),
        }),
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
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
      [intl, placeholder]
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

    const floatingMenuItems: BubbleMenuItemProps[] | null = editor && [
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
      {
        iconName: 'ul',
        active: editor.isActive('bulletList'),
        onClick: () => {
          editor.chain().focus().toggleBulletList().run()
        },
      },
      {
        iconName: 'ol',
        active: editor.isActive('orderedList'),
        onClick: () => {
          editor.chain().focus().toggleOrderedList().run()
        },
      },
      {
        iconName: 'quote',
        active: editor.isActive('blockquote'),
        onClick: () => {
          editor.chain().focus().toggleBlockquote().run()
        },
      },
      {
        iconName: 'horizontal',
        active: editor.isActive('horizontalRule'),
        onClick: () => {
          editor.chain().focus().setHorizontalRule().run()
        },
      },
    ]

    const menuCSS = css`
      padding: 12px 16px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px 4px;
      background: ${theme.color.menu.background};
      border: 1px solid ${theme.color.menu.border};
      border-radius: 12px;
    `

    return (
      <>
        <EditorContent
          className={className}
          editor={editor}
          css={css`
            flex: 1;
            display: flex;
            flex-direction: column;

            .ProseMirror {
              flex: 1;
              ${theme.typography.body};

              &:focus {
                outline: none;
              }

              > * {
                margin-bottom: 0;
              }
              > * + * {
                margin-top: 20px;
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

              * > p {
                margin-top: unset;
                margin-bottom: unset;
              }

              blockquote {
                margin-left: 0;
                margin-right: 0;
                padding: 0 16px;
                border-left: 2px solid ${theme.color.divider.primary};
              }

              pre {
                padding: 20px 24px;
                background: ${theme.color.codeBlock.background};
              }

              ul,
              ol {
                padding-left: 24px;
              }

              li {
                padding-left: 4px;
              }

              > ul {
                list-style-type: disc;
                > li > ul {
                  list-style-type: circle;
                  > li > ul {
                    list-style-type: square;
                    > li > ul {
                      list-style-type: disc;
                      > li > ul {
                        list-style-type: circle;
                        > li > ul {
                          list-style-type: square;
                          > li > ul {
                            list-style-type: disc;
                            > li > ul {
                              list-style-type: circle;
                              > li > ul {
                                list-style-type: square;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }

              > ol {
                list-style-type: decimal;
                > li > ol {
                  list-style-type: lower-alpha;
                  > li > ol {
                    list-style-type: lower-roman;
                    > li > ol {
                      list-style-type: decimal;
                      > li > ol {
                        list-style-type: lower-alpha;
                        > li > ol {
                          list-style-type: lower-roman;
                          > li > ol {
                            list-style-type: decimal;
                            > li > ol {
                              list-style-type: lower-alpha;
                              > li > ol {
                                list-style-type: lower-roman;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }

              hr {
                border: none;
                border-top: 1px solid ${theme.color.divider.primary};
              }

              a {
                display: inline-block;
                cursor: pointer;
                color: ${theme.color.link.normal};
                :hover {
                  color: ${theme.color.link.hover};
                }
              }

              p.is-editor-empty::before,
              p.is-empty:only-child::before,
              style + p.is-empty:last-child::before {
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
          <FloatingMenu
            editor={editor}
            tippyOptions={{
              maxWidth: '246px',
              placement: 'bottom-start',
              duration: 100,
            }}
            css={menuCSS}
          >
            {floatingMenuItems?.map(
              ({ iconName, active, onClick, ...props }) => (
                <BubbleMenuItem
                  key={iconName}
                  iconName={iconName}
                  active={active}
                  onClick={onClick}
                  {...props}
                />
              )
            )}
          </FloatingMenu>
        )}
        {editor && (
          <BubbleMenu
            editor={editor}
            tippyOptions={{ maxWidth: '246px' }}
            css={menuCSS}
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
            background: ${theme.color.button.secondary.contained.hover
              .background};
          }
        `}
      />
    )
  })
)
