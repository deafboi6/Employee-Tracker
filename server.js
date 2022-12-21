const inquirer = require("inquirer");
const table = require("console.table");
const db = require("./config/connection");

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database!");
    promptQuestions();
})

const promptQuestions = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "choices",
                message: "What would you like to do?",
                choices: [
                    "Add Department",
                    "Add Employee",
                    "Add Role",
                    "Update Employee Role",
                    "View All Departments",
                    "View All Employees",
                    "View All Roles",
                    "Quit"
                ]
            }
        ])
        .then(ans => {
            if (ans.choices === "View All Employees") {
                ViewAllEmployees();
            } if (ans.choices === "Add Employee") {
                AddEmployee();
            } if (ans.choices === "Update Employee Role") {
                UpdateEmployeeRole();
            } if (ans.choices === "View All Roles") {
                ViewAllRoles();
            } if (ans.choices === "View All Departments") {
                ViewAllDepartments();
            } if (ans.choices === "Add Department") {
                AddDepartment();
            } if (ans.choices === "Quit") {
                const Quit = () => {
                    db.end();
                    console.log("Goodbye!");
                }
                Quit();
            } if (ans.choices === "Add Role") {
                AddRole();
            }
        });
};

//------------------------------------------ VIEWS TABLES ------------------------------------------

const ViewAllEmployees = () => {
    let sqlQuery =
    `SELECT
        employees.id, 
        employees.first_name AS "First Name", 
        employees.last_name AS "Last Name", 
        roles.Title AS "Title", 
        departments.department_name AS "Department", 
        roles.Salary AS "Salary",
        employees.manager_id AS "Manager"
    FROM
        employees, roles, departments WHERE departments.id = roles.department_id AND roles.id = employees.role_id
    ORDER BY employees.id ASC`;
    db.query(sqlQuery, (err, results) => {
    err ? console.log(err) : console.table(results);
    promptQuestions();
    });
};
const ViewAllRoles = () => {
    let sqlQuery = 
    `SELECT
        roles.id,
        roles.Title AS "Title",
        departments.department_name AS "Department",
        roles.Salary AS "Salary"
    FROM
        roles, departments WHERE departments.id = roles.department_id
    ORDER BY roles.id ASC`;
    db.query(sqlQuery, (err, results) => {
        err ? console.log(err) : console.table(results);
    promptQuestions();
    });
};
const ViewAllDepartments = () => {
    let sqlQuery = 
    `SELECT
        departments.id,
        departments.department_name AS "Department"
    FROM
        departments
    ORDER BY departments.id ASC`;
    db.query(sqlQuery, (err, results) => {
        err ? console.log(err) : console.table(results);
        promptQuestions();
    });

};

//------------------------------------------ ADDS TO TABLES ------------------------------------------

const AddEmployee = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "What is your employee's first name?"
            },
            {
                type: "input",
                name: "lastName",
                message: "What is your employee's last name?"
            }
        ])
        .then(ans => {
            const emp = [ans.firstName, ans.lastName];
            let sqlQuery = `SELECT roles.id, roles.Title FROM roles`;
            db.query(sqlQuery, (err, results) => {
                const roles = results.map(({ id, Title }) => ({ name: Title, value: id }));
                if (err) throw err;

                inquirer
                    .prompt([
                        {
                            type: "list",
                            name: "role",
                            message: "What is your employee's role?",
                            choices: roles
                        }
                    ])
                    .then(ans => {
                        const chosenRole = ans.role;
                        emp.push(chosenRole);
                        let sqlQuery = `SELECT * FROM employees`;
                        db.query(sqlQuery, (err, results) => {
                            if (err) throw err;
                            const managers = results.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                            inquirer
                                .prompt([
                                    {
                                    type: "list",
                                    name: "manager",
                                    message: "Who is your employee's manager?",
                                    choices: managers
                                    }
                                ])
                                .then(ans => {
                                    const chosenManager = ans.manager;
                                    emp.push(chosenManager);
                                    let sqlQuery = 
                                    `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                                    db.query(sqlQuery, emp, (err) => {
                                        if (err) throw err;
                                        console.log("Successfully added Employee!");
                                        promptQuestions();
                                    });
                                });
                        });
                    });
            });
        });
};

const AddDepartment = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "depName",
                message: "What do you want to call your new Department?"
            }
        ])
        .then(ans => {
            let sqlQuery = `INSERT INTO departments (department_name)
                            VALUES (?)`;
            db.query(sqlQuery, ans.depName, (err) => {
                if (err) throw err;
                console.log("department created!");
                promptQuestions();
            });
        });
};

const AddRole = () => {
    const newRole = [];
    db.query(`SELECT * from departments`, (err, results) => {
        if (err) throw err;
        const departments = results.map(({ id, department_name }) => ({ name: department_name, value: id }));

    inquirer
        .prompt([
            {
                type: "input",
                name: "role",
                message: "What is the name of the new role?"
            },
            {
                type: "number",
                name: "salary",
                message: "What is the salary for this role?"
            },
            {
                type: "list",
                name: "departments",
                message: "Which department is this role under?",
                choices: departments
            }
        ])
        .then(ans => {
            newRole.push(ans.role, ans.salary, ans.departments);
            let sqlQuery = `INSERT INTO roles (Title, Salary, department_id)
                            VALUES (?, ?, ?)`
            db.query(sqlQuery, newRole, (err) => {
                if (err) throw err;
                console.log("New role created!");
                promptQuestions();
            });
        });
    });
};

//------------------------------------------ UPDATES EMPLOYEE ------------------------------------------

const UpdateEmployeeRole = () => {
    let sqlQuery = `SELECT * from employees`;
    db.query(sqlQuery, (err, results) => {
        if (err) throw err;
        const emp = results.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

        let sqlQuery2 = `SELECT roles.id, roles.Title FROM roles`;
        db.query(sqlQuery2, (err, results) => {
            const roles = results.map(({ id, Title }) => ({ name: Title, value: id }));
            if (err) throw err;
    
            inquirer
                .prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Which employee role would you like to update?",
                        choices: emp
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "What would would you like to assign them?",
                        choices: roles
                    }
                ])
                .then(ans => {
                    const updatedEmp = [ans.employee, ans. role];
                    let sqlQuery = 
                    `UPDATE employees
                    SET role_id = ${updatedEmp[1]}
                    WHERE id = ${updatedEmp[0]}`;
                    db.query(sqlQuery, (err) => {
                        if (err) throw err;
                        console.log("Employee role updated!");
                        promptQuestions();
                    });
                });
        });
    });
};
