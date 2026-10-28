"use client";

import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TProps as JsxParserProps } from "react-jsx-parser";
import JsxParser from "react-jsx-parser";
import { cn } from "@/lib/utils";

interface JSXPreviewContextValue {
  jsx: string;
  processedJsx: string;
  isStreaming: boolean;
  error: Error | null;
  setError: (error: Error | null) => void;
  setLastGoodJsx: (jsx: string) => void;
  components: JsxParserProps["components"];
  bindings: JsxParserProps["bindings"];
  onErrorProp?: (error: Error) => void;
}

const JSXPreviewContext = createContext<JSXPreviewContextValue | null>(null);

const TAG_START_REGEX = /^<\/?([a-zA-Z][a-zA-Z0-9.:-]*)/;

function findTagEnd(source: string, start: number): number {
  let quote: string | null = null;
  let depth = 0;
  for (let index = start; index < source.length; index++) {
    const character = source[index];
    if (quote) {
      if (character === "\\") {
        index++;
      } else if (character === quote) {
        quote = null;
      }
    } else if (character === '"' || character === "'" || character === "`") {
      quote = character;
    } else if (character === "{") {
      depth++;
    } else if (character === "}" && depth > 0) {
      depth--;
    } else if (character === ">" && depth === 0) {
      return index;
    }
  }
  return -1;
}

const useJSXPreview = () => {
  const context = useContext(JSXPreviewContext);
  if (!context) {
    throw new Error("JSXPreview components must be used within JSXPreview");
  }
  return context;
};

