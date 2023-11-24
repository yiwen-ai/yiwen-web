import { css, useTheme, type Theme } from '@emotion/react'
import { Details } from '@tiptap-pro/extension-details'
import { DetailsContent } from '@tiptap-pro/extension-details-content'
import { DetailsSummary } from '@tiptap-pro/extension-details-summary'
import { Emoji } from '@tiptap-pro/extension-emoji'
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import { UniqueID } from '@tiptap-pro/extension-unique-id'
import {
  createDocument,
  type EditorOptions,
  type Extensions,
  type FocusPosition,
  type JSONContent,
  type NodeViewProps,
} from '@tiptap/core'
// import { FontFamily } from '@tiptap/extension-font-family'
// import { Color } from '@tiptap/extension-color'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Image, type ImageOptions } from '@tiptap/extension-image'
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
import { Plugin, PluginKey } from '@tiptap/pm/state' // eslint-disable-line import/named
import {
  BubbleMenu,
  EditorContent,
  FloatingMenu,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type BubbleMenuProps,
  type FloatingMenuProps,
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { shouldUpload, type UploadOutput } from '@yiwen-ai/store'
import { isBlobURL } from '@yiwen-ai/util'
import 'highlight.js/styles/github-dark.css'
import 'katex/dist/katex.min.css'
import { createLowlight, common as lowlightCommon } from 'lowlight'
import { nanoid } from 'nanoid'
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { useIntl } from 'react-intl'
import { concatMap, from, type Observable, type Subscription } from 'rxjs'
import { IconButton, type IconButtonProps } from './Button'
import { TextField } from './TextField'

Mathematics.options.katexOptions = {} // required
const lowlight = createLowlight(lowlightCommon)

// eslint-disable-next-line react-refresh/only-export-components
export const getExtensions = ({
  image,
  placeholder,
}: {
  image?: Partial<ImageUploadOptions>
  placeholder?: string
} = {}): Extensions => [
  // Color, // should handle color in dark theme
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Details.configure({ persist: true }),
  DetailsContent,
  DetailsSummary,
  Emoji.configure({ enableEmoticons: true }),
  // FontFamily,
  ImageUpload.configure(image),
  Link.configure({
    protocols: [],
    autolink: false,
    linkOnPaste: true,
    openOnClick: false,
    HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    validate: (href) => (href ? href.startsWith('https://') : false),
  }),
  Mathematics.configure({ katexOptions: { strict: false } }),
  Mention,
  Placeholder.configure({ placeholder: placeholder ?? '' }),
  StarterKit.configure({
    codeBlock: false,
    heading: { levels: [1, 2, 3, 4, 5, 6] },
  }),
  Subscript,
  Superscript,
  Table.configure({ resizable: true }),
  TableCell,
  TableHeader,
  TableRow,
  TaskItem.configure({ nested: true }),
  TaskList,
  TextAlign.configure({
    types: [
      'heading',
      'paragraph',
      'codeBlock',
      'blockquote',
      'table',
      'tableCell',
    ],
  }),
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
]

export interface RichTextEditorProps {
  className?: string
  dir?: string | undefined
  editable?: boolean
  autofocus?: FocusPosition
  placeholder?: string
  initialContent?: JSONContent | null | undefined
  content?: JSONContent | null | undefined
  onChange?: (content: JSONContent) => void
  upload?: ((file: File) => Observable<UploadOutput>) | null | undefined
}

export const RichTextViewer = memo(
  forwardRef(
    (
      {
        className,
        dir,
        placeholder,
        initialContent = null,
        content,
        ...props
      }: RichTextEditorProps,
      ref
    ) => {
      const theme = useTheme()
      const editor = useEditor(
        {
          ...props,
          editable: false,
          content: content ?? initialContent,
          extensions: getExtensions(),
        },
        [content]
      )

      useImperativeHandle(ref, () => editor, [editor])

      return editor ? (
        <EditorContent
          className={className}
          editor={editor}
          dir={dir}
          css={EditorCSS(theme)}
        ></EditorContent>
      ) : null
    }
  )
)

export const RichTextEditor = memo(
  forwardRef(
    (
      {
        className,
        dir,
        placeholder,
        initialContent = null,
        content,
        onChange,
        upload,
        ...props
      }: RichTextEditorProps,
      ref
    ) => {
      const intl = useIntl()
      const theme = useTheme()

      const extensions = useMemo(() => {
        return getExtensions({
          image: {
            inline: false,
            placeholder: intl.formatMessage({
              defaultMessage: '选择或拖拽图片上传',
            }),
            upload,
          },
          placeholder:
            placeholder ??
            intl.formatMessage({ defaultMessage: '输入内容开始创作' }),
        })
      }, [intl, placeholder, upload])

      const onUpdate = useCallback<EditorOptions['onUpdate']>(
        ({ editor }) => onChange?.(editor.getJSON()),
        [onChange]
      )

      // TODO: update options when props change
      const editor = useEditor(
        {
          ...props,
          content: content ?? initialContent,
          extensions,
          onUpdate,
        },
        [extensions]
      )

      useEffect(() => {
        if (!editor || content === undefined) return
        const doc = createDocument(
          content,
          editor.schema,
          editor.options.parseOptions
        )
        const eq = editor.state.doc.eq(doc)
        if (!eq) editor.commands.setContent(content)
      }, [content, editor])

      useImperativeHandle(ref, () => editor, [editor])

      // const [inSetLink, setInSetLink] = useState(false)

      const setLink = useCallback(() => {
        if (!editor || content === undefined) return
        // setInSetLink(true)
        const inputE = document.getElementById(
          'editor-link-input'
        ) as HTMLInputElement
        if (inputE == null) {
          return
        }
        const previousUrl = editor.getAttributes('link')['href'] ?? ''
        inputE.setAttribute('value', previousUrl)
        inputE.parentElement?.style.setProperty('display', 'inline-flex')
        inputE.setSelectionRange(0, inputE.value.length)
        inputE.focus()
      }, [content, editor])

      const handleLinkInputChange = useCallback(
        (value: string, ev: React.KeyboardEvent<HTMLInputElement>) => {
          if (!editor || content === undefined) return

          if (value === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
          }
          if (!value.startsWith('https://')) {
            return
          }

          // update link
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: value })
            .run()

          ev.currentTarget.blur()
          ev.currentTarget.setAttribute('value', '')
          ev.currentTarget.parentElement?.style.setProperty('display', 'none')
        },
        [content, editor]
      )

      const handleFileInputChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
          const file = ev.currentTarget.files?.[0]
          if (!file || !editor) return false
          ev.preventDefault()
          editor.commands.insertContent([
            {
              type: 'image',
              attrs: {
                src: URL.createObjectURL(file),
                alt: file.name,
                title: file.name,
              },
            },
            {
              type: 'paragraph',
              attrs: {},
            },
          ])
          return true
        },
        [editor]
      )

      //#region bubble menu & floating menu
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
          iconName: 'h4',
          active: editor.isActive('heading', { level: 4 }),
          onClick: () => {
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          },
        },
        {
          iconName: 'h5',
          active: editor.isActive('heading', { level: 5 }),
          onClick: () => {
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          },
        },
        {
          iconName: 'h6',
          active: editor.isActive('heading', { level: 6 }),
          onClick: () => {
            editor.chain().focus().toggleHeading({ level: 6 }).run()
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
          iconName: 'bold',
          active: editor.isActive('bold'),
          onClick: () => {
            editor.chain().focus().toggleBold().run()
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
          iconName: 'underline',
          active: editor.isActive('underline'),
          onClick: () => {
            editor.chain().focus().toggleUnderline().run()
          },
        },
        {
          iconName: 'strike',
          active: editor.isActive('strike'),
          onClick: () => {
            editor.chain().focus().toggleStrike().run()
          },
        },
        {
          iconName: 'subscript',
          active: editor.isActive('subscript'),
          onClick: () => {
            editor.chain().focus().toggleSubscript().run()
          },
        },
        {
          iconName: 'superscript',
          active: editor.isActive('superscript'),
          onClick: () => {
            editor.chain().focus().toggleSuperscript().run()
          },
        },
        {
          iconName: 'code',
          active: editor.isActive('code'),
          onClick: () => {
            editor.chain().focus().toggleCode().run()
          },
        },
        {
          iconName: 'link',
          active: editor.isActive('link'),
          onClick: setLink,
        },
        {
          iconName: 'quote',
          active: editor.isActive('blockquote'),
          onClick: () => {
            editor.chain().focus().toggleBlockquote().run()
          },
        },
        {
          iconName: 'list-check',
          active: editor.isActive('taskList'),
          onClick: () => {
            editor.chain().focus().toggleTaskList().run()
          },
        },
        {
          iconName: 'align-center',
          active: editor.isActive({ textAlign: 'center' }),
          onClick: () => {
            editor.isActive({ textAlign: 'center' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('center').run()
          },
        },
        {
          iconName: 'align-justify',
          active: editor.isActive({ textAlign: 'justify' }),
          onClick: () => {
            editor.isActive({ textAlign: 'justify' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('justify').run()
          },
        },
        {
          iconName: 'align-left',
          active: editor.isActive({ textAlign: 'left' }),
          onClick: () => {
            editor.isActive({ textAlign: 'left' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('left').run()
          },
        },
        {
          iconName: 'align-right',
          active: editor.isActive({ textAlign: 'right' }),
          onClick: () => {
            editor.isActive({ textAlign: 'right' })
              ? editor.chain().focus().unsetTextAlign().run()
              : editor.chain().focus().setTextAlign('right').run()
          },
        },
      ]

      const bubbleMenuOptions = useMemo(
        (): NonNullable<BubbleMenuProps['tippyOptions']> => ({
          maxWidth: '320px',
        }),
        []
      )

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
          iconName: 'h4',
          active: editor.isActive('heading', { level: 4 }),
          onClick: () => {
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          },
        },
        {
          iconName: 'h5',
          active: editor.isActive('heading', { level: 5 }),
          onClick: () => {
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          },
        },
        {
          iconName: 'h6',
          active: editor.isActive('heading', { level: 6 }),
          onClick: () => {
            editor.chain().focus().toggleHeading({ level: 6 }).run()
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
          iconName: 'bold',
          active: editor.isActive('bold'),
          onClick: () => {
            editor.chain().focus().toggleBold().run()
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
          iconName: 'underline',
          active: editor.isActive('underline'),
          onClick: () => {
            editor.chain().focus().toggleUnderline().run()
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
          iconName: 'list-check',
          active: editor.isActive('taskList'),
          onClick: () => {
            editor.chain().focus().toggleTaskList().run()
          },
        },
        {
          iconName: 'codeblock',
          active: editor.isActive('codeBlock'),
          onClick: () => {
            editor.chain().focus().toggleCodeBlock().run()
          },
        },
        {
          iconName: 'horizontal',
          active: editor.isActive('horizontalRule'),
          onClick: () => {
            editor.chain().focus().setHorizontalRule().run()
          },
        },
        {
          iconName: 'imgupload',
          active: false,
          onClick: undefined,
          htmlFor: 'editor-file-input',
          children: (
            <input
              type='file'
              id='editor-file-input'
              accept='.png,.jpg,.jpeg,.gif,.webp'
              onChange={handleFileInputChange}
              css={css`
                display: none;
              `}
            />
          ),
        },
      ]

      const floatingMenuOptions = useMemo(
        (): NonNullable<FloatingMenuProps['tippyOptions']> => ({
          maxWidth: '320px',
          placement: 'bottom-start',
          duration: 100,
        }),
        []
      )
      //#endregion

      const menuCSS = css`
        padding: 12px 16px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 4px;
        background: ${theme.color.menu.background};
        border: 1px solid ${theme.color.menu.border};
        border-radius: 8px;
      `

      return editor ? (
        <EditorContent
          className={className}
          editor={editor}
          dir={dir}
          css={EditorCSS(theme)}
        >
          <FloatingMenu
            editor={editor}
            tippyOptions={floatingMenuOptions}
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
          <BubbleMenu
            editor={editor}
            tippyOptions={bubbleMenuOptions}
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
            <TextField
              size='medium'
              id='editor-link-input'
              inputtype='url'
              placeholder='https://'
              css={css`
                display: none;
                width: 100%;
              `}
              onEnter={handleLinkInputChange}
              onDismiss={(ev) => {
                ev.currentTarget.blur()
              }}
              onBlurCapture={(ev) => {
                ev.currentTarget.setAttribute('value', '')
                ev.currentTarget.parentElement?.style.setProperty(
                  'display',
                  'none'
                )
              }}
            />
          </BubbleMenu>
        </EditorContent>
      ) : null
    }
  )
)

const EditorCSS = (theme: Theme) => {
  return css`
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
        margin-top: 0;
        margin-bottom: 0;
        + * {
          margin-top: 20px;
        }
      }

      * > p {
        margin-top: 0;
        margin-bottom: 0;
        text-indent: 2em;
        + p {
          margin-top: 20px;
        }
      }

      h1 {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 32px;
        font-weight: 600;
        line-height: 36px;
      }

      h2 {
        margin-top: 32px;
        margin-bottom: 16px;
        font-size: 28px;
        font-weight: 600;
        line-height: 36px;
      }

      h3 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-size: 24px;
        font-weight: 600;
        line-height: 32px;
      }

      h4 {
        margin-top: 24px;
        margin-bottom: 12px;
        font-size: 20px;
        font-weight: 600;
        line-height: 32px;
      }

      h5 {
        margin-top: 20px;
        margin-bottom: 10px;
        font-size: 18px;
        font-weight: 600;
        line-height: 28px;
      }

      h6 {
        margin-top: 20px;
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 600;
        line-height: 28px;
      }

      blockquote {
        margin-left: 0;
        margin-right: 0;
        padding: 0 16px;
        border-left: 2px solid ${theme.color.divider.default};
      }

      code {
        padding: 0.2em 0.4em;
        border-radius: 4px;
        background: ${theme.color.code.background};
      }

      pre {
        padding: 16px 24px;
        border-radius: 8px;
        border: 1px solid ${theme.palette.grayLight};
        background: ${theme.color.codeBlock.background};

        code {
          padding: 0;
          border-radius: 0;
          color: ${theme.color.codeBlock.color};
          background: ${theme.color.codeBlock.background};
        }
      }

      sub {
        vertical-align: sub;
        font-size: 0.6em;
      }

      sup {
        vertical-align: super;
        font-size: 0.6em;
      }

      ul,
      ol {
        padding-left: 24px;
      }

      li {
        padding-left: 4px;
      }

      ul[data-type='taskList'] {
        list-style: none;
        padding: 0;
      }
      ul[data-type='taskList'] li {
        display: flex;
        label {
          margin-right: 0.5rem;
        }
        div {
          flex: 1 1 auto;
        }
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
        border-top: 1px solid ${theme.color.divider.default};
      }

      a {
        display: inline-block;
        cursor: pointer;
        color: ${theme.color.body.primary};
        :hover {
          color: ${theme.color.body.primaryHover};
        }
      }

      p {
        text-indent: 2em;
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

      .Tiptap-mathematics-render {
        .latin_fallback,
        .cyrillic_fallback,
        .brahmic_fallback,
        .georgian_fallback,
        .cjk_fallback,
        .hangul_fallback {
          font-style: italic;
        }
      }
    }
  `
}

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
          color: ${theme.color.body.default} !important;
          &[data-active] {
            background: ${theme.color.button.secondary.contained.hover
              .background};
          }
        `}
      />
    )
  })
)

interface ImageUploadOptions extends ImageOptions {
  placeholder: string
  upload?: ((file: File) => Observable<UploadOutput>) | null | undefined
}

function ImageWrapper({ updateAttributes, ...props }: NodeViewProps) {
  const intl = useIntl()
  const options = props.extension.options as ImageUploadOptions
  const attrs = props.node.attrs as React.ImgHTMLAttributes<HTMLImageElement>
  const src = attrs.src

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<unknown>()

  const [retryCount, setRetryCount] = useState(1)
  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  useEffect(() => {
    const upload = options.upload
    let subscription: Subscription | undefined

    if (retryCount && shouldUpload(src) && upload) {
      setIsUploading(true)
      let _result: UploadOutput | undefined
      subscription = from(fetch(src))
        .pipe(
          concatMap((resp) => resp.blob()),
          concatMap((blob) =>
            upload(
              new File(
                [blob],
                attrs.alt ||
                  attrs.title ||
                  intl.formatMessage({ defaultMessage: '图片' }),
                { type: blob.type }
              )
            )
          )
        )
        .subscribe({
          next: (result) => {
            _result = result
            setUploadProgress(result.progress)
          },
          error: (error) => {
            setUploadError(error)
            setIsUploading(false)
          },
          complete: () => {
            if (_result?.done) updateAttributes({ src: _result.value })
            setUploadError(undefined)
            setIsUploading(false)
          },
        })
    }

    return () => subscription?.unsubscribe()
  }, [
    attrs.alt,
    attrs.title,
    intl,
    options.upload,
    retryCount,
    src,
    updateAttributes,
  ])

  useEffect(() => {
    return () => {
      setTimeout(() => {
        isBlobURL(src) && URL.revokeObjectURL(src)
      }, 100)
    }
  }, [src])

  return (
    <NodeViewWrapper
      className='image-wrapper'
      css={css`
        width: fit-content;
        margin: auto;
        position: relative;
      `}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        {...attrs}
        css={css`
          max-width: 100%;
          margin: auto;
          display: block;
        `}
      />
      {(isUploading || uploadError) && (
        <div
          css={css`
            position: absolute;
            right: 4px;
            bottom: 4px;
            display: flex;
            align-items: center;
          `}
        >
          {isUploading ? (
            <div
              css={(theme) => css`
                padding: 0 4px;
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.1);
                color: ${theme.color.body.secondary};
                ${theme.typography.tooltip}
              `}
            >
              {(uploadProgress * 100).toFixed(0) + '%'}
            </div>
          ) : uploadError ? (
            <button
              onClick={retry}
              css={(theme) => css`
                padding: 0 4px;
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.1);
                color: ${theme.color.body.danger};
                ${theme.typography.tooltip}
              `}
            >
              {intl.formatMessage({ defaultMessage: '上传失败，请重试' })}
            </button>
          ) : null}
        </div>
      )}
    </NodeViewWrapper>
  )
}

const ImageUpload = Image.extend<ImageUploadOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      placeholder: '',
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageWrapper)
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('image'),
        props: {
          handlePaste: (view, ev) => {
            const file = Array.from(ev.clipboardData?.files || []).find(
              (item) => item.type.startsWith('image')
            )
            if (!file) return false
            ev.preventDefault()
            const blob = file.slice(0, file.size, file.type)
            const newFile = new File([blob], `${Date.now()}-${file.name}`, {
              type: file.type,
            })
            this.editor.commands.insertContent([
              {
                type: this.name,
                attrs: {
                  src: URL.createObjectURL(newFile),
                  alt: newFile.name,
                  title: newFile.name,
                },
              },
              {
                type: 'paragraph',
                attrs: {},
              },
            ])
            return true
          },
        },
      }),
    ]
  },
})
