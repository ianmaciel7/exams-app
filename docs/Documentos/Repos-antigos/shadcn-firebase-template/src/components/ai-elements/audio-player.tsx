"use client";

import type { Experimental_SpeechResult as SpeechResult } from "ai";
import {
  MediaControlBar,
  MediaController,
  MediaDurationDisplay,
  MediaMuteButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaVolumeRange,
} from "media-chrome/react";
import type { ComponentProps, CSSProperties } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

type AudioPlayerProps = Omit<ComponentProps<typeof MediaController>, "audio">;

const AudioPlayer = ({ children, style, ...props }: AudioPlayerProps) => (
  <MediaController
    audio
    data-slot="audio-player"
    style={
      {
        "--media-background-color": "transparent",
        "--media-button-icon-height": "1rem",
        "--media-button-icon-width": "1rem",
        "--media-control-background": "transparent",
        "--media-control-hover-background": "var(--color-accent)",
        "--media-control-padding": "0",
        "--media-font": "var(--font-sans)",
        "--media-font-size": "10px",
        "--media-icon-color": "currentColor",
        "--media-preview-time-background": "var(--color-background)",
        "--media-preview-time-border-radius": "var(--radius-md)",
        "--media-preview-time-text-shadow": "none",
        "--media-primary-color": "var(--color-primary)",
        "--media-range-bar-color": "var(--color-primary)",
        "--media-range-track-background": "var(--color-secondary)",
        "--media-secondary-color": "var(--color-secondary)",
        "--media-text-color": "var(--color-foreground)",
        "--media-tooltip-arrow-display": "none",
        "--media-tooltip-background": "var(--color-background)",
        "--media-tooltip-border-radius": "var(--radius-md)",
        ...style,
      } as CSSProperties
    }
    {...props}
  >
    {children}
  </MediaController>
);

type AudioPlayerElementProps = Omit<ComponentProps<"audio">, "src"> &
  (
    | {
        data: SpeechResult["audio"];
      }
    | {
        src: string;
      }
  );

const AudioPlayerElement = ({ ...props }: AudioPlayerElementProps) => (
  // oxlint-disable-next-line eslint-plugin-jsx-a11y(media-has-caption) -- audio player captions are provided by consumer
  <audio
    data-slot="audio-player-element"
    slot="media"
    src={
      "src" in props
        ? props.src
        : `data:${props.data.mediaType};base64,${props.data.base64}`
    }
    {...props}
  />
);

type AudioPlayerControlBarProps = ComponentProps<typeof MediaControlBar>;

const AudioPlayerControlBar = ({
  children,
  ...props
}: AudioPlayerControlBarProps) => (
  <MediaControlBar data-slot="audio-player-control-bar" {...props}>
    <ButtonGroup orientation="horizontal">{children}</ButtonGroup>
  </MediaControlBar>
);

type AudioPlayerPlayButtonProps = ComponentProps<typeof MediaPlayButton>;

const AudioPlayerPlayButton = ({
  className,
  disabled,
  preventClick,
  ref,
  ...props
}: AudioPlayerPlayButtonProps) => (
  <MediaPlayButton
    className={cn(
      buttonVariants({ size: "icon-sm", variant: "outline" }),
      "bg-transparent",
      className,
    )}
    disabled={disabled}
    ref={(element) => {
      if (element) element.preventClick = Boolean(disabled || preventClick);
      if (typeof ref === "function") return ref(element);
      if (ref) ref.current = element;
    }}
    data-slot="audio-player-play-button"
    {...props}
  />
);

type AudioPlayerSeekBackwardButtonProps = ComponentProps<
  typeof MediaSeekBackwardButton
>;

const AudioPlayerSeekBackwardButton = ({
  className,
  disabled,
  preventClick,
  ref,
  seekOffset = 10,
  ...props
}: AudioPlayerSeekBackwardButtonProps) => (
  <MediaSeekBackwardButton
    className={cn(
      buttonVariants({ size: "icon-sm", variant: "outline" }),
      "bg-transparent",
      className,
    )}
    disabled={disabled}
    ref={(element) => {
      if (element) element.preventClick = Boolean(disabled || preventClick);
      if (typeof ref === "function") return ref(element);
      if (ref) ref.current = element;
    }}
    data-slot="audio-player-seek-backward-button"
    seekOffset={seekOffset}
    {...props}
  />
);

