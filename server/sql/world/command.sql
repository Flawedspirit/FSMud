DROP TABLE IF EXISTS `command`;

CREATE TABLE IF NOT EXISTS `command` (
    `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `permission` tinyint unsigned NOT NULL DEFAULT '0',
    PRIMARY KEY (`name`)
);

LOCK TABLES `command` WRITE;
INSERT INTO `command` VALUES
('account', 0),
('account create', 3),
('account delete', 3),
('account uuid', 1),
('server', 2),
('server close', 2),
('server memory', 2),
('server version', 2);
UNLOCK TABLES;