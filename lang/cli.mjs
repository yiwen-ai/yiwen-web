import { Buffer } from 'buffer'
import { decode, encode } from 'cborg'
import fs from 'node:fs/promises'

const HOST = 'https://api.yiwen.ai'
const GID = 'ck08p30j4vfh80pte7a0'
const CID = 'ck6pjehf66imvkusjbjg'

async function main() {
  const command = process.argv[2]
  switch (command) {
    case 'extract': {
      extract()
      break
    }
    case 'compile': {
      await compile()
      break
    }
    default: {
      console.error('Unknown command')
      process.exit(1)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

async function extract() {
  const zho = JSON.parse(await fs.readFile('./lang/zho.json', 'utf-8'))
  const doc = { type: 'doc', content: [] }
  const keys = Object.keys(zho)
  keys.sort()
  for (const key of keys) {
    doc.content.push({
      type: 'paragraph',
      attrs: {
        id: key,
      },
      content: [
        {
          type: 'text',
          text: zho[key].defaultMessage,
        },
      ],
    })
  }

  encode(doc)

  await fs.writeFile(
    './lang/content.txt',
    Buffer.from(encode(doc)).toString('base64url')
  )
}

async function compile() {
  const headers = new Headers()
  headers.set('Accept', 'application/cbor')
  const listRes = await fetch(
    `${HOST}/v1/publication/publish?gid=${GID}&cid=${CID}`,
    { headers }
  )

  if (listRes.status !== 200) {
    throw new Error(listRes.text())
  }

  const publicationList = decode(Buffer.from(await listRes.arrayBuffer()))
  const docSet = new Set()
  for (const doc of publicationList.result) {
    if (doc.language === doc.from_language) {
      console.log(`Skipped ${doc.language}`)
      continue
    }
    if (docSet.has(CID + doc.language)) {
      continue
    }
    docSet.add(CID + doc.language)

    const docRes = await fetch(
      `${HOST}/v1/publication?gid=${GID}&cid=${CID}&language=${doc.language}&version=${doc.version}&fields=content`,
      { headers }
    )

    if (docRes.status !== 200) {
      throw new Error(docRes.text())
    }

    const publication = decode(Buffer.from(await docRes.arrayBuffer()))
    const content = decode(Buffer.from(publication.result.content))
    const messages = {}
    for (const node of content.content) {
      if (node.attrs?.id && node.content.length > 0) {
        const id = node.attrs.id
        const text = node.content[0].text
        messages[id] = text
      }
    }

    const lang = Intl.getCanonicalLocales(publication.result.language)[0]
    await fs.writeFile(
      `./packages/web/lang/${lang}.json`,
      JSON.stringify(messages, null, 2)
    )
    console.log(`Compiled ${lang}`)
  }
}
