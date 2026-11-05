import { redirectAuthenticated } from "../_lib/redirect-authenticated";
import { SignInFormClient } from "./_components/sign-in-form-client";

export const instant = false;

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const { next } = await props.searchParams;
  await redirectAuthenticated(next);

  return <SignInFormClient />;
}
