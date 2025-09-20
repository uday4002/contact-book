import { useEffect, useState } from "react";
import axios from "axios";
import { FaPhone, FaEnvelope, FaTrash } from "react-icons/fa";
import "./App.css";

function App() {
  const [contacts, setContacts] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API = "https://contact-book-721c.onrender.com";
  const LIMIT = 5;

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ message: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const fetchContacts = async (page = 1) => {
    try {
      const res = await axios.get(`${API}/api/contacts?page=${page}&limit=${LIMIT}`);
      setContacts(res.data.contacts);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.log("Error fetching contacts:", err);
      setStatus({ message: "Failed to load contacts", type: "error" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(`${API}/api/contacts`, form);
      setStatus({ message: "Contact added successfully", type: "success" });
      setForm({ name: "", phone: "", email: "" });
      fetchContacts(currentPage);
    } catch (err) {
      console.log("Error saving contact:", err);
      setStatus({ message: "Failed to save contact", type: "error" });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this contact?");
    if (!confirmed) return;

    try {
      await axios.delete(`${API}/api/contacts/${id}`);
      if (contacts.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
      else fetchContacts(currentPage);

      setStatus({ message: "Contact deleted successfully", type: "success" });
    } catch (err) {
      console.log("Error deleting contact:", err);
      setStatus({ message: "Failed to delete contact", type: "error" });
    }
  };

  return (
    <div className="app">
      {status.message && <div className={`status-bar ${status.type}`}>{status.message}</div>}

      <h1>Contact Book</h1>

      <h2 className="add-contact">Add Contact</h2>

      <form onSubmit={handleSubmit} className="contact-form">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "error-input" : ""}
          />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>

        <div>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className={errors.phone ? "error-input" : ""}
          />
          {errors.phone && <p className="error">{errors.phone}</p>}
        </div>

        <div>
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <button type="submit">Add</button>
      </form>

      <div className="contact-list">
        {contacts.map((c) => (
          <div className="contact-card" key={c._id}>
            <div>
              <h3>{c.name}</h3>
              <p>
                <FaPhone /> {c.phone}
              </p>
              <p>
                <FaEnvelope /> {c.email}
              </p>
            </div>
            <div className="actions">
              <button onClick={() => handleDelete(c._id)}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
