const express = require('express');
const app = express();
const { readEmployees, writeEmployees } = require('./modules/fileHandler');

const PORT = 3000;

async function startServer() {
  try {
    const employees = await readEmployees();
    console.log('Successfully loaded employee data:', employees);

    // Server Configuration
    app.set('view engine', 'ejs');
    app.use(express.static('public'));
    app.use(express.urlencoded({ extended: true })); // Handle form data

    // Routes
    app.get('/', (req, res) => {
      let searchQuery = req.query.search || '';
      let filteredEmployees = employees;

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        filteredEmployees = employees.filter(emp =>
          emp.name.toLowerCase().includes(lowerQuery) ||
          emp.role.toLowerCase().includes(lowerQuery)
        );
      }

      // Calculate Stats
      const totalEmployees = filteredEmployees.length;
      const totalSalary = filteredEmployees.reduce((sum, emp) => sum + Number(emp.salary), 0);
      const totalTax = totalSalary * 0.12;

      res.render('index', {
        employees: filteredEmployees,
        searchQuery,
        stats: { totalEmployees, totalSalary, totalTax }
      });
    });

    // Add Employee Page
    app.get('/add', (req, res) => {
      res.render('add');
    });

    // Add Employee
    app.post('/add', async (req, res) => {
      const { name, role, salary } = req.body;

      // Data Validation
      if (!name || name.trim() === '') {
        return res.redirect('/?error=Name cannot be empty'); // Simple error handling via query param or just redirect
      }
      if (Number(salary) < 0) {
        return res.redirect('/?error=Salary cannot be negative');
      }

      const newEmployee = {
        id: Date.now(), // Unique ID
        name,
        role,
        salary: Number(salary)
      };
      employees.push(newEmployee);
      await writeEmployees(employees);
      res.redirect('/');
    });

    // Delete Employee
    app.get('/delete/:id', async (req, res) => {
      const id = Number(req.params.id);
      const index = employees.findIndex(emp => emp.id === id);
      if (index !== -1) {
        employees.splice(index, 1);
        await writeEmployees(employees);
      }
      res.redirect('/');
    });

    // Edit Employee Form
    app.get('/edit/:id', (req, res) => {
      const id = Number(req.params.id);
      const employee = employees.find(emp => emp.id === id);
      if (employee) {
        res.render('edit', { employee });
      } else {
        res.redirect('/');
      }
    });

    // Update Employee
    app.post('/edit/:id', async (req, res) => {
      const id = Number(req.params.id);
      const { name, role, salary } = req.body;

      // Data Validation
      if (!name || name.trim() === '') {
        return res.redirect('/'); // In a real app, reload form with error
      }
      if (Number(salary) < 0) {
        return res.redirect('/');
      }

      const index = employees.findIndex(emp => emp.id === id);
      if (index !== -1) {
        employees[index] = { id, name, role, salary: Number(salary) };
        await writeEmployees(employees);
      }
      res.redirect('/');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
