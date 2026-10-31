import { Form as FormPrimitive } from "@base-ui/react/form";

function Form({ className, ...props }: FormPrimitive.Props) {
  // Base UI Form renders `noValidate` so the app, not the browser bubble, owns
  // the messages, and it moves focus to the first invalid control on submit.
  return <FormPrimitive data-slot="form" className={className} {...props} />;
}

export { Form };
