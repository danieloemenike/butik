import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  title: string
  description: string
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  loading?: boolean
}

function FormattedAlertModal({
  title,
  description,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          {onConfirm && (
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FormattedAlertModal
