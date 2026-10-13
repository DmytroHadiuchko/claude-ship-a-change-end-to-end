# Notes: PUT /users/:id

## The plan

Before any code, Claude restated the requirements and listed the open
questions; I answered them, then approved a plan written as a call chain
(`server.js` → `routes/users.js` → `db/store.js`). The decisions it fixed:

- `PUT` is a full replacement, so both `name` and `email` are required.
- "Invalid" means not a string, empty or whitespace-only, or an email
  without an `@`. Each case gets its own `{ error }` message, in the same
  shape the existing routes use.
- A non-numeric id (`/users/abc`) returns 404, matching `GET /users/:id`.
- The body is validated before the user is looked up (400 before 404), so
  a bad request never touches stored data.
- Data access goes through a new `store.updateUser`, which returns
  `undefined` for an unknown id and leaves the HTTP decision to the route.

I accepted the proposed answers to every open question without changes.
One addition came from the plan itself: the minimal `@` check on email,
since the brief asks to reject *invalid* fields, not just missing ones.

## Model

Opus 5.5. The feature is small, but the brief has gaps — what counts as
"invalid", the order of 400 and 404, how to treat a non-numeric id. I wanted
a model that would raise those questions instead of guessing.

## Commits

The plan called for three commits: `store.updateUser`, then the `PUT` route
with validation, then this file. That would have kept the data layer and the
HTTP layer reviewable on their own. In practice the work was committed by
hand (a local hook requires a Jira key in the commit header, so Claude
couldn't commit), and the three changes ended up in a single commit. I kept
it that way, not rewriting the branch, and gave the commit a message that
describes the whole change. The diff is small (3 files, about 110 lines),
so one commit is still readable, but the store/route split is visible only
in the diff, not in the history.

## Review

The self-review of the diff found no code changes to make. Its one real
finding was about process: the commit message "Ship a real change end to end"
doesn't say what changed. On the code side the review confirmed:

- unknown and non-numeric ids return 404
- a missing body, a non-object body, or non-string / blank fields return 400
  instead of throwing
- `id` and extra fields in the body are ignored
- the 400 test on `/users/1` doesn't mutate user 1

Two things were noted but left out of scope, because changing them would
also touch `GET`: `Number("0x1")` resolves to id 1, and values are validated
but not trimmed.

Node.js wasn't installed on the dev machine, so the tests were never run
locally; `npm run lint` and `npm test` are checked only by CI on the pull
request.
