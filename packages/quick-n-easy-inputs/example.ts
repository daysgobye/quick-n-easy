import { QuickNEasyORM, type DatabaseDeclaration } from "quick-n-easy-orm/quickNEasyOrm";
import { createDB } from "quick-n-easy-orm/shims/bunSqliteShim";
import { QuickNEasyInputs } from "./quickNEasyInputs";


// const db = new Database(":memory:");
const db = createDB(":memory:")
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

// --- ADMIN UI EXAMPLE ---
async function runAdminUIExample() {
    console.log("\n--- Creating AdminUI instance ---");
    const adminUI = new QuickNEasyInputs(orm);

    // Register a custom renderer for image fields
    adminUI.registerRenderers({
        "image": async (name) => `<input type="text" id="${name}" name="${name}" placeholder="Enter image URL" />
    <div class="preview-container" id="${name}-preview"></div>
    <script>
      document.getElementById("${name}").addEventListener("change", function() {
        const preview = document.getElementById("${name}-preview");
        preview.innerHTML = this.value ? '<img src="' + this.value + '" style="max-width: 100%; margin-top: 10px;">' : "";
      });
    </script>`
    });

    console.log("\n--- Generating User Form ---");
    const userForm = await adminUI.generateForm("user", "/api/users");
    console.log("User form HTML generated:");
    console.log(userForm);

    console.log("\n--- Generating Post Form ---");
    const postForm = await adminUI.generateForm("post", "/api/posts");
    console.log("Post form HTML generated:");
    console.log(postForm);

    // Save the forms to HTML files for viewing

}

// Run both examples
async function runAll() {
    try {
        await runAdminUIExample();
    } catch (err) {
        console.error("❌ Error during examples:", err);
    }
}

runAll();
