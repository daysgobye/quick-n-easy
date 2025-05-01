# Quick N Easy ORM: The SUPER FUCKING EZ ORM for SQlite

So you’re here because you need an ORM that won’t put you to sleep with complexity, huh? Well, lucky for you, you’ve found it. QuickNEasyORM is for those who don’t have time to mess around with 3 million files, 42 classes, and endless configuration. You want something that works, right now. If you think this ORM won’t work for you, you're probably wrong—but that’s just because your side project is never going to hit 5 users anyway. So whatever, it’s fine. You’ll be fine with this.

## The Goal? Get From 0 to 1, Fast.

Do you really want to spend 2 hours setting up an entity? A schema? A migrations just to insert a single thing into your database? Yeah, of course not. You want to build your app, not spend time configuring an ORM. The whole point of this package is to let you go from **zero to one** as fast as possible. If you were here for anything else, you’re in the wrong place.

### Compare to the Other ORMs

Let’s talk about the competition. You know, the other ORMs out there that require so much setup, it feels like you’re building an entire app just to add a new table? Here's how that looks:
```
.
├── .dbpackage
└── src/
    ├── models/
    │   ├── user.ts
    │   └── post.ts
    ├── entity/
    │   ├── user.ts
    │   └── post.ts
    ├── lib/
    │   └── db.ts
    └── index.ts
```
In contrast, here’s what you’ll be doing with QuickNEasyORM:

```js
import { type DatabaseDeclaration, QuickNEasyORM } from "quick-n-easy-orm";
// bun
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";
// node
// import { createDB } from "quick-n-easy-orm/shims/betterSqlite3Shim";
// D1
// import { createDB } from "quick-n-easy-orm/shims/d1Shim";


const db = createDB(":memory:");

// --- DECLARATION ---
const dbDeclaration: DatabaseDeclaration = {
    post: {
        title: "text",
        body: "long text",
        author: { type: "one-to-one", ref: "user" },
        image: "image",
    },
    user: {
        email: "text",
        password: "text",
        posts: { type: "one-to-many", ref: "post" },
    }
};

// --- INIT ORM ---
export const orm = new QuickNEasyORM(db, dbDeclaration);

// --- INDEX.TS---
// in your app doing real work solving a problem no one needed soved
import { orm } from "./db";
const user = await orm.insert("user", { email: "test@example.com", password: "password123" });
const users = await orm.list("user");
const post = await orm.insert("post", {
        title: "My First Post",
        body: "This is the body of the first post.",
        author: user.id,
        image: "https://placekitten.com/400/400"
    });
const fetchedUser = await orm.get(users[0].id);
fetchedUser.email = "updated@example.com";
const updatedUser = await orm.update(fetchedUser);
await orm.delete(users[0].id);


```

And that’s it. One DB file, one import, and you're querying away. No need for 10,000 files just to get **one thing** into the DB. **You’re welcome**.


### Filters & Pagination? Who Cares?

If you're worried about filtering or pagination in SQL, maybe this isn’t for you. Oh wait, did you really just say "pagination"? Buddy, **you're not going to have so many rows that you can’t filter them in JavaScript**. Because if you could, you wouldn’t be here looking for **QuickNEasyORM**, right? You’re looking for something light and fast, not a bloated mess of features you’ll never need.

### You Know SQL? You Don’t Need to Know This Package.

If you’re one of those people who thinks "SQL is the only way", don’t even bother. This package is made for **people who don’t know SQL**, and that’s perfectly fine. You know what you shouldn’t be doing? Writing classes to create `list()`, `get()`, `insert()`, `update()` functions. You know what’s better? **Letting QuickNEasyORM do all that for you**. It's called productivity.

### N+1 Query Problem? Yep, It's Here. And We Don’t Care.

Oh, the **N+1 query problem**? Yeah, it's there. And guess what? We don’t care. Why? Because **nobody’s using your app anyway**. But if you’ve got real users and that N+1 problem is giving you a headache? Hey, congratulations. You've got a *good problem*. Go upgrade to something fancier, like Drizzle. QuickNEasyORM? It’s for people who don’t want to deal with over-engineering their app. It’s quick, it’s dirty, and it **works**.

### Column Types: The Basics

If you’re wondering about column types, here they are:

```ts
export type ColumnType = "text" | "long text" | "image" | "date" | "json" | "number" | "bool" | { type: "one-to-one" | "one-to-many", ref: string };
```

If you want something that’s not on this list, just parse it from a string and move on. Seriously. Don’t overthink it.


## Features

- Define database schema using JavaScript/TypeScript objects
- Automatic table creation based on schema and migrations
- Support for relationships (one-to-one, one-to-many)
- Automatic handling of metadata, creation and update timestamps
- Simple CRUD API (get, list, insert, update, delete)
- Automatically fetch 1 relation in get or list operation

## Not Features
- speed (you’re not here for that)
- complex queries (you’re not building Facebook)
- advanced relationships (not needed, deal with it)
- advanced migrations (again, *not needed*)
- advanced data types (LOL)
- advanced data validation (don’t need it)
- advanced error handling (you’ll figure it out)
- advanced logging (I left in console.logs for you)
- caching (we don't need that, *you* don't need that)
- security (you’re probably not making a bank app anyway)
- performance (you got like 3 rows anyway)
- testing (lol, sure)
- deployment (if you’re deploying this, I’m impressed)
- documentation (you read this far, so you’re fine)
- support (maybe later, maybe never)

This is a *super simple* ORM, people. It does its job. No need to make it complicated.


### The Big Picture: Simple ORM = No BS

In the end, if QuickNEasyORM is causing problems in your app? **Good job!** You’ve got users. You’ve succeeded. Now go upgrade to something more powerful, like Drizzle. QuickNEasyORM got you from point A to point B fast—and that’s the point.

If you don’t like the way this package works, maybe you need to reconsider your life choices.

