CREATE TABLE `ip_bans` (
    `ip` varchar(15) NOT NULL DEFAULT '127.0.0.1' COMMENT 'Banned IPv4 address',
    `ban_time` int NOT NULL DEFAULT '0',
    `ban_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `ban_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    PRIMARY KEY (`ip`)
);

LOCK TABLES `ip_bans` WRITE;
UNLOCK TABLES;