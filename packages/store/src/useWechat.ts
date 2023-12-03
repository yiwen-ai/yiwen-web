import '../types/weixin-js-sdk.d.ts'

import { useCallback } from 'react'
import wx from 'weixin-js-sdk'
import { isInWechat } from './common'
import { useLogger } from './logger'
import { useFetcher } from './useFetcher'

interface WechatOutput {
  url: string
  appId: string
  nonceStr: string
  signature: string
  timestamp: number
}

const path = '/v1/wechat/jsapi_ticket'

function useWechatAPI() {
  const request = useFetcher()

  const jsapiTicket = useCallback(
    (url: string) => {
      return request.post<{ result: WechatOutput }>(path, { url })
    },
    [request]
  )

  return {
    jsapiTicket,
  } as const
}

export function useWechat() {
  const { jsapiTicket } = useWechatAPI()
  const logger = useLogger()

  const wechat = useCallback(
    async (opts: wx.UpdateAppMessageShareDataOptions) => {
      if (!isInWechat()) {
        return undefined
      }

      const { result: config } = await jsapiTicket(opts.link)
      wx.config({
        debug: false, // true:调试时候弹窗
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'],
        beta: false,
      })

      wx.ready(() => {
        wx.updateAppMessageShareData(opts)
        wx.updateTimelineShareData(opts)
      })

      wx.error((error) => {
        logger.error('wechat error', { error })
      })
    },
    [jsapiTicket, logger]
  )

  return {
    wechat,
  } as const
}
