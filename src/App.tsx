import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import CreateWalletProcess from "@/components/create-wallet-process"
import SignTransactionProcess from "@/components/sign-transaction-process"
import type { IncomingMessage, IncomingCreateMessage, IncomingSignMessage } from "@/types/incoming-message"

const ALLOWED_ORIGIN = import.meta.env.VITE_PAY_HOST ?? "http://localhost:5173"

export function App() {
  const [createMessage, setCreateMessage] = useState<IncomingCreateMessage | null>(null)
  const [signMessage, setSignMessage] = useState<IncomingSignMessage | null>(null)
  const { setTheme } = useTheme()

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== ALLOWED_ORIGIN) return
      const msg = event.data as IncomingMessage

      if (msg.action === "set-theme") {
        setTheme(msg.theme as "dark" | "light")
        return
      }

      if (msg.action === "create") {
        setCreateMessage(msg as IncomingCreateMessage)
        return
      }

      if (msg.action === "sign") {
        setSignMessage(msg as IncomingSignMessage)
        return
      }
    }

    window.addEventListener("message", handleMessage)
    window.parent.postMessage({ action: "ready" }, ALLOWED_ORIGIN)

    return () => window.removeEventListener("message", handleMessage)
  }, [setTheme])

  return (
    <div className="flex min-h-svh p-2">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        {createMessage ? (
          <CreateWalletProcess message={createMessage} />
        ) : signMessage ? (
          <SignTransactionProcess message={signMessage} />
        ) : (
          <p className="text-muted-foreground">Waiting for message...</p>
        )}
      </div>
    </div>
  )
}

export default App
