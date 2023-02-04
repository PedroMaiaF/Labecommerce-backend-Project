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
('U001','Pedro Maia', 'pedro@email.com', 'estudante1'),
('U002','Carlos Henrique', 'henrique@email.com', 'estudante2'),
('U003','Carlos Bergson', 'bergson@email', 'estudante3');

INSERT INTO users (id, name, email, password)
VALUES ("U004", "Paola Bracho", "usurpadora@email.com", "usurpadora1");

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
('C01', 'Play Station 5', 4300,"console de 8ª geração da Sony", 'video game console', "https://picsum.photos/200"),
('C02', 'Nintendo Switch Oled', 2600, "console de 8ª geração da Nintendo", 'video game console', "https://picsum.photos/200"),
('C03', 'XBox Series X', 3700, "Console de 8ª geração da Microsoft", 'video game console', "https://picsum.photos/200");


INSERT INTO products (id, name, price, description, category, image_url)
VALUES ('G003', 'NBA2k23', 100, "jogo de basquetebol da National Basketball Association",'video game', "https://picsum.photos/200");

SELECT * FROM products
ORDER BY price ASC
LIMIT 4400
OFFSET 0;

DROP TABLE products;

CREATE TABLE purchases (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    buyer_id TEXT NOT NULL,
    total_price REAL NOT NULL,
    delivered_at TEXT,
    created_at TEXT DEFAULT (DATETIME('now', 'localtime')) NOT NULL,
    paid INTEGER DEFAULT(0) NOT NULL
);

INSERT INTO purchases (id, buyer_id, total_price, delivered_at, paid)
VALUES 
('P001', "U001", 299.99, NULL, 0),
('P002', "U002", 200, NULL, 0),
('P003', "U003", 100, NULL, 0),
('P004', "U002", 3700, NULL, 0),
('P005', "U003", 6000, NULL, 0);

UPDATE purchases
SET
paid = 1,
delivered_at = DATETIME("now")
WHERE id = "P005";

UPDATE purchases
SET
paid = 1,
delivered_at = DATETIME("now")
WHERE id = "P001";

UPDATE purchases
SET
paid = 1,
delivered_at = DATETIME("now")
WHERE id = "P003";

INSERT INTO purchases (id, buyer_id, total_price, delivered_at, paid)
VALUES 
('P006', "U004", 299.99, NULL, 0);

SELECT * FROM purchases
INNER JOIN users
ON purchases.buyer_id = users.id
WHERE users.id = "U004";

SELECT * FROM purchases;

DROP TABLE purchases;

CREATE TABLE purchases_products (
    purchase_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantidy INTEGER NOT NULL,
    FOREIGN KEY (purchase_id) REFERENCES purchases (id),
    FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE
);

INSERT INTO purchases_products
VALUES
    ("PP001", "P001", 2),
    ("PP002", "P002", 1),   
    ("PP003", "P006", 1),
    ("PP004", "P003", 4),
    ("PP005", "P005", 2);

SELECT * FROM purchases_products;

SELECT * FROM purchases_products
RIGHT JOIN purchases
ON purchases_products.purchase_id = purchases.id
RIGHT JOIN products
ON purchases_products.product_id = products.id;


DROP TABLE purchases_products;
