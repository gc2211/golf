const express = require('express');
const connection = require('./db');
const Joi = require('joi');
const port = 8000;


const serverPort = process.env.PORT || 8000;

const app = express();

connection.connect((err) => {
 if (err) {
  console.error('Error connecting to db', err);
 } else {
  console.log('Connected to db');
 }
});

app.use(express.json());

//Users


//Read users 
app.get('/users', (req, res) => {
 connection.promise().query('SELECT * FROM users')
  .then(([results]) => {
   res.json(results);
  })
  .catch((err) => {
   console.error(err);
   res.status(500).send('Error retrieving users from db.');
  });
});

//Read users by id

app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    connection.promise()
      .query('SELECT * FROM users WHERE id = ?', [id])
      .then(([results]) => {
        if (results.length) {
          res.json(results[0]);
        } else {
          res.sendStatus(404);
        }
      });
  }); 

// Create user

 app.post('/users', (req, res) => {
 const { firstname, lastname, age ,country ,city , province} = req.body;

 const { error: validationErrors } = Joi.object({
  firstname: Joi.string().max(255).required(),
  lastname: Joi.string().max(255).required(),
  age: Joi.number().min(1).required(),
  country: Joi.string().max(255).required(),
  city: Joi.string().max(255).required(),
  province: Joi.string().max(255).required(),
 }).validate({ firstname, lastname, age ,country ,city , province}, { abortEarly: false });

 if (validationErrors) {
   res.status(422).json({ errors: validationErrors.details });
 } else {
   connection.promise()
    .query('INSERT INTO users (firstname, lastname, age,country ,city , province) VALUES (?, ?, ?,?,?,?)', [firstname, lastname, age,country ,city , province])
     .then(([result]) => {
      const createdUser = { id: result.insertId, firstname, lastname, age ,country ,city , province};
       res.status(201).json(createdUser);
     }).catch((err) => { console.error(err); res.sendStatus(500); });
 }
});

//Update user by id
app.patch('/users/:id', (req, res) => {
 const { error: validationErrors } = Joi.object({
  firstname: Joi.string().max(255).required(),
  lastname: Joi.string().max(255).required(),
  age: Joi.number().min(1).required(),
  country: Joi.string().max(255).required(),
  city: Joi.string().max(255).required(),
  province: Joi.string().max(255).required(),

 }).validate(req.body, { abortEarly: false });

 if (validationErrors)
   return res.status(422).json({ errors: validationErrors.details });

 connection.promise()
   .query('UPDATE users SET ? WHERE id = ?', [req.body, req.params.id])
   .then(([result]) => {
     res.sendStatus(200);
   })
   .catch((err) => {
     console.error(err);
     res.sendStatus(204);
   });
});


// Delete user
app.delete('/users/:id', (req, res) => {
 connection.promise()
   .query('DELETE FROM users WHERE id = ?', [req.params.id])
   .then(([result]) => {
     if (result.affectedRows) res.sendStatus(204);
     else res.sendStatus(404);
   })
   .catch((err) => {
     console.error(err);
     res.sendStatus(500);
   });
});

app.listen(serverPort, () => {
	console.log(`Server is running on ${port}`);
	});
// Please keep this module.exports app, we need it for the tests !
module.exports = app;