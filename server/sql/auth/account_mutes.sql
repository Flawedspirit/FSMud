DROP TABLE IF EXISTS `account_mutes`;

CREATE TABLE `account_mutes` (
    `UUID` char(36) NOT NULL DEFAULT '' COMMENT 'Account identifier',
    `mute_time` int NOT NULL DEFAULT '0',
    `mute_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    `mute_by` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
    PRIMARY KEY (`UUID`)
);

LOCK TABLES `account_mutes` WRITE;
UNLOCK TABLES;