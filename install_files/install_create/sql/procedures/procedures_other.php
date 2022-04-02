<?php
$sql[]="
	CREATE PROCEDURE ThreadChanger (IN processType INT, IN processDeterminant INT, OUT processId INT, OUT timeInThread INT, OUT thisThread INT) BEGIN 
		/*{\"product\":\"Binom 1.14\",\"version\":\"1.21\",\"date\":\"02.04.2020\"}*/
		DECLARE
			availableThreads, reservedThreads,
			maxThreads, maxProcess, MaxThreadsOnProcess,
			busyThreads, inProcess, tempThread,
			MinTime, MaxTime, correctId, tempValue
		INT DEFAULT 0;
		DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN
			INSERT INTO engine_errors(proc_id, `type`, error_date, error_name, error_text) VALUES (0,processType,NOW(),'ThreadChanger','Error In ThreadChanger');
			SET @temp_sql=('SELECT RELEASE_LOCK(\"ThreadChanger\")');
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
		END;
		DO SLEEP(FLOOR(200 + RAND() * (0 - 200))/1000);
		SET thisThread = 0;
		SET availableThreads = 1; 
		SET reservedThreads = 1;
		SET processId = 0;
		SET timeInThread = 1.01;
		SET MinTime = 4.04;
		SET MaxTime = 6.06;
		SET MaxThreadsOnProcess = 6;
		SET tempValue = (SELECT `val` FROM `settings` WHERE `name` = 'mt_threads' LIMIT 1);
		IF(tempValue IS NOT NULL AND tempValue>1 AND tempValue<16)THEN
			SET availableThreads = tempValue;
			SET tempValue = NULL;
		END IF;
		SET tempValue = (SELECT `val` FROM `settings` WHERE `name` = 'mt_proc_on_thread' LIMIT 1);
		IF(tempValue IS NOT NULL AND tempValue>1 AND tempValue<12)THEN
			SET MaxThreadsOnProcess = tempValue;
			SET tempValue = NULL;
		END IF;
		IF(
			(SELECT GET_LOCK('ThreadChanger', 0))=1 AND
			(SELECT COUNT(*) FROM engine_process_instant WHERE 
				`type`=processType AND 
				(determinant = processDeterminant OR proc_id = 0)
			)=0 
		)THEN
			SET correctId = (SELECT id FROM engine_process ORDER BY id DESC LIMIT 1);
			IF(correctId IS NULL)THEN
				SET correctId = 0;
			END IF;
			SET @temp_sql = CONCAT('ALTER TABLE engine_process AUTO_INCREMENT=',correctId+1);
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			IF(availableThreads=1)THEN
				SET maxThreads = 3;
				SET maxProcess = 1;
			ELSE
				SET maxThreads = availableThreads;
				SET maxProcess = 1;
				CASE processType
					WHEN 1 THEN 
						SET maxThreads = availableThreads + reservedThreads;
					WHEN 2 THEN 
						SET maxProcess = availableThreads - 1;
					WHEN 3 THEN 
						/*feature*/
						/*SET maxProcess = FLOOR(availableThreads/2);*/
						SET maxProcess = 1;
				END CASE;
			END IF;
			IF(maxProcess>MaxThreadsOnProcess)THEN
				SET maxProcess = MaxThreadsOnProcess;
			END IF;
			SET timeInThread = timeInThread*maxProcess;
			IF(timeInThread<MinTime)THEN
				SET timeInThread = MinTime;
			END IF;
			IF(timeInThread>MaxTime)THEN
				SET timeInThread = MaxTime;
			END IF;
			SET busyThreads = (SELECT COUNT(*) FROM engine_process_instant WHERE thread!=0);
			SET inProcess = (SELECT COUNT(*) FROM engine_process_instant WHERE `type`=processType);
			IF(inProcess<maxProcess AND busyThreads<maxThreads)THEN
				WHILE (tempThread <= maxThreads AND thisThread = 0) DO
					SET tempThread = tempThread + 1;
					IF(
						(SELECT COUNT(*) AS cnt FROM engine_process_instant WHERE thread = tempThread)=0
					)THEN
						SET thisThread = tempThread;
					END IF;
				END WHILE;
				IF(thisThread!=0)THEN
					INSERT INTO engine_process(thread, `type`, determinant) VALUES (thisThread, processType, processDeterminant);
					SET processId = (SELECT LAST_INSERT_ID());
					INSERT INTO engine_process_instant(proc_id, thread, `type`, determinant) VALUES (processId, thisThread, processType, processDeterminant);
				END IF;
			END IF;
		END IF;
		SET @temp_sql=('SELECT RELEASE_LOCK(\"ThreadChanger\")');
		PREPARE temp_sql FROM @temp_sql;
		EXECUTE temp_sql;
		DEALLOCATE PREPARE temp_sql;
	END
";

