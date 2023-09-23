import { css, useTheme } from '@emotion/react'
import { forwardRef, memo } from 'react'
import TextareaAutosize_, {
  type TextareaAutosizeProps,
} from 'react-textarea-autosize'

export const TextareaAutosize = memo(
  forwardRef(function TextareaAutosize(
    props: TextareaAutosizeProps,
    ref: React.Ref<HTMLTextAreaElement>
  ) {
    const theme = useTheme()

    return (
      <TextareaAutosize_
        {...props}
        ref={ref}
        css={css`
          width: 100%;
          box-sizing: border-box;
          resize: none;
          border: none;
          outline: none;
          background: none;
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          font-weight: inherit;
          line-height: inherit;
          overflow-wrap: break-word;
          ::placeholder {
            color: ${theme.color.input.placeholder};
          }
        `}
      />
    )
  })
)
