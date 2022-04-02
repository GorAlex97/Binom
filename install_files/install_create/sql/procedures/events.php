<?php
$sql[]="
	CREATE EVENT autoCleaning ON SCHEDULE EVERY 24 HOUR STARTS '2019-01-01 00:00:01' DO BEGIN".'
		/*{"product":"Binom 1.14","version":"114010","date":"18.06.2020"}*/'."
		DECLARE 
			varCampId_temp, varClickId, varClickTime,
			varCampId, varTimeLimit,
			varStartClearTime, varEndClearTime,
			varClearDays, flag, varClickFlag
		INT DEFAULT 0;
		DECLARE clearCampsCursor1 CURSOR FOR
			SELECT 
				id
			FROM
				campaigns
			WHERE 
				id>0 AND 
				id NOT IN (SELECT camp_id FROM engine_clear_events WHERE status<5) AND
				id NOT IN (SELECT camp_id FROM engine_autoclear_extends) AND
				start_camp>0 AND
				start_camp<varClickFlag;
		DECLARE clearCampsCursor2 CURSOR FOR 
			SELECT id, click_time FROM ClearCamps;
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1; 	
		IF((SELECT val FROM `settings` WHERE name = 'auto_clear_status')=1 AND (SELECT val FROM `settings` WHERE name = 'auto_clear_interval')>0)THEN
			SET varClickFlag = (SELECT click_time+(1*24*3600) FROM clicks WHERE click_time>0 AND click_time<(UNIX_TIMESTAMP()-(SELECT (val+1)*24*3600 FROM `settings` WHERE name = 'auto_clear_interval')) AND camp_id NOT IN (SELECT camp_id FROM engine_autoclear_extends) AND id!=0 ORDER BY click_time ASC LIMIT 1);
			SET varTimeLimit = (SELECT val*24*3600 FROM `settings` WHERE name = 'auto_clear_interval');
			SET @temp_sql='
				CREATE TEMPORARY TABLE `ClearCamps` (
					id INT NOT NULL, 
					click_time INT NOT NULL
				);
			';
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			OPEN clearCampsCursor1;
					REPEAT
						FETCH clearCampsCursor1 INTO varCampId_temp;
						IF NOT flag THEN
							
							SET varClickId=(SELECT IF((SELECT click_time FROM clicks WHERE camp_id = varCampId_temp ORDER BY id ASC LIMIT 1)<varClickFlag,1,NULL) AS checkId LIMIT 1);						
							
							IF(varClickId IS NOT NULL)THEN
								SET varClickTime = (
									SELECT 
										(
											SELECT
												click_time 
											FROM 
												clicks 
											WHERE 
												camp_id = varCampId_temp AND 
												click_time>0 AND 
												click_time<varClickFlag 
											ORDER BY click_time ASC 
											LIMIT 1
										) AS click_time 
								);
								IF(varClickTime IS NOT NULL)THEN
									INSERT INTO `ClearCamps`(`id`, `click_time`)VALUES(varCampId_temp, varClickTime);
								END IF;
							END IF;
						END IF;
				UNTIL flag END REPEAT;
			CLOSE clearCampsCursor1;
			SET flag=0;
			OPEN clearCampsCursor2;
				REPEAT
					FETCH clearCampsCursor2 INTO varCampId, varStartClearTime;
						IF NOT flag THEN
							IF(varStartClearTime<UNIX_TIMESTAMP()-varTimeLimit)THEN
								IF(((UNIX_TIMESTAMP()-varTimeLimit) - varStartClearTime)/(3600*24)>3)THEN
									SET varClearDays=3;
								END IF;
								SET varEndClearTime=varStartClearTime+(3*24*3600);
								INSERT INTO engine_clear_events(
									auto_clear, start_clear, camp_id,
									start_interval, end_interval
								) VALUES (
									1, UNIX_TIMESTAMP(), varCampId,
									varStartClearTime-1, varEndClearTime+1
								);
							END IF;
						END IF;
				UNTIL flag END REPEAT;
			CLOSE clearCampsCursor2;
		END IF;
	END;