const matchJsxTag = (code: string) => {
  let quote: string | null = null;
  let expressionDepth = 0;

  for (let index = 0; index < code.length; index++) {
    const character = code[index];
    if (quote) {
      if (character === "\\") {
        index++;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (code.startsWith("<!--", index)) {
      const end = code.indexOf("-->", index + 4);
      if (end < 0) return null;
      index = end + 2;
      continue;
    }
    if (expressionDepth > 0 && code.startsWith("/*", index)) {
      const commentEnd = code.indexOf("*/", index + 2);
      if (commentEnd < 0) return null;
      index = commentEnd + 1;
      continue;
    }
    if (expressionDepth > 0 && code.startsWith("//", index)) {
      const lineEnd = code.indexOf("\n", index + 2);
      if (lineEnd < 0) return null;
      index = lineEnd;
      continue;
    }
    if (expressionDepth > 0 && (character === '"' || character === "'" || character === "`")) {
      quote = character;
      continue;
    }
    if (character === "{") {
      expressionDepth++;
      continue;
    }
    if (character === "}" && expressionDepth > 0) {
      expressionDepth--;
      continue;
    }
    if (expressionDepth > 0 || character !== "<") continue;

    const start = code.slice(index).match(TAG_START_REGEX);
    if (!start) continue;
    const boundary = code[index + start[0].length];
    if (boundary && !/[\s/>]/.test(boundary)) continue;
    const closingIndex = findTagEnd(code, index + start[0].length);
    if (closingIndex < 0) return null;
    const tag = code.slice(index, closingIndex + 1);
    const type = /^<\//.test(tag)
      ? "closing"
      : /\/\s*>$/.test(tag)
        ? "self-closing"
        : "opening";
    return {
      attributes: "",
      endIndex: closingIndex + 1,
      startIndex: index,
      tag,
      tagName: start[1],
      type,
    };
  }
  return null;
};

const stripIncompleteTag = (text: string) => {
  const openComment = text.lastIndexOf("<!--");
  if (openComment >= 0 && text.indexOf("-->", openComment) < 0) {
    return text.slice(0, openComment);
  }
  return text.replace(/<\/?(?:[a-zA-Z][a-zA-Z0-9.:-]*(?:\s[^<>]*)?)?$/, "");
};

const completeJsxTag = (code: string) => {
  const stack: string[] = [];
  let result = "";
  let currentPosition = 0;

  while (currentPosition < code.length) {
    const match = matchJsxTag(code.slice(currentPosition));
    if (!match) {
      result += stripIncompleteTag(code.slice(currentPosition));
      break;
    }
    const { tagName, type, startIndex, endIndex, tag } = match;
    result += code.slice(currentPosition, currentPosition + startIndex);

    if (type === "opening") {
      stack.push(tagName);
      result += tag;
    } else if (type === "closing") {
      if (stack.includes(tagName)) {
        while (stack.at(-1) !== tagName) {
          result += `</${stack.pop()}>`;
        }
        stack.pop();
        result += tag;
      }
    } else {
      result += tag;
    }

    currentPosition += endIndex;
  }

  return (
    result +
    stack
      .toReversed()
      .map((tag) => `</${tag}>`)
      .join("")
  );
};

type JSXPreviewProps = ComponentProps<"div"> & {
  jsx: string;
  isStreaming?: boolean;
  components?: JsxParserProps["components"];
  bindings?: JsxParserProps["bindings"];
  onError?: (error: Error) => void;
};

const JSXPreview = memo(
  ({
    jsx,
    isStreaming = false,
    components,
    bindings,
    onError,
    className,
    children,
    ...props
  }: JSXPreviewProps) => {
    const [prevJsx, setPrevJsx] = useState(jsx);
    const [error, setError] = useState<Error | null>(null);
    const [_lastGoodJsx, setLastGoodJsx] = useState("");

    // Clear error when jsx changes (derived state pattern)
    if (jsx !== prevJsx) {
      setPrevJsx(jsx);
      setError(null);
    }

    const processedJsx = useMemo(
      () => (isStreaming ? completeJsxTag(jsx) : jsx),
      [jsx, isStreaming],
    );

    const contextValue = useMemo(
      () => ({
        bindings,
        components,
        error,
        isStreaming,
        jsx,
        onErrorProp: onError,
        processedJsx,
        setError,
        setLastGoodJsx,
      }),
      [
        bindings,
        components,
        error,
        isStreaming,
        jsx,
        onError,
        processedJsx,
        setError,
      ],
    );

    return (
      <JSXPreviewContext.Provider value={contextValue}>
        <div className={cn("relative", className)} {...props}>
          {children}
        </div>
      </JSXPreviewContext.Provider>
    );
  },
);

JSXPreview.displayName = "JSXPreview";

type JSXPreviewContentProps = Omit<ComponentProps<"div">, "children">;

const JSXPreviewContent = memo(
  ({ className, ...props }: JSXPreviewContentProps) => {
    const {
      processedJsx,
      isStreaming,
      components,
      bindings,
      setError,
      setLastGoodJsx,
      onErrorProp,
    } = useJSXPreview();
    const errorReportedRef = useRef<string | null>(null);
    const lastGoodJsxRef = useRef("");
    const [hadError, setHadError] = useState(false);

    // Reset error tracking when jsx changes
    useEffect(() => {
      errorReportedRef.current = null;
      setHadError(false);
    }, [processedJsx]);

    const handleError = useCallback(
      (err: Error) => {
        // Prevent duplicate error reports for the same jsx
        if (errorReportedRef.current === processedJsx) {
          return;
        }
        errorReportedRef.current = processedJsx;

        // During streaming, suppress errors and fall back to last good JSX
        if (isStreaming) {
          setHadError(true);
          return;
        }

        setError(err);
        onErrorProp?.(err);
      },
      [processedJsx, isStreaming, onErrorProp, setError],
    );

    // Track the last JSX that rendered without error
    useEffect(() => {
      if (!errorReportedRef.current) {
        lastGoodJsxRef.current = processedJsx;
        setLastGoodJsx(processedJsx);
      }
    }, [processedJsx, setLastGoodJsx]);

    // During streaming, if the current JSX errored, re-render with last good version
    const displayJsx =
      isStreaming && hadError ? lastGoodJsxRef.current : processedJsx;

    return (
      <div className={cn("jsx-preview-content", className)} {...props}>
        <JsxParser
          bindings={bindings}
          components={components}
          jsx={displayJsx}
          onError={handleError}
          renderInWrapper={false}
        />
      </div>
    );
  },
);

JSXPreviewContent.displayName = "JSXPreviewContent";

type JSXPreviewErrorProps = ComponentProps<"div"> & {
  children?: ReactNode | ((error: Error) => ReactNode);
};

const renderChildren = (
  children: ReactNode | ((error: Error) => ReactNode),
  error: Error,
): ReactNode => {
  if (typeof children === "function") {
    return children(error);
  }
  return children;
};

const JSXPreviewError = memo(
  ({ className, children, ...props }: JSXPreviewErrorProps) => {
    const { error } = useJSXPreview();

    if (!error) {
      return null;
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm",
          className,
        )}
        {...props}
      >
        {children ? (
          renderChildren(children, error)
        ) : (
          <>
            <AlertCircle className="size-4 shrink-0" />
            <span>{error.message}</span>
          </>
        )}
      </div>
    );
  },
);

JSXPreviewError.displayName = "JSXPreviewError";

export {
  useJSXPreview,
  JSXPreview,
  JSXPreviewContent,
  JSXPreviewError,
  type JSXPreviewProps,
  type JSXPreviewContentProps,
  type JSXPreviewErrorProps,
};
