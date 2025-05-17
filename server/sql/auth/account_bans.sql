DROP TABLE IF EXISTS `account_bans`;

CREATE TABLE `account_bans` (
    `UUID` char(36) NOT NULL DEFAULT '' COMMENT 'Account identifier',
    `ban_time` int NOT NULL DEFAULT '0',
    `ban_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `ban_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    PRIMARY KEY (`UUID`)
);

LOCK TABLES `account_bans` WRITE;
UNLOCK TABLES;