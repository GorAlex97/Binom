<?php
$sql[]="
/* Device Base */
CREATE TABLE IF NOT EXISTS `base_device_unknown` (
    `id`  int(11) NOT NULL AUTO_INCREMENT,
    `hash` varchar(32) NOT NULL,
    `agent` text NOT NULL,
    `create_date` int(11) NOT NULL,
    `cnt` int(11) NOT NULL, 
	PRIMARY KEY (`id`),
	UNIQUE KEY `hash` (`hash`),
	KEY `create_date` (`create_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

START TRANSACTION;
DROP TABLE IF EXISTS `devicebase_regs`;
CREATE TABLE IF NOT EXISTS `devicebase_regs` (
		  `cat` int(11) NOT NULL DEFAULT '0',
		  `model_id` int(11) NOT NULL,
		  `brand_id` int(11) NOT NULL,
		  `reg` varchar(32) NOT NULL,
		  `rating` int(11) NOT NULL DEFAULT '0',
		  `adapt` int(11) NOT NULL DEFAULT '0',
		  KEY `brand_id` (`brand_id`),
			KEY `rating` (`rating`),
			KEY `adapt` (`adapt`),
			KEY `cat` (`cat`)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
";