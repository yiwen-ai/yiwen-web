import { css, keyframes, useTheme } from '@emotion/react'
import { memo, type HTMLAttributes } from 'react'

export type SpinnerSize = 'small' | 'medium' | 'large'

const SizeDict: Record<SpinnerSize, number> = {
  small: 16,
  medium: 24,
  large: 36,
}

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize | number
}

export const Spinner = memo(function Spinner({
  size = 'medium',
  ...props
}: SpinnerProps) {
  const theme = useTheme()
  const width = typeof size === 'number' ? size : SizeDict[size]

  return (
    <div
      role="progressbar"
      {...props}
      css={css`
        width: ${width}px;
        height: ${width}px;
        box-sizing: border-box;
        border: 1px solid ${theme.color.button.primary.contained.border};
        border-radius: 50%;
        animation: 2s linear infinite ${keyframes`
            0% {
              transform: rotate(0deg);
              clip-path: polygon(
                50% 50%,
                0% 0%,
                50% 0%,
                50% 0%,
                50% 0%,
                50% 0%,
                50% 0%,
                50% 0%,
                50% 0%
              );
            }
            20% {
              clip-path: polygon(
                50% 50%,
                0% 0%,
                50% 0%,
                100% 0%,
                100% 50%,
                100% 50%,
                100% 50%,
                100% 50%,
                100% 50%
              );
            }
            30% {
              clip-path: polygon(
                50% 50%,
                0% 0%,
                50% 0%,
                100% 0%,
                100% 50%,
                100% 100%,
                50% 100%,
                50% 100%,
                50% 100%
              );
            }
            40% {
              clip-path: polygon(
                50% 50%,
                0% 0%,
                50% 0%,
                100% 0%,
                100% 50%,
                100% 100%,
                50% 100%,
                0% 100%,
                0% 50%
              );
            }
            50% {
              clip-path: polygon(
                50% 50%,
                50% 0%,
                50% 0%,
                100% 0%,
                100% 50%,
                100% 100%,
                50% 100%,
                0% 100%,
                0% 50%
              );
            }
            60% {
              clip-path: polygon(
                50% 50%,
                100% 50%,
                100% 50%,
                100% 50%,
                100% 50%,
                100% 100%,
                50% 100%,
                0% 100%,
                0% 50%
              );
            }
            70% {
              clip-path: polygon(
                50% 50%,
                50% 100%,
                50% 100%,
                50% 100%,
                50% 100%,
                50% 100%,
                50% 100%,
                0% 100%,
                0% 50%
              );
            }
            80% {
              clip-path: polygon(
                50% 50%,
                0% 100%,
                0% 100%,
                0% 100%,
                0% 100%,
                0% 100%,
                0% 100%,
                0% 100%,
                0% 50%
              );
            }
            90% {
              transform: rotate(360deg);
              clip-path: polygon(
                50% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%
              );
            }
            100% {
              clip-path: polygon(
                50% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%,
                0% 50%
              );
            }`};
      `}
    />
  )
})
