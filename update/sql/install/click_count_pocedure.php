<?php
$sql[]="
CREATE TABLE IF NOT EXISTS clicks_count (
	`id` int(11) NOT NULL AUTO_INCREMENT,
	`type` varchar(8) NOT NULL,
	`type_id` int(11) NOT NULL,
	`count` int(11) NOT NULL,
    `dt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY `type` (`type`,`type_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
";

$sql[]="
DROP PROCEDURE IF EXISTS recount_total_clicks;

CREATE PROCEDURE recount_total_clicks()
BEGIN".'
	/*{"product":"Binom 1.16","version":"1.0","date":"23.11.2021"}*/'."
	DECLARE cnt INT DEFAULT 0;
	SET cnt = (SELECT COUNT(*) as cnt FROM clicks WHERE id IS NOT NULL);
	INSERT INTO clicks_count (id,type,type_id,count) VALUE (1,'all',0,cnt) ON DUPLICATE KEY UPDATE type='all',count=cnt;
    SELECT cnt;
END;
";
$sql[]="
DROP PROCEDURE IF EXISTS recount_ts_clicks;

CREATE PROCEDURE recount_ts_clicks()
BEGIN".'
	/*{"product":"Binom 1.16","version":"1.0","date":"23.11.2021"}*/'."
	DECLARE cnt INT DEFAULT 0;
	REPLACE INTO `clicks_count` (`type`,`type_id`,`count`) 
		SELECT 'ts' as `type`, 
			`ts_id` as `type_id`, 
			COUNT(*) as `count` 
		FROM `clicks` as cl WHERE id IS NOT NULL GROUP BY ts_id;
END;
";

$sql[]="
CREATE EVENT `recountTotalClicks` ON SCHEDULE EVERY 24 HOUR STARTS '2021-01-01 05:00:00.000000' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN ".'
	/*{"product":"Binom 1.16","version":"1.0","date":"23.11.2021"}*/'."
	TRUNCATE TABLE clicks_count;
	CALL recount_ts_clicks(); 
	DELETE FROM `clicks_count` WHERE `type` = 'ts' AND `type_id`=0;
	CALL recount_total_clicks();  
END;
";
