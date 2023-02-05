-- Active: 1675537390941@@127.0.0.1@3306

CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME('now', 'localtime')) NOT NULL
);

INSERT INTO users (id, name, email, password)
VALUES 
('U001','Pedro Maia', 'pedro@email.com', 'Estudante1*'),
('U002','Carlos Ferreira', 'carleto@email.com', 'estUdante2%'),
('U003','Bruno Meyer', 'brunin@email', 'estudANte3&');

INSERT INTO users (id, name, email, password)
VALUES ("U004", "Paola Bracho", "usurpadora@email.com", "usUrpadora1@#");

SELECT * FROM users
ORDER BY name ASC;

SELECT * FROM users;

DROP TABLE users;

CREATE TABLE products (
id TEXT PRIMARY KEY UNIQUE NOT NULL,
name TEXT NOT NULL,
price REAL NOT NULL,
description TEXT NOT NULL,
category TEXT NOT NULL,
image_url TEXT NOT NULL
);

INSERT INTO products (id, name, price, description, category, image_url)
VALUES ('G001', 'Gran Turismo 7', 200, "simulator de corrida",'video game', "https://picsum.photos/200"),
('G002', 'Pokémon Scarlet', 299.99, "jogo de RPG", 'video game', "https://picsum.photos/200"),
('C001', 'Play Station 5', 4300,"console de 8ª geração da Sony", 'video game console', "https://picsum.photos/200"),
('C002', 'Nintendo Switch Oled', 2600, "console de 8ª geração da Nintendo", 'video game console', "https://picsum.photos/200"),
('C003', 'XBox Series X', 3700, "Console de 8ª geração da Microsoft", 'video game console', "https://picsum.photos/200");


INSERT INTO products (id, name, price, description, category, image_url)
VALUES ('G003', 'NBA2k23', 100, "jogo de basquetebol da National Basketball Association",'video game', "https://picsum.photos/200");

SELECT * FROM products
ORDER BY price ASC
LIMIT 4400
OFFSET 0;


SELECT * FROM products;

DROP TABLE products;

CREATE TABLE purchases (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    total_price REAL NOT NULL,
    paid INTEGER DEFAULT(0) NOT NULL,
    delivered_at TEXT,
    buyer_id TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME('now', 'localtime')) NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users (id) ON UPDATE CASCADE
);

INSERT INTO purchases (id, total_price, paid, delivered_at, buyer_id)
VALUES 
('PU001', 299.99, 0, NULL, "U001"),
('PU002', 200, 0, NULL, "U002"),
('PU003', 100, 0, NULL,"U003"),
('PU004', 3700, 0, NULL, "U004"),
('PU005', 6000, 0, NULL,"U003");

UPDATE purchases
SET
paid = 1,
delivered_at = DATETIME("now")
WHERE id = "PU005";

UPDATE purchases
SET
paid = 1,
delivered_at = DATETIME("now")
WHERE id = "PU001";

UPDATE purchases
SET
paid = 1,
delivered_at = DATETIME("now")
WHERE id = "PU003";

INSERT INTO purchases (id, total_price, paid, delivered_at, buyer_id)
VALUES 
('PU006', 250, 0, NULL, "U005");

SELECT * FROM purchases
INNER JOIN users
ON purchases.buyer_id = users.id
WHERE users.id = "U004";

SELECT * FROM purchases;

DROP TABLE purchases;

CREATE TABLE purchases_products (
    purchase_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases (id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE
);

INSERT INTO purchases_products
VALUES
    ("PU001", "C001", 2),
    ("PU002", "C002", 1),   
    ("PU003", "C003", 1),
    ("PU004", "G003", 4),
    ("PU005", "G001", 2),
    ("PU002", "C002", 3),
    ("PU003", "G002", 5);

SELECT * FROM purchases_products;

SELECT * FROM purchases_products
RIGHT JOIN purchases
ON purchases_products.purchase_id = purchases.id
RIGHT JOIN products
ON purchases_products.product_id = products.id;


DROP TABLE purchases_products;
