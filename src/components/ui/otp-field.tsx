import { OTPField as OTPFieldPrimitive } from "@base-ui/react/otp-field";
import { cn } from "cn";

function OTPField({ className, ...props }: OTPFieldPrimitive.Root.Props) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="otp-field"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function OTPFieldInput({ className, ...props }: OTPFieldPrimitive.Input.Props) {
  return (
    <OTPFieldPrimitive.Input
      data-slot="otp-field-input"
      className={cn(
        "size-8 border-y border-r border-input bg-transparent text-center text-sm transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg pointer-coarse:size-11 focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[invalid]:border-destructive dark:bg-input/30",
        className,
      )}
      {...props}
    />
  );
}

export { OTPField, OTPFieldInput };
