import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


  
type Props = {
    title: string
    description: string
    isOpen: boolean
    onClose: () => void
   
  }
  
  function FormattedAlertModal({title, description,isOpen, onClose}: Props) {
      const onChange = (open: boolean) => {
          if (!open) {
              onClose()
          }
      }
    return (
      <>
    <Dialog open = {isOpen} onOpenChange = {onChange}>
  <DialogContent>
    <DialogHeader>
                        <DialogTitle>{ title }</DialogTitle>
      <DialogDescription>
        {description}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
  </DialogContent>
</Dialog>
            

    </>
    )
  }
  
  export default FormattedAlertModal