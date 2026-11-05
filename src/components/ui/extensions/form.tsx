import { Form as FormPrimitive } from "@base-ui/react/form";

// Not `next/form`. That component is for GET/search forms that navigate with
// search params (or Server Actions). Our forms run client Actions against the
// Firebase SDK and need Base UI's validation and focus handling, so every form
// uses this one. Use `next/form` directly only for URL-driven search/filter.
function Form({ className, ...props }: FormPrimitive.Props) {
  // Base UI Form renders `noValidate` so the app, not the browser bubble, owns
  // the messages, and it moves focus to the first invalid control on submit.
  return <FormPrimitive data-slot="form" className={className} {...props} />;
}

export { Form };