type AudioPlayerSeekForwardButtonProps = ComponentProps<
  typeof MediaSeekForwardButton
>;

const AudioPlayerSeekForwardButton = ({
  className,
  disabled,
  preventClick,
  ref,
  seekOffset = 10,
  ...props
}: AudioPlayerSeekForwardButtonProps) => (
  <MediaSeekForwardButton
    className={cn(
      buttonVariants({ size: "icon-sm", variant: "outline" }),
      "bg-transparent",
      className,
    )}
    disabled={disabled}
    ref={(element) => {
      if (element) element.preventClick = Boolean(disabled || preventClick);
      if (typeof ref === "function") return ref(element);
      if (ref) ref.current = element;
    }}
    data-slot="audio-player-seek-forward-button"
    seekOffset={seekOffset}
    {...props}
  />
);

type AudioPlayerTimeDisplayProps = ComponentProps<typeof MediaTimeDisplay>;

const AudioPlayerTimeDisplay = ({
  className,
  ...props
}: AudioPlayerTimeDisplayProps) => (
  <ButtonGroupText
    className="bg-transparent"
    render={
      <MediaTimeDisplay
        className={cn("tabular-nums", className)}
        data-slot="audio-player-time-display"
        {...props}
      />
    }
  ></ButtonGroupText>
);

type AudioPlayerTimeRangeProps = ComponentProps<typeof MediaTimeRange>;

const AudioPlayerTimeRange = ({
  className,
  ...props
}: AudioPlayerTimeRangeProps) => (
  <ButtonGroupText
    className="bg-transparent"
    render={
      <MediaTimeRange
        className={cn("", className)}
        data-slot="audio-player-time-range"
        {...props}
      />
    }
  ></ButtonGroupText>
);

type AudioPlayerDurationDisplayProps = ComponentProps<
  typeof MediaDurationDisplay
>;

const AudioPlayerDurationDisplay = ({
  className,
  ...props
}: AudioPlayerDurationDisplayProps) => (
  <ButtonGroupText
    className="bg-transparent"
    render={
      <MediaDurationDisplay
        className={cn("tabular-nums", className)}
        data-slot="audio-player-duration-display"
        {...props}
      />
    }
  ></ButtonGroupText>
);

type AudioPlayerMuteButtonProps = ComponentProps<typeof MediaMuteButton>;

const AudioPlayerMuteButton = ({
  className,
  ...props
}: AudioPlayerMuteButtonProps) => (
  <ButtonGroupText
    className="bg-transparent"
    render={
      <MediaMuteButton
        className={cn("", className)}
        data-slot="audio-player-mute-button"
        {...props}
      />
    }
  ></ButtonGroupText>
);

type AudioPlayerVolumeRangeProps = ComponentProps<typeof MediaVolumeRange>;

const AudioPlayerVolumeRange = ({
  className,
  ...props
}: AudioPlayerVolumeRangeProps) => (
  <ButtonGroupText
    className="bg-transparent"
    render={
      <MediaVolumeRange
        className={cn("", className)}
        data-slot="audio-player-volume-range"
        {...props}
      />
    }
  ></ButtonGroupText>
);

export {
  AudioPlayer,
  AudioPlayerElement,
  AudioPlayerControlBar,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerDurationDisplay,
  AudioPlayerMuteButton,
  AudioPlayerVolumeRange,
  type AudioPlayerProps,
  type AudioPlayerElementProps,
  type AudioPlayerControlBarProps,
  type AudioPlayerPlayButtonProps,
  type AudioPlayerSeekBackwardButtonProps,
  type AudioPlayerSeekForwardButtonProps,
  type AudioPlayerTimeDisplayProps,
  type AudioPlayerTimeRangeProps,
  type AudioPlayerDurationDisplayProps,
  type AudioPlayerMuteButtonProps,
  type AudioPlayerVolumeRangeProps,
};
