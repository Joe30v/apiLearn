import { Router } from "express";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "./pg"; // send sql to postgre and return row as array

import {
    CreateTodoSchema,
    UpdateTodoSchema,
    RegisterSchema,
    LoginSchema,
    type CreateTodoInput,
    type UpdateTodoInput
} from "./schemas";

import { SECRET_KEY } from "./config";
import { authMiddleware, validate } from "./middleware";


const router = Router();

router.post("/register", async (req, res) => {
    try {
        const body = RegisterSchema.parse(req.body); // check body is valid, if not throw ZodError
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // UNIQUE constraint on username rejects duplicates (caught below as 23505)
        const rows = await query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
            [body.username, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: rows[0].id
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                error: "Invalid input"
            });
        }
        if(error.code === '23505') { // Unique violation error code
            return res.status(409).json({
                error: "Username already taken"
            });
        }

        res.status(500).json({
            error: " Registration failed"
        });
    }
});

router.post("/login", async (req, res) => {
  try {
    const body = LoginSchema.parse(req.body);

    // Find user
    const rows = await query(
      "SELECT id, username, password FROM users WHERE username = $1",
      [body.username]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify password
    const isCorrect = await bcrypt.compare(body.password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({ token, userId: user.id });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/health", async (req, res) => {
    res.json({ status: "OK" });
});

const TODO_COLUMNS = 'todos.id, todos.title, todos.completed, todos.user_id AS "userId", todos.created_at AS "createdAt"';

router.get("/todos", authMiddleware, async (req, res) => {
    try {
        const { sort,status, search} = req.query;
        const params: unknown[] = [req.userId];
        let where = "WHERE todos.user_id = $1";

        const pageNum = Math.max(1, Number(req.query.page) || 1);
        const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 10));
        const offset = (pageNum - 1) * pageSize;
        

        if (status === "complete") {
            where += " AND todos.completed = TRUE";
        } else if (status === "incomplete") {
            where += " AND todos.completed = FALSE";
        }

        if( typeof search === "string" && search.trim() !== "") {
          where += ` AND todos.title ILIKE $${params.length + 1}`;
          params.push(`%${search.trim()}%`);
        }

         const countRows = await query(
           `SELECT COUNT(*) AS count FROM todos ${where}`,
           params
          );
          const totalCount = Number(countRows[0].count);
         
          let sql = `SELECT ${TODO_COLUMNS}, users.username
           FROM todos
           JOIN users ON todos.user_id = users.id
           ${where}`;


        if(sort === "oldest") {
          sql += " ORDER BY todos.created_at ASC";
        } else if ( sort === "title") {
          sql += " ORDER BY todos.title ASC";
        } else {
          sql += " ORDER BY todos.created_at DESC";
        }

         sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(pageSize, offset);

        const todos = await query(sql, params);

        res.json({
          todos,
          pagination: {
            page: pageNum,
            pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize)
          }
        });
        

        res.json(todos);
    } catch (err) {
      console.error(err);
        res.status(500).json({ error: "Failed to load todos" });
    }
});


// Order matters: auth first, then validate, then the handler
router.post("/todos", authMiddleware, validate(CreateTodoSchema), async (req, res) => {
  try {
    const body: CreateTodoInput = req.body; // already validated and trimmed

    const rows = await query(
      `INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING ${TODO_COLUMNS}`,
      [body.title, req.userId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

router.patch("/todos/:id", authMiddleware, validate(UpdateTodoSchema), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body: UpdateTodoInput = req.body;

    const rows = await query(
      `UPDATE todos
       SET title = COALESCE($1, title), completed = COALESCE($2, completed)
       WHERE id = $3 AND user_id = $4
       RETURNING ${TODO_COLUMNS}`,
      [body.title ?? null, body.completed ?? null, id, req.userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Todo not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update todo" });
  }
});

router.delete("/todos/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const rows = await query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Todo not found" });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

 router.get("/todos/stats", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const rows = await query(
      `SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE completed = TRUE) AS completed,
        COUNT(*) FILTER (WHERE completed = FALSE) AS incomplete
       FROM todos
       WHERE user_id = $1`,
      [req.userId]
    );

    const stats = rows;
    res.json(stats[0]);
  }catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

 router.get("/todos/with-user", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const todos = await query(
      `SELECT
        todos.id,
        todos.title,
        todos.completed,
        todos.created_at AS "createdAt",
        users.username,
        users.email
      FROM todos
      INNER JOIN users ON todos.user_id = users.id
      WHERE todos.user_id = $1
      ORDER BY todos.created_at DESC`,
      [userId]
    );
    
    res.json(todos);
    }catch (err) {
    res.status(500).json({ error: "Failed to fetch todos with user info" });
  }
    });

export default router;
