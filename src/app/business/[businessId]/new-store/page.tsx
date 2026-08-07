import { redirect } from "next/navigation"

type Props = {
  params: Promise<{
    businessId: string
  }>
}

/** Create store now opens as a modal on the business page. */
const page = async ({ params }: Props) => {
  const { businessId } = await params
  redirect(`/business/${businessId}`)
}

export default page
