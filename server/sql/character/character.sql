DROP TABLE IF EXISTS `character`;

CREATE TABLE IF NOT EXISTS `character` (
    `UUID` char(36) NOT NULL DEFAULT '' COMMENT 'Account identifier',
    `race` tinyint unsigned NOT NULL DEFAULT '0',
    `sex` tinyint unsigned NOT NULL DEFAULT '0',
    `flags` int unsigned NOT NULL DEFAULT '0',
    `level` tinyint unsigned NOT NULL DEFAULT '1',
    `xp` int unsigned NOT NULL DEFAULT '0',
    `money` int unsigned NOT NULL DEFAULT '0',
    `banked_money` int unsigned NOT NULL DEFAULT '0',
    `health` int unsigned NOT NULL DEFAULT '0',
    `current_health` int unsigned NOT NULL DEFAULT '0',
    `strength` smallint unsigned NOT NULL DEFAULT '0',
    `vitality` smallint unsigned NOT NULL DEFAULT '0',
    `agility` smallint unsigned NOT NULL DEFAULT '0',
    `willpower` smallint unsigned NOT NULL DEFAULT '0',
    `perception` smallint unsigned NOT NULL DEFAULT '0',
    `map_id` smallint unsigned NOT NULL DEFAULT '0',
    `map_x` tinyint unsigned NOT NULL DEFAULT '0',
    `map_y` tinyint unsigned NOT NULL DEFAULT '0',
    PRIMARY KEY (`UUID`)
);

LOCK TABLES `character` WRITE;
UNLOCK TABLES;