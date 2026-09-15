# Server actions

Paths: `app/**/actions.ts`, and any file marked `"use server"`.

**Next.js rule pack.** Delete this file in a repository that does not use the App Router.

## A server action is a public HTTP endpoint

It looks like a function call. That is exactly the danger: the syntax hides the fact that
anyone on the internet can invoke it with any arguments. The component that calls it does not
constrain who reaches it, and a check on the page rendering the form does not protect the
action behind it.

Treat every action as though its file were named `app/api/.../route.ts`.

## Authorization and schema validation, every time

In this order. The order is the rule - validating after use, or authorizing after the write,
is the flaw this file exists to prevent.

```ts
"use server";

export async function updateThing(input: unknown) {
  const session = await requireSession();                    // 1. authenticate
  const data = UpdateThingSchema.parse(input);               // 2. validate
  const thing = await db.thing.findFirst({                   // 3. authorize, scoped
    where: { id: data.id, orgId: session.orgId },
  });
  if (!thing) notFound();

  await db.thing.update({                                    // 4. act, narrowly
    where: { id: thing.id },
    data: { name: data.name },
  });
  revalidatePath(`/things/${thing.id}`);
}
```

## Rules

- **Every action authenticates.** No exception for one "only called from an authenticated
  page" - the caller is not a control.
- **Every action validates its input against a schema.** The TypeScript signature is erased
  at runtime and proves nothing about what was actually sent.
- **Allowlist the fields written.** Never spread validated input into an update.
- **Return errors, do not throw raw ones.** An unhandled throw serializes something to the
  client; decide what the client sees.
- **Revalidate precisely.** `revalidateTag` where tags exist; `revalidatePath` on the narrowest
  path that changed.
- **Rate-limit anything expensive** - mail, SMS, uploads, third-party calls.
- **Nothing secret in the return value.** Whatever an action returns crosses to the client.

## Tests in the same PR

Succeeds for the owner; rejects invalid input at the schema before any effect; rejects the
anonymous caller; rejects another user's ID **and the record is verifiably unchanged**.

Assert the record afterwards. A 403 returned after the write still wrote.
