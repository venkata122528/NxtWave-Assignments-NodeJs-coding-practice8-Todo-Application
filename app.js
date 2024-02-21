const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

let db = null;

const initializeDataBaseServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running On Port 3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error}`);
    process.exit(1);
  }
};

initializeDataBaseServer();

//

app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  let sqlQuery = `SELECT * FROM todo 
  WHERE todo LIKE "%${search_q}%" 
  AND priority LIKE "%${priority}%" 
  AND status LIKE "%${status}%";`;
  const result = await db.all(sqlQuery);
  response.send(result);
});

//To return a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const result = await db.get(sqlQuery);
  response.send(result);
});

//To create a todo in the todo table

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const sqlQuery = `INSERT INTO 
    todo(id,todo,priority,status) 
    VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(sqlQuery);
  response.send("Todo Successfully Added");
});

//

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let sqlQuery = null;
  let resultText = null;
  if (status !== undefined) {
    sqlQuery = `UPDATE todo SET status='${status}' WHERE id=${todoId};`;
    resultText = "Status Updated";
  } else if (priority !== undefined) {
    sqlQuery = `UPDATE todo SET priority='${priority}' WHERE id=${todoId};`;
    resultText = "Priority Updated";
  } else if (todo !== undefined) {
    sqlQuery = `UPDATE todo SET todo='${todo}' WHERE id=${todoId};`;
    resultText = "Todo Updated";
  }
  await db.run(sqlQuery);
  response.send(resultText);
});

//To delete a todo from the todo table based on the todo ID

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const sqlQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(sqlQuery);
  response.send("Todo Deleted");
});

module.exports = app;
