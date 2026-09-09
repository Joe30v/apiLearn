
import express from "express";

interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

const app = express();

let todos: Todo[] = [
        { id: 1, title: "Learn TypeScript", completed: false },
        { id: 2, title: "Build a REST API", completed: false },
        { id: 3, title: "Write unit tests", completed: false }
    ];

 app.use(express.json());

app.get("/health", (req, res) => {
    console.log(req.method, req.path);
    res.send({ status: "OK" });
});

app.get("/todos", (req, res) => {
    

    console.log(req.method, req.path);
    res.json(todos);
});

app.post("/todos",(req,res) =>{

    if(!req.body.title || typeof req.body.title !== "string"){
        return res.status(400).send({ error: "Title is required and must be a string" });

    }
    const nextId = Math.max(...todos.map(todo => todo.id)) + 1;
    
    const newTodo: Todo = {
        id: nextId,
        title: req.body.title,
        completed: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);

});

 app.patch("/todos/:id", (req,res) =>{
     
    const id= Number(req.params.id);
    if(Number.isNaN(id)){
        return res.status(400).json ({ error: "id must be a number" });

    }

    const todo = todos.find( t => t.id === id);
    if(!todo){
        return res.status(404).json({ error: " todo not found" });
        
    }

    if(typeof req.body.completed !== "boolean"){
        return res.status(400).json({ error: "completed must be a boolean"});
    }
    todo.completed = req.body.completed;

    res.json(todo);

    

 });

app.delete("/todos/:id", (req, res) => {
  // validate param
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  // delete
  let original = todos.length;
  todos = todos.filter(t => t.id !== id);

  // check if anything was actually deleted
  if (todos.length === original) {
    return res.status(404).json({ error: "todo not found" });
  }

  // respond with no content
  res.status(204).send();
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});