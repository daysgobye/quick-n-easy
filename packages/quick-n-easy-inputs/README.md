# 🎨 Quick-n-Easy Inputs

Because who has time to write forms? Not you! That's why we made Quick-n-Easy Inputs - the magical form generator that turns your database declarations into beautiful, functional forms faster than you can say "npm install".

## 🚀 Features

- **Zero to Forms in Seconds**: Just feed it your database declaration, and BOOM! You've got forms.
- **Custom Input Renderers**: Want your image field to have a preview? A color picker to have a fancy palette? We've got you covered!
- **Seamless ORM Integration**: Works like a charm with Quick-n-Easy ORM (they're besties 👯‍♂️)

## 📦 Installation

```bash
npm install quick-n-easy-inputs
```

## 🎮 Quick Start

```typescript
import { QuickNEasyInputs } from "quick-n-easy-inputs";

// Your existing database declaration and orm
const dbDeclaration = {
    post: {
        title: "text",
        body: "long text",
        image: "image"
    }
};
const db = createBetterSqlite3DB("example.db")
const orm = new QuickNEasyORM(db, dbDeclaration);

// Create your admin UI instance
const adminUI = new QuickNEasyInputs(orm);

// Generate a form - it's that easy!
const form = await adminUI.generateForm("post", "/api/posts");
```

## 🎨 Custom Renderers

Want to make your forms extra fancy? Register custom renderers for any field type:

```typescript
adminUI.registerRenderers({
    "image": async (name) => `
        <input type="text" id="${name}" name="${name}" placeholder="Enter image URL" />
        <div class="preview-container" id="${name}-preview"></div>
        <script>
            document.getElementById("${name}").addEventListener("change", function() {
                const preview = document.getElementById("${name}-preview");
                preview.innerHTML = this.value 
                    ? '<img src="' + this.value + '" style="max-width: 100%; margin-top: 10px;">' 
                    : "";
            });
        </script>
    `
});
```

## 🤝 Integration with Quick-n-Easy ORM

This package is part of the Quick-n-Easy family - designed to work seamlessly with Quick-n-Easy ORM. Together, they're like peanut butter and jelly, but for web development! 🥜

## 🎯 Why Quick-n-Easy Inputs?

- **Time is Precious**: Stop writing repetitive form code
- **Flexibility**: Customize anything and everything
- **Type Safety**: Built with TypeScript for peace of mind
- **Developer Joy**: Because coding should be fun!

## 📚 API Reference

### QuickNEasyInputs

```typescript
class QuickNEasyInputs {
    constructor(dbDeclaration: DatabaseDeclaration, orm: QuickNEasyORM)
    generateForm(tableName: string, action: string): Promise<string>
    registerRenderers(renderers: Record<string, InputRenderer>): void
}
```

## 📝 License

MIT - because sharing is caring! ❤️