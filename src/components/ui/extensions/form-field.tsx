"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cn } from "cn";

/**
 * Base UI field building blocks (pair with `Form` from `./form`). Unlike the plain shadcn `Field` (a `div`),
 * these link the label, the description and the error to the control with
 * `for`, `aria-labelledby` and `aria-describedby`, and set `aria-invalid`
 * (WCAG 1.3.1, 3.3.1, 3.3.2, 4.1.2). They work with React Hook Form through
 * `Controller`: pass `invalid`, `touched`, `dirty` and `name` from the field
 * state, and `match` on `FormFieldError`.
 */

function FormField({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      data-slot="form-field"
      className={cn(
        "group/field flex w-full flex-col gap-2 data-[invalid]:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FormFieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      data-slot="form-field-label"
      className={cn(
        "flex w-fit gap-2 text-sm leading-snug font-medium select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FormFieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      data-slot="form-field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormFieldError({ className, ...props }: FieldPrimitive.Error.Props) {
  return (
    <FieldPrimitive.Error
      // The error mounts only when it applies, so role="alert" announces it
      // when it appears (WCAG 4.1.3) even if focus stays elsewhere.
      role="alert"
      data-slot="form-field-error"
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    />
  );
}

export { FormField, FormFieldDescription, FormFieldError, FormFieldLabel };
