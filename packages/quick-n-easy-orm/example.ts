import { type DatabaseDeclaration, QuickNEasyORM } from "./quickNEasyOrm";
import { createBunSqliteDB } from "./shims/bunSqliteShim";

// const db = new Database(":memory:");
const db = createBunSqliteDB(":memory:")
// const db = new Database("example.db");



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
const orm = new QuickNEasyORM(db, dbDeclaration);

// --- EXAMPLE WORKFLOW ---
async function runExample() {
    console.log("\n--- Inserting user ---");
    const user = await orm.insert("user", { email: "test@example.com", password: "password123" });
    console.log(user);

    console.log("\n--- Inserting another user ---");
    const user2 = await orm.insert("user", { email: "second@example.com", password: "password456" });
    console.log(user2);

    console.log("\n--- Listing users ---");
    const users = await orm.list("user");
    console.log(users);

    console.log("\n--- Inserting a post linked to the first user ---");
    const post = await orm.insert("post", {
        title: "My First Post",
        body: "This is the body of the first post.",
        author: user.id,
        image: "https://placekitten.com/400/400"
    });
    console.log(post);

    console.log("\n--- Listing posts ---");
    const posts = await orm.list("post");
    console.log(posts);

    console.log("\n--- Getting specific user by ID ---");
    const fetchedUser = await orm.get(user.id);
    console.log(fetchedUser);

    console.log("\n--- Updating the user's email ---");
    fetchedUser.email = "updated@example.com";
    const updatedUser = await orm.update(fetchedUser);
    console.log(updatedUser);

    console.log("\n--- Deleting second user ---");
    await orm.delete(user2.id);
    console.log(`Deleted user with id ${user2.id}`);

    console.log("\n--- Final user list ---");
    const finalUsers = await orm.list("user");
    console.log(JSON.stringify(finalUsers, null, 2));

    console.log("\n--- Final post list ---");
    const finalPosts = await orm.list("post");
    console.log(finalPosts);
}

// --- ADMIN UI EXAMPLE ---
async function runAdminUIExample() {
    //     console.log("\n--- Creating AdminUI instance ---");
    //     const adminUI = new AdminUI(dbDeclaration, orm);

    //     // Register a custom renderer for image fields
    //     adminUI.registerRenderers({
    //         "image": async (name) => `<input type="text" id="${name}" name="${name}" placeholder="Enter image URL" />
    // <div class="preview-container" id="${name}-preview"></div>
    // <script>
    //   document.getElementById("${name}").addEventListener("change", function() {
    //     const preview = document.getElementById("${name}-preview");
    //     preview.innerHTML = this.value ? '<img src="' + this.value + '" style="max-width: 100%; margin-top: 10px;">' : "";
    //   });
    // </script>`
    //     });

    //     console.log("\n--- Generating User Form ---");
    //     const userForm = await adminUI.generateForm("user", "/api/users");
    //     console.log("User form HTML generated:");
    //     console.log(userForm);

    //     console.log("\n--- Generating Post Form ---");
    //     const postForm = await adminUI.generateForm("post", "/api/posts");
    //     console.log("Post form HTML generated:");
    //     console.log(postForm);

    //     // Save the forms to HTML files for viewing

}

// Run both examples
async function runAll() {
    try {
        await runExample();
        await runAdminUIExample();
    } catch (err) {
        console.error("❌ Error during examples:", err);
    }
}

runAll();
