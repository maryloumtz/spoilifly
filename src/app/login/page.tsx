import AuthView from "@/views/AuthView";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <AuthView mode="login" redirectTo={redirect} />;
}