";
$sql[]='
CREATE EVENT correctorReportEvent ON SCHEDULE EVERY 1 SECOND DO BEGIN
	/*{"product":"Binom 1.14","version":"114004","date":"12.03.2020"}*/
	DECLARE startClick, lastClick, countClicks, processLimiter, Process2Limiter INT DEFAULT 0;
	DECLARE trueResult, processId, timeInThread, thisThread, tempThread INT DEFAULT 0;
	/*--------------------*/
	DECLARE CONTINUE HANDLER FOR 1062 BEGIN
	END;
	/*---------------------*/
	SET tempThread=FLOOR(RAND()*(99-50)+50);
	SET Process2Limiter = (SELECT MAX(int_var) FROM engine_process WHERE end_date!=0 AND `type`=2);
	SET startClick = (SELECT id FROM temp_table WHERE `is_reload`=0 AND in_progress=0 ORDER BY id ASC LIMIT 1);
	SET lastClick = (SELECT id FROM temp_table WHERE `is_reload`=0 AND in_progress=0 ORDER BY id DESC LIMIT 1);
	IF(lastClick IS NOT NULL)THEN
		CALL ThreadChanger(3, startClick, processId, timeInThread, thisThread);
		IF(processId!=0 AND processId IS NOT NULL)THEN
			SET processLimiter=3500;
			SET countClicks = 1;
			SET countClicks = (SELECT IF(test2.s IS NULL,1,IF(test2.S<1,1,(IF(test2.S>processLimiter,processLimiter,test2.S)))) AS S FROM (SELECT AVG(test.C / test.T) AS S FROM (SELECT IF((end_date - start_date)=0,0.25,(end_date - start_date)) AS T, cnt AS C FROM engine_process WHERE end_date!=0 AND `type` = 3 AND cnt != 0 ORDER BY id DESC LIMIT 5) AS test) AS test2);
			SET countClicks=countClicks*timeInThread;
			IF((lastClick-startClick)>countClicks)THEN
				IF(countClicks<(SELECT COUNT(*) FROM temp_table))THEN
					SET @temp_sql=CONCAT(\'SELECT id INTO @last_id FROM temp_table WHERE `is_reload`=0 AND in_progress=0 ORDER BY id ASC LIMIT \',countClicks,\', 1\');
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					SET lastClick = @last_id;
				END IF;
			END IF;
			IF((SELECT COUNT(*) FROM temp_table WHERE id >= startClick AND id <= lastClick AND click_id <= Process2Limiter AND is_reload = 0 AND in_progress=0)>0)THEN
				UPDATE temp_table SET in_progress = 0, `thread` = tempThread WHERE in_progress = 1 AND `thread`=thisThread;
				DROP TABLE IF EXISTS temp_table_in_progress_id;
				CREATE TEMPORARY TABLE temp_table_in_progress_id SELECT MIN(id) AS id FROM temp_table WHERE
				    in_progress=0 AND
                    id >= startClick AND
                    id <= lastClick AND
                    click_id <= Process2Limiter AND
                    is_reload = 0 GROUP BY click_id;
				UPDATE temp_table SET in_progress = 1, `thread`=thisThread WHERE
				    in_progress=0 AND
                    id >= startClick AND
                    id <= lastClick AND
                    click_id <= Process2Limiter AND
                    is_reload = 0 AND
                    id IN (
                       SELECT id FROM temp_table_in_progress_id
                    );
				DROP TABLE IF EXISTS temp_table_in_progress_id;
				UPDATE engine_process SET 
					start_date = unix_timestamp(),
					cnt = (SELECT COUNT(*) FROM temp_table WHERE in_progress = 1 AND `thread`=thisThread),
					int_var = lastClick
				WHERE id = processId;
				DROP TABLE IF EXISTS temp_update_data;
				CALL correctorReport(startClick, lastClick, thisThread);
				SET trueResult = 1;
				IF(trueResult=1)THEN
					UPDATE engine_process SET
						end_date = unix_timestamp()
					WHERE id = processId;
				ELSE
					DELETE FROM engine_process WHERE id = processId;
				END IF;
				UPDATE temp_table SET in_progress = 0, `thread` = 0 WHERE `thread`=tempThread;
			ELSE
				DELETE FROM engine_process WHERE id = processId;
			END IF;
			DELETE FROM engine_process_instant WHERE proc_id = processId;
		END IF;
	END IF;
END;
';

$sql[]='
	CREATE EVENT clear_offer_cap ON SCHEDULE EVERY 10 MINUTE DO BEGIN
		/*{"product":"Binom 1.13","version":"1.2","date":"02.04.2019"}*/
		UPDATE offers SET cap_cnv=0, cap_clear=UNIX_TIMESTAMP() WHERE cap_cnv > 0 AND HOUR(convert_tz(NOW(),@@session.time_zone,cap_timezone))=0 AND (UNIX_TIMESTAMP()-cap_clear)>3600;
	END;
';
$sql[]="
CREATE EVENT creatorReportEvent ON SCHEDULE EVERY 1 SECOND DO BEGIN
	/*{\"product\":\"Binom 1.15\",\"version\":\"115000\",\"date\":\"15.03.2020\"}*/
	DECLARE startClick, dplClick, lastClick, countClicks, processLimiter INT DEFAULT 0;
	DECLARE trueResult, processId, timeInThread, thisThread INT DEFAULT 0;
	SET startClick = (SELECT int_var FROM engine_process WHERE `type` = 2 AND start_date!=0 ORDER BY id DESC LIMIT 1);
    SET dplClick = (SELECT int_var FROM engine_process WHERE `type` = 2 AND start_date!=0 AND int_var>0 ORDER BY id DESC LIMIT 1,1);
	IF(startClick IS NULL)THEN
		SET startClick = 0;
	END IF;
	SET lastClick = (SELECT id FROM clicks ORDER BY id DESC LIMIT 1);
    IF(startClick<dplClick)THEN
        IF((SELECT SUM(int_var) FROM engine_process WHERE `type` = 2)>0)THEN
            INSERT INTO engine_errors(
                proc_id, `type`, error_date, error_name, error_text
            ) VALUES (
                0, 2, NOW(), '#D2E:Wrong reboot',''
            );
            DELETE FROM engine_process WHERE int_var = 0 AND `type`=2;
            SET startClick = dplClick;
        END IF;
    END IF;
    IF((SELECT `AUTO_INCREMENT` FROM `information_schema`.`TABLES` WHERE `TABLE_SCHEMA` = database() AND `TABLE_NAME` = 'clicks')<startClick)THEN
        INSERT INTO engine_errors(
            proc_id, `type`, error_date, error_name, error_text
        ) VALUES (
                     0, 2, NOW(), '#D2E:Wrong PR2ID',''
                 );
        DELETE FROM engine_process WHERE int_var = startClick AND `type`=2;
        SET startClick = dplClick;
    END IF;
	IF(startClick!=lastClick OR (SELECT COUNT(*) FROM temp_table WHERE is_reload=1)>0)THEN
		CALL ThreadChanger(2, startClick, processId, timeInThread, thisThread); 
		IF(processId!=0 AND processId IS NOT NULL)THEN
			SET processLimiter=1250;
			SET countClicks = 1;
			IF((lastClick>startClick OR (SELECT COUNT(*) FROM temp_table WHERE `is_reload`=1)>0) AND lastClick IS NOT NULL AND lastClick!=0 AND (startClick!=lastClick OR (SELECT COUNT(*) FROM temp_table WHERE `is_reload` = 1)>0))THEN
				SET countClicks = (SELECT IF(test2.s IS NULL,1,IF(test2.S<1,1,(IF(test2.S>processLimiter,processLimiter,test2.S)))) AS S FROM (SELECT AVG(test.C / test.T) AS S FROM (SELECT IF((end_date - start_date)=0,0.5,(end_date - start_date)) AS T, cnt AS C FROM engine_process WHERE end_date!=0 AND `type` = 2 AND cnt != 0 ORDER BY id DESC LIMIT 5) AS test) AS test2);
				SET countClicks = countClicks * timeInThread;
				IF((lastClick - startClick)>countClicks)THEN
					SET lastClick = startClick+countClicks;
				END IF;
				UPDATE engine_process SET 
					start_date = unix_timestamp(),
					cnt = (lastClick-startClick),
					int_var = lastClick
				WHERE id = processId;
				CALL creatorReport(startClick, lastClick, thisThread); 
				SET trueResult = 1;
			END IF;
			IF(trueResult=1)THEN
				UPDATE engine_process SET
					end_date = unix_timestamp()
				WHERE id = processId;
			ELSE
				DELETE FROM engine_process WHERE id = processId;
			END IF;
			DELETE FROM engine_process_instant WHERE proc_id = processId;
		END IF;
	END IF;
END;
";
$sql[]="
CREATE EVENT saverClicksEvent ON SCHEDULE EVERY 2 SECOND DO BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.2\",\"date\":\"26.09.2019\"}*/
	DECLARE countClicks INT DEFAULT 0;
	DECLARE clientTime DATETIME;
	DECLARE processId, timeInThread, trueResult, thisThread INT DEFAULT 0;
	SET countClicks = (SELECT COUNT(id) FROM temp_clicks);
	IF(countClicks>0)THEN
		CALL ThreadChanger(1, 0, processId, timeInThread, thisThread); 
		IF(processId!=0 AND processId IS NOT NULL)THEN
			CALL time_convert(NOW(),clientTime);
			IF (countClicks > 1500) THEN
				SET countClicks=1500;
			END IF;
			IF (countClicks > 100) THEN
				UPDATE engine_process SET 
						start_date = unix_timestamp(),
						cnt = countClicks,
						int_var = countClicks
				WHERE id = processId;
				CALL saverClicks(countClicks);
				SET trueResult = 1;
			ELSE
				IF ((UNIX_TIMESTAMP(clientTime) - (SELECT click_time FROM temp_clicks ORDER BY click_time ASC LIMIT 0, 1))>15) THEN
					UPDATE engine_process SET 
						start_date = unix_timestamp(),
						cnt = countClicks,
						int_var = countClicks
					WHERE id = processId;
					CALL saverClicks(countClicks);
					SET trueResult = 1;
				END IF;
			END IF;
			IF(trueResult=1)THEN
				UPDATE engine_process SET
					end_date = unix_timestamp()
				WHERE id = processId;
			ELSE
				DELETE FROM engine_process WHERE id = processId;
			END IF;
			DELETE FROM engine_process_instant WHERE proc_id = processId;
		END IF;
	END IF;
END;
";

$sql[]="
	CREATE EVENT engine_clear_event ON SCHEDULE EVERY 4 SECOND DO BEGIN
		/*{\"product\":\"Binom 1.14\",\"version\":\"114010\",\"date\":\"21.05.2020\"}*/
		DECLARE time_limit_step_1 INT DEFAULT 300;
		DECLARE time_limit_step_2 INT DEFAULT 300;
		DECLARE time_limit_step_3 INT DEFAULT 60;
		DECLARE time_limit_step_31 INT DEFAULT 1;
		DECLARE var_kill_proc, var_norestart_proc INT DEFAULT 0;
		DECLARE var_now_date DATETIME;
		DECLARE var_event_id, var_status, var_last_operation, var_errors, var_now INT DEFAULT 0;
		CALL time_convert(NOW(),var_now_date);
		SET var_now=UNIX_TIMESTAMP(var_now_date);
		IF((SELECT COUNT(*) FROM engine_clear_events WHERE status>0 AND status<5)>1)THEN
			SET var_norestart_proc = (SELECT id FROM engine_clear_events WHERE status>0 AND status<5 ORDER BY status DESC LIMIT 1);
			UPDATE engine_clear_events SET status = 0 WHERE status>0 AND status<5 AND status!=var_norestart_proc;
		END IF;
		IF((SELECT COUNT(*) FROM engine_clear_events WHERE status!=0 AND status!=5)<=1)THEN
			IF((SELECT COUNT(*) FROM engine_clear_events WHERE start_clear<=var_now AND status<5)>0)THEN
				SELECT 
					id, status, last_operation,`errors`
				INTO
					var_event_id,
					var_status,
					var_last_operation,
					var_errors
				FROM 
					engine_clear_events 
				WHERE 
					start_clear<=var_now AND
					status<5
				ORDER BY status DESC LIMIT 1;
				CASE var_status
					WHEN 0 THEN 
						call engine_clear_step_1;
					WHEN 1 THEN 
						IF((unix_timestamp()-var_last_operation)>time_limit_step_1)THEN
							UPDATE engine_clear_events SET status = 9 WHERE id = var_event_id;
						END IF;
					WHEN 2 THEN 
						call engine_clear_step_2;
					WHEN 3 THEN 
						IF((unix_timestamp()-var_last_operation)>time_limit_step_2)THEN
							IF(var_errors<5)THEN
								UPDATE engine_clear_events SET status = 2, `errors`=`errors`+1 WHERE id = var_event_id;
							ELSE
								UPDATE engine_clear_events SET status = 9, `errors`=5 WHERE id = var_event_id;
							END IF;
						END IF;
					WHEN 4 THEN 
						IF((SELECT COUNT(*) FROM engine_clear_clicks WHERE status=0 AND start_date>0)=0)THEN
							IF((unix_timestamp()-1588085466)>time_limit_step_31)THEN
								
								call engine_clear_step_3;
							END IF;
						ELSE
							IF(var_errors<30)THEN
								IF((unix_timestamp()-var_last_operation)>time_limit_step_3)THEN
									UPDATE engine_clear_events SET `errors`=`errors`+1 WHERE id = var_event_id;
									SET var_kill_proc = (SELECT id FROM information_schema.`PROCESSLIST` WHERE `info` LIKE '%check_test_clear%' AND `time`>time_limit_step_3 LIMIT 1);
									IF(var_kill_proc IS NOT NULL)THEN
										SET @temp_sql = CONCAT('KILL ',var_kill_proc,';');
										PREPARE temp_sql FROM @temp_sql;
										EXECUTE temp_sql;
										DEALLOCATE PREPARE temp_sql;
									END IF;
									UPDATE engine_clear_clicks SET start_date=0, end_click_time=start_click_time, cnt=15 WHERE status=0 AND start_date>0;
								END IF;
							ELSE
								UPDATE engine_clear_events SET status = 9, `errors`=30 WHERE id = var_event_id;
							END IF;
						END IF;
				END CASE;
			END IF;
		END IF;
	END;
";

$sql[]='
	CREATE EVENT EDProcessControl ON SCHEDULE EVERY 30 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'ProcessControl\');
	END;
';
$sql[]='
	CREATE EVENT EDEngProcessControl ON SCHEDULE EVERY 60 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'EngProcessControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDSystemVarsControl ON SCHEDULE EVERY 600 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'SystemVarsControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDTempDataControl ON SCHEDULE EVERY 1800 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'TempDataControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDErrorControl ON SCHEDULE EVERY 60 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'ErrorControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDTempTableErrorControl ON SCHEDULE EVERY 300 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'TempTableErrorControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDClicksInfoControl ON SCHEDULE EVERY 180 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'ClicksInfoControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDLogControl ON SCHEDULE EVERY 7200 SECOND DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'LogControl\');
	END;		
';
$sql[]='
	CREATE EVENT EDOptimizeFast ON SCHEDULE EVERY 12 HOUR DO BEGIN
		/*{"product":"Binom 1.13","version":"1.0","date":"11.03.2019"}*/
		CALL EngineDiagnostics(\'OptimizeFast\');
	END;		
';

//отложенный пересчёт метрик
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
DROP EVENT IF EXISTS `recountTotalClicks`;
CREATE EVENT `recountTotalClicks` ON SCHEDULE EVERY 24 HOUR STARTS '2021-01-01 05:00:00.000000' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN ".'
	/*{"product":"Binom 1.16","version":"1.0","date":"23.11.2021"}*/'."
	TRUNCATE TABLE clicks_count;
	CALL recount_ts_clicks(); 
	DELETE FROM `clicks_count` WHERE `type` = 'ts' AND `type_id`=0;
	CALL recount_total_clicks();  
END;
";
/* // судя по всему, боле не пользуемые эвенты
$sql[]="
CREATE EVENT report_event ON SCHEDULE EVERY 5 SECOND DO BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.0\",\"date\":\"15.10.2018\"}*./
	DECLARE start_click_id, last_click_id, var_cnt, var_limiter, var_is_reload_count INT;
	DO SLEEP(FLOOR(100 + RAND() * (0 - 100))/1000);
	SET var_limiter=1000;
	SET var_cnt = 1;
	IF((SELECT COUNT(*) FROM engine_process_instant WHERE `type` = 2)=0)THEN
		SET start_click_id = (SELECT int_var FROM engine_process WHERE `type` = 2 ORDER BY id DESC LIMIT 1);
		IF(start_click_id IS NULL)THEN
			SET start_click_id = 0;
		END IF;
		SET last_click_id = (SELECT id FROM clicks ORDER BY id DESC LIMIT 1);
		SET var_is_reload_count = (SELECT COUNT(*) FROM temp_table WHERE `is_reload`=1);
		IF((last_click_id>start_click_id OR var_is_reload_count>0) AND last_click_id IS NOT NULL AND last_click_id!=0 AND (start_click_id!=last_click_id OR (SELECT COUNT(*) FROM temp_table WHERE `is_reload` = 1)>0))THEN
			SET var_cnt = (SELECT IF(test2.s IS NULL,1,IF(test2.S<1,1,(IF(test2.S>var_limiter,var_limiter,test2.S)))) AS S FROM (SELECT AVG(test.C / test.T) AS S FROM (SELECT IF((end_date - start_date)=0,0.5,(end_date - start_date)) AS T, cnt AS C FROM engine_process WHERE end_date!=0 AND `type` = 2 AND cnt != 0 ORDER BY id DESC LIMIT 5) AS test) AS test2);
			SET var_cnt = var_cnt * 4.07;
			IF((last_click_id - start_click_id)>var_cnt)THEN
				SET last_click_id = start_click_id+var_cnt;
			END IF;
			CALL report_load(start_click_id, last_click_id, 0);
		END IF;
	END IF;
END;
";

$sql[]="
CREATE EVENT CorrectionDataHandlerEvent ON SCHEDULE EVERY 5 SECOND DO BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.0\",\"date\":\"15.10.2018\"}*./
	DECLARE start_click_id, last_click_id, var_cnt, var_limiter, tmp_count INT;
	DO SLEEP(FLOOR(100 + RAND() * (0 - 100))/1000);
	SET var_limiter=3500;
	SET var_cnt = 1;
	IF((SELECT COUNT(*) FROM engine_process_instant WHERE `type` = 3)=0)THEN
		SET var_cnt = 1;
		SET start_click_id = (SELECT id FROM temp_table WHERE `is_reload`=0 ORDER BY id ASC LIMIT 1);
		SET last_click_id = (SELECT id FROM temp_table WHERE `is_reload`=0 ORDER BY id DESC LIMIT 1);
		IF(last_click_id IS NOT NULL)THEN
			SET var_cnt = (SELECT IF(test2.s IS NULL,1,IF(test2.S<1,1,(IF(test2.S>var_limiter,var_limiter,test2.S)))) AS S FROM (SELECT AVG(test.C / test.T) AS S FROM (SELECT IF((end_date - start_date)=0,0.25,(end_date - start_date)) AS T, cnt AS C FROM engine_process WHERE end_date!=0 AND `type` = 3 AND cnt != 0 ORDER BY id DESC LIMIT 5) AS test) AS test2);
			SET var_cnt=var_cnt*4.3;
			IF((last_click_id-start_click_id)>var_cnt)THEN
				SET tmp_count = (SELECT COUNT(*) FROM temp_table);
				IF(var_cnt<tmp_count)THEN
					SET @temp_sql=CONCAT('SELECT id INTO @last_id FROM temp_table WHERE `is_reload`=0 ORDER BY id ASC LIMIT ',var_cnt,', 1');
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
					SET last_click_id = @last_id;
				END IF;
			END IF;
			DROP TABLE IF EXISTS temp_update_data;
			CALL CorrectionDataHandler(start_click_id, last_click_id);
		END IF;
	END IF;
END;
";

$sql[]="
CREATE EVENT save_clicks_event ON SCHEDULE EVERY 2 SECOND DO BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.2\",\"date\":\"15.10.2018\"}*./
	DECLARE var_count INT DEFAULT 0;
	DECLARE time_client DATETIME;
	CALL time_convert(NOW(),time_client);
	DO SLEEP(FLOOR(100 + RAND() * (0 - 100))/1000);
	SET var_count = (SELECT COUNT(id) FROM temp_clicks);
	IF (var_count > 1500) THEN
		SET var_count=1500;
	END IF;
	IF((SELECT COUNT(*) FROM engine_process_instant WHERE `type` = 1)=0 AND var_count>0)THEN
		IF (var_count > 100) THEN
			CALL save_clicks(var_count);
		ELSE
			IF ((UNIX_TIMESTAMP(time_client) - (SELECT click_time FROM temp_clicks ORDER BY click_time ASC LIMIT 0, 1))>15) THEN
				CALL save_clicks(var_count);
			END IF;
		END IF;
	END IF;
END;
"; //*/
