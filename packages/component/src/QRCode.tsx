import { css } from '@emotion/react'
import { useIsMounted } from '@yiwen-ai/util'
import { toDataURL } from 'qrcode'
import { memo, useEffect, useState, type ImgHTMLAttributes } from 'react'

export interface QRCodeProps extends ImgHTMLAttributes<HTMLImageElement> {
  value: string
}

export const QRCode = memo(function QRCode({ value, ...props }: QRCodeProps) {
  const isMounted = useIsMounted()
  const [url, setUrl] = useState<string | undefined>()

  useEffect(() => {
    toDataURL(value, {
      margin: 0,
      scale: 8,
    })
      .then((url) => isMounted() && setUrl(url))
      .catch(() => {
        // ignore
      })
  }, [isMounted, value])

  return url ? (
    <img
      src={url}
      alt={value}
      {...props}
      css={css`
        display: block;
        width: 100%;
      `}
    />
  ) : null
})
