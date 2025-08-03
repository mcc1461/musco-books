import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js"; // Import your Book model
import protectRoute from "../middleware/auth.middleware.js"; // Import your middleware

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !rating || !caption) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to the database
    const newBook = new Book({
      title,
      caption,
      rating,
      image: imageUrl,
      user: req.user.id,
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// const response = await fetch(`http://localhost:3011/api/books?pages=1&limit=7`);

// pagination => infinite scroll
// Get all books for a user
router.get("/", protectRoute, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalBooks = await Book.countDocuments();
    const paginatedBooks = books.slice(startIndex, endIndex);
    const totalPages = Math.ceil(totalBooks / limit);
    const pagination = {
      totalBooks,
      totalPages,
      currentPage: page,
      hasNextPage: endIndex < totalBooks,
      hasPreviousPage: startIndex > 0,
    };
    const books = await Book.find({ user: req.user.id })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!books) {
      return res.status(404).json({ message: "No books found." });
    }
    res.status(200).json({
      books: paginatedBooks,
      pagination,
      currentPage: page,
      totalPages,
      totalBooks,
      hasNextPage: endIndex < totalBooks,
      hasPreviousPage: startIndex > 0,
    });
    // res.status(200).json({
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get a single book by ID
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "user",
      "username"
    );
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get the books recommended by the user
router.get("/recommended", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    if (!books) {
      return res.status(404).json({ message: "No books found." });
    }
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching recommended books:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Check the user who created the book
    if (book.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }
    // Delete the image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return res.status(500).json({ message: "Failed to delete image." });
      }
    }
    // If the image is not from Cloudinary, delete it directly
    await cloudinary.uploader.destroy(book.image.public_id);
    // Delete the book from the database
    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update a book
router.put("/:id", protectRoute, async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;

    if (!image || !title || !rating || !caption) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, caption, rating, image: imageUrl },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