$sql[]="
CREATE PROCEDURE delete_by_mask (IN var_mask VARCHAR(255)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.1\",\"date\":\"26.09.2019\"}*/
	DECLARE flag INT DEFAULT 0;
	DECLARE var_table_name VARCHAR(255);
	DECLARE cursor_delete CURSOR FOR
		SELECT 
			table_name 
		FROM information_schema.tables 
		WHERE 
			table_schema=database() AND 
			table_name REGEXP var_mask;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	OPEN cursor_delete;
		REPEAT
			FETCH cursor_delete INTO 
				var_table_name;
			IF NOT flag THEN
				SET @temp_sql=CONCAT('DROP TABLE IF EXISTS ',var_table_name,';');
				PREPARE temp_sql FROM @temp_sql;
				EXECUTE temp_sql;
				DEALLOCATE PREPARE temp_sql;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_delete;
END;
";

$sql[]='
	CREATE PROCEDURE time_convert (IN time_server DATETIME, OUT time_client DATETIME) BEGIN
		/*{\'product\':\'Binom 1.13\',\'version\':\'2.0\',\'date\':\'11.03.2019\'}*/
		DECLARE varTimezone VARCHAR(10);
		DECLARE varTimezoneHour, varTimezoneMinute INT;
		SET varTimezone=\'{timezone}\';
		SET varTimezoneHour=LEFT(varTimezone, LOCATE(\':\', varTimezone)-1);
		SET varTimezoneMinute=RIGHT(varTimezone, 2);
		IF(varTimezoneHour>0 OR varTimezoneHour=0)THEN
			SET time_client=convert_tz(time_server,@@session.time_zone,CONCAT(\'+\',varTimezoneHour,\':\',varTimezoneMinute));
		ELSE
			SET time_client=convert_tz(time_server,@@session.time_zone,CONCAT(varTimezoneHour,\':\',varTimezoneMinute));
		END IF;
	END
';
	
$sql[]="
CREATE PROCEDURE create_columns (IN var_table_name VARCHAR(128), IN var_column_name VARCHAR(128), IN sql_all TEXT) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.1\",\"date\":\"26.09.2019\"}*/
	IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = var_table_name AND table_schema = database() AND column_name = var_column_name)=0)THEN
		SET @all_sql = sql_all;
		PREPARE create_columns FROM @all_sql;
		EXECUTE create_columns;
		DEALLOCATE PREPARE create_columns;
	END IF;
END
";

$sql[]="
CREATE PROCEDURE drop_columns (IN var_table_name VARCHAR(128), IN var_column_name VARCHAR(128), IN sql_all TEXT) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.1\",\"date\":\"26.09.2019\"}*/
	IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = var_table_name AND table_schema = database() AND column_name = var_column_name)!=0)THEN
		SET @all_sql = sql_all;
		PREPARE drop_columns FROM @all_sql;
		EXECUTE drop_columns;
		DEALLOCATE PREPARE drop_columns;
	END IF;
END
";

$sql[]="
	CREATE PROCEDURE ip_convert (IN ip BIGINT, OUT var_ip VARCHAR(13), OUT var_ip_1 INT, OUT var_ip_2 INT, OUT var_ip_3 INT, OUT var_ip_4 INT) BEGIN
		/*{\"product\":\"Binom 1.10 (i)\",\"version\":\"1.10\",\"date\":\"08.05.2018\"}*/
		DECLARE length_ip INT;
		SET length_ip = LENGTH(ip);
		SET var_ip_1=SUBSTRING(ip,1,(3-(12-length_ip)));
		SET var_ip_2=SUBSTRING(ip,(4-(12-length_ip)),3);
		SET var_ip_3=SUBSTRING(ip,(7-(12-length_ip)),3);
		SET var_ip_4=SUBSTRING(ip,(10-(12-length_ip)),3);
		SET var_ip=CONCAT(var_ip_1,'.',var_ip_2,'.',var_ip_3,'.',var_ip_4);
	END
";

$sql[]="
	CREATE PROCEDURE backup_load() BEGIN
		/*{\"product\":\"Binom 1.10 (i)\",\"version\":\"1.10\",\"date\":\"08.05.2018\"}*/
		IF((SELECT @@global.event_scheduler)!='ON' OR (SELECT @@global.max_allowed_packet)<134217728 OR (SELECT @@global.group_concat_max_len)<10240)THEN
			IF((SELECT @@global.event_scheduler)!='ON')THEN
				SET GLOBAL event_scheduler=ON;
			END IF;
			IF((SELECT @@global.max_allowed_packet)<134217728)THEN
				SET GLOBAL max_allowed_packet=134217728;
			END IF;
			IF((SELECT @@global.group_concat_max_len)<20480)THEN
				SET GLOBAL group_concat_max_len=20480;
			END IF;
			SELECT 1;
		ELSE
			SELECT 0;
		END IF;
	END;
";

$sql[]="
CREATE PROCEDURE drop_foreign_keys (IN var_table_name VARCHAR(128), IN var_column_name VARCHAR(128)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.1\",\"date\":\"26.09.2019\"}*/
	DECLARE flag INT DEFAULT 0;
	DECLARE var_key_name VARCHAR(128);
	DECLARE cursor_1 CURSOR FOR
		SELECT constraint_name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA =database() AND TABLE_NAME = var_table_name AND CONSTRAINT_NAME <>'PRIMARY' AND REFERENCED_TABLE_NAME is not null AND COLUMN_NAME = var_column_name;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	SET flag=0;
	OPEN cursor_1;
		REPEAT
			FETCH cursor_1 INTO var_key_name;
			IF NOT flag THEN
				SET @sql_q=CONCAT('ALTER TABLE ',var_table_name,' DROP FOREIGN KEY ',var_key_name,';');
				PREPARE delete_key FROM @sql_q;
				EXECUTE delete_key;
				DEALLOCATE PREPARE delete_key;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_1;
END
";

$sql[]='
CREATE PROCEDURE engine_clear_step_1() BEGIN
	/*{"product":"Binom 1.14","version":"1.2","date":"26.09.2019"}*/
	DECLARE var_event_id, var_camp_id, var_start, var_start_test, var_end, var_clear_lpt INT DEFAULT 0;
	DECLARE var_start_camp INT DEFAULT 0;
	DECLARE var_float_time, last_click_time, var_now INT DEFAULT 0;
	DECLARE var_now_date DATETIME;
	DECLARE var_table_name, var_month_table_name VARCHAR (255);
	CALL time_convert(NOW(),var_now_date);
	SET var_now=UNIX_TIMESTAMP(var_now_date);
	DO SLEEP(FLOOR(1000 + RAND() * (250 - 1000))/1000);
	IF((SELECT COUNT(*) FROM engine_clear_events WHERE status!=0 AND status!=5)=0)THEN
		SELECT 
			ece.id, 
			ece.camp_id, 
			IFNULL(UNIX_TIMESTAMP(FROM_UNIXTIME(IF(ece.start_interval<c.start_camp,c.start_camp,ece.start_interval), \'%Y-%m-%d 00:00:01\')),0) AS start_interval, 
			UNIX_TIMESTAMP(FROM_UNIXTIME(IF(ece.end_interval>unix_timestamp(),unix_timestamp(),ece.end_interval), \'%Y-%m-%d 23:59:59\')) AS end_interval,
			ece.start_interval
		INTO
			var_event_id,
			var_camp_id,
			var_start,
			var_end,
			var_start_test
		FROM 
			engine_clear_events AS ece
			LEFT JOIN
				campaigns AS c ON c.id = ece.camp_id
		WHERE
			ece.status=0 AND
			ece.start_clear<=var_now AND
			ece.start_interval<=unix_timestamp()
		ORDER BY 
			ece.start_clear ASC 
		LIMIT 1;
		IF(var_event_id IS NOT NULL AND var_event_id!=0 AND var_start<=var_end AND var_start>0 AND var_start IS NOT NULL)THEN
			IF(var_start_test=0)THEN
				SET var_clear_lpt = 1;
			END IF;
			UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 1,start_interval=var_start, end_interval=var_end WHERE id=var_event_id;
			SET var_float_time=var_start;
			WHILE (var_float_time <= var_end) DO
				SET var_table_name=CONCAT(var_camp_id,\'_\',FROM_UNIXTIME(var_float_time,\'%d%m%Y\'));
				IF((SELECT table_name FROM information_schema.tables WHERE table_schema=database() AND table_name=CONCAT(\'report_camp_\',var_table_name)) IS NOT NULL)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES (var_event_id,1,CONCAT(\'report_camp_\',var_table_name));
				END IF;
				IF((SELECT table_name FROM information_schema.tables WHERE table_schema=database() AND table_name=CONCAT(\'report_camp_ip_\',var_table_name)) IS NOT NULL)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES (var_event_id,1,CONCAT(\'report_camp_ip_\',var_table_name));
				END IF;
				IF((SELECT table_name FROM information_schema.tables WHERE table_schema=database() AND table_name=CONCAT(\'report_camp_token_\',var_table_name)) IS NOT NULL)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES (var_event_id,1,CONCAT(\'report_camp_token_\',var_table_name));
				END IF;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 21, id FROM showcase_campaigns WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 22, id FROM showcase_landings WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 23, id FROM showcase_networks WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 24, id FROM showcase_offers WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 25, id FROM showcase_rotations WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 26, id FROM showcase_sources WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 31, id FROM showcase_campaigns_days WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 32, id FROM showcase_landings_days WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 33, id FROM showcase_networks_days WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 34, id FROM showcase_offers_days WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 35, id FROM showcase_rotations_days WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				INSERT INTO engine_clear_tables(event_id, `type`, name) SELECT var_event_id, 36, id FROM showcase_sources_days WHERE date_name = FROM_UNIXTIME(var_float_time,\'%d%m%Y\') AND camp_id = var_camp_id;
				IF(var_clear_lpt=1)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES(var_event_id,37,var_camp_id);
				END IF;
				SET var_float_time=var_float_time + 24*60*60;
			END WHILE;
			SET var_float_time=var_start;
			WHILE (var_float_time <= var_end) DO
				SET var_table_name=CONCAT(var_camp_id,\'_\',FROM_UNIXTIME(var_float_time,\'%d%m%Y\'));
				IF((SELECT table_name FROM information_schema.tables WHERE table_schema=database() AND table_name=CONCAT(\'month_report_camp_\',var_table_name)) IS NOT NULL)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES (var_event_id,1,CONCAT(\'month_report_camp_\',var_table_name));
				END IF;
				IF((SELECT table_name FROM information_schema.tables WHERE table_schema=database() AND table_name=CONCAT(\'month_report_camp_ip_\',var_table_name)) IS NOT NULL)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES (var_event_id,1,CONCAT(\'month_report_camp_ip_\',var_table_name));
				END IF;
				IF((SELECT table_name FROM information_schema.tables WHERE table_schema=database() AND table_name=CONCAT(\'month_report_camp_token_\',var_table_name)) IS NOT NULL)THEN
					INSERT INTO engine_clear_tables(event_id, `type`, name) VALUES (var_event_id,1,CONCAT(\'month_report_camp_token_\',var_table_name));
				END IF;
				SET var_float_time=var_float_time + 24*60*60*30;
			END WHILE;
			TRUNCATE engine_clear_clicks;
			SET last_click_time = (
				SELECT
					IFNULL(
						(
							SELECT 
								click_time
							FROM 
								clicks 
							WHERE 
								click_time>=(SELECT click_time FROM clicks WHERE camp_id = var_camp_id AND click_time>=var_start AND click_time<=var_end ORDER BY click_time ASC LIMIT 1) AND
								camp_id = var_camp_id
							ORDER BY click_time ASC LIMIT 15,1
						),
						(
							SELECT 
								click_time
							FROM
								clicks 
							WHERE 
								click_time>=var_start AND
								click_time<=var_end AND
								camp_id = var_camp_id	
							ORDER BY click_time DESC LIMIT 1
						)
					) AS click_time
			);
			INSERT INTO engine_clear_clicks(event_id, status, start_date, end_date, start_click_time, end_click_time, cnt) VALUES (var_event_id, 0, 0, 0, var_start, last_click_time, 15);
			UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 2, `errors`=0 WHERE id = var_event_id;
			
		ELSE
			IF(var_start>var_end OR var_start=0 OR var_start IS NULL)THEN
				UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 5, `errors`=0 WHERE id = var_event_id;
			END IF;
		END IF;
	END IF;
END;
';

$sql[]="
CREATE PROCEDURE engine_clear_step_2() BEGIN
	/*{\"product\":\"Binom 1.12 (i)\",\"version\":\"1.11\",\"date\":\"15.10.2018\"}*/
	DECLARE var_event_id INT DEFAULT 0;
	DECLARE flag INT DEFAULT 0;
	DECLARE var_event_id_t, var_type, var_el_id INT DEFAULT 0;
	DECLARE var_name VARCHAR (255);
	DECLARE cursor_1 CURSOR FOR
		SELECT 
			id, event_id, `type`, name
		FROM engine_clear_tables;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	DO SLEEP(FLOOR(1000 + RAND() * (250 - 1000))/1000);
	IF((SELECT COUNT(*) FROM engine_clear_events WHERE status!=0 AND status!=5 AND status!=2)=0)THEN
		SELECT 
			id 
		INTO
			var_event_id
		FROM 
			engine_clear_events 
		WHERE
			status=2
		ORDER BY 
			start_clear ASC 
		LIMIT 1;
		IF(var_event_id IS NOT NULL)THEN
			UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 3 WHERE id = var_event_id;
			OPEN cursor_1;
			REPEAT
				FETCH cursor_1 INTO 
					var_el_id, var_event_id_t, var_type, var_name;
				IF NOT flag THEN
					IF(var_event_id_t=var_event_id)THEN
						CASE var_type
							WHEN 1 THEN 
								SET @temp_sql = CONCAT('DROP TABLE IF EXISTS ',var_name);
							WHEN 21 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_campaigns WHERE id = ',var_name);
							WHEN 22 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_landings WHERE id = ',var_name);
							WHEN 23 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_networks WHERE id = ',var_name);
							WHEN 24 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_offers WHERE id = ',var_name);	
							WHEN 25 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_rotations WHERE id = ',var_name);
							WHEN 26 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_sources WHERE id = ',var_name);
							WHEN 31 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_campaigns_days WHERE id = ',var_name);
							WHEN 32 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_landings_days WHERE id = ',var_name);
							WHEN 33 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_networks_days WHERE id = ',var_name);
							WHEN 34 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_offers_days WHERE id = ',var_name);
							WHEN 35 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_rotations_days WHERE id = ',var_name);
							WHEN 36 THEN 
								SET @temp_sql = CONCAT('DELETE FROM showcase_sources_days WHERE id = ',var_name);
							WHEN 37 THEN 
								SET @temp_sql = CONCAT('DELETE FROM tokens_lp WHERE camp_id = ',var_name);
						END CASE;
						IF(@temp_sql IS NOT NULL)THEN
							PREPARE temp_sql FROM @temp_sql;
							EXECUTE temp_sql;
							DEALLOCATE PREPARE temp_sql;
							DELETE FROM engine_clear_tables WHERE id = var_el_id;
						END IF;
						DELETE FROM engine_clear_tables WHERE 1;
					END IF;
				END IF;
				UNTIL flag END REPEAT;
			CLOSE cursor_1;
			DELETE FROM showcase_sources WHERE date_type!=1;
			DELETE FROM showcase_rotations WHERE date_type!=1;
			DELETE FROM showcase_offers WHERE date_type!=1;
			DELETE FROM showcase_networks WHERE date_type!=1;
			DELETE FROM showcase_landings WHERE date_type!=1;
			DELETE FROM showcase_campaigns WHERE date_type!=1;
			INSERT INTO showcase_campaigns (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,2,RIGHT(date_name, 6),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_campaigns WHERE date_type=1 GROUP BY RIGHT(date_name, 6), el_id;
			INSERT INTO showcase_campaigns (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,3,RIGHT(date_name, 4),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_campaigns WHERE date_type=1 GROUP BY RIGHT(date_name, 4), el_id;
			INSERT INTO showcase_landings (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,2,RIGHT(date_name, 6),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_landings WHERE date_type=1 GROUP BY RIGHT(date_name, 6), el_id;
			INSERT INTO showcase_landings (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,3,RIGHT(date_name, 4),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_landings WHERE date_type=1 GROUP BY RIGHT(date_name, 4), el_id;
			INSERT INTO showcase_networks (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,2,RIGHT(date_name, 6),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_networks WHERE date_type=1 GROUP BY RIGHT(date_name, 6), el_id;
			INSERT INTO showcase_networks (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,3,RIGHT(date_name, 4),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_networks WHERE date_type=1 GROUP BY RIGHT(date_name, 4), el_id;
			INSERT INTO showcase_offers (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,2,RIGHT(date_name, 6),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_offers WHERE date_type=1 GROUP BY RIGHT(date_name, 6), el_id;
			INSERT INTO showcase_offers (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,3,RIGHT(date_name, 4),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_offers WHERE date_type=1 GROUP BY RIGHT(date_name, 4), el_id;
			INSERT INTO showcase_rotations (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,2,RIGHT(date_name, 6),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_rotations WHERE date_type=1 GROUP BY RIGHT(date_name, 6), el_id;
			INSERT INTO showcase_rotations (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,3,RIGHT(date_name, 4),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_rotations WHERE date_type=1 GROUP BY RIGHT(date_name, 4), el_id;
			INSERT INTO showcase_sources (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,2,RIGHT(date_name, 6),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_sources WHERE date_type=1 GROUP BY RIGHT(date_name, 6), el_id;
			INSERT INTO showcase_sources (el_id, date_type, date_name, clicks, `unique`,unique_camp,clicks_offer, clicks_landing, leads, event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,bots, spend, pay, last_click, camp_id) SELECT el_id,3,RIGHT(date_name, 4),SUM(clicks),SUM(`unique`),SUM(unique_camp),SUM(clicks_offer),SUM(clicks_landing), SUM(leads),SUM(event_1),SUM(event_2),SUM(event_3),SUM(event_4),SUM(event_5),SUM(event_6),SUM(event_7),SUM(event_8),SUM(event_9),SUM(event_10),SUM(bots),SUM(spend),SUM(pay),MAX(last_click),camp_id FROM showcase_sources WHERE date_type=1 GROUP BY RIGHT(date_name, 4), el_id;
			UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 4, `errors`=0 WHERE id = var_event_id;
		END IF;
	END IF;
END;
";

$sql[]='
CREATE PROCEDURE engine_clear_step_3() BEGIN
	/*{"product":"Binom 1.14","version":"1.3","date":"26.09.2019"}*/
	DECLARE min_limit INT DEFAULT 30;		/*минимальный лимит обрабатываемых строк в секунду*/
	DECLARE max_limit INT DEFAULT 2500;		/*максимальный лимит обрабатываемых строк в секунду*/
	DECLARE desired_time INT DEFAULT 3.05;	/*желаемое время выполнения одного цикла*/
	DECLARE var_event_id,var_camp_id,last_click_time,var_event_start,var_event_end,var_cnt,var_start_proc INT DEFAULT 0;
	DECLARE var_clear_clicks_id,var_start,var_end INT DEFAULT 0;
	SET var_start_proc = unix_timestamp();
	DO SLEEP(FLOOR(1000 + RAND() * (250 - 1000))/1000);
	IF((SELECT COUNT(*) FROM engine_clear_events WHERE status!=0 AND status!=5 AND status!=4)=0)THEN
		IF((SELECT COUNT(*) FROM engine_clear_clicks WHERE status=0 AND start_date>0)=0)THEN
			SELECT 
				id,
				camp_id,
				start_interval,
				end_interval
			INTO
				var_event_id,
				var_camp_id,
				var_event_start,
				var_event_end
			FROM 
				engine_clear_events 
			WHERE
				status=4
			ORDER BY 
				start_clear ASC 
			LIMIT 1;
			IF(var_event_id IS NOT NULL)THEN
				SELECT
					id,start_click_time,end_click_time,cnt
					INTO
					var_clear_clicks_id,var_start,var_end,var_cnt
				FROM engine_clear_clicks
				WHERE status = 0 AND event_id=var_event_id AND start_date=0
				ORDER BY id ASC LIMIT 1;
				IF(var_start IS NOT NULL AND var_end IS NOT NULL)THEN
					UPDATE engine_clear_events SET last_operation=unix_timestamp() WHERE id = var_event_id;
					UPDATE engine_clear_clicks SET start_date = var_start_proc WHERE id = var_clear_clicks_id;
					DROP TABLE IF EXISTS cl_delete_temp;
					SET @temp_sql=\'
						CREATE TABLE IF NOT EXISTS cl_delete_temp (
							id int(11) NOT NULL,
							click_time int(11) NOT NULL,
							cnv_id int(11) NOT NULL
						) ENGINE=MyISAM DEFAULT CHARSET=utf8;
					\';
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					SET @temp_sql=\'ALTER TABLE cl_delete_temp ADD INDEX(id);\';
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					SET @temp_sql=\'ALTER TABLE cl_delete_temp ADD INDEX(click_time);\';
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					SET @temp_sql=\'ALTER TABLE cl_delete_temp ADD INDEX(cnv_id);\';
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					SET @temp_sql=CONCAT(\'
						INSERT INTO cl_delete_temp(id,click_time,cnv_id)
						SELECT  
							id,click_time,cvr_id
						FROM 
							clicks
						WHERE 
							clicks.click_time >=\',var_start,\' AND clicks.click_time <=\',var_end,\' AND clicks.camp_id = \',var_camp_id,\'
						LIMIT 0, \',var_cnt,\';
					\');
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					DELETE FROM cl_delete_temp WHERE click_time>var_event_end OR click_time<var_event_start;
					IF((SELECT COUNT(*) FROM cl_delete_temp)=0) THEN 
						UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 5, `errors`=0 WHERE id = var_event_id;
						UPDATE engine_clear_clicks SET end_date = unix_timestamp(), status = 1 WHERE id = var_clear_clicks_id;
					ELSE
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_referer_url AS tbl ON tbl.click_id = cl.id;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_tokens AS tbl ON tbl.click_id = cl.id;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_map AS tbl ON tbl.click_id = cl.id;
						/*DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_crawler AS tbl ON tbl.click_id = cl.id;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_proxy AS tbl ON tbl.click_id = cl.id;*/
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_tokens_lp AS tbl ON tbl.click_id = cl.id;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks_events AS tbl ON tbl.click_id = cl.id;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN clicks AS tbl ON tbl.id = cl.id;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN conversion_status AS tbl ON tbl.cnv_id = cl.cnv_id WHERE cl.cnv_id!=0;
						DELETE tbl FROM cl_delete_temp AS cl LEFT JOIN conversion AS tbl ON tbl.id = cl.cnv_id WHERE cl.cnv_id!=0;
						DROP TABLE IF EXISTS cl_delete_temp;
						SET var_start=var_end;
						SET var_cnt=IFNULL(ROUND((var_cnt/(unix_timestamp()-var_start_proc))*desired_time),var_cnt*desired_time);
						IF(var_cnt>(max_limit*desired_time))THEN
							SET var_cnt=(max_limit*desired_time);
						END IF;
						IF(var_cnt<(min_limit*desired_time))THEN
							SET var_cnt=(min_limit*desired_time);
						END IF;
						IF((unix_timestamp()-var_start_proc)>desired_time)THEN
							SET var_cnt=ROUND(var_cnt*0.75);
						END IF;
						
						SET @temp_sql = CONCAT(\'
							SELECT "check_test_clear" AS check_test,
								IFNULL(
									(
										SELECT 
											click_time
										FROM 
											clicks 
										WHERE 
											click_time>=\',var_start,\' AND
											camp_id = \',var_camp_id,\'
										ORDER BY click_time ASC LIMIT \',var_cnt,\',1
									),
									(
										SELECT 
											MAX(click_time)
										FROM
											clicks 
										WHERE 
											click_time>=\',var_start,\' AND
											camp_id = \',var_camp_id,\'	
									)
								) AS click_time INTO @check_test, @temp_last_click_time
						\');
						PREPARE temp_sql FROM @temp_sql;
						EXECUTE temp_sql;
						DEALLOCATE PREPARE temp_sql;
						SET last_click_time=@temp_last_click_time;
						INSERT INTO 
							engine_clear_clicks(
								event_id, status, start_date, end_date, start_click_time, end_click_time, cnt
							) VALUES (
								var_event_id, 0, 0, 0, var_start, last_click_time, var_cnt
							);
						UPDATE engine_clear_clicks SET end_date = unix_timestamp(), status = 1 WHERE id = var_clear_clicks_id;
						UPDATE engine_clear_events SET last_operation=unix_timestamp() WHERE id = var_event_id;
					END IF;
				ELSE
					UPDATE engine_clear_events SET last_operation=unix_timestamp(), status = 5, `errors`=0 WHERE id = var_event_id;
				END IF;
			END IF;
		END IF;
	END IF;
END
';

$sql[]='
CREATE PROCEDURE EngineDiagnostics(IN DType VARCHAR(65)) BEGIN
	/*{"product":"Binom 1.15","version":"1.15","date":"12.01.2021"}*/
	DECLARE flag INT DEFAULT 0;
	DECLARE ProcessId INT DEFAULT 0; 
	DECLARE ProcessInfo VARCHAR(255) DEFAULT \'\';
	DECLARE EngProcessId, EngProcessType, EngProcessStart, EngProcessCnt INT DEFAULT 0; 
	DECLARE ClicksInfoCnt INT DEFAULT 0; 
	DECLARE EngProcessLogLimiter, ClicksInfoId INT DEFAULT 0; 
	DECLARE LimitTime1Proc INT DEFAULT 10;
	DECLARE LimitTime8Proc INT DEFAULT 600;
	DECLARE LimitTimeDefaultProc INT DEFAULT 65;
	DECLARE LimitTimeDefault2Proc INT DEFAULT 7200;
	DECLARE ShowcaseDayLimiter INT DEFAULT 35;
	DECLARE ClicksInfoLimiter INT DEFAULT 1000000;
	DECLARE ClicksInfoTimeLimiter INT DEFAULT 86400*7;
	DECLARE CheckTempClickId, CheckClickId INT DEFAULT 0;
	DECLARE TextResult TEXT DEFAULT \'\';
	DECLARE OptimizeTable, OptimizeTableEng, ClearTempTable VARCHAR(255) DEFAULT \'\';
	DECLARE ProcessControlCursor CURSOR FOR
		SELECT id, `info` FROM information_schema.`PROCESSLIST` WHERE 
			(`info` LIKE \'%ignorekill200%\' AND `time`>200) OR 
			(`info` LIKE \'%ignorekill400%\' AND `time`>400) OR 
			(`info` LIKE \'%ignorekill600%\' AND `time`>600) OR 
			(`info` LIKE \'%ignorekill1800%\' AND `time`>1800) OR 
			(`info` LIKE \'%CREATE TEMPORARY TABLE temp_update_data%\' AND `time`>45) OR
			(`info` NOT LIKE \'%engine_clear_step%\' AND `info` NOT LIKE \'%repair%\' AND `info` NOT LIKE \'%REPAIR%\' AND `info` NOT LIKE \'%check%\' AND `info` NOT LIKE \'%CHECK%\' AND `info` NOT LIKE \'%optimize%\' AND `info` NOT LIKE \'%OPTIMIZE%\' AND `info` NOT LIKE \'%ignorekill%\' AND `time`>120 AND `db`=database());
	DECLARE EngProcessControlCursor CURSOR FOR
		/*SELECT id, `type`, start_date FROM engine_process WHERE end_date=0 AND start_date>0;*/
		SELECT id, `type`, start_date FROM engine_process WHERE end_date=0 AND (start_date>0 OR (`thread`!=0 AND `determinant`!=0));
	DECLARE LogControlCursor CURSOR FOR
		SELECT `type`, COUNT(*) AS cnt FROM engine_process WHERE start_date>0 GROUP BY `type`;
	DECLARE OptimizeCursor CURSOR FOR
		SELECT table_name, engine FROM information_schema.tables WHERE table_schema = database();
	DECLARE ClearTempReportCursor CURSOR FOR 
		SELECT table_name FROM information_schema.tables WHERE table_schema = database() AND table_name LIKE \'%temp_report%\' AND (UNIX_TIMESTAMP() - UNIX_TIMESTAMP(update_time) > 3600);
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	DECLARE CONTINUE HANDLER FOR 1062 BEGIN
		IF(EngProcessType IS NOT NULL)THEN
			DELETE FROM temp_table WHERE is_reload=0 AND thread=(SELECT `thread` FROM engine_process WHERE id = EngProcessId) LIMIT 1;
		END IF;
	END;
	DECLARE CONTINUE HANDLER FOR 1227 BEGIN
		SELECT \'No Root version\';
	END;
	CASE DType
		WHEN \'ProcessControl\' THEN 
			SET flag = 0;
			OPEN ProcessControlCursor;
				REPEAT
					FETCH ProcessControlCursor INTO ProcessId, ProcessInfo;
					IF NOT flag THEN
						SET @TempSql=CONCAT(\'KILL \',ProcessId,\';\');
						PREPARE TempSql FROM @TempSql;
						EXECUTE TempSql;
						DEALLOCATE PREPARE TempSql;
						INSERT INTO engine_errors(
							proc_id, `type`, error_date, error_name, error_text
						) VALUES (
							0, 0, NOW(), \'#D1E:long request\',CONCAT(\'SQL:\',ProcessInfo)
						);
					END IF;
				UNTIL flag END REPEAT;
			CLOSE ProcessControlCursor;
			SET flag = 0;
			IF((SELECT COUNT(*) FROM information_schema.`PROCESSLIST`)>20)THEN
				INSERT INTO engine_errors(
					proc_id, `type`, error_date, 	error_name, error_text
				) VALUES (
					0, 0, NOW(), \'#D2W:many requests\',CONCAT(\'COUNT:\',(SELECT COUNT(*) FROM information_schema.`PROCESSLIST`))
				);
			END IF;
		WHEN \'EngProcessControl\' THEN
			SET flag = 0;
			OPEN EngProcessControlCursor;
				REPEAT
					FETCH EngProcessControlCursor INTO EngProcessId, EngProcessType, EngProcessStart;
					IF NOT flag THEN
						CASE EngProcessType
							WHEN 1 THEN 
								IF((UNIX_TIMESTAMP()-EngProcessStart)>LimitTime1Proc)THEN
									DELETE FROM engine_process WHERE id = EngProcessId;
									DELETE FROM engine_process_instant WHERE proc_id = EngProcessId;
									INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text)VALUES (
										EngProcessId, EngProcessType, NOW(), \'#D3E: Timeout\',\'Kill Process\');
								END IF;
							WHEN 8 THEN 
								IF((UNIX_TIMESTAMP()-EngProcessStart)>LimitTime8Proc)THEN
									DELETE FROM engine_process WHERE id = EngProcessId;
									DELETE FROM engine_process_instant WHERE proc_id = EngProcessId;
									INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text)VALUES (
										EngProcessId, EngProcessType, NOW(), \'#D3E: Trigger timeout\',\'Kill Process\');
								END IF;
							WHEN 4 THEN
								IF((UNIX_TIMESTAMP()-EngProcessStart)>LimitTimeDefault2Proc)THEN
									DELETE FROM engine_process WHERE id = EngProcessId;
									DELETE FROM engine_process_instant WHERE proc_id = EngProcessId;
									INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text)VALUES (
										EngProcessId, EngProcessType, NOW(), \'#D3E: Timeout\',\'Kill Process\');
								END IF;
							WHEN 5 THEN
								IF((UNIX_TIMESTAMP()-EngProcessStart)>LimitTimeDefault2Proc)THEN
									DELETE FROM engine_process WHERE id = EngProcessId;
									DELETE FROM engine_process_instant WHERE proc_id = EngProcessId;
									INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text)VALUES (
										EngProcessId, EngProcessType, NOW(), \'#D3E: Timeout\',\'Kill Process\');
								END IF;
							ELSE
								IF((UNIX_TIMESTAMP()-EngProcessStart)>LimitTimeDefaultProc)THEN
									IF(EngProcessType=2)THEN
										UPDATE temp_table SET in_progress=0, thread=0, is_reload=1 WHERE is_reload=2 AND thread=(SELECT `thread` FROM engine_process WHERE id = EngProcessId);
									END IF;
									IF(EngProcessType=3)THEN
										UPDATE temp_table SET in_progress=0, thread=0 WHERE is_reload=0 AND thread=(SELECT `thread` FROM engine_process WHERE id = EngProcessId);
									END IF;
									DELETE FROM engine_process WHERE id = EngProcessId;
									DELETE FROM engine_process_instant WHERE proc_id = EngProcessId;
									INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text)VALUES (
										EngProcessId, EngProcessType, NOW(), \'#D3E: Timeout\',\'Kill Process\');
								END IF;
						END CASE;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE EngProcessControlCursor;
			DELETE FROM engine_process_instant WHERE 
				proc_id!=0 AND
				(SELECT id FROM engine_process WHERE id = engine_process_instant.proc_id) IS NULL;
			SET flag = 0;
		WHEN \'LogControl\' THEN 
			/*cloak control*/
			DELETE FROM cloak_tempdata WHERE create_date<(UNIX_TIMESTAMP()-(30*24*3600));
			/***************/
			DELETE FROM conversion_logs WHERE (UNIX_TIMESTAMP()-logtime)>(7*24*3600);
			IF((SELECT COUNT(*) FROM conversion_logs)>100000)THEN
			    SET @tempid=(SELECT id FROM conversion_logs ORDER BY id DESC LIMIT 95000, 1);
			    DELETE FROM conversion_logs WHERE id < @tempid;
			END IF;
			DELETE FROM trigger_logs WHERE (UNIX_TIMESTAMP()-logtime)>(30*24*3600);
			DELETE FROM engine_users_log WHERE (UNIX_TIMESTAMP()-sql_date)>(14*24*3600);
			OPEN LogControlCursor;
				REPEAT
					FETCH LogControlCursor INTO EngProcessType, EngProcessCnt;
					IF NOT flag THEN
						IF(EngProcessCnt>150)THEN
							SET EngProcessLogLimiter=(SELECT id FROM engine_process WHERE end_date!=0 AND `type`=EngProcessType ORDER BY id DESC LIMIT 75, 1);
							IF(EngProcessType<4)THEN
								CASE EngProcessType
									WHEN 1 THEN 
										INSERT INTO engine_logs(`type`, proc_date, int_val)
											SELECT 
												EngProcessType,
												UNIX_TIMESTAMP(FROM_UNIXTIME(end_date, \'%Y-%m-%d %H:%i:00\')),
												SUM(int_var)
											FROM 
												engine_process 
											WHERE 
												id<EngProcessLogLimiter AND `type`=EngProcessType
											GROUP BY 
												FROM_UNIXTIME(end_date, \'%Y-%m-%d %H:%i:00\');
									ELSE
										INSERT INTO engine_logs(`type`, proc_date, int_val,`speed`)
											SELECT 
												EngProcessType,
												UNIX_TIMESTAMP(FROM_UNIXTIME(end_date, \'%Y-%m-%d %H:%i:00\')),
												AVG((end_date - start_date)/4.26)*100,
												SUM(cnt) AS `speed`
											FROM 
												engine_process 
											WHERE 
												id<EngProcessLogLimiter AND `type`=EngProcessType
											GROUP BY 
												FROM_UNIXTIME(end_date, \'%Y-%m-%d %H:%i:00\');
								END CASE;
							END IF;
							DELETE FROM engine_process WHERE id < EngProcessLogLimiter  AND `type`=EngProcessType;
							SET EngProcessLogLimiter = (SELECT id FROM engine_logs ORDER BY id DESC LIMIT 72000, 1);
							DELETE FROM engine_logs WHERE id < EngProcessLogLimiter;
						END IF;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE LogControlCursor;
			SET flag = 0;
		WHEN \'SystemVarsControl\' THEN 
			SET GLOBAL sql_mode=\'\';
			SET GLOBAL event_scheduler=ON;
			IF((SELECT @@max_allowed_packet)<134217728)THEN
				SET GLOBAL max_allowed_packet=134217728;
			END IF;
			IF((SELECT @@group_concat_max_len)<40960)THEN
				SET GLOBAL group_concat_max_len=40960;
			END IF;
			IF((SELECT @@max_heap_table_size)<2147483648)THEN
				SET GLOBAL max_heap_table_size=2147483648;
			END IF;
			IF((SELECT @@max_sp_recursion_depth)<3)THEN
				SET GLOBAL max_sp_recursion_depth=3;
			END IF;	
		WHEN \'TempDataControl\' THEN
			SET flag = 0;
			IF((SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = database() AND table_name LIKE \'%temp_report%\' AND (UNIX_TIMESTAMP() - UNIX_TIMESTAMP(update_time) > 3600))>0)THEN
				OPEN ClearTempReportCursor;
					REPEAT
						FETCH ClearTempReportCursor INTO ClearTempTable;
						IF NOT flag THEN
							SET @tempsql=CONCAT(\'DROP TABLE IF EXISTS \',database(),\'.\',ClearTempTable);
							PREPARE tempsql FROM @tempsql;
							EXECUTE tempsql;
							DEALLOCATE PREPARE tempsql;
						END IF;
					UNTIL flag END REPEAT;
				CLOSE ClearTempReportCursor;
			END IF;
			SET flag = 0;
			DELETE FROM temp_data WHERE die_time<UNIX_TIMESTAMP();
			DELETE FROM showcase_campaigns_days WHERE UNIX_TIMESTAMP()-UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),\'-\',MID(date_name,-6,2),\'-\',REPLACE(date_name,MID(date_name,-6,6),\'\'),\' \',hour_name,\':00:00\'))>ShowcaseDayLimiter*24*3600;
			DELETE FROM showcase_landings_days WHERE UNIX_TIMESTAMP()-UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),\'-\',MID(date_name,-6,2),\'-\',REPLACE(date_name,MID(date_name,-6,6),\'\'),\' \',hour_name,\':00:00\'))>ShowcaseDayLimiter*24*3600;
			DELETE FROM showcase_networks_days WHERE UNIX_TIMESTAMP()-UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),\'-\',MID(date_name,-6,2),\'-\',REPLACE(date_name,MID(date_name,-6,6),\'\'),\' \',hour_name,\':00:00\'))>ShowcaseDayLimiter*24*3600;
			DELETE FROM showcase_offers_days WHERE UNIX_TIMESTAMP()-UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),\'-\',MID(date_name,-6,2),\'-\',REPLACE(date_name,MID(date_name,-6,6),\'\'),\' \',hour_name,\':00:00\'))>ShowcaseDayLimiter*24*3600;
			DELETE FROM showcase_rotations_days WHERE UNIX_TIMESTAMP()-UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),\'-\',MID(date_name,-6,2),\'-\',REPLACE(date_name,MID(date_name,-6,6),\'\'),\' \',hour_name,\':00:00\'))>ShowcaseDayLimiter*24*3600;
			DELETE FROM showcase_sources_days WHERE UNIX_TIMESTAMP()-UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),\'-\',MID(date_name,-6,2),\'-\',REPLACE(date_name,MID(date_name,-6,6),\'\'),\' \',hour_name,\':00:00\'))>ShowcaseDayLimiter*24*3600;	
		WHEN \'ClicksInfoControl\' THEN	
			SET ClicksInfoCnt = (SELECT COUNT(*) FROM clicks_info);
			IF(ClicksInfoCnt > ClicksInfoLimiter*2)THEN
				SET ClicksInfoId = (SELECT id FROM clicks_info WHERE is_cnv=0 ORDER BY info_time DESC LIMIT 850000, 1);
				DELETE FROM clicks_info WHERE id < ClicksInfoId;
			ELSE
				IF(ClicksInfoCnt > ClicksInfoLimiter)THEN
					SET ClicksInfoId = (SELECT info_time FROM clicks_info WHERE is_cnv=0 ORDER BY info_time ASC LIMIT 300000, 1);
					DELETE FROM clicks_info WHERE info_time < ClicksInfoId;
				ELSE
					DELETE FROM clicks_info WHERE (UNIX_TIMESTAMP(NOW())-info_time)>(ClicksInfoTimeLimiter);
				END IF;
			END IF;
			/*clean FingerPrint*/
			DELETE FROM clicks_info_fingerprint WHERE uclick NOT IN (SELECT uclick FROM clicks_info);
		WHEN \'ErrorControl\' THEN
			DELETE FROM temp_clicks WHERE (SELECT id FROM clicks WHERE id = temp_clicks.id) IS NOT NULL;
			SET CheckTempClickId=(SELECT auto_increment FROM information_schema.tables WHERE table_name = \'temp_clicks\' AND table_schema = database());
			SET CheckClickId=(SELECT auto_increment FROM information_schema.tables WHERE table_name = \'clicks\' AND table_schema = database());
			IF(CheckClickId>CheckTempClickId)THEN
				TRUNCATE temp_clicks;
				SET @temp_sql = CONCAT(\'ALTER TABLE temp_clicks AUTO_INCREMENT=\',CheckClickId+1);
				PREPARE temp_sql FROM @temp_sql;
				EXECUTE temp_sql;
				DEALLOCATE PREPARE temp_sql;
			END IF;
		WHEN \'TempTableErrorControl\' THEN
			DELETE FROM temp_table WHERE click_id=0;
			DELETE FROM temp_table WHERE id IN (
				SELECT 
					temp.id
				FROM 
					(SELECT id, click_id FROM temp_table ORDER BY id ASC LIMIT 5000) AS temp 
					LEFT JOIN 
						clicks ON clicks.id = temp.click_id 
					LEFT JOIN 
						temp_clicks ON temp_clicks.id = temp.click_id 
					WHERE 
					clicks.id IS NULL AND temp_clicks.id IS NULL
			);
			DELETE FROM temp_table WHERE id IN (
				SELECT 
					temp.id
				FROM 
					(SELECT id, click_id FROM temp_table ORDER BY id ASC LIMIT 10000) AS temp
					LEFT JOIN clicks_map 
						ON clicks_map.click_id = temp.click_id 
					WHERE 
						clicks_map.click_id IS NULL AND
						(SELECT int_var FROM engine_process WHERE `type`=2 AND end_date>0 ORDER BY id DESC LIMIT 1) > temp.click_id
			);
		WHEN \'OptimizeFast\' THEN
			OPTIMIZE TABLE showcase_campaigns;
			OPTIMIZE TABLE showcase_landings;
			OPTIMIZE TABLE showcase_networks;
			OPTIMIZE TABLE showcase_offers;
			OPTIMIZE TABLE showcase_rotations;
			OPTIMIZE TABLE showcase_sources;
					  
			OPTIMIZE TABLE showcase_campaigns_days;
			OPTIMIZE TABLE showcase_landings_days;
			OPTIMIZE TABLE showcase_networks_days;
			OPTIMIZE TABLE showcase_offers_days;
			OPTIMIZE TABLE showcase_rotations_days;
			OPTIMIZE TABLE showcase_sources_days;
					  
			OPTIMIZE TABLE temp_table;
			OPTIMIZE TABLE clicks_info;
			OPTIMIZE TABLE engine_process;
			OPTIMIZE TABLE engine_process_instant;
			OPTIMIZE TABLE base_browser;
			OPTIMIZE TABLE base_device_brand;
			OPTIMIZE TABLE base_device_lang;
			OPTIMIZE TABLE base_device_model;
			OPTIMIZE TABLE base_device_technical_data_1;
			OPTIMIZE TABLE base_device_technical_data_2;
			OPTIMIZE TABLE base_device_technical_data_3;
			OPTIMIZE TABLE base_device_technical_data_4;
			OPTIMIZE TABLE base_os;
			OPTIMIZE TABLE users_permission;
			OPTIMIZE TABLE temp_data;
			OPTIMIZE TABLE token_tags;
			OPTIMIZE TABLE conversion_logs;
		WHEN \'OptimizeNoReport\' THEN	
			SET flag = 0;
			OPEN OptimizeCursor;
				REPEAT
					FETCH OptimizeCursor INTO OptimizeTable, OptimizeTableEng;
					IF NOT flag THEN
						IF(OptimizeTable NOT LIKE \'%report_camp%\')THEN
							SET @temp_sql=CONCAT(\'OPTIMIZE TABLE \',OptimizeTable,\';\');
							PREPARE temp_sql FROM @temp_sql;
							EXECUTE temp_sql;
							DEALLOCATE PREPARE temp_sql;
						END IF;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE OptimizeCursor;
			SET flag = 0;
		WHEN \'OptimizeReport\' THEN	
			SET flag = 0;
			OPEN OptimizeCursor;
				REPEAT
					FETCH OptimizeCursor INTO OptimizeTable, OptimizeTableEng;
					IF NOT flag THEN
						IF(OptimizeTable LIKE \'%report_camp%\' OR OptimizeTable LIKE \'%showcase%\')THEN
							SET @temp_sql=CONCAT(\'OPTIMIZE TABLE \',OptimizeTable,\';\');
							PREPARE temp_sql FROM @temp_sql;
							EXECUTE temp_sql;
							DEALLOCATE PREPARE temp_sql;
						END IF;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE OptimizeCursor;
			SET flag = 0;
		WHEN \'OptimizeMyisam\' THEN	
			SET flag = 0;
			OPEN OptimizeCursor;
				REPEAT
					FETCH OptimizeCursor INTO OptimizeTable, OptimizeTableEng;
					IF NOT flag THEN
						IF(OptimizeTableEng=\'myisam\')THEN
							SET @temp_sql=CONCAT(\'OPTIMIZE TABLE \',OptimizeTable,\';\');
							PREPARE temp_sql FROM @temp_sql;
							EXECUTE temp_sql;
							DEALLOCATE PREPARE temp_sql;
						END IF;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE OptimizeCursor;
			SET flag = 0;
		WHEN \'OptimizeFull\' THEN	
			SET flag = 0;
			OPEN OptimizeCursor;
				REPEAT
					FETCH OptimizeCursor INTO OptimizeTable, OptimizeTableEng;
					IF NOT flag THEN
						SET @temp_sql=CONCAT(\'OPTIMIZE TABLE \',OptimizeTable,\';\');
						PREPARE temp_sql FROM @temp_sql;
						EXECUTE temp_sql;
						DEALLOCATE PREPARE temp_sql;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE OptimizeCursor;
			SET flag = 0;
	END CASE;
	IF(TextResult=\'\')THEN
		SET TextResult=\'Finish\';
	END IF;
	SELECT TextResult;
END;
';

$sql[]="
	CREATE PROCEDURE engine_proc_controller(IN proc_type INT, IN proc_status VARCHAR(12)) BEGIN
		/*{\"product\":\"Binom 1.10 (i)\",\"version\":\"1.10\",\"date\":\"08.05.2018\"}*/
		DECLARE temp_id INT DEFAULT 0;
		CASE proc_status
			WHEN 'stop' THEN 
				IF((SELECT COUNT(*) FROM engine_process_instant WHERE `type`=proc_type AND 	proc_id	=0)=0)THEN
					INSERT INTO engine_process_instant(proc_id, `type`) VALUES (0,proc_type);
				END IF;
			WHEN 'start' THEN 
				DELETE FROM engine_process_instant WHERE proc_id=0 AND `type`=proc_type;
			WHEN 'restart' THEN 
				DELETE FROM engine_process WHERE `type`=proc_type AND end_date=0;
				DELETE FROM engine_process_instant WHERE `type`=proc_type;
			WHEN 'lowspeed' THEN 
				SET temp_id=(SELECT id FROM engine_process WHERE `type`=proc_type ORDER BY id DESC LIMIT 10,1);
				UPDATE engine_process SET cnt = 1 WHERE `type`=proc_type AND id > temp_id;
		END CASE;
	END;
";

$sql[]="
	CREATE PROCEDURE Math_Coef(IN var_a BIGINT, IN var_b BIGINT, OUT coef DECIMAL(64,0)) BEGIN
		/*{\"product\":\"Binom 1.10 (i)\",\"version\":\"1.10\",\"date\":\"08.05.2018\"}*/
		DECLARE var_c DECIMAL(64,0) DEFAULT 1;
		DECLARE var_i, var_i2 BIGINT DEFAULT 1;
		SET var_i=var_b-var_a+1;
		WHILE (var_i<=var_b AND var_c<(POW(10,63)-1)) DO
			SET var_c = var_c * var_i / var_i2;
			SET var_i=var_i+1;
			SET var_i2=var_i2+1;
			IF(var_c>=(POW(10,63)-1))THEN
				SET var_c=0;
				SET var_i = var_b;
			END IF;
		END WHILE;
		SET coef = var_c;
	END;
";

$sql[]="
	CREATE PROCEDURE Math_Result(IN var_a BIGINT, IN var_b BIGINT, IN var_c DECIMAL(17,8), IN var_d DECIMAL(17,8), OUT var_result_1 DECIMAL(5,2), OUT var_result_2 DECIMAL(4,2)) BEGIN
		/*{\"product\":\"Binom 1.10 (i)\",\"version\":\"1.10\",\"date\":\"08.05.2018\"}*/
		DECLARE var_p DECIMAL(64,8) DEFAULT 0;
		DECLARE var_h DECIMAL(20,15);
		DECLARE var_i BIGINT DEFAULT 0;
		DECLARE var_f DECIMAL(64,0);
		SET var_h = var_d/var_c;
		SET var_result_2 = 1;
		WHILE var_i<=var_a DO
			CALL Math_Coef(var_i,var_b,var_f);
			IF(var_f=0)THEN
				SET var_i=var_a+1;
				SET var_result_2 = 0;
			ELSE
				SET var_p = var_p + var_f * POW(var_h,var_i) * POW((1-var_h),(var_b-var_i));
				SET var_i = var_i + 1;
			END IF;
		END WHILE;
		SET var_result_1 = var_p*100;
	END;
";

$sql[]="
CREATE PROCEDURE createIndex(IN varTableName VARCHAR(65), IN varColumnName VARCHAR(65), IN varIndexName VARCHAR(65), IN varNonUnique INT) BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.0\",\"date\":\"05.11.2018\"}*/
	DECLARE 
		varCurCntColumns, varCurNonUnique, flag, varCntIndex1, varCntIndex2
	INT DEFAULT 0;
	DECLARE 
		varCurIndexName, varCurColumnName
	VARCHAR(65) DEFAULT NULL;
	DECLARE cursorIndexs CURSOR FOR
		SELECT cnt_columns,index_name,column_name,non_unique FROM 
		(
			SELECT COUNT(*) AS cnt_columns,index_name,
					if(COUNT(*)>1, GROUP_CONCAT(DISTINCT column_name SEPARATOR ', '),column_name) AS column_name,
					non_unique
			FROM information_schema.statistics
			WHERE table_schema = database() AND table_name = varTableName
			GROUP BY index_name
		) AS indexs WHERE REPLACE(indexs.column_name,' ','')=varColumnName OR indexs.index_name=varIndexName;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	OPEN cursorIndexs;
		REPEAT
			FETCH cursorIndexs INTO 
				varCurCntColumns,
				varCurIndexName,
				varCurColumnName,
				varCurNonUnique;
			IF NOT flag THEN
				SET varCntIndex1 = varCntIndex1 + 1;
				IF(
					(
						varCurCntColumns>0 AND 
						(
							REPLACE(varCurColumnName,' ','')!=varColumnName OR 
							varCurNonUnique!=varNonUnique OR
							varCurIndexName!=varIndexName
						)
					)
				)THEN
					SET varCurCntColumns=0;
					SET @tempSQL=CONCAT('ALTER TABLE `',varTableName,'` DROP INDEX `',varCurIndexName,'`');
					PREPARE tempSQL FROM @tempSQL;
					EXECUTE tempSQL;
					DEALLOCATE PREPARE tempSQL;
					SET varCntIndex2 = varCntIndex2 + 1;
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursorIndexs;
	IF(varCntIndex2=varCntIndex1)THEN
		IF(varNonUnique=0)THEN
			SET @tempSQL=CONCAT('
				CREATE UNIQUE INDEX `',varIndexName,'` ON `',varTableName,'`(',varColumnName,');
			');
		ELSE
			SET @tempSQL=CONCAT('
				CREATE INDEX `',varIndexName,'` ON `',varTableName,'`(',varColumnName,');
			');
		END IF;
		PREPARE tempSQL FROM @tempSQL;
		EXECUTE tempSQL;
		DEALLOCATE PREPARE tempSQL;
	END IF;
END;
";

$sql[]="
	CREATE PROCEDURE dropIndex(IN varTableName VARCHAR(65), IN varIndexName VARCHAR(65)) BEGIN
		IF((SELECT COUNT(*) AS cnt FROM information_schema.statistics WHERE table_schema = database() AND table_name = varTableName AND index_name=varIndexName GROUP BY index_name LIMIT 1)>0)THEN
			SET @tempSQL=CONCAT('ALTER TABLE `',varTableName,'` DROP INDEX `',varIndexName,'`;');
			PREPARE tempSQL FROM @tempSQL;
			EXECUTE tempSQL;
			DEALLOCATE PREPARE tempSQL;
		END IF;
	END;
";
?>