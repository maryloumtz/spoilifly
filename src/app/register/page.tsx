import AuthView from "@/views/AuthView";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <AuthView mode="register" redirectTo={redirect} />;
}
