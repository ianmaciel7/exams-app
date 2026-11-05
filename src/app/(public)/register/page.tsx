import { redirectAuthenticated } from "../_lib/redirect-authenticated";
import { RegisterFormClient } from "./_components/register-form-client";

export const instant = false;

export default async function RegisterPage(props: PageProps<"/register">) {
  const { next } = await props.searchParams;
  await redirectAuthenticated(next);

  return <RegisterFormClient />;
}
