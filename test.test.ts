import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { SimpleORM, type DatabaseDeclaration, type GenericDB } from "./simpleOrm";
import { createBunSqliteDB } from "./shims/bunSqliteShim";

describe("SimpleORM", () => {
    let db: GenericDB;
    let orm: SimpleORM;
    let userId: string;
    let postId: string;

    // Define test database schema
    const dbDeclaration: DatabaseDeclaration = {
        post: {
            title: "text",
            body: "long text",
            author: { type: "one-to-one", ref: "user" },
            image: "text"
        },
        user: {
            email: "text",
            password: "text",
            posts: { type: "one-to-many", ref: "post" },
        }
    };

    // Setup before each test
    beforeEach(() => {
        // Create in-memory SQLite database
        db = createBunSqliteDB(":memory:")

        orm = new SimpleORM(db, dbDeclaration);
    });

    // Cleanup after each test
    afterEach(() => {
        db.close();
    });

    describe("CRUD Operations", () => {
        test("should insert a user", async () => {
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            expect(user).toBeDefined();
            expect(user.id).toBeString();
            expect(user.id).toStartWith("user_");
            expect(user.email).toBe("test@example.com");
            expect(user.password).toBe("password123");
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);

            userId = user.id;
        });

        test("should get a user by id", async () => {
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            const fetchedUser = await orm.get(user.id);

            expect(fetchedUser).toBeDefined();
            expect(fetchedUser.id).toBe(user.id);
            expect(fetchedUser.email).toBe("test@example.com");
        });

        test("should list all users", async () => {
            await orm.insert("user", {
                email: "user1@example.com",
                password: "password1"
            });

            await orm.insert("user", {
                email: "user2@example.com",
                password: "password2"
            });

            const users = await orm.list("user");

            expect(users).toBeArray();
            expect(users.length).toBe(2);
            expect(users[0].email).toBe("user1@example.com");
            expect(users[1].email).toBe("user2@example.com");
        });

        test("should update a user", async () => {
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            user.email = "updated@example.com";
            const updatedUser = await orm.update(user);

            expect(updatedUser.email).toBe("updated@example.com");

            // Verify by fetching again
            const fetchedUser = await orm.get(user.id);
            expect(fetchedUser.email).toBe("updated@example.com");
        });

        test("should delete a user", async () => {
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            await orm.delete(user.id);

            // Verify user is deleted by checking list
            const users = await orm.list("user");
            expect(users.length).toBe(0);

            // Verify get throws error
            try {
                await orm.get(user.id);
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                //@ts-ignore
                expect(error.message).toContain("not found");
            }
        });
    });

    describe("Relationships", () => {
        test("should handle one-to-one relationships", async () => {
            // Create a user
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            // Create a post linked to the user
            const post = await orm.insert("post", {
                title: "Test Post",
                body: "This is a test post",
                author: user.id,
                image: "https://example.com/image.jpg"
            });

            // Verify post has user reference
            expect(post.author).toBeDefined();
            // Add type assertion to fix TypeScript errors
            const authorRecord = post.author as { id: string; email: string };
            expect(authorRecord.id).toBe(user.id);
            expect(authorRecord.email).toBe("test@example.com");

            // Get the post and check relationship
            const fetchedPost = await orm.get(post.id);
            expect(fetchedPost.author).toBeDefined();
            // Add type assertion to fix TypeScript errors
            const fetchedAuthor = fetchedPost.author as { id: string };
            expect(fetchedAuthor.id).toBe(user.id);
        });

        test("should handle one-to-many relationships", async () => {
            // Create a user
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            // Create multiple posts linked to the user
            const post1 = await orm.insert("post", {
                title: "Post 1",
                body: "This is post 1",
                author: user.id,
                image: "https://example.com/image1.jpg"
            });

            const post2 = await orm.insert("post", {
                title: "Post 2",
                body: "This is post 2",
                author: user.id,
                image: "https://example.com/image2.jpg"
            });

            // Get the user and check posts relationship
            const fetchedUser = await orm.get(user.id);
            expect(fetchedUser.posts).toBeDefined();
            expect(fetchedUser.posts).toBeArray();

            // Verify we can find both posts in the database
            const posts = await orm.list("post");
            expect(posts.length).toBe(2);

            // Verify post titles
            const postTitles = posts.map(post => post.title).sort();
            expect(postTitles).toEqual(["Post 1", "Post 2"]);

            // Verify both posts have the correct author
            posts.forEach(post => {
                expect(post.author).toBeDefined();
                // Add type assertion to fix TypeScript errors
                const postAuthor = post.author as { id: string };
                expect(postAuthor.id).toBe(user.id);
            });
        });
    });

    describe("Edge Cases", () => {
        test("should handle missing fields with default values", async () => {
            // Insert with minimal data
            const user = await orm.insert("user", {
                email: "test@example.com"
                // password is missing
            });

            expect(user.password).toBe(""); // Default for text type
            // For relationship fields, they might be null initially
            expect(user.posts).toBeDefined();
        });

        test("should validate field types", async () => {
            try {
                // @ts-ignore - intentionally passing wrong type for testing
                await orm.insert("user", {
                    email: 123, // Should be string
                    password: "password123"
                });
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                //@ts-ignore
                expect(error.message).toContain('should be a string');
            }
        });

        test("should reject unknown fields", async () => {
            try {
                // @ts-ignore - intentionally passing unknown field for testing
                await orm.insert("user", {
                    email: "test@example.com",
                    password: "password123",
                    unknownField: "value"
                });
                expect(true).toBe(false); // Should not reach here
            } catch (error) {
                //@ts-ignore
                expect(error.message).toContain('Unexpected field');
            }
        });

        test("should handle circular references", async () => {
            // Create a user
            const user = await orm.insert("user", {
                email: "test@example.com",
                password: "password123"
            });

            // Create a post linked to the user
            const post = await orm.insert("post", {
                title: "Test Post",
                body: "This is a test post",
                author: user.id,
                image: "https://example.com/image.jpg"
            });

            // Get the user and verify it has the post
            const fetchedUser = await orm.get(user.id);
            expect(fetchedUser.posts).toBeArray();
            //@ts-ignore
            expect(fetchedUser.posts.length).toBe(1);
            // Add type assertion to fix TypeScript errors
            //@ts-ignore
            const userPost = fetchedUser.posts[0] as { title: string };
            expect(userPost.title).toBe("Test Post");

            // Verify the post has the user reference
            const fetchedPost = await orm.get(post.id);
            expect(fetchedPost.author).toBeDefined();
            // Add type assertion to fix TypeScript errors
            const postAuthor = fetchedPost.author as { id: string };
            expect(postAuthor.id).toBe(user.id);
        });
    });
});

