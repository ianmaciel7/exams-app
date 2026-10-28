import "@/app/globals.css";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

function SampleMetricCard({
  containerClass = "w-full",
  metricAGroup = "metric-a",
  metricBGroup = "metric-b",
}: {
  containerClass?: string;
  metricAGroup?: string;
  metricBGroup?: string;
}) {
  return (
    <div className={`@container ${containerClass}`}>
      <Card data-testid="card-root" className="w-full">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Analytics Overview</CardTitle>
          <CardDescription data-testid="card-description">
            Live metric tracking
          </CardDescription>
          <CardAction data-testid="card-action">
            <Button size="sm">Export</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div
            data-testid="metrics-grid"
            className="flex flex-col @sm:flex-row gap-4"
          >
            <div
              data-testid={metricAGroup}
              className="flex-1 rounded bg-muted p-4 min-h-[48px]"
            >
              Revenue
            </div>
            <div
              data-testid={metricBGroup}
              className="flex-1 rounded bg-muted p-4 min-h-[48px]"
            >
              Conversions
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col @xs:flex-row gap-2">
          <Button className="w-full @xs:w-auto">View Report</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

test("renders CardHeader with @container/card-header and reflows action into 2-column grid", async () => {
  await page.viewport(768, 800);
  const screen = await render(<SampleMetricCard />);

  const title = screen.getByTestId("card-title").element();
  const action = screen.getByTestId("card-action").element();

  const titleRect = title.getBoundingClientRect();
  const actionRect = action.getBoundingClientRect();

  // CardHeader grid has-data-[slot=card-action] aligns title left and action right
  expect(actionRect.left).toBeGreaterThanOrEqual(titleRect.right - 1);
  expect(Math.abs(titleRect.top - actionRect.top)).toBeLessThan(10);
});

test("adapts card layout using container queries (@container) across mobile and desktop viewports", async () => {
  // Mobile viewport (375px)
  await page.viewport(375, 667);
  const screen = await render(<SampleMetricCard />);
  const card = screen.getByTestId("card-root").element();
  const metricA = screen.getByTestId("metric-a").element();
  const metricB = screen.getByTestId("metric-b").element();

  const cardRect = card.getBoundingClientRect();
  let aRect = metricA.getBoundingClientRect();
  let bRect = metricB.getBoundingClientRect();

  // Card fits viewport without horizontal overflow
  expect(cardRect.width).toBeLessThanOrEqual(375);
  // Narrow container (< 384px) keeps metrics vertically stacked
  expect(bRect.top).toBeGreaterThanOrEqual(aRect.bottom - 1);

  // Desktop viewport (1280px)
  await page.viewport(1280, 800);
  aRect = metricA.getBoundingClientRect();
  bRect = metricB.getBoundingClientRect();

  // In wide container (>= 384px @sm breakpoint), metrics reflow horizontally side-by-side
  expect(Math.abs(aRect.top - bRect.top)).toBeLessThan(5);
  expect(bRect.left).toBeGreaterThanOrEqual(aRect.right - 1);
});

test("demonstrates container query adaptation independent of viewport width", async () => {
  // On desktop viewport (1280px), container query responds to parent box width
  await page.viewport(1280, 800);

  const screen = await render(
    <div>
      <SampleMetricCard
        containerClass="w-[320px]"
        metricAGroup="narrow-a"
        metricBGroup="narrow-b"
      />
      <div className="h-8" />
      <SampleMetricCard
        containerClass="w-[640px]"
        metricAGroup="wide-a"
        metricBGroup="wide-b"
      />
    </div>,
  );

  const narrowA = screen
    .getByTestId("narrow-a")
    .element()
    .getBoundingClientRect();
  const narrowB = screen
    .getByTestId("narrow-b")
    .element()
    .getBoundingClientRect();

  const wideA = screen.getByTestId("wide-a").element().getBoundingClientRect();
  const wideB = screen.getByTestId("wide-b").element().getBoundingClientRect();

  // Narrow container (320px) stacks metrics even on 1280px desktop viewport
  expect(narrowB.top).toBeGreaterThanOrEqual(narrowA.bottom - 1);

  // Wide container (640px) aligns metrics side-by-side
  expect(Math.abs(wideA.top - wideB.top)).toBeLessThan(5);
  expect(wideB.left).toBeGreaterThanOrEqual(wideA.right - 1);
});
