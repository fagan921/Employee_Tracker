INSERT INTO departments (department_name)
VALUES
    ('Accounting'),
    ('Human Resources'),
    ('Marketing'),
    ('Sales');

INSERT INTO roles (title, salary, department_id)
VALUES
    ('Accountant', 80000, 1),
    ('Account Manager', 100000, 1),
    ('HR Associate', 60000, 2),
    ('HR Manager', 70000, 2),
    ('Marketing Associate', 50000, 3),
    ('Marketing Manager', 90000, 3),
    ('Sales Associate', 40000, 4),
    ('Sales Manager', 70000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ('Jasper', 'Ridley', 2, null),
    ('Lila', 'Montgomery', 1, 1),
    ('Orion', 'Carter', 4, null),
    ('Selene', 'Porter', 3, 3),
    ('Finnian', 'Graves', 5, null),
    ('Isla', 'Donovan', 6, 5),
    ('Atticus', 'Vale', 7, null),
    ('Zara', 'Whitfield', 8, 7);

SELECT * FROM departments;
SELECT * FROM roles;
SELECT * FROM employees;
