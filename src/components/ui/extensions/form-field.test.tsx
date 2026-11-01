import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input";
import { Form } from "./form";
import {
  FormField,
  FormFieldDescription,
  FormFieldError,
  FormFieldLabel,
} from "./form-field";

describe("FormField", () => {
  it("links label, description and error to the control and focuses the first invalid one", async () => {
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <FormField name="name">
          <FormFieldLabel>{"Name"}</FormFieldLabel>
          <Input autoComplete="name" />
        </FormField>
        <FormField name="email">
          <FormFieldLabel>{"Email"}</FormFieldLabel>
          <Input type="email" autoComplete="email" required />
          <FormFieldDescription>{"We never share it."}</FormFieldDescription>
          <FormFieldError match="valueMissing">
            {"Enter your email."}
          </FormFieldError>
        </FormField>
        <button type="submit">{"Save"}</button>
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const email = screen.getByLabelText("Email");
    const error = await screen.findByText("Enter your email.");
    await waitFor(() => expect(document.activeElement).toBe(email));
    expect(email.getAttribute("aria-invalid")).toBe("true");
    const describedBy = (email.getAttribute("aria-describedby") ?? "").split(
      " ",
    );
    expect(describedBy).toContain(error.id);
    expect(describedBy).toContain(screen.getByText("We never share it.").id);
    expect(error.getAttribute("role")).toBe("alert");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
