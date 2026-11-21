"use client";

import type { ComponentProps } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthCardProps = ComponentProps<typeof Card>;

function AuthCard({ className, ...props }: AuthCardProps) {
  return (
    <Card
      data-slot="auth-card"
      {...props}
      className={cn("mx-auto w-full max-w-sm", className)}
    />
  );
}

export { AuthCard, type AuthCardProps };
