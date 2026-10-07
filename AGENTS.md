<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- `/` is the experiments registry (static list in code); each experiment lives under its own path prefix with an `<prefix>/socials` internal campaign review page. Captured ≠ Remembered keeps its three-step journey at `/captured-remembered`.
- Journal Context (`/journal`) requires sign-in; entries, photos and surfacings are per-user tables scoped by `auth.uid()`, media in the private `journal-media` bucket under `<user_id>/`. AI calls run only in server functions via `src/lib/ai-gateway.server.ts`.
- Store contributed photos in the private `memory-contributions` bucket and metadata in `memory_contributions`; private media must never use public URLs.
- Use art-directed landscape and portrait first-screen photography selected by viewport orientation so the embedded title and family remain visible without letterboxing.
