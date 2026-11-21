import { cn as baseCn } from "cn";

export function cn(
  ...inputs: Parameters<typeof baseCn>
): ReturnType<typeof baseCn> {
  return baseCn(...inputs);
}
