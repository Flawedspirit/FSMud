DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
    `UUID` char(36) NOT NULL DEFAULT '' COMMENT 'Account identifier',
    `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `password` char(60) NOT NULL DEFAULT '',
    `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `session_key` char(40) NOT NULL DEFAULT '',
    `permission` tinyint unsigned NOT NULL DEFAULT '0',
    `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `played_time` int unsigned NOT NULL DEFAULT '0',
    `last_ip` varchar(15) NOT NULL DEFAULT '127.0.0.1',
    `last_attempt_ip` varchar(15) NOT NULL DEFAULT '127.0.0.1',
    `last_login` timestamp NULL DEFAULT NULL,
    `failed_logins` int unsigned NOT NULL DEFAULT '0',
    `online` tinyint unsigned NOT NULL DEFAULT '0',
    `locale` tinyint unsigned NOT NULL DEFAULT '0',
    PRIMARY KEY (`UUID`),
    UNIQUE (`username`)
);

LOCK TABLES `account` WRITE;
UNLOCK TABLES;