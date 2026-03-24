import { useEffect, useState } from "react"
import { Loader2, Check, CircleDashed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signWithUmPasskeyWallet } from "@/lib/um-passkey-wallet"
import type { IncomingSignMessage } from "@/types/incoming-message"
import type { TransactionSerializable } from "viem"

const ALLOWED_ORIGIN = import.meta.env.VITE_PAY_HOST ?? "http://localhost:5173"

type Status = "idle" | "loading" | "completed" | "cancelled"

type Steps = {
  generating: Status
  confirm: Status
  signing: Status
}

function StepIcon({ status }: { status: Status }) {
  if (status === "loading") return <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
  if (status === "completed") return <Check className="h-4 w-4 shrink-0 text-green-500" />
  if (status === "cancelled") return <span className="text-destructive">✕</span>
  return <CircleDashed className="h-4 w-4 shrink-0 opacity-30" />
}

export default function SignTransactionProcess({ message }: { message: IncomingSignMessage }) {
  const [steps, setSteps] = useState<Steps>({
    generating: "loading",
    confirm: "idle",
    signing: "idle",
  })

  const tx = message.tx as TransactionSerializable

  useEffect(() => {
    const t1 = setTimeout(() => setSteps(s => ({ ...s, generating: "completed", confirm: "loading" })), 1000)
    return () => clearTimeout(t1)
  }, [])

  async function handleConfirm() {
    setSteps(s => ({ ...s, confirm: "completed", signing: "loading" }))

    const signedTx = await signWithUmPasskeyWallet(message.wallet, tx)

    if (signedTx) {
      setSteps(s => ({ ...s, signing: "completed" }))
      window.parent.postMessage({ action: "sign-result", signedTx }, ALLOWED_ORIGIN)
    } else {
      setSteps(s => ({ ...s, signing: "cancelled" }))
      window.parent.postMessage({ action: "sign-error", error: "Signing failed" }, ALLOWED_ORIGIN)
    }
  }

  function handleCancel() {
    setSteps(s => ({ ...s, confirm: "completed", signing: "cancelled" }))
    window.parent.postMessage({ action: "sign-error", error: "Cancelled by user" }, ALLOWED_ORIGIN)
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <p className="font-medium text-muted-foreground">
        Signing transaction for <span className="text-wrap text-foreground">{message.wallet.name}</span>
      </p>
      <div className={`flex items-center gap-2 ${steps.generating === "idle" ? "opacity-30" : ""}`}>
        <StepIcon status={steps.generating} />
        <span>Generating transaction...</span>
      </div>
      <div className={`flex items-center gap-2 ${steps.confirm === "idle" ? "opacity-30" : ""}`}>
        <StepIcon status={steps.confirm} />
        <span>Requesting signature...</span>
      </div>
      {steps.confirm === "loading" && (
        <div className="flex gap-2 mt-1">
          <Button size="sm" variant="outline" className="rounded-none" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" className="rounded-none" onClick={handleConfirm}>
            Confirm
          </Button>
        </div>
      )}
      {steps.signing !== "idle" && (
        <div className="flex items-center gap-2">
          <StepIcon status={steps.signing} />
          <span className={steps.signing === "cancelled" ? "text-destructive" : ""}>
            {steps.signing === "completed" ? "Signing completed!" : steps.signing === "cancelled" ? "Cancelled" : "Signing..."}
          </span>
        </div>
      )}
    </div>
  )
}
