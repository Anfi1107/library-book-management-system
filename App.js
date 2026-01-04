const express = require("express");
const mongoose = require("mongoose");
const Book = require("./models/Book");

const app = express();
app.use(express.json());

/* ---------------- MongoDB Connection ---------------- */
mongoose.connect("mongodb://127.0.0.1:27017/libraryDB")
.then(async () => {
  console.log("MongoDB Connected Successfully");
  await initialInsert();
})
.catch(err => console.log(err));

/* ---------------- CREATE (Initial Insert) ---------------- */
async function initialInsert() {
  const count = await Book.countDocuments();

  if (count === 0) {
    await Book.insertMany([
      {
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self Help",
        publishedYear: 2018,
        availableCopies: 5
      },
      {
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "Fiction",
        publishedYear: 2005,
        availableCopies: 3
      },
      {
        title: "Clean Code",
        author: "Robert C Martin",
        category: "Programming",
        publishedYear: 2008,
        availableCopies: 4
      }
    ]);
    console.log("Books inserted successfully");
  } else {
    console.log("Books already exist. Skipping insertion.");
  }

  const books = await Book.find();
  console.log("All Books:");
  console.log(books);
}

/* ---------------- READ ---------------- */
app.get("/books", async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

/* ---------------- UPDATE ---------------- */
app.put("/update/:id", async (req, res) => {
  try {
    const { change } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.json({ message: "Book not found" });
    }

    if (book.availableCopies + change < 0) {
      return res.json({ message: "Stock cannot be negative" });
    }

    book.availableCopies += change;
    await book.save();

    console.log(`Updated: ${book.title} → Stock: ${book.availableCopies}`);

    res.json({
      message: "Book updated successfully",
      book
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

/* ---------------- DELETE ---------------- */
app.delete("/delete/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.json({ message: "Book not found" });
    }

    await Book.findByIdAndDelete(req.params.id);

    console.log(`Deleted: ${book.title}`);

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.json({ error: err.message });
  }
});

/* ---------------- SERVER ---------------- */
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
