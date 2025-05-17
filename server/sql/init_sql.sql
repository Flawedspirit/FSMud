DROP USER IF EXISTS 'fsmud'@'localhost';
CREATE USER 'fsmud'@'localhost' IDENTIFIED BY 'fsmuddb' WITH MAX_QUERIES_PER_HOUR 0 MAX_UPDATES_PER_HOUR 0 MAX_CONNECTIONS_PER_HOUR 0;
GRANT ALL PRIVILEGES ON *.* TO 'fsmud'@'localhost' WITH GRANT OPTION;

CREATE DATABASE `fsmud_character` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE `fsmud_auth` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE `fsmud_world` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `fsmud_character`.* TO 'fsmud'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON `fsmud_auth`.* TO 'fsmud'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON `fsmud_world`.* TO 'fsmud'@'localhost' WITH GRANT OPTION;