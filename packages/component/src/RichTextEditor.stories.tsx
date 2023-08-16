import type { Meta, StoryObj } from '@storybook/react'
import { RichTextEditor } from './RichTextEditor'

const meta: Meta<typeof RichTextEditor> = {
  component: RichTextEditor,
}

export default meta

type Story = StoryObj<typeof RichTextEditor>

const html = `
<h1 data-id="h2OzU2">Lorem Ipsum</h1>
<h2 data-id="jNLDEK">什么是Lorem Ipsum?</h2>
<p data-id="Ekk_Pn">
  Lorem Ipsum，也称乱数假文或者哑元文本，
  是印刷及排版领域所常用的虚拟文字。由于曾经一台匿名的打印机刻意打乱了一盒印刷字体从而造出一本字体样品书，Lorem
  Ipsum从西元15世纪起就被作为此领域的标准文本使用。它不仅延续了五个世纪，还通过了电子排版的挑战，其雏形却依然保存至今。在1960年代，”Leatraset”公司发布了印刷着Lorem
  Ipsum段落的纸张，从而广泛普及了它的使用。最近，计算机桌面出版软件”Aldus
  PageMaker”也通过同样的方式使Lorem Ipsum落入大众的视野。
</p>
<h2 data-id="h7sDAY">格式化</h2>
<blockquote data-id="_iizfz">
  <p data-id="xvebC4">block quote</p>
  <p data-id="zkHt_t">line2</p>
</blockquote>
<ul>
  <li data-id="AKvgMD"><p data-id="zevxa5">item1</p></li>
  <li data-id="n0NFmP"><p data-id="J2NPNh">item2</p></li>
</ul>
<ol>
  <li data-id="37ntO3"><p data-id="V9ebO2">item1</p></li>
  <li data-id="XDdNi2"><p data-id="LtP8J3">item2</p></li>
</ol>
<pre data-id="xe9wHp"><code>Hello, World!</code></pre>
`

export const Basic: Story = {
  args: {
    initialContent: html,
  },
}
