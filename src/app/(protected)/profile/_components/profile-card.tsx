import type { ComponentProps } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProfileCardProps = ComponentProps<typeof Card>;
type ProfileCardActionProps = ComponentProps<typeof CardAction>;
type ProfileCardHeaderProps = ComponentProps<typeof CardHeader>;
type ProfileCardTitleProps = ComponentProps<typeof CardTitle>;
type ProfileCardDescriptionProps = ComponentProps<typeof CardDescription>;
type ProfileCardContentProps = ComponentProps<typeof CardContent>;
type ProfileCardFooterProps = ComponentProps<typeof CardFooter>;

function ProfileCard({ className, ...props }: ProfileCardProps) {
  return (
    <Card className={cn("mx-auto w-full max-w-sm", className)} {...props} />
  );
}

function ProfileCardAction(props: ProfileCardActionProps) {
  return <CardAction {...props} />;
}

function ProfileCardHeader(props: ProfileCardHeaderProps) {
  return <CardHeader {...props} />;
}

function ProfileCardTitle(props: ProfileCardTitleProps) {
  return <CardTitle {...props} />;
}

function ProfileCardDescription(props: ProfileCardDescriptionProps) {
  return <CardDescription {...props} />;
}

function ProfileCardContent({
  children,
  className,
  ...props
}: ProfileCardContentProps) {
  return (
    <CardContent
      className={cn("flex w-full flex-col gap-4", className)}
      {...props}
    >
      {children}
    </CardContent>
  );
}

function ProfileCardFooter({ className, ...props }: ProfileCardFooterProps) {
  return (
    <CardFooter
      className={cn(
        "w-full flex-col gap-4 border-t-0 bg-transparent pt-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  ProfileCard,
  ProfileCardAction,
  ProfileCardContent,
  ProfileCardDescription,
  ProfileCardFooter,
  ProfileCardHeader,
  ProfileCardTitle,
};
