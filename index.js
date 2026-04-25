const express = require("express");
const pool = require("./db");
const logger = require("./middleware/logger");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(logger);

// ================= GET ALL =================
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET BY ID =================
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= POST =================
app.post("/tasks", async (req, res) => {
  const { title, description } = req.body;

  // VALIDASI WAJIB
  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title tidak boleh kosong" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
      [title, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= PUT =================
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, is_completed } = req.body;

  try {
    const check = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    const result = await pool.query(
      `UPDATE tasks 
       SET title=$1, description=$2, is_completed=$3 
       WHERE id=$4 RETURNING *`,
      [title, description, is_completed, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE =================
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const check = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Task berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= START =================
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});