// the example shows this works but this doesnt work

// describe("Migration Tests", () => {
//     let db: Database;
//     let orm: SimpleORM;
//     const dbPath = "./test-db.sqlite";

//     // Define test database schema
//     const dbDeclaration: DatabaseDeclaration = {
//         post: {
//             title: "text",
//             body: "long text",
//             author: { type: "one-to-one", ref: "user" },
//             image: "text"
//         },
//         user: {
//             email: "text",
//             password: "text",
//             posts: { type: "one-to-many", ref: "post" },
//         }
//     };

//     beforeEach(async () => {
//         const file = Bun.file(dbPath)
//         const exists = await file.exists();
//         if (exists) {
//             file.delete();
//         }
//         db = new Database(dbPath);
//         orm = new SimpleORM(db, dbDeclaration);
//     });

//     afterEach(async () => {
//         db.close();
//         const file = Bun.file(dbPath)
//         const exists = await file.exists();
//         if (exists) {
//             file.delete();
//         }
//     });

//     test("should add a column and verify all records have it", async () => {
//         // Insert initial records
//         await orm.insert("user", { email: "user1@example.com", password: "password1" });
//         await orm.insert("user", { email: "user2@example.com", password: "password2" });

//         // Modify dbDeclaration to add a new column
//         dbDeclaration.user.newColumn = "text";
//         await db.close();

//         db = new Database(dbPath);
//         orm = new SimpleORM(db, dbDeclaration);

//         // Insert another record
//         await orm.insert("user", { email: "user3@example.com", password: "password3", newColumn: "newValue" });

//         // List all records and verify new column
//         const users = await orm.list("user");

//         expect(users.length).toBe(3);
//         users.forEach(user => {
//             expect(user.newColumn).toBeDefined();
//         });
//     });

//     test("should drop a column and verify new records don't have it", async () => {
//         // Insert initial records
//         await orm.insert("user", { email: "user1@example.com", password: "password1", newColumn: "value1" });
//         await orm.insert("user", { email: "user2@example.com", password: "password2", newColumn: "value2" });

//         // Modify dbDeclaration to drop the column
//         delete dbDeclaration.user.newColumn;
//         await db.close();

//         db = new Database(dbPath);
//         orm = new SimpleORM(db, dbDeclaration);

//         // Insert another record
//         await orm.insert("user", { email: "user3@example.com", password: "password3" });

//         // List all records and verify dropped column
//         const users = await orm.list("user");
//         expect(users.length).toBe(3);
//         expect(users[0].newColumn).toBeDefined();  // old records still have it
//         expect(users[1].newColumn).toBeDefined();
//         expect(users[2].newColumn).toBeUndefined(); // new record won't
//     });
// });