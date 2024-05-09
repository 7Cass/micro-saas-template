import { auth } from "@/services/auth";
import { ProfileForm } from "./_components/form";

export default async function Page() {
  const session = await auth();

  if (!session?.user) return;

  return <ProfileForm defaultValues={session?.user} />;
}
