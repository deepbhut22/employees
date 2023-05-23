import  Express  from "express";
import mysql from 'mysql2';
import bodyParser from "body-parser";
import ejs from 'ejs';

const app = Express();

app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs');
app.use(Express.json());

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Employees'
})

//query to create database.

// const createTableQuery = `
//   CREATE TABLE employee_info (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     fname VARCHAR(50) NOT NULL,
//     lname VARCHAR(50) NOT NULL,
//     city VARCHAR(50),
//     salary DECIMAL(10, 2)
//   )
// `;
// conn.query(createTableQuery, err => {
//     if (err) {
//       console.error('error while creating table', err);
//       return;
//     }
//     console.log('table created');
// });


//connecting our App with the database
conn.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database.');
  });


  //creating an employee
  app.post('/employees', (req, res) => {
    //retriving all the values from post request
    const {id,fname,lname,city,salary} = req.body;
  
    const query = `insert into employee_info (id, fname, lname, city, salary) values (${id},'${fname}','${lname}','${city}',${salary})`;
  
    //writing query to insert values in to database
    conn.query(query, (err, result) => {
      if (err) {
        console.error("Error while executing SQL query: ", err);
        return res.status(500).json({ error: "eror executing SQL query" });
      }
      //writing a feedback message on successfull insertion
      res.json({ message: 'employee added successfully' });
    });
  });


  //retriving list of employees with pagination
    app.get('/employees', (req, res) => {
    const page = 1; //page number 
    const limit = 10; // number of employees per page
    const offset = (page - 1) * limit; // calculating offset
  
    const query = `select * from employee_info limit ${limit} offset ${offset}`;
  
    conn.query(query, (err, result) => {
        if (err) {
            console.error('Error while executing query: ', err);
            return res.status(500).json({ error: 'Error while executing SQL query' });
        }
        const employees = result;
        const countQuery = 'select count(*) as total from employee_info';
    
        conn.query(countQuery, (err, count) => {
        if (err) {
          console.error('Error executing SQL query: ', err);
          return res.status(500).json({ error: 'Error while executing SQL query' });
        }
        const totalCount = count[0].total;
        //sending data into the json formate.
        res.json({
          page: parseInt(page),
          limit,
          totalCount,
          data: employees,
        });
      });
    });
  });


  //retriving an employee with given id
  app.get('/employees/:id', (req, res) => {
    const employeeId = req.params.id;//getting hold of a specific id
  
    const query = `select * from employee_info where id = ${employeeId}`;
  
    //writing query to retrive employee with specified id
    conn.query(query, (err, result) => {
      if (err) {
        console.error('Error executing SQL query: ', err);
        return res.status(500).json({ error: 'error while executing SQL query' });
      }
  
      if (result.length === 0) {
        return res.status(404).json({ error: 'employee not found' });
      }
      res.json(result[0]);
    });
  });


  //deleting an employee with specific id
  app.delete('/employees/:id', (req, res) => {
    const id = req.params.id;
  
    const query = `delete from employee_info WHERE id = ${id}`;
  
    conn.query(query, (err, result) => {
      if (err) {
        console.error('error while executing SQL query: ', err);
        return res.status(500).json({ error: 'error while executing SQL query' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'employee not found' });
      }
  
      res.json({ message: 'employee deleted successfully' });
    });
  });


  //updating an employee with specific id
  app.put('/employees/:id', (req, res) => {
    const id = req.params.id;
    const { fname, lname, city, salary } = req.body;
  
    const query = `update employee_info set fname = '${fname}',lname='${lname}',city='${city}',salary=${salary} where id = ${id}`;
  
    conn.query(query, (err, result) => {
      if (err) {
        console.error('error while executing SQL query: ', err);
        return res.status(500).json({ error: 'error while executing SQL query' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'employee not found' });
      }
  
      res.json({ message: 'employee updated successfully' });
    });
  });



app.listen(3000 , ()=>{
    console.log("server running on port 3000");
})
