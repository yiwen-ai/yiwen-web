import { Buffer } from 'buffer'
import { decode, encode } from 'cborg'
import fs from 'node:fs/promises'

const HOST = 'https://api.yiwen.ai'
const MESSAGE_ID = 'ckjjdj2sblvpm7b5ad70'
const SESS_COOKIE = process.env.SESS_COOKIE // 'YW_DID=xxxxxxx; YW_SESS=xxxxxxxxx'

async function main() {
  const api = new YiwenMessage()
  await api.getLanguages()
  console.log(`languages: ${Object.keys(api.languages).length / 2}`)

  await api.auth()

  switch (process.argv[2]) {
    case 'update': {
      await api.updateZho()
      break
    }
    case 'updateI18n': {
      await api.updateI18n(process.argv[3])
      break
    }
    // case 'updateAllI18n': {
    //   await api.updateAllI18n()
    //   break
    // }
    case 'compile': {
      await api.compile()
      break
    }
    case 'translate': {
      await api.translate()
      break
    }
    default: {
      throw new Error(`Unknown command: "${process.argv[2]}"`)
    }
  }
}

class YiwenMessage {
  constructor() {
    this.endpoint = HOST
    this.messageId = MESSAGE_ID
    this.sessCookie = SESS_COOKIE
    this.languages = {
      zh: ['zho', 'Chinese', '中文'],
      zho: ['zho', 'Chinese', '中文'],
    }
    this.token = ''
  }

  async updateZho() {
    const { result } = await this.fetch('GET', `v1/message`, {
      id: this.messageId,
      fields: 'language,version',
    })

    const msg = JSON.parse(await fs.readFile('./lang/zho.json', 'utf-8'))
    const message = {}
    const keys = Object.keys(msg)
    keys.sort()
    for (const key of keys) {
      message[key] = msg[key].defaultMessage
    }

    result.message = Buffer.from(encode(message))

    const res = await this.fetch('PATCH', `v1/message`, {
      id: result.id,
      language: 'zho',
      version: result.version,
      message: result.message,
    })
    result.version = res.result.version
    return result
  }

  async updateI18n(code) {
    const lang = this.languages[code]
    if (!lang) {
      throw new Error(`Unknown language: "${code}"`)
    }

    const locale = new Intl.Locale(lang[0])
    const msg = JSON.parse(
      await fs.readFile(`./packages/web/lang/${locale.language}.json`, 'utf-8')
    )

    const { result } = await this.fetch('GET', `v1/message`, {
      id: this.messageId,
      fields: 'language,version',
    })

    await this.fetch('PATCH', `v1/message`, {
      id: result.id,
      language: lang[0],
      version: result.version,
      message: Buffer.from(encode(msg.messages)),
    })

    console.log(`Updated ${locale.language}.json`)
    return result
  }

  async updateAllI18n() {
    const { result } = await this.fetch('GET', `v1/message`, {
      id: this.messageId,
      fields: 'language,version',
    })

    const files = await fs.readdir('./packages/web/lang')

    for (const file of files) {
      const lang = this.languages[file.split('.')[0]]
      if (!lang) {
        console.warn(`Unknown language: "${file}"`)
        continue
      }

      const msg = JSON.parse(
        await fs.readFile(`./packages/web/lang/${file}`, 'utf-8')
      )
      await this.fetch('PATCH', `v1/message`, {
        id: result.id,
        language: lang[0],
        version: result.version,
        message: Buffer.from(encode(msg.messages)),
      })
      console.log(`Updated ${file}`)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  async translate() {
    const { result } = await this.fetch('GET', `v1/message`, {
      id: this.messageId,
      fields: 'version,i18n',
    })

    for (const code of Object.keys(result.i18n_messages).sort()) {
      try {
        await this.fetch('POST', `v1/message/translate`, {
          id: result.id,
          language: code,
          version: result.version,
        })
        console.log(`Start translate ${code}`)
        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (err) {
        console.error(`translate ${code} error: ${err}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  async compile() {
    const { result } = await this.fetch('GET', `v1/message`, {
      id: this.messageId,
      fields: 'version,i18n',
    })

    for (const code of Object.keys(result.i18n_messages).sort()) {
      const locale = new Intl.Locale(code)
      const messages = decode(result.i18n_messages[code])
      for (const key of Object.keys(messages)) {
        // https://formatjs.io/docs/core-concepts/icu-syntax#quoting--escaping
        const text = messages[key]
          .replace(/(!?')'{/, "''{")
          .replace(/}'(!?')/, "}''")
        if (text !== messages[key]) {
          messages[key] = text
          console.log(`Escaped ${code} ${key}`)
        }
      }
      await fs.writeFile(
        `./packages/web/lang/${locale.language}.json`,
        JSON.stringify({ messages }, null, 2)
      )

      console.log(`Compiled ${code}`)
    }

    console.log('Done', Object.keys(result.i18n_messages).length)
  }

  async getLanguages() {
    const { result } = await this.fetch('GET', `languages`)
    for (const lang of result) {
      const locale = new Intl.Locale(lang[0])
      this.languages[locale.language] = lang
      this.languages[lang[0]] = lang
    }
  }

  async auth() {
    const headers = new Headers()
    headers.set('Cookie', `${this.sessCookie}`)
    headers.set('Accept', 'application/json')
    headers.set('Content-Type', 'application/json')

    const res = await fetch('https://auth.yiwen.ai/access_token', { headers })
    if (res.status !== 200) {
      throw new Error(await res.text())
    }

    const { access_token } = await res.json()
    this.token = access_token

    const userinfo = await fetch('https://auth.yiwen.ai/userinfo', { headers })
    if (res.status !== 200) {
      throw new Error(await res.text())
    }
    const { name, cn } = await userinfo.json()
    console.log(`Login as ${name} (${cn})`)
  }

  async fetch(method, path, body) {
    const headers = new Headers()
    headers.set('Cookie', `${this.sessCookie}`)
    headers.set('Accept', 'application/cbor')
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }
    let api = path ? `${this.endpoint}/${path}` : this.endpoint
    const options = { method: method ?? 'GET', headers }
    if (body) {
      if (options.method === 'GET') {
        const q = new URLSearchParams()
        for (const [key, value] of Object.entries(body)) {
          q.set(key, value)
        }
        api += '?' + q.toString()
      } else {
        headers.set('Content-Type', 'application/cbor')
        options.body = encode(body)
      }
    }

    const res = await fetch(api, options)
    if (res.status !== 200) {
      throw new Error(await res.text())
    }
    return decode(Buffer.from(await res.arrayBuffer()))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
