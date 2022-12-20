INSERT INTO departments (department_name)
VALUES ("Sales"),
       ("Service"),
       ("Engineering");

INSERT INTO roles (title, salary, department_id)
VALUES ("SALES MANAGER", 65000, 1),
       ("CUSTOMER SERVICE", 35000, 1),
       ("SALES AGENT", 50000, 1),
       ("SERVICE TECHNICIAN", 50000, 2),
       ("SENIOR SERVICE TECHNICIAN", 75000, 2),
       ("WEB DEVELOPER", 120000, 3),
       ("DATA ANALYST", 125000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Tony", "Smith", 1, NULL),
       ("Sampson", "Brown", 2, 1),
       ("Carter", "Hooper", 3, 1),
       ("Amber", "McCarthy", 4, NULL),
       ("Dawson", "Harrell", 5, 4),
       ("Alexandria", "Carver", 4, NULL),
       ("Naima", "Dixon", 7, NULL);