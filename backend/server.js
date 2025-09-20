const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected")).catch((err) => {
    console.log("MongoDB Connection Failed: ", err.message);
    process.exit(1);
});

const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

app.get("/api/contacts", async (req, res) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const skip = (parseInt(page) - 1) * limit;
        const contacts = await Contact.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

        const total = await Contact.countDocuments();

        res.status(200).json({ contacts, totalPages: Math.ceil(total / limit), currentPage: parseInt(page) });
    } catch (err) {
        res.status(500).json({ message: `Failed to GET contacts: ${err.message}` });
    }
});

app.post("/api/contacts", async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        if (!name || !phone || !email) {
            return res.status(400).json({ message: "Name, phone and email all fields are required" });
        }
        const newContact = new Contact({ name, phone, email });
        await newContact.save();
        return res.status(201).json(newContact);
    } catch (err) {
        res.status(500).json({ message: `Failed to ADD contact: ${err.message}` });
    }
});

app.delete("/api/contacts/:id", async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Contact not found" });
        }
        res.status(200).json({ message: "Contact Deleted" });
    } catch (err) {
        res.status(500).json({ message: `Failed to DELETE contact ${err.message}` });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Running on the ${PORT}`);
});