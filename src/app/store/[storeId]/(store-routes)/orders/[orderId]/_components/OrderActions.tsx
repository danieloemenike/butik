"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import FormattedAlertModal from "@/components/FormattedAlertModal"

export function OrderActions({
  storeId,
  orderId,
  status,
}: {
  storeId: string
  orderId: string
  status: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (status === "EXPIRED") {
    return (
      <p className="text-sm text-muted-foreground">
        Hold expired — stock released.
      </p>
    )
  }

  if (status !== "PENDING") {
    return (
      <p className="text-sm text-muted-foreground">
        This order is {status.toLowerCase()}.
      </p>
    )
  }

  async function run(action: "confirm" | "cancel") {
    try {
      setLoading(true)
      await axios.patch(`/api/${storeId}/orders/${orderId}/v1`, { action })
      toast({
        description:
          action === "confirm"
            ? "Order confirmed."
            : "Order cancelled and stock restored.",
      })
      setCancelOpen(false)
      router.refresh()
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined
      toast({
        variant: "destructive",
        title: "Could not update order",
        description: message || "Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <FormattedAlertModal
        title="Cancel this order?"
        description="Stock held for this pending order will be restored. This cannot be undone."
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => run("cancel")}
        loading={loading}
        confirmLabel="Cancel order"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={loading}
          onClick={() => run("confirm")}
        >
          Confirm order
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setCancelOpen(true)}
        >
          Cancel order
        </Button>
      </div>
    </>
  )
}
