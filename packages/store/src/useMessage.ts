export interface CreateMessageInput {
  attach_to: Uint8Array
  kind: string
  language: string
  context: string
  message: Uint8Array
}

export interface MessageOutput {
  id: Uint8Array
  attach_to?: Uint8Array
  kind?: string
  language?: string
  languages?: string[]
  version: number
  context?: string
  created_at: number
  updated_at: number
  message?: Uint8Array
  i18n_messages?: Record<string, Uint8Array>
}

export interface UpdateMessageInput {
  id: Uint8Array
  gid: Uint8Array
  version: number
  context?: string
  language?: string
  message?: Uint8Array
}
