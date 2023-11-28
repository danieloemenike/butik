"use client";

import axios from "axios";
import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import FormattedAlertModal from "@/components/FormattedAlertModal";
import { useDeleteBillboardMutation } from "@/reduxStore/services/billboardApiSlice";


type BillboardInfoType = {
  id: string;
  label: string;
  imageUrl: string;
  promotionText: string | null;
  promotionImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  storeId: string;
}

interface CellActionProps {
  data: BillboardInfoType;
}

 const CellAction = ({
  data,
 }: CellActionProps) => {
  const {toast} = useToast()
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
   const [deleteBillboard, {isLoading, isError, isSuccess, }] = useDeleteBillboardMutation();
   
  const onConfirm = async () => {
    try {
      setLoading(true);
      
      await deleteBillboard({ storeId: params.storeId, billboardId: data.id })
      
      if (isSuccess) return
      toast({
        description: "Your Billboard has been deleted successfully.",
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
  
          <DropdownMenuItem
            onClick={() => router.push(`/store/${params.storeId}/billboards/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Update
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