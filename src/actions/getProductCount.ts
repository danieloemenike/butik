import prismadb from "@/lib/prismadb";
export const getProductCount = async (storeId: string) => {
    const productCount = await prismadb.product.count({
        where: {
            storeId,
            isArchived: false
        },
     
    });
    return productCount;
}