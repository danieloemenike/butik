"use client";

import axios from "axios";
import { useState } from "react";
import { Copy, Edit, LucideFastForward, MoreHorizontal, Trash } from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
// import AlertModal from "@/components/ui/modals/AlertModal";
import { useDeleteStoreMutation } from "@/reduxStore/services/storeApiSlice";
import { useToast } from "@/components/ui/use-toast";
import FormattedAlertModal from "@/components/FormattedAlertModal";

type StoreType = {
    id: string; name: string; address: string | null; city: string | null; country: string | null; createdAt: string; updatedAt: string; phoneNumber: string | null;
}
interface CellActionProps {
  data: StoreType;
}

 const CellAction = ({
  data,
 }: CellActionProps) => {
   const {toast} = useToast()
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
   const [deleteStore, {isLoading, isError, isSuccess, }] = useDeleteStoreMutation();
   
  const onConfirm = async () => {
    try {
      setLoading(true);
      
      await deleteStore({ storeId: data.id, businessId: params.businessId })
      
      toast({
        description: "Your store has been deleted successfully.",
      });
      
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        
      })
    } finally {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <>
      {/* <AlertModal
        open={open} 
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
              title="Are you absolutely sure?"
              description ="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
          
          /> */}
          <FormattedAlertModal title = "Are you absolutely sure?"  description ="This action cannot be undone. This will permanently delete your account and remove your data from our servers." isOpen = {open}  onClose={() => setOpen(false)} />
          
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
  
          {/* <DropdownMenuItem
            onClick={() => router.push(`/store/${params.storeId}/billboards/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
          </DropdownMenuItem> */}
        
          
           <DropdownMenuItem
            onClick={() => router.push(`/store/${data?.id}/dashboard`)}
          >
            <LucideFastForward className="mr-2 h-4 w-4" /> Visit Store
          </DropdownMenuItem>

            <DropdownMenuItem
            onClick={() => setOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};


export default CellAction