export type IncomingMessage = {
  action: string
  [key: string]: unknown
}

export type IncomingCreateMessage = {
  action: "create"
  username: string
}

export type IncomingSignMessage = {
  action: "sign"
  tx: Record<string, unknown>
  wallet: import("@/types/wallet").UmKeystore
}