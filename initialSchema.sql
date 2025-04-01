CREATE DATABASE budgeting_app;
USE budgeting_app;

-- Categories Table (Predefined Categories)
CREATE TABLE categories (
    id INT PRIMARY KEY,  -- No AUTO_INCREMENT since these are predefined
    name VARCHAR(100) NOT NULL
);

-- Transactions Table (Tracks Income & Expenses)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id INT NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Savings Table (Tracks Savings Goals)
CREATE TABLE savings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined categories
INSERT INTO categories (id, name) VALUES
(1, 'Salary'),
(2, 'Freelance'),
(3, 'Investment'),
(4, 'Food & Groceries'),
(5, 'Rent'),
(6, 'Transportation'),
(7, 'Entertainment'),
(8, 'Healthcare'),
(9, 'Utilities'),
(10, 'Debt Repayment');