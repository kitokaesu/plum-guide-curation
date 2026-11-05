import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const session = await requireUser("/dashboard");

  switch (session.role) {
    case "HOST":
      redirect("/dashboard/host");
    case "SPECIALIST":
      redirect("/dashboard/specialist");
    case "ADMIN":
      redirect("/dashboard/admin");
    default:
      redirect("/dashboard/guest");
  }
}
