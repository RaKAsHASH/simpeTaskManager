import pool from "../database/configuration/db.js"
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';


const app = express();
app.use(cors())
const port = 3000;
app.use(bodyParser.json());


// Get all lists with tasks
app.get('/lists', async (req, res) => {
   try {
      const { rows: lists } = await pool.query('SELECT * FROM lists ORDER BY created DESC');
      const listsWithTasks = await Promise.all(lists.map(async (list) => {
         const { rows: tasks } = await pool.query('SELECT * FROM tasks WHERE list_id = $1 ORDER BY CASE WHEN isCompleted = true THEN 1 ELSE 0 END,id', [list.id]);
         return {
            ...list,
            tasks
         };
      }));
      res.json(listsWithTasks);

   } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});


// delete all lists 
app.delete('/lists/remove-all', async (req, res) => {
   try {
      const { rows: lists } = await pool.query('DELETE FROM lists');
      res.json("ALL Lists DELETED SUCCESSFULLY");

   } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});
// Complete task
app.patch('/tasks', async (req, res) => {
   console.log('REACHED')
   const { taskId } = req.query;
   console.log(taskId)
   try {
      await pool.query('UPDATE tasks SET iscompleted=true WHERE id = $1', [taskId]);
      res.json({ message: 'Task Completed successfully' });
   } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});
// displace  task from one list to another
app.patch('/tasks/displace', async (req, res) => {
   console.log('REACHED')
   const { taskId, listId } = req.query;
   console.log(taskId)
   try {
      await pool.query('UPDATE tasks SET list_id=$1 WHERE id = $2', [listId, taskId]);
      res.json({ message: 'Task Displaced successfully' });
   } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});

// Create List with multiple tasks
app.post('/create-new-list/add-tasks', async (req, res) => {
   const { listName, tasks } = req.body;
   try {
      const { rows } = await pool.query('INSERT INTO lists (name) VALUES ($1) RETURNING id', [listName]);
      const listId = rows[0].id;

      const promises = tasks.map(async name => {
         await pool.query('INSERT INTO tasks (name, list_id) VALUES ($1, $2)', [name, listId]);
      });

      await Promise.all(promises);

      res.status(201).json({ message: 'Tasks added to list successfully' });
   } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
});


// ############################
// USER'S API
// signUp
app.post('/signup', async (req, res) => {
   const { name, username, password } = req.body;
   try {
      const { rows } = await pool.query('INSERT INTO users (name,username,password) VALUES ($1,$2,$3) RETURNING id', [name, username, password]);
      const userId = rows[0].id;
      res.status(201).json({ message: 'User created SuccessFully', userId: userId });
   } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
   }
})


// login User
app.post('/login', async (req, res) => {
   const { username, password } = req.body;
   try {
      const { rows } = await pool.query('SELECT password FROM users WHERE username=$1', [username]);
      if (rows.length === 0) {
         console.error('Username does not exist');
         return res.status(401).json({ error: 'Invalid Credentials' });
      }
      const retrievedPass = rows[0].password;
      if (password === retrievedPass) {
         return res.status(200).json({ message: 'Success' });
      } else {
         return res.status(401).json({ error: 'Invalid Credentials' });
      }
   } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
   }
});


app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
