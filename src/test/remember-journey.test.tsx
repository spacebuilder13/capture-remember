import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ getRememberStory: vi.fn(), addRememberReply: vi.fn(), getRememberOwnerStory: vi.fn(), answerRememberFollowup: vi.fn(), deleteRememberStory: vi.fn() }));
vi.mock("@/lib/remember.functions", () => api);
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options, useParams: () => ({ token: "rw_testcode123" }) }),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
import { Route as FamilyRoute } from "@/routes/remember-when/$token";
import { Route as OwnerRoute } from "@/routes/remember-when/me.$token";

const data = { spark: "tiny", story: "We had a picnic.", senderName: "Priya", childName: "Arjun", photoUrl: null, replies: [], last: null };
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  api.getRememberStory.mockResolvedValue(data);
  api.getRememberOwnerStory.mockResolvedValue(data);
});

describe("Remember When mutation recovery", () => {
  it("allows a family member to retry after a rejected reply save", async () => {
    api.addRememberReply.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ ok: true });
    const Component = FamilyRoute.options.component;
    if (!Component) throw new Error("Missing family page");
    render(<Component />);
    fireEvent.change(await screen.findByRole("textbox", { name: "What you remember" }), { target: { value: "Nani brought the cake." } });
    fireEvent.click(screen.getByRole("button", { name: "Add my memory" }));
    await screen.findByText("We could not save your memory. Please try again.");
    fireEvent.click(screen.getByRole("button", { name: "Add my memory" }));
    await waitFor(() => expect(api.addRememberReply).toHaveBeenCalledTimes(2));
    expect(api.addRememberReply.mock.calls[1]?.[0]?.data.memory).toBe("Nani brought the cake.");
  });

  it("reads a saved grandparent check-in on a fresh private-page visit", async () => {
    api.getRememberOwnerStory.mockResolvedValue({ ...data, last: { answer: "joined", who: ["grandparent"] } });
    const Component = OwnerRoute.options.component;
    if (!Component) throw new Error("Missing owner page");
    render(<Component />);
    const grandparent = await screen.findByRole("button", { name: "Grandparent" });
    expect(grandparent).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("button", { name: "Not yet" })).not.toBeInTheDocument();
  });

  it("does not accept a failed check-in and permits retry", async () => {
    api.answerRememberFollowup.mockResolvedValueOnce({ error: "Could not save." }).mockResolvedValueOnce({ ok: true });
    const Component = OwnerRoute.options.component;
    if (!Component) throw new Error("Missing owner page");
    render(<Component />);
    fireEvent.click(await screen.findByRole("button", { name: "Not yet" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Not yet" }));
    await waitFor(() => expect(api.answerRememberFollowup).toHaveBeenCalledTimes(2));
    expect(api.answerRememberFollowup.mock.calls[1]?.[0]?.data.answer).toBe("not_yet");
  });

  it("keeps the story available when deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.deleteRememberStory.mockResolvedValue({ error: "Could not delete." });
    const Component = OwnerRoute.options.component;
    if (!Component) throw new Error("Missing owner page");
    render(<Component />);
    fireEvent.click(await screen.findByRole("button", { name: "Delete my story" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: "Delete my story" })).toBeEnabled();
    expect(screen.queryByText("Your story is deleted.")).not.toBeInTheDocument();
  });
});