import type { PropsWithChildren } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";

type PublicUiProviderProps = PropsWithChildren<{
  isError: boolean;
  isLoading: boolean;
  errorMessage: string;
}>;
function PublicUiProvider({
  children,
  isError,
  isLoading,
  errorMessage,
}: PublicUiProviderProps) {
  if (isError)
    return (
      <Alert variant="destructive">
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  if (isLoading) return <LoadingStatus />;
  return children;
}

export { PublicUiProvider };
