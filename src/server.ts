
import { QueryResult } from 'pg';
import inquirer, { Answers } from 'inquirer';
import { pool, connectToDb } from './connection.js';


connectToDb();

const PORT = process.env.PORT
const app = express();

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  role_id: number;
  manager_id: number | null;
}

// TypeScript interface for department data
interface Department {
  id: number;
  department_name: string;
}

// TypeScript interface for role data
interface Role {
  id: number;
  title: string;
  salary: number;
  department_id: number;
}

const mainMenu = (): void => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Exit'
      ]
    }
  ]).then((answers: Answers) => {
    switch (answers.action) {
      case 'View All Departments':
        viewAllDepartments();
        break;
      case 'View All Roles':
        viewAllRoles();
        break;
      case 'View All Employees':
        viewAllEmployees();
        break;
      case 'Add Department':
        addDepartment();
        break;
      case 'Add Role':
        addRole();
        break;
      case 'Add Employee':
        addEmployee();
        break;
      case 'Update Employee Role':
        updateEmployeeRole();
        break;
      default:
        pool.end();
        console.log('Goodbye!');
    }
  });
};

// View all departments
const viewAllDepartments = (): void => {
  pool.query('SELECT * FROM departments', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.table(res.rows);
    mainMenu();
  });
};

// View all roles
const viewAllRoles = (): void => {
  const query = `
    SELECT roles.id, roles.title, roles.salary, departments.department_name AS department
    FROM roles
    JOIN departments ON roles.department_id = departments.id
  `;
  pool.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.table(res.rows);
    mainMenu();
  });
};

// View all employees
const viewAllEmployees = (): void => {
  const query = `
    SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.department_name AS department, roles.salary, 
           CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employees
    JOIN roles ON employees.role_id = roles.id
    JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees manager ON employees.manager_id = manager.id
  `;
  pool.query(query, (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.table(res.rows);
    mainMenu();
  });
};

// Add a department
const addDepartment = (): void => {
  inquirer.prompt([
    { name: 'department_name', message: 'Enter the department name:', type: 'input' }
  ]).then(answers => {
    pool.query('INSERT INTO departments (department_name) VALUES ($1)', [answers.department_name], (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Department added successfully!');
      mainMenu();
    });
  });
};

// Add a role
const addRole = (): void => {
  pool.query('SELECT * FROM departments', (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    const departments: Department[] = res.rows;
    const departmentChoices = departments.map(department => ({
      name: department.department_name,
      value: department.id
    }));

    inquirer.prompt([
      { name: 'title', message: 'Enter the role title:', type: 'input' },
      { name: 'salary', message: 'Enter the salary for this role:', type: 'input' },
      {
        type: 'list',
        name: 'department_id',
        message: 'Select the department for this role:',
        choices: departmentChoices
      }
    ]).then(answers => {
      pool.query(
        'INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)',
        [answers.title, parseInt(answers.salary), answers.department_id],
        (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('Role added successfully!');
          mainMenu();
        }
      );
    });
  });
};

// Add an employee
const addEmployee = (): void => {
  pool.query('SELECT * FROM roles', (err, rolesRes) => {
    if (err) {
      console.error(err);
      return;
    }
    pool.query('SELECT * FROM employees', (err, empRes) => {
      if (err) {
        console.error(err);
        return;
      }

      const roles: Role[] = rolesRes.rows;
      const employees: Employee[] = empRes.rows;

      const roleChoices = roles.map(role => ({ name: role.title, value: role.id }));
      const managerChoices = employees.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }));

      inquirer.prompt([
        { name: 'first_name', message: 'Enter the employee\'s first name:', type: 'input' },
        { name: 'last_name', message: 'Enter the employee\'s last name:', type: 'input' },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select the employee\'s role:',
          choices: roleChoices
        },
        {
          type: 'list',
          name: 'manager_id',
          message: 'Select the employee\'s manager:',
          choices: [...managerChoices, { name: 'None', value: null }]
        }
      ]).then(answers => {
        pool.query(
          'INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
          [answers.first_name, answers.last_name, answers.role_id, answers.manager_id],
          (err: Error | null, res) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log('Employee added successfully!');
            mainMenu();
          }
        );
      });
    });
  });
};

// Update an employee's role
const updateEmployeeRole = (): void => {
  pool.query('SELECT * FROM employees', (err: Error | null, empRes) => {
    if (err) {
      console.error(err);
      return;
    }
    pool.query('SELECT * FROM roles', (err: Error | null, roleRes) => {
      if (err) {
        console.error(err);
        return;
      }

      const employees: Employee[] = empRes.rows;
      const roles: Role[] = roleRes.rows;

      const employeeChoices = employees.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
      }));

      const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
      }));

      inquirer.prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee to update:',
          choices: employeeChoices
        },
        {
          type: 'list',
          name: 'role_id',
          message: 'Select the new role for the employee:',
          choices: roleChoices
        }
      ]).then(answers => {
        pool.query(
          'UPDATE employees SET role_id = $1 WHERE id = $2',
          [answers.role_id, answers.employee_id],
          (err: Error | null, res) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log('Employee role updated successfully!');
            mainMenu();
          }
        );
      });
    });
  });
};

mainMenu();