<?php
$sql[]="
CREATE PROCEDURE correctorReport (IN start_id INT, IN last_id INT, IN thisThread INT) correctorReport: BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"114004\",\"date\":\"12.03.2020\"}*/
	DECLARE var_timeout INT DEFAULT 45;
	DECLARE log_id,sql_errors,start_time INT DEFAULT 0;
	DECLARE flag TINYINT(1) DEFAULT 0;
	DECLARE
		var_temp_id, var_click_id
	INT DEFAULT 0;
	DECLARE
		var_temp_type,
		var_camp_id, var_click_time, 
		var_click_is_bot, var_click_is_landing,
		var_click_is_unique_camp, var_click_is_unique,
		var_rc, var_rc_ip, var_rc_t,
		var_temp_cvr_id, var_click_cvr_id,
		var_temp_offer_click, var_click_offer_click,
		var_temp_offer, var_click_offer,
		var_temp_offer_type, var_click_offer_type
	INT DEFAULT 0;
	DECLARE
		var_temp_pay, var_click_pay,
		var_temp_cpc, var_click_cpc,		
		var_temp_event_val_1, var_click_event_val_1,			
		var_temp_event_val_2, var_click_event_val_2,			
		var_temp_event_val_3, var_click_event_val_3,
		var_temp_event_val_4, var_click_event_val_4,
		var_temp_event_val_5, var_click_event_val_5,	
		var_temp_event_val_6, var_click_event_val_6,	
		var_temp_event_val_7, var_click_event_val_7,		
		var_temp_event_val_8, var_click_event_val_8,			
		var_temp_event_val_9, var_click_event_val_9,
		var_temp_event_val_10, var_click_event_val_10
	DECIMAL(18,8) DEFAULT 0;
	DECLARE cursor_temp_table CURSOR FOR
		SELECT 
			temp_id,temp_type,click_id,camp_id,click_time,click_is_bot,
			click_is_landing,click_is_unique_camp,click_is_unique,
			rc,rc_ip,rc_t,temp_cvr_id,click_cvr_id,temp_pay,click_pay,
			temp_offer_click,click_offer_click,temp_cpc,click_cpc,
			temp_offer,click_offer,temp_offer_type,click_offer_type,	
			temp_event_val_1,click_event_val_1,temp_event_val_2,
			click_event_val_2,temp_event_val_3,click_event_val_3,
			temp_event_val_4,click_event_val_4,temp_event_val_5,
			click_event_val_5,temp_event_val_6,click_event_val_6,	
			temp_event_val_7,click_event_val_7,temp_event_val_8,
			click_event_val_8,temp_event_val_9,click_event_val_9,
			temp_event_val_10,click_event_val_10
		FROM temp_update_data ORDER BY temp_type ASC;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	/*-----------------*/
		DECLARE CONTINUE HANDLER FOR 1146 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P31E','Table doesn`t exist');
		END;
		DECLARE EXIT HANDLER FOR 1213 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P32E','Deadlock #1213');
			UPDATE temp_table SET in_progress=0, thread=0 WHERE is_reload=0 AND thread=thisThread AND in_progress!=0;
			DO SLEEP(5); CALL correctorReport (start_id, last_id, thisThread);
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P32Fix','Deadlock #1213 FIX');
		END;
		DECLARE EXIT HANDLER FOR 1614 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P33E','Deadlock #1614');
			UPDATE temp_table SET in_progress=0, thread=0 WHERE is_reload=0 AND thread=thisThread AND in_progress!=0;
			DO SLEEP(5);CALL correctorReport (start_id, last_id, thisThread);
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P33Fix','Deadlock #1614 FIX');
		END;
		DECLARE CONTINUE HANDLER FOR 1048 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P34E','Column cannot be NULL');
		END;
		DECLARE CONTINUE HANDLER FOR 1050 BEGIN
			SET sql_errors=1;	
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P35E','Table already exists');
		END;
		DECLARE EXIT HANDLER FOR 1064 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P36E','Var is NULL');
			UPDATE temp_table SET in_progress=0, thread=0 WHERE is_reload=0 AND thread=thisThread AND in_progress!=0;
			DO SLEEP(5);
			CALL correctorReport (start_id, last_id, thisThread);
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P36Fix','Var is NULL FIX');
		END;
		DECLARE CONTINUE HANDLER FOR 1062 BEGIN
		    SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text,error_date ) VALUES (3,'#P38E','Dupl.Row', NOW());
	    END;
		DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN
			IF(sql_errors=0)THEN
				SET sql_errors=1;
				INSERT INTO engine_errors(`type`, error_name, error_text, error_date) VALUES (3,'#P37E','Unknown error', NOW());
			END IF;
		END;
	/*-----------------*/
	SET start_time=UNIX_TIMESTAMP();
		UPDATE engine_process SET end_date = UNIX_TIMESTAMP() WHERE type = 4 AND end_date = 0 AND int_var<=last_id;
		CREATE TEMPORARY TABLE temp_update_data 
			SELECT
				temp.id AS temp_id,
				temp.`type` AS temp_type,
				clicks.id AS click_id,
				clicks.offer AS offer_id,
				clicks.offer_type AS offer_type,
				clicks.landing_page AS landing_id,
				clicks.an AS network_id,
				clicks.ts_id AS ts_id,
				clicks.dop_int_2 AS rotation_id,
				clicks.camp_id AS camp_id,
				clicks.click_time AS click_time,
				clicks.is_bot AS click_is_bot,
				IF(clicks.landing_page!=0,1,0) AS click_is_landing,
				IF(clicks.dop_int_3=1 OR clicks.dop_int_3=2,1,0) AS click_is_unique_camp,
				IF(clicks.dop_int_3=1,1,0) AS click_is_unique,
				clicks_map.rc,
				clicks_map.rc_ip,
				clicks_map.rc_t,
				IF(`type`=1,temp.value_int,NULL) AS temp_cvr_id,
				IF(`type`=1 OR `type`=5,clicks.cvr_id,NULL) AS click_cvr_id,
				IF(`type`=1,temp.value_decimal,NULL) AS temp_pay,
				IF(`type`=1 OR `type`=5,clicks.pay,NULL) AS click_pay,
				IF(`type`=2,temp.value_int,NULL) AS temp_offer_click,
				IF(`type`=2 OR `type`=5,clicks.offer_click,NULL) AS click_offer_click,
				IF(`type`=3,temp.value_decimal,NULL) AS temp_cpc,
				IF(`type`=3 OR `type`=5,clicks.cpc,NULL) AS click_cpc,
				IF(`type`=5,temp.value_int,NULL) AS temp_offer,
				IF(`type`=5 OR `type`=5,clicks.offer,NULL) AS click_offer,
				IF(`type`=5,temp.value_decimal,NULL) AS temp_offer_type,
				IF(`type`=5 OR `type`=5,clicks.offer_type,NULL) AS click_offer_type,	
				IF(`type`>40 AND temp.value_int = 1,temp.value_decimal,NULL) AS temp_event_val_1,
				IF((`type`>40 AND temp.value_int = 1) OR `type`=5,clicks_events.event_val_1,NULL) AS click_event_val_1,			
				IF(`type`>40 AND temp.value_int = 2,temp.value_decimal,NULL) AS temp_event_val_2,
				IF((`type`>40 AND temp.value_int = 2) OR `type`=5,clicks_events.event_val_2,NULL) AS click_event_val_2,			
				IF(`type`>40 AND temp.value_int = 3,temp.value_decimal,NULL) AS temp_event_val_3,
				IF((`type`>40 AND temp.value_int = 3) OR `type`=5,clicks_events.event_val_3,NULL) AS click_event_val_3,
				IF(`type`>40 AND temp.value_int = 4,temp.value_decimal,NULL) AS temp_event_val_4,
				IF((`type`>40 AND temp.value_int = 4) OR `type`=5,clicks_events.event_val_4,NULL) AS click_event_val_4,
				IF(`type`>40 AND temp.value_int = 5,temp.value_decimal,NULL) AS temp_event_val_5,
				IF((`type`>40 AND temp.value_int = 5) OR `type`=5,clicks_events.event_val_5,NULL) AS click_event_val_5,	
				IF(`type`>40 AND temp.value_int = 6,temp.value_decimal,NULL) AS temp_event_val_6,
				IF((`type`>40 AND temp.value_int = 6) OR `type`=5,clicks_events.event_val_6,NULL) AS click_event_val_6,	
				IF(`type`>40 AND temp.value_int = 7,temp.value_decimal,NULL) AS temp_event_val_7,
				IF((`type`>40 AND temp.value_int = 7) OR `type`=5,clicks_events.event_val_7,NULL) AS click_event_val_7,		
				IF(`type`>40 AND temp.value_int = 8,temp.value_decimal,NULL) AS temp_event_val_8,
				IF((`type`>40 AND temp.value_int = 8) OR `type`=5,clicks_events.event_val_8,NULL) AS click_event_val_8,			
				IF(`type`>40 AND temp.value_int = 9,temp.value_decimal,NULL) AS temp_event_val_9,
				IF((`type`>40 AND temp.value_int = 9) OR `type`=5,clicks_events.event_val_9,NULL) AS click_event_val_9,
				IF(`type`>40 AND temp.value_int = 10,temp.value_decimal,NULL) AS temp_event_val_10,
				IF((`type`>40 AND temp.value_int = 10) OR `type`=5,clicks_events.event_val_10,NULL) AS click_event_val_10
			FROM 
				temp_table AS temp
				LEFT JOIN clicks_map ON clicks_map.click_id = temp.click_id
				LEFT JOIN clicks ON clicks.id = temp.click_id
				LEFT JOIN clicks_events ON (temp.`type`>40 OR temp.`type`=5) AND clicks_events.click_id = temp.click_id
			WHERE
				in_progress = 1 AND
				`thread` = thisThread AND
				is_reload = 0 AND
				clicks_map.rc IS NOT NULL AND 
				clicks_map.rc_ip IS NOT NULL AND 
				clicks_map.rc_t IS NOT NULL AND
				(IF(
					(
						temp.`type`=5 AND
						(SELECT COUNT(*) FROM temp_table WHERE in_progress = 1 AND click_id = temp.click_id AND id!=temp.id)>0
					),0,1
				))=1
			ORDER BY temp.`type` ASC;
		IF((unix_timestamp()-start_time)>var_timeout AND sql_errors=0)THEN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P38E','Timeout. Set lowspeed');
			CALL engine_proc_controller(3,'lowspeed');
		END IF;
		CREATE TEMPORARY TABLE temp_update_data_clicks
			SELECT 
				click_id,
				MAX(temp_cvr_id) AS temp_cvr_id,
				MAX(temp_pay) AS temp_pay,
				MAX(temp_offer_click) AS temp_offer_click,
				MAX(temp_cpc) AS temp_cpc,
				MAX(temp_offer) AS temp_offer,
				MAX(temp_offer_type) AS temp_offer_type
			FROM temp_update_data WHERE temp_type<40 GROUP BY click_id;
		UPDATE 
			clicks
			INNER JOIN
			temp_update_data_clicks ON temp_update_data_clicks.click_id = clicks.id
		SET 
			clicks.cvr_id = IF(
				temp_update_data_clicks.temp_cvr_id IS NOT NULL, temp_update_data_clicks.temp_cvr_id, clicks.cvr_id
			),
			clicks.pay = IF(
				temp_update_data_clicks.temp_pay IS NOT NULL, temp_update_data_clicks.temp_pay, clicks.pay
			),
			clicks.offer_click = IF(
				temp_update_data_clicks.temp_offer_click IS NOT NULL, temp_update_data_clicks.temp_offer_click, clicks.offer_click
			),
			clicks.cpc = IF(
				temp_update_data_clicks.temp_cpc IS NOT NULL, temp_update_data_clicks.temp_cpc, clicks.cpc
			),
			clicks.offer = IF(
				temp_update_data_clicks.temp_offer IS NOT NULL, temp_update_data_clicks.temp_offer, clicks.offer
			),
			clicks.offer_type = IF(
				temp_update_data_clicks.temp_offer_type IS NOT NULL, temp_update_data_clicks.temp_offer_type, clicks.offer_type
			),
			clicks.an = IF(
				temp_update_data_clicks.temp_offer IS NOT NULL AND temp_update_data_clicks.temp_offer_type IS NOT NULL,
				IF(
					temp_update_data_clicks.temp_offer_type=3,
					(SELECT network FROM offers WHERE id = temp_update_data_clicks.temp_offer),
					0
				),
				clicks.an
			);
		INSERT INTO clicks_events(
			click_id, 
			camp_id,
			event_val_1, 
			event_val_2, 
			event_val_3, 
			event_val_4, 
			event_val_5, 
			event_val_6, 
			event_val_7, 
			event_val_8, 
			event_val_9, 
			event_val_10
		) SELECT
			click_id,
			camp_id,
			IF(temp_event_val_1 IS NULL,0,temp_event_val_1),
			IF(temp_event_val_2 IS NULL,0,temp_event_val_2),
			IF(temp_event_val_3 IS NULL,0,temp_event_val_3),
			IF(temp_event_val_4 IS NULL,0,temp_event_val_4),
			IF(temp_event_val_5 IS NULL,0,temp_event_val_5),
			IF(temp_event_val_6 IS NULL,0,temp_event_val_6),
			IF(temp_event_val_7 IS NULL,0,temp_event_val_7),
			IF(temp_event_val_8 IS NULL,0,temp_event_val_8),
			IF(temp_event_val_9 IS NULL,0,temp_event_val_9),
			IF(temp_event_val_10 IS NULL,0,temp_event_val_10)
		FROM
			temp_update_data
		WHERE temp_type >40 ORDER BY temp_id ASC
		ON DUPLICATE KEY UPDATE
			event_val_1=IF(temp_event_val_1 IS NULL,event_val_1,temp_event_val_1),
			event_val_2=IF(temp_event_val_2 IS NULL,event_val_2,temp_event_val_2),
			event_val_3=IF(temp_event_val_3 IS NULL,event_val_3,temp_event_val_3),
			event_val_4=IF(temp_event_val_4 IS NULL,event_val_4,temp_event_val_4),
			event_val_5=IF(temp_event_val_5 IS NULL,event_val_5,temp_event_val_5),
			event_val_6=IF(temp_event_val_6 IS NULL,event_val_6,temp_event_val_6),
			event_val_7=IF(temp_event_val_7 IS NULL,event_val_7,temp_event_val_7),
			event_val_8=IF(temp_event_val_8 IS NULL,event_val_8,temp_event_val_8),
			event_val_9=IF(temp_event_val_9 IS NULL,event_val_9,temp_event_val_9),
			event_val_10=IF(temp_event_val_10 IS NULL,event_val_10,temp_event_val_10);
		OPEN cursor_temp_table;
			REPEAT
				FETCH cursor_temp_table INTO 
					var_temp_id, var_temp_type, var_click_id,
					var_camp_id, var_click_time,
					var_click_is_bot, var_click_is_landing,
					var_click_is_unique_camp, var_click_is_unique,
					var_rc, var_rc_ip, var_rc_t,
					var_temp_cvr_id, var_click_cvr_id,
					var_temp_pay, var_click_pay,
					var_temp_offer_click, var_click_offer_click,
					var_temp_cpc, var_click_cpc,
					var_temp_offer, var_click_offer,
					var_temp_offer_type, var_click_offer_type,			
					var_temp_event_val_1, var_click_event_val_1,			
					var_temp_event_val_2, var_click_event_val_2,			
					var_temp_event_val_3, var_click_event_val_3,
					var_temp_event_val_4, var_click_event_val_4,
					var_temp_event_val_5, var_click_event_val_5,	
					var_temp_event_val_6, var_click_event_val_6,	
					var_temp_event_val_7, var_click_event_val_7,		
					var_temp_event_val_8, var_click_event_val_8,			
					var_temp_event_val_9, var_click_event_val_9,
					var_temp_event_val_10, var_click_event_val_10;
				IF NOT flag THEN
					IF((unix_timestamp()-start_time)>var_timeout AND sql_errors=0)THEN
						SET sql_errors=1;
						INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (
							3,'#P39E','Timeout. Set lowspeed');
						CALL engine_proc_controller(3,'lowspeed');
					END IF;
					IF(var_temp_type=5)THEN
						SET var_temp_cvr_id = 0;
						SET var_temp_pay = 0;
						SET var_temp_offer_click = 0;
						SET var_temp_cpc = 0;
						SET var_temp_offer = 0;
						SET var_temp_offer_type = 0;
						SET var_temp_event_val_1 = 0;	
						SET var_temp_event_val_2 = 0;
						SET var_temp_event_val_3 = 0;
						SET var_temp_event_val_4 = 0;
						SET var_temp_event_val_5 = 0;
						SET var_temp_event_val_6 = 0;
						SET var_temp_event_val_7 = 0;
						SET var_temp_event_val_8 = 0;
						SET var_temp_event_val_9 = 0;
						SET var_temp_event_val_10 = 0;
					END IF;
					IF(var_rc!=0)THEN
						SET @temp_sql=CONCAT('
							UPDATE
								',CONCAT('report_camp_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y')),'
							SET
								clicks_offer = @check_update := clicks_offer - ',(IFNULL(var_click_offer_click,0)),' + ',(IFNULL(var_temp_offer_click,0)),',
								leads = leads - ',IF(var_click_cvr_id IS NULL OR var_click_cvr_id=0,0,1),' + ',IF(var_temp_cvr_id IS NULL OR var_temp_cvr_id=0,0,1),',
								spend = spend - ',(IFNULL(var_click_cpc,0)),' + ',(IFNULL(var_temp_cpc,0)),',
								pay = pay - ',(IFNULL(var_click_pay,0)),' + ',(IFNULL(var_temp_pay,0)),',
								event_1 = event_1 - ',(IFNULL(var_click_event_val_1,0)),' + ',(IFNULL(var_temp_event_val_1,0)),',
								event_2 = event_2 - ',(IFNULL(var_click_event_val_2,0)),' + ',(IFNULL(var_temp_event_val_2,0)),',
								event_3 = event_3 - ',(IFNULL(var_click_event_val_3,0)),' + ',(IFNULL(var_temp_event_val_3,0)),',
								event_4 = event_4 - ',(IFNULL(var_click_event_val_4,0)),' + ',(IFNULL(var_temp_event_val_4,0)),',
								event_5 = event_5 - ',(IFNULL(var_click_event_val_5,0)),' + ',(IFNULL(var_temp_event_val_5,0)),',
								event_6 = event_6 - ',(IFNULL(var_click_event_val_6,0)),' + ',(IFNULL(var_temp_event_val_6,0)),',
								event_7 = event_7 - ',(IFNULL(var_click_event_val_7,0)),' + ',(IFNULL(var_temp_event_val_7,0)),',
								event_8 = event_8 - ',(IFNULL(var_click_event_val_8,0)),' + ',(IFNULL(var_temp_event_val_8,0)),',
								event_9 = event_9 - ',(IFNULL(var_click_event_val_9,0)),' + ',(IFNULL(var_temp_event_val_9,0)),',
								event_10 = event_10 - ',(IFNULL(var_click_event_val_10,0)),' + ',(IFNULL(var_temp_event_val_10,0)),',
								clicks = clicks - ',IF(var_temp_type=5,1,0),',
								bots = bots - ',IF(var_temp_type=5,var_click_is_bot,0),',
								clicks_landing = clicks_landing - ',IF(var_temp_type=5,var_click_is_landing,0),',
								unique_camp = unique_camp - ',IF(var_temp_type=5,var_click_is_unique_camp,0),',
								`unique` = `unique` - ',IF(var_temp_type=5,var_click_is_unique,0),'
							WHERE id = ',var_rc,';
						');
						PREPARE update_report FROM @temp_sql;
						EXECUTE update_report;
						DEALLOCATE PREPARE update_report;
						IF(@check_update IS NULL)THEN
							INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P310E','Row doesn`t exist');
						ELSE
							SET @check_update = NULL;
						END IF;
					END IF;
					IF(var_rc_ip!=0)THEN
						SET @temp_sql=CONCAT('
							UPDATE
								',CONCAT('report_camp_ip_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y')),'
							SET
								clicks_offer = @check_update := clicks_offer - ',(IFNULL(var_click_offer_click,0)),' + ',(IFNULL(var_temp_offer_click,0)),',
								leads = leads - ',IF(var_click_cvr_id IS NULL OR var_click_cvr_id=0,0,1),' + ',IF(var_temp_cvr_id IS NULL OR var_temp_cvr_id=0,0,1),',
								spend = spend - ',(IFNULL(var_click_cpc,0)),' + ',(IFNULL(var_temp_cpc,0)),',
								pay = pay - ',(IFNULL(var_click_pay,0)),' + ',(IFNULL(var_temp_pay,0)),',
								event_1 = event_1 - ',(IFNULL(var_click_event_val_1,0)),' + ',(IFNULL(var_temp_event_val_1,0)),',
								event_2 = event_2 - ',(IFNULL(var_click_event_val_2,0)),' + ',(IFNULL(var_temp_event_val_2,0)),',
								event_3 = event_3 - ',(IFNULL(var_click_event_val_3,0)),' + ',(IFNULL(var_temp_event_val_3,0)),',
								event_4 = event_4 - ',(IFNULL(var_click_event_val_4,0)),' + ',(IFNULL(var_temp_event_val_4,0)),',
								event_5 = event_5 - ',(IFNULL(var_click_event_val_5,0)),' + ',(IFNULL(var_temp_event_val_5,0)),',
								event_6 = event_6 - ',(IFNULL(var_click_event_val_6,0)),' + ',(IFNULL(var_temp_event_val_6,0)),',
								event_7 = event_7 - ',(IFNULL(var_click_event_val_7,0)),' + ',(IFNULL(var_temp_event_val_7,0)),',
								event_8 = event_8 - ',(IFNULL(var_click_event_val_8,0)),' + ',(IFNULL(var_temp_event_val_8,0)),',
								event_9 = event_9 - ',(IFNULL(var_click_event_val_9,0)),' + ',(IFNULL(var_temp_event_val_9,0)),',
								event_10 = event_10 - ',(IFNULL(var_click_event_val_10,0)),' + ',(IFNULL(var_temp_event_val_10,0)),',
								clicks = clicks - ',IF(var_temp_type=5,1,0),',
								bots = bots - ',IF(var_temp_type=5,var_click_is_bot,0),',
								clicks_landing = clicks_landing - ',IF(var_temp_type=5,var_click_is_landing,0),',
								unique_camp = unique_camp - ',IF(var_temp_type=5,var_click_is_unique_camp,0),',
								`unique` = `unique` - ',IF(var_temp_type=5,var_click_is_unique,0),'
							WHERE id = ',var_rc_ip,';
						');
						PREPARE update_report FROM @temp_sql;
						EXECUTE update_report;
						DEALLOCATE PREPARE update_report;
						IF(@check_update IS NULL)THEN
							INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P310E','Row doesn`t exist');
						ELSE
							SET @check_update = NULL;
						END IF;
					END IF;
					IF(var_rc_t!=0)THEN
						SET @temp_sql=CONCAT('
							UPDATE
								',CONCAT('report_camp_token_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y')),'
							SET
								clicks_offer = @check_update := clicks_offer - ',(IFNULL(var_click_offer_click,0)),' + ',(IFNULL(var_temp_offer_click,0)),',
								leads = leads - ',IF(var_click_cvr_id IS NULL OR var_click_cvr_id=0,0,1),' + ',IF(var_temp_cvr_id IS NULL OR var_temp_cvr_id=0,0,1),',
								spend = spend - ',(IFNULL(var_click_cpc,0)),' + ',(IFNULL(var_temp_cpc,0)),',
								pay = pay - ',(IFNULL(var_click_pay,0)),' + ',(IFNULL(var_temp_pay,0)),',
								event_1 = event_1 - ',(IFNULL(var_click_event_val_1,0)),' + ',(IFNULL(var_temp_event_val_1,0)),',
								event_2 = event_2 - ',(IFNULL(var_click_event_val_2,0)),' + ',(IFNULL(var_temp_event_val_2,0)),',
								event_3 = event_3 - ',(IFNULL(var_click_event_val_3,0)),' + ',(IFNULL(var_temp_event_val_3,0)),',
								event_4 = event_4 - ',(IFNULL(var_click_event_val_4,0)),' + ',(IFNULL(var_temp_event_val_4,0)),',
								event_5 = event_5 - ',(IFNULL(var_click_event_val_5,0)),' + ',(IFNULL(var_temp_event_val_5,0)),',
								event_6 = event_6 - ',(IFNULL(var_click_event_val_6,0)),' + ',(IFNULL(var_temp_event_val_6,0)),',
								event_7 = event_7 - ',(IFNULL(var_click_event_val_7,0)),' + ',(IFNULL(var_temp_event_val_7,0)),',
								event_8 = event_8 - ',(IFNULL(var_click_event_val_8,0)),' + ',(IFNULL(var_temp_event_val_8,0)),',
								event_9 = event_9 - ',(IFNULL(var_click_event_val_9,0)),' + ',(IFNULL(var_temp_event_val_9,0)),',
								event_10 = event_10 - ',(IFNULL(var_click_event_val_10,0)),' + ',(IFNULL(var_temp_event_val_10,0)),',
								clicks = clicks - ',IF(var_temp_type=5,1,0),',
								bots = bots - ',IF(var_temp_type=5,var_click_is_bot,0),',
								clicks_landing = clicks_landing - ',IF(var_temp_type=5,var_click_is_landing,0),',
								unique_camp = unique_camp - ',IF(var_temp_type=5,var_click_is_unique_camp,0),',
								`unique` = `unique` - ',IF(var_temp_type=5,var_click_is_unique,0),'
							WHERE id = ',var_rc_t,';
						');
						PREPARE update_report FROM @temp_sql;
						EXECUTE update_report;
						DEALLOCATE PREPARE update_report;
						IF(@check_update IS NULL)THEN
							INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (3,'#P310E','Row doesn`t exist');
						ELSE
							SET @check_update = NULL;
						END IF;
					END IF;
					IF(var_temp_type=5)THEN
						UPDATE temp_table SET is_reload = 1, in_progress=0, `thread` = 0 WHERE id = var_temp_id; 
					END IF;
					DELETE FROM temp_table WHERE id = var_temp_id AND is_reload = 0;
				END IF;
			UNTIL flag END REPEAT;
		CLOSE cursor_temp_table;
		call CorrectionDataHandlerShowcase();
		UPDATE temp_table SET in_progress = 0, `thread` = 0 WHERE in_progress = 1 AND `thread` = thisThread;
END;
";

$sql[]="
CREATE PROCEDURE CorrectionDataHandler (IN start_id INT, IN last_id INT) CorrectionDataHandler: BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.0\",\"date\":\"15.10.2018\"}*/
	DECLARE var_timeout INT DEFAULT 45;
	DECLARE var_limit,log_id,sql_errors,start_time INT DEFAULT 0;
	DECLARE flag TINYINT(1) DEFAULT 0;
	DECLARE
		var_temp_id, var_temp_type, var_click_id,
		var_camp_id, var_click_time,
		var_click_is_bot, var_click_is_landing,
		var_click_is_unique_camp, var_click_is_unique,
		var_rc, var_rc_ip, var_rc_t,
		var_temp_cvr_id, var_click_cvr_id,
		var_temp_offer_click, var_click_offer_click,
		var_temp_offer, var_click_offer,
		var_temp_offer_type, var_click_offer_type
	INT DEFAULT 0;
	DECLARE
		var_temp_pay, var_click_pay,
		var_temp_cpc, var_click_cpc,
		var_temp_event_val_1, var_click_event_val_1,
		var_temp_event_val_2, var_click_event_val_2,
		var_temp_event_val_3, var_click_event_val_3,
		var_temp_event_val_4, var_click_event_val_4,
		var_temp_event_val_5, var_click_event_val_5,
		var_temp_event_val_6, var_click_event_val_6,
		var_temp_event_val_7, var_click_event_val_7,
		var_temp_event_val_8, var_click_event_val_8,
		var_temp_event_val_9, var_click_event_val_9,
		var_temp_event_val_10, var_click_event_val_10
	DECIMAL(15,5) DEFAULT 0;
	DECLARE cursor_temp_table CURSOR FOR
		SELECT
			temp_id,temp_type,click_id,camp_id,click_time,click_is_bot,
			click_is_landing,click_is_unique_camp,click_is_unique,
			rc,rc_ip,rc_t,temp_cvr_id,click_cvr_id,temp_pay,click_pay,
			temp_offer_click,click_offer_click,temp_cpc,click_cpc,
			temp_offer,click_offer,temp_offer_type,click_offer_type,
			temp_event_val_1,click_event_val_1,temp_event_val_2,
			click_event_val_2,temp_event_val_3,click_event_val_3,
			temp_event_val_4,click_event_val_4,temp_event_val_5,
			click_event_val_5,temp_event_val_6,click_event_val_6,
			temp_event_val_7,click_event_val_7,temp_event_val_8,
			click_event_val_8,temp_event_val_9,click_event_val_9,
			temp_event_val_10,click_event_val_10
		FROM temp_update_data ORDER BY temp_type ASC;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	/*-----------------*/
		DECLARE CONTINUE HANDLER FOR 1146 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P31E',
				'Table doesn`t exist (continue)'
			);
		END;
		DECLARE EXIT HANDLER FOR 1213 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P32E',
				'Deadlock #1213 (restart)'
			);
			CALL engine_proc_controller(3,'restart');
		END;
		DECLARE EXIT HANDLER FOR 1614 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P33E',
				'Deadlock #1614 (restart)'
			);
			CALL engine_proc_controller(3,'restart');
		END;
		DECLARE CONTINUE HANDLER FOR 1048 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P34E',
				'Column cannot be NULL (continue)'
			);
		END;
		DECLARE CONTINUE HANDLER FOR 1050 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P35E',
				'Table already exists (continue)'
			);
		END;
		DECLARE EXIT HANDLER FOR 1064 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P36E',
				'Var is NULL (restart)');
			CALL engine_proc_controller(3,'restart');
		END;
		DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN
			IF(sql_errors=0)THEN
				SET sql_errors=1;
				INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
					'#P37E',
					'Unknown error'
				);
			END IF;
			SET sql_errors=1;
		END;
	/*-----------------*/
	SET start_time=UNIX_TIMESTAMP();
	DO SLEEP(FLOOR(1000 + RAND() * (250 - 1000))/1000);
	IF((SELECT COUNT(*) FROM engine_process_instant WHERE `type` = 3 AND proc_id!=0)=0)THEN
		UPDATE engine_process SET end_date = UNIX_TIMESTAMP() WHERE type = 4 AND end_date = 0 AND int_var<=last_id;
		SET var_limit = (SELECT MAX(int_var) FROM engine_process WHERE end_date!=0 AND `type`=2);
		INSERT INTO engine_process(`type`, start_date, int_var, cnt) VALUES (3,UNIX_TIMESTAMP(),0, (SELECT COUNT(*) FROM temp_table WHERE id >= start_id AND id <= last_id AND click_id <= var_limit AND is_reload = 0));
		SET log_id=(SELECT LAST_INSERT_ID());
		INSERT INTO engine_process_instant(proc_id,`type`) VALUES (log_id,3);
		UPDATE temp_table SET in_progress = 0 WHERE in_progress = 1;
		UPDATE temp_table SET in_progress = 1 WHERE id >= start_id AND id <= last_id AND click_id <= var_limit AND is_reload = 0;
		CREATE TEMPORARY TABLE temp_update_data
			SELECT
				temp.id AS temp_id,
				temp.`type` AS temp_type,
				clicks.id AS click_id,
				clicks.offer AS offer_id,
				clicks.offer_type AS offer_type,
				clicks.landing_page AS landing_id,
				clicks.an AS network_id,
				clicks.ts_id AS ts_id,
				clicks.dop_int_2 AS rotation_id,
				clicks.camp_id AS camp_id,
				clicks.click_time AS click_time,
				clicks.is_bot AS click_is_bot,
				IF(clicks.landing_page!=0,1,0) AS click_is_landing,
				IF(clicks.dop_int_3=1 OR clicks.dop_int_3=2,1,0) AS click_is_unique_camp,
				IF(clicks.dop_int_3=1,1,0) AS click_is_unique,
				clicks_map.rc,
				clicks_map.rc_ip,
				clicks_map.rc_t,
				IF(`type`=1,temp.value_int,NULL) AS temp_cvr_id,
				IF(`type`=1 OR `type`=5,clicks.cvr_id,NULL) AS click_cvr_id,
				IF(`type`=1,temp.value_decimal,NULL) AS temp_pay,
				IF(`type`=1 OR `type`=5,clicks.pay,NULL) AS click_pay,
				IF(`type`=2,temp.value_int,NULL) AS temp_offer_click,
				IF(`type`=2 OR `type`=5,clicks.offer_click,NULL) AS click_offer_click,
				IF(`type`=3,temp.value_decimal,NULL) AS temp_cpc,
				IF(`type`=3 OR `type`=5,clicks.cpc,NULL) AS click_cpc,
				IF(`type`=5,temp.value_int,NULL) AS temp_offer,
				IF(`type`=5 OR `type`=5,clicks.offer,NULL) AS click_offer,
				IF(`type`=5,temp.value_decimal,NULL) AS temp_offer_type,
				IF(`type`=5 OR `type`=5,clicks.offer_type,NULL) AS click_offer_type,
				IF(`type`>40 AND temp.value_int = 1,temp.value_decimal,NULL) AS temp_event_val_1,
				IF((`type`>40 AND temp.value_int = 1) OR `type`=5,clicks_events.event_val_1,NULL) AS click_event_val_1,
				IF(`type`>40 AND temp.value_int = 2,temp.value_decimal,NULL) AS temp_event_val_2,
				IF((`type`>40 AND temp.value_int = 2) OR `type`=5,clicks_events.event_val_2,NULL) AS click_event_val_2,
				IF(`type`>40 AND temp.value_int = 3,temp.value_decimal,NULL) AS temp_event_val_3,
				IF((`type`>40 AND temp.value_int = 3) OR `type`=5,clicks_events.event_val_3,NULL) AS click_event_val_3,
				IF(`type`>40 AND temp.value_int = 4,temp.value_decimal,NULL) AS temp_event_val_4,
				IF((`type`>40 AND temp.value_int = 4) OR `type`=5,clicks_events.event_val_4,NULL) AS click_event_val_4,
				IF(`type`>40 AND temp.value_int = 5,temp.value_decimal,NULL) AS temp_event_val_5,
				IF((`type`>40 AND temp.value_int = 5) OR `type`=5,clicks_events.event_val_5,NULL) AS click_event_val_5,
				IF(`type`>40 AND temp.value_int = 6,temp.value_decimal,NULL) AS temp_event_val_6,
				IF((`type`>40 AND temp.value_int = 6) OR `type`=5,clicks_events.event_val_6,NULL) AS click_event_val_6,
				IF(`type`>40 AND temp.value_int = 7,temp.value_decimal,NULL) AS temp_event_val_7,
				IF((`type`>40 AND temp.value_int = 7) OR `type`=5,clicks_events.event_val_7,NULL) AS click_event_val_7,
				IF(`type`>40 AND temp.value_int = 8,temp.value_decimal,NULL) AS temp_event_val_8,
				IF((`type`>40 AND temp.value_int = 8) OR `type`=5,clicks_events.event_val_8,NULL) AS click_event_val_8,
				IF(`type`>40 AND temp.value_int = 9,temp.value_decimal,NULL) AS temp_event_val_9,
				IF((`type`>40 AND temp.value_int = 9) OR `type`=5,clicks_events.event_val_9,NULL) AS click_event_val_9,
				IF(`type`>40 AND temp.value_int = 10,temp.value_decimal,NULL) AS temp_event_val_10,
				IF((`type`>40 AND temp.value_int = 10) OR `type`=5,clicks_events.event_val_10,NULL) AS click_event_val_10
			FROM
				temp_table AS temp
				LEFT JOIN clicks_map ON clicks_map.click_id = temp.click_id
				LEFT JOIN clicks ON clicks.id = temp.click_id
				LEFT JOIN clicks_events ON (temp.`type`>40 OR temp.`type`=5) AND clicks_events.click_id = temp.click_id
			WHERE
				in_progress = 1 AND
				is_reload = 0 AND
				clicks_map.rc IS NOT NULL AND
				clicks_map.rc_ip IS NOT NULL AND
				clicks_map.rc_t IS NOT NULL AND
				(IF(
					(
						temp.`type`=5 AND
						(SELECT COUNT(*) FROM temp_table WHERE in_progress = 1 AND click_id = temp.click_id AND id!=temp.id)>0
					),0,1
				))=1
			ORDER BY temp.`type` ASC;
		IF((unix_timestamp()-start_time)>var_timeout)THEN
			SET sql_errors=1;
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
				'#P38E',
				'Timeout (restart, lowspeed)'
			);
			CALL engine_proc_controller(3,'lowspeed');
			CALL engine_proc_controller(3,'restart');
			LEAVE CorrectionDataHandler;
		END IF;
		CREATE TEMPORARY TABLE temp_update_data_clicks
			SELECT
				click_id,
				MAX(temp_cvr_id) AS temp_cvr_id,
				MAX(temp_pay) AS temp_pay,
				MAX(temp_offer_click) AS temp_offer_click,
				MAX(temp_cpc) AS temp_cpc,
				MAX(temp_offer) AS temp_offer,
				MAX(temp_offer_type) AS temp_offer_type
			FROM temp_update_data WHERE temp_type<40 GROUP BY click_id;
		UPDATE
			clicks
			INNER JOIN
			temp_update_data_clicks ON temp_update_data_clicks.click_id = clicks.id
		SET
			clicks.cvr_id = IF(
				temp_update_data_clicks.temp_cvr_id IS NOT NULL, temp_update_data_clicks.temp_cvr_id, clicks.cvr_id
			),
			clicks.pay = IF(
				temp_update_data_clicks.temp_pay IS NOT NULL, temp_update_data_clicks.temp_pay, clicks.pay
			),
			clicks.offer_click = IF(
				temp_update_data_clicks.temp_offer_click IS NOT NULL, temp_update_data_clicks.temp_offer_click, clicks.offer_click
			),
			clicks.cpc = IF(
				temp_update_data_clicks.temp_cpc IS NOT NULL, temp_update_data_clicks.temp_cpc, clicks.cpc
			),
			clicks.offer = IF(
				temp_update_data_clicks.temp_offer IS NOT NULL, temp_update_data_clicks.temp_offer, clicks.offer
			),
			clicks.offer_type = IF(
				temp_update_data_clicks.temp_offer_type IS NOT NULL, temp_update_data_clicks.temp_offer_type, clicks.offer_type
			),
			clicks.an = IF(
				temp_update_data_clicks.temp_offer IS NOT NULL AND temp_update_data_clicks.temp_offer_type IS NOT NULL,
				IF(
					temp_update_data_clicks.temp_offer_type=3,
					(SELECT network FROM offers WHERE id = temp_update_data_clicks.temp_offer),
					0
				),
				clicks.an
			);
		INSERT INTO clicks_events(
			click_id,
			camp_id,
			event_val_1,
			event_val_2,
			event_val_3,
			event_val_4,
			event_val_5,
			event_val_6,
			event_val_7,
			event_val_8,
			event_val_9,
			event_val_10
		) SELECT
			click_id,
			camp_id,
			IF(temp_event_val_1 IS NULL,0,temp_event_val_1),
			IF(temp_event_val_2 IS NULL,0,temp_event_val_2),
			IF(temp_event_val_3 IS NULL,0,temp_event_val_3),
			IF(temp_event_val_4 IS NULL,0,temp_event_val_4),
			IF(temp_event_val_5 IS NULL,0,temp_event_val_5),
			IF(temp_event_val_6 IS NULL,0,temp_event_val_6),
			IF(temp_event_val_7 IS NULL,0,temp_event_val_7),
			IF(temp_event_val_8 IS NULL,0,temp_event_val_8),
			IF(temp_event_val_9 IS NULL,0,temp_event_val_9),
			IF(temp_event_val_10 IS NULL,0,temp_event_val_10)
		FROM
			temp_update_data
		WHERE temp_type >40 ORDER BY temp_id ASC
		ON DUPLICATE KEY UPDATE
			event_val_1=IF(temp_event_val_1 IS NULL,event_val_1,temp_event_val_1),
			event_val_2=IF(temp_event_val_2 IS NULL,event_val_2,temp_event_val_2),
			event_val_3=IF(temp_event_val_3 IS NULL,event_val_3,temp_event_val_3),
			event_val_4=IF(temp_event_val_4 IS NULL,event_val_4,temp_event_val_4),
			event_val_5=IF(temp_event_val_5 IS NULL,event_val_5,temp_event_val_5),
			event_val_6=IF(temp_event_val_6 IS NULL,event_val_6,temp_event_val_6),
			event_val_7=IF(temp_event_val_7 IS NULL,event_val_7,temp_event_val_7),
			event_val_8=IF(temp_event_val_8 IS NULL,event_val_8,temp_event_val_8),
			event_val_9=IF(temp_event_val_9 IS NULL,event_val_9,temp_event_val_9),
			event_val_10=IF(temp_event_val_10 IS NULL,event_val_10,temp_event_val_10);
		OPEN cursor_temp_table;
			REPEAT
				FETCH cursor_temp_table INTO
					var_temp_id, var_temp_type, var_click_id,
					var_camp_id, var_click_time,
					var_click_is_bot, var_click_is_landing,
					var_click_is_unique_camp, var_click_is_unique,
					var_rc, var_rc_ip, var_rc_t,
					var_temp_cvr_id, var_click_cvr_id,
					var_temp_pay, var_click_pay,
					var_temp_offer_click, var_click_offer_click,
					var_temp_cpc, var_click_cpc,
					var_temp_offer, var_click_offer,
					var_temp_offer_type, var_click_offer_type,
					var_temp_event_val_1, var_click_event_val_1,
					var_temp_event_val_2, var_click_event_val_2,
					var_temp_event_val_3, var_click_event_val_3,
					var_temp_event_val_4, var_click_event_val_4,
					var_temp_event_val_5, var_click_event_val_5,
					var_temp_event_val_6, var_click_event_val_6,
					var_temp_event_val_7, var_click_event_val_7,
					var_temp_event_val_8, var_click_event_val_8,
					var_temp_event_val_9, var_click_event_val_9,
					var_temp_event_val_10, var_click_event_val_10;
				IF NOT flag THEN
					IF((unix_timestamp()-start_time)>var_timeout)THEN
						SET sql_errors=1;
						INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
							'#P39E',
							'Timeout (restart, lowspeed)'
						);
						CALL engine_proc_controller(3,'lowspeed');
						CALL engine_proc_controller(3,'restart');
						LEAVE CorrectionDataHandler;
					END IF;
					IF(var_temp_type=5)THEN
						SET var_temp_cvr_id = 0;
						SET var_temp_pay = 0;
						SET var_temp_offer_click = 0;
						SET var_temp_cpc = 0;
						SET var_temp_offer = 0;
						SET var_temp_offer_type = 0;
						SET var_temp_event_val_1 = 0;
						SET var_temp_event_val_2 = 0;
						SET var_temp_event_val_3 = 0;
						SET var_temp_event_val_4 = 0;
						SET var_temp_event_val_5 = 0;
						SET var_temp_event_val_6 = 0;
						SET var_temp_event_val_7 = 0;
						SET var_temp_event_val_8 = 0;
						SET var_temp_event_val_9 = 0;
						SET var_temp_event_val_10 = 0;
					END IF;
					IF(var_rc!=0)THEN
						SET @temp_sql=CONCAT('
							UPDATE
								',CONCAT('report_camp_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y')),'
							SET
								clicks_offer = @check_update := clicks_offer - ',(IFNULL(var_click_offer_click,0)),' + ',(IFNULL(var_temp_offer_click,0)),',
								leads = leads - ',IF(var_click_cvr_id IS NULL OR var_click_cvr_id=0,0,1),' + ',IF(var_temp_cvr_id IS NULL OR var_temp_cvr_id=0,0,1),',
								spend = spend - ',(IFNULL(var_click_cpc,0)),' + ',(IFNULL(var_temp_cpc,0)),',
								pay = pay - ',(IFNULL(var_click_pay,0)),' + ',(IFNULL(var_temp_pay,0)),',
								event_1 = event_1 - ',(IFNULL(var_click_event_val_1,0)),' + ',(IFNULL(var_temp_event_val_1,0)),',
								event_2 = event_2 - ',(IFNULL(var_click_event_val_2,0)),' + ',(IFNULL(var_temp_event_val_2,0)),',
								event_3 = event_3 - ',(IFNULL(var_click_event_val_3,0)),' + ',(IFNULL(var_temp_event_val_3,0)),',
								event_4 = event_4 - ',(IFNULL(var_click_event_val_4,0)),' + ',(IFNULL(var_temp_event_val_4,0)),',
								event_5 = event_5 - ',(IFNULL(var_click_event_val_5,0)),' + ',(IFNULL(var_temp_event_val_5,0)),',
								event_6 = event_6 - ',(IFNULL(var_click_event_val_6,0)),' + ',(IFNULL(var_temp_event_val_6,0)),',
								event_7 = event_7 - ',(IFNULL(var_click_event_val_7,0)),' + ',(IFNULL(var_temp_event_val_7,0)),',
								event_8 = event_8 - ',(IFNULL(var_click_event_val_8,0)),' + ',(IFNULL(var_temp_event_val_8,0)),',
								event_9 = event_9 - ',(IFNULL(var_click_event_val_9,0)),' + ',(IFNULL(var_temp_event_val_9,0)),',
								event_10 = event_10 - ',(IFNULL(var_click_event_val_10,0)),' + ',(IFNULL(var_temp_event_val_10,0)),',
								clicks = clicks - ',IF(var_temp_type=5,1,0),',
								bots = bots - ',IF(var_temp_type=5,var_click_is_bot,0),',
								clicks_landing = clicks_landing - ',IF(var_temp_type=5,var_click_is_landing,0),',
								unique_camp = unique_camp - ',IF(var_temp_type=5,var_click_is_unique_camp,0),',
								`unique` = `unique` - ',IF(var_temp_type=5,var_click_is_unique,0),'
							WHERE id = ',var_rc,';
						');
						PREPARE update_report FROM @temp_sql;
						EXECUTE update_report;
						DEALLOCATE PREPARE update_report;
						IF(@check_update IS NULL)THEN
							INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
								'#P310E',
								'Row doesn`t exist'
							);
						ELSE
							SET @check_update = NULL;
						END IF;
					END IF;
					IF(var_rc_ip!=0)THEN
						SET @temp_sql=CONCAT('
							UPDATE
								',CONCAT('report_camp_ip_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y')),'
							SET
								clicks_offer = @check_update := clicks_offer - ',(IFNULL(var_click_offer_click,0)),' + ',(IFNULL(var_temp_offer_click,0)),',
								leads = leads - ',IF(var_click_cvr_id IS NULL OR var_click_cvr_id=0,0,1),' + ',IF(var_temp_cvr_id IS NULL OR var_temp_cvr_id=0,0,1),',
								spend = spend - ',(IFNULL(var_click_cpc,0)),' + ',(IFNULL(var_temp_cpc,0)),',
								pay = pay - ',(IFNULL(var_click_pay,0)),' + ',(IFNULL(var_temp_pay,0)),',
								event_1 = event_1 - ',(IFNULL(var_click_event_val_1,0)),' + ',(IFNULL(var_temp_event_val_1,0)),',
								event_2 = event_2 - ',(IFNULL(var_click_event_val_2,0)),' + ',(IFNULL(var_temp_event_val_2,0)),',
								event_3 = event_3 - ',(IFNULL(var_click_event_val_3,0)),' + ',(IFNULL(var_temp_event_val_3,0)),',
								event_4 = event_4 - ',(IFNULL(var_click_event_val_4,0)),' + ',(IFNULL(var_temp_event_val_4,0)),',
								event_5 = event_5 - ',(IFNULL(var_click_event_val_5,0)),' + ',(IFNULL(var_temp_event_val_5,0)),',
								event_6 = event_6 - ',(IFNULL(var_click_event_val_6,0)),' + ',(IFNULL(var_temp_event_val_6,0)),',
								event_7 = event_7 - ',(IFNULL(var_click_event_val_7,0)),' + ',(IFNULL(var_temp_event_val_7,0)),',
								event_8 = event_8 - ',(IFNULL(var_click_event_val_8,0)),' + ',(IFNULL(var_temp_event_val_8,0)),',
								event_9 = event_9 - ',(IFNULL(var_click_event_val_9,0)),' + ',(IFNULL(var_temp_event_val_9,0)),',
								event_10 = event_10 - ',(IFNULL(var_click_event_val_10,0)),' + ',(IFNULL(var_temp_event_val_10,0)),',
								clicks = clicks - ',IF(var_temp_type=5,1,0),',
								bots = bots - ',IF(var_temp_type=5,var_click_is_bot,0),',
								clicks_landing = clicks_landing - ',IF(var_temp_type=5,var_click_is_landing,0),',
								unique_camp = unique_camp - ',IF(var_temp_type=5,var_click_is_unique_camp,0),',
								`unique` = `unique` - ',IF(var_temp_type=5,var_click_is_unique,0),'
							WHERE id = ',var_rc_ip,';
						');
						PREPARE update_report FROM @temp_sql;
						EXECUTE update_report;
						DEALLOCATE PREPARE update_report;
						IF(@check_update IS NULL)THEN
							INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
								'#P310E',
								'Row doesn`t exist'
							);
						ELSE
							SET @check_update = NULL;
						END IF;
					END IF;
					IF(var_rc_t!=0)THEN
						SET @temp_sql=CONCAT('
							UPDATE
								',CONCAT('report_camp_token_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y')),'
							SET
								clicks_offer = @check_update := clicks_offer - ',(IFNULL(var_click_offer_click,0)),' + ',(IFNULL(var_temp_offer_click,0)),',
								leads = leads - ',IF(var_click_cvr_id IS NULL OR var_click_cvr_id=0,0,1),' + ',IF(var_temp_cvr_id IS NULL OR var_temp_cvr_id=0,0,1),',
								spend = spend - ',(IFNULL(var_click_cpc,0)),' + ',(IFNULL(var_temp_cpc,0)),',
								pay = pay - ',(IFNULL(var_click_pay,0)),' + ',(IFNULL(var_temp_pay,0)),',
								event_1 = event_1 - ',(IFNULL(var_click_event_val_1,0)),' + ',(IFNULL(var_temp_event_val_1,0)),',
								event_2 = event_2 - ',(IFNULL(var_click_event_val_2,0)),' + ',(IFNULL(var_temp_event_val_2,0)),',
								event_3 = event_3 - ',(IFNULL(var_click_event_val_3,0)),' + ',(IFNULL(var_temp_event_val_3,0)),',
								event_4 = event_4 - ',(IFNULL(var_click_event_val_4,0)),' + ',(IFNULL(var_temp_event_val_4,0)),',
								event_5 = event_5 - ',(IFNULL(var_click_event_val_5,0)),' + ',(IFNULL(var_temp_event_val_5,0)),',
								event_6 = event_6 - ',(IFNULL(var_click_event_val_6,0)),' + ',(IFNULL(var_temp_event_val_6,0)),',
								event_7 = event_7 - ',(IFNULL(var_click_event_val_7,0)),' + ',(IFNULL(var_temp_event_val_7,0)),',
								event_8 = event_8 - ',(IFNULL(var_click_event_val_8,0)),' + ',(IFNULL(var_temp_event_val_8,0)),',
								event_9 = event_9 - ',(IFNULL(var_click_event_val_9,0)),' + ',(IFNULL(var_temp_event_val_9,0)),',
								event_10 = event_10 - ',(IFNULL(var_click_event_val_10,0)),' + ',(IFNULL(var_temp_event_val_10,0)),',
								clicks = clicks - ',IF(var_temp_type=5,1,0),',
								bots = bots - ',IF(var_temp_type=5,var_click_is_bot,0),',
								clicks_landing = clicks_landing - ',IF(var_temp_type=5,var_click_is_landing,0),',
								unique_camp = unique_camp - ',IF(var_temp_type=5,var_click_is_unique_camp,0),',
								`unique` = `unique` - ',IF(var_temp_type=5,var_click_is_unique,0),'
							WHERE id = ',var_rc_t,';
						');
						PREPARE update_report FROM @temp_sql;
						EXECUTE update_report;
						DEALLOCATE PREPARE update_report;
						IF(@check_update IS NULL)THEN
							INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
								'#P310E',
								'Row doesn`t exist'
							);
						ELSE
							SET @check_update = NULL;
						END IF;
					END IF;
					IF(var_temp_type=5)THEN
						UPDATE temp_table SET is_reload = 1 WHERE id = var_temp_id;
					END IF;
					DELETE FROM temp_table WHERE id = var_temp_id AND is_reload = 0;
				END IF;
			UNTIL flag END REPEAT;
		CLOSE cursor_temp_table;
		call CorrectionDataHandlerShowcase();
		UPDATE temp_table SET in_progress = 0 WHERE in_progress = 1;
		UPDATE engine_process SET end_date=UNIX_TIMESTAMP() WHERE id = log_id;
		DELETE FROM engine_process_instant WHERE proc_id = log_id;
	ELSE
		INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,3,NOW(),
			'#P311E',
			'Duplication'
		);
	END IF;
END;
";
$sql[]="
CREATE PROCEDURE reportReload(IN varStartDate VARCHAR(32)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"114012\",\"date\":\"27.05.2020\"}*/
	DECLARE flag, tempDate INT DEFAULT 0;
	DECLARE clickid INT DEFAULT 0;
	DECLARE varTableName VARCHAR(32);
	DECLARE DropReportTables CURSOR FOR 
		SELECT tableName FROM temp_DropReportTables;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	CALL engine_proc_controller(2,'stop');
	CALL engine_proc_controller(3,'stop');
	DO SLEEP(5);
	SET @temp_sql='';
	SET @temp_sql2='';
	if(varStartDate='full')THEN
		SET varStartDate = '2015-01-01';
		SET clickid = 0;
	ELSE
		SET clickid = (SELECT (id-1) AS id FROM clicks WHERE click_time>(UNIX_TIMESTAMP(varStartDate)-3600*36) AND FROM_UNIXTIME(click_time, '%Y-%m-%d')=varStartDate ORDER BY id ASC LIMIT 1);
	END IF;
	IF(clickid IS NOT NULL)THEN
		DELETE FROM engine_process WHERE `type`=2 AND int_var> clickid AND end_date!=0; 
		INSERT INTO engine_process(`type`, start_date, end_date, int_var, cnt) VALUES (2,1,1,clickid,1000);
		SET tempDate=UNIX_TIMESTAMP(varStartDate);
		WHILE (UNIX_TIMESTAMP()>=tempDate) DO
			SET @temp_sql=CONCAT(@temp_sql,\" OR `table_name` LIKE '%\",FROM_UNIXTIME(tempDate, '%d%m%Y'),\"%'\");
			SET @temp_sql2=CONCAT(@temp_sql2,\" OR `date_name` = '\",FROM_UNIXTIME(tempDate, '%d%m%Y'),\"'\");
			SET tempDate=tempDate+24*3600;
		END WHILE;
		IF(@temp_sql!='')THEN
			SET @temp_sql=CONCAT(\"
				CREATE TEMPORARY TABLE temp_DropReportTables 
					SELECT 
						`table_name` AS `tableName`
					FROM
						`information_schema`.`tables` 
					WHERE 
						`table_schema`=database() AND ( `table_name`='ignoreTestBinom' \",@temp_sql,\" );
			\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET flag = 0;
			OPEN DropReportTables;
				REPEAT
					FETCH DropReportTables INTO varTableName;
					IF NOT flag THEN
						SET @temp_sql=CONCAT(\"DROP TABLE IF EXISTS \",varTableName,\";\");
						PREPARE temp_sql FROM @temp_sql;
						EXECUTE temp_sql;
						DEALLOCATE PREPARE temp_sql;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE DropReportTables;
			SET flag = 0;
		END IF;
		IF(@temp_sql2!='')THEN
			DELETE FROM showcase_campaigns WHERE date_type!=1;
			DELETE FROM showcase_landings WHERE date_type!=1;
			DELETE FROM showcase_networks WHERE date_type!=1;
			DELETE FROM showcase_offers WHERE date_type!=1;
			DELETE FROM showcase_rotations WHERE date_type!=1;
			DELETE FROM showcase_sources WHERE date_type!=1;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_campaigns WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_sources WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_landings WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_networks WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_offers WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_rotations WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_campaigns_days WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_sources_days WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_landings_days WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_networks_days WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_offers_days WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT(\"DELETE FROM showcase_rotations_days WHERE `date_name` = 'ignoreTestBinom' \",@temp_sql2,\";\");
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			
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
		END IF;
		DO SLEEP(5);
		CALL engine_proc_controller(2,'restart');
		CALL engine_proc_controller(3,'restart');
		DROP TABLE IF EXISTS temp_DropReportTables;
	END IF;
END;
";
$sql[]="
CREATE PROCEDURE creatorReport (IN start_click_id INT, IN last_click_id INT, IN thisThread INT) creatorReport: BEGIN 
	/*{\"product\":\"Binom 1.14\",\"version\":\"114004\",\"date\":\"12.03.2020\"}*/
	DECLARE sql_time, var_timeout, sql_errors INT DEFAULT 0;
	DECLARE DeadLockFix INT DEFAULT 0;
	DECLARE sql_table VARCHAR(255) DEFAULT '0';
	DECLARE
		last_id, var_id INT;
	DECLARE 
		check_table,i,var_ip_1,var_ip_2,var_ip_3,var_ip_4,var_bot,check_agent,
		var_click_time,var_camp_id,var_offer,var_path_id,var_landing_page,var_cvr_id,
		var_ts_id,var_rule_id,var_offer_click,var_offer_type,var_an,var_geo,var_ua,
		var_publisher,var_ref,var_token,var_dop_int,var_dop_int_2,var_day_week,var_hour_click,
		var_isp, var_country, var_geo_type, var_os, var_browser, var_model, var_brand, var_td3,
		var_cl_map, var_unique, var_unique_camp
	INT;
	DECLARE 
		var_table_name,var_table_name_ip,var_ip_text,var_table_name_token
	VARCHAR(64);
	DECLARE log_id, flag INT DEFAULT 0;
	DECLARE var_ip BIGINT;
	DECLARE var_pay, var_cpc DECIMAL(18,8);
	DECLARE 
		var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
		var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10
	DECIMAL(15,5);
	DECLARE time_client DATETIME;
	DECLARE cursor_1 CURSOR FOR
		SELECT 
			cl.id, cl.click_time, cl.camp_id, cl.offer, cl.path_id, cl.landing_page, 
			cl.cvr_id, cl.ts_id, cl.rule_id, cl.offer_click, cl.offer_type, cl.an, 
			cl.pay, cl.cpc, cl.geo, cl.ua, cl.publisher, cl.ip, cl.referer_domain,
			(SELECT tokens FROM traffic_sources WHERE id = cl.ts_id) AS token,
			cl.is_bot, cl.dop_int, cl.dop_int_2, cl.dop_int_3,
			FROM_UNIXTIME(cl.click_time, '%w'),
			HOUR(FROM_UNIXTIME(cl.click_time, '%Y-%m-%d %H:%i:%S')),
			IF(cl.ip<1000000000,IF(bg6.isp_id IS NULL,0,bg6.isp_id),IF(bg4.isp_id IS NULL,0,bg4.isp_id)),
			IF(cl.ip<1000000000,IF(bg6.country_id IS NULL,0,bg6.country_id),IF(bg4.country_id IS NULL,0,bg4.country_id)),
			IF(cl.ip<1000000000,IF(bg6.cnct_id IS NULL,0,bg6.cnct_id),IF(bg4.cnct_id IS NULL,0,bg4.cnct_id)),
			IF(bdev.os IS NULL,0,bdev.os),
			IF(bdev.browser IS NULL,0,bdev.browser),
			IF(bdev.device_model_id IS NULL,0,bdev.device_model_id),
			IF(bdev.device_brand_id IS NULL,0,bdev.device_brand_id),
			IF(bdev.device_td3_id IS NULL,0,bdev.device_td3_id),
			IF(cm.click_id IS NULL,0,cm.click_id),
			event_val_1,event_val_2,event_val_3,event_val_4,event_val_5,
			event_val_6,event_val_7,event_val_8,event_val_9,event_val_10
		FROM 
			temp_table_from_report_load AS cl 
			LEFT JOIN base_geo_ipv4 AS bg4 ON bg4.id = cl.geo
			LEFT JOIN base_geo_ipv6 AS bg6 ON bg6.id = cl.geo
			LEFT JOIN user_agents AS bdev ON bdev.id = cl.ua
			LEFT JOIN clicks_map AS cm ON cm.click_id = cl.id
		ORDER BY cl.id DESC;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	/*-----------------*/
		DECLARE EXIT HANDLER FOR 145 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P26E',CONCAT('Table ',sql_table,' crashed'));
		END;
		DECLARE EXIT HANDLER FOR 1213 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P21E','Deadlock #1213');
			UPDATE temp_table SET in_progress=0, thread=0, is_reload=1 WHERE is_reload=2 AND thread=thisThread;
			DO SLEEP(5);
			CALL creatorReport(start_click_id,last_click_id,thisThread);
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P21Fix','Deadlock #1213 Fix');
		END;
		DECLARE EXIT HANDLER FOR 1614 BEGIN
			SET sql_errors=1;
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P22E','Deadlock #1614');
			UPDATE temp_table SET in_progress=0, thread=0, is_reload=1 WHERE is_reload=2 AND thread=thisThread;
			DO SLEEP(5);
			CALL creatorReport(start_click_id,last_click_id,thisThread);
			INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P22Fix','Deadlock #1614 Fix');
		END;
		DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN
			IF(sql_errors=0)THEN
				SET sql_errors=1;
				INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P23E','Unknown error');
			END IF;
		END;
	/*-----------------*/
	SET sql_time=unix_timestamp();
	SET var_timeout=45;
		UPDATE temp_table SET `is_reload` = 2, `thread`=thisThread WHERE `is_reload`=1;
		DROP TABLE IF EXISTS temp_table_from_report_load;
		SET @temp_sql=CONCAT('
			CREATE TEMPORARY TABLE temp_table_from_report_load 
				SELECT 
					cl.*,
					IF(ce.event_val_1 IS NULL,0,ce.event_val_1) AS event_val_1,
					IF(ce.event_val_2 IS NULL,0,ce.event_val_2) AS event_val_2,
					IF(ce.event_val_3 IS NULL,0,ce.event_val_3) AS event_val_3,
					IF(ce.event_val_4 IS NULL,0,ce.event_val_4) AS event_val_4,
					IF(ce.event_val_5 IS NULL,0,ce.event_val_5) AS event_val_5,
					IF(ce.event_val_6 IS NULL,0,ce.event_val_6) AS event_val_6,
					IF(ce.event_val_7 IS NULL,0,ce.event_val_7) AS event_val_7,
					IF(ce.event_val_8 IS NULL,0,ce.event_val_8) AS event_val_8,
					IF(ce.event_val_9 IS NULL,0,ce.event_val_9) AS event_val_9,
					IF(ce.event_val_10 IS NULL,0,ce.event_val_10) AS event_val_10
				FROM 
					clicks AS cl
				LEFT JOIN clicks_events AS ce ON ce.click_id = cl.id
				WHERE 
					cl.id > ',start_click_id,' AND cl.id<=',last_click_id,'
				UNION
				SELECT 
					cl.*,
					IF(ce.event_val_1 IS NULL,0,ce.event_val_1) AS event_val_1,
					IF(ce.event_val_2 IS NULL,0,ce.event_val_2) AS event_val_2,
					IF(ce.event_val_3 IS NULL,0,ce.event_val_3) AS event_val_3,
					IF(ce.event_val_4 IS NULL,0,ce.event_val_4) AS event_val_4,
					IF(ce.event_val_5 IS NULL,0,ce.event_val_5) AS event_val_5,
					IF(ce.event_val_6 IS NULL,0,ce.event_val_6) AS event_val_6,
					IF(ce.event_val_7 IS NULL,0,ce.event_val_7) AS event_val_7,
					IF(ce.event_val_8 IS NULL,0,ce.event_val_8) AS event_val_8,
					IF(ce.event_val_9 IS NULL,0,ce.event_val_9) AS event_val_9,
					IF(ce.event_val_10 IS NULL,0,ce.event_val_10) AS event_val_10
				FROM 
				temp_table AS temp
				LEFT JOIN clicks AS cl ON cl.id = temp.click_id
				LEFT JOIN clicks_events AS ce ON ce.click_id = cl.id
				WHERE 
					temp.is_reload=2 AND `thread`=',thisThread,';
		');
		PREPARE temp_sql FROM @temp_sql;
		EXECUTE temp_sql;
		DEALLOCATE PREPARE temp_sql;
		SET DeadLockFix = 1;
		IF((SELECT COUNT(*) FROM temp_table_from_report_load)>0)THEN
			CALL time_convert(NOW(),time_client);
			OPEN cursor_1;
				REPEAT
					FETCH cursor_1 INTO var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page,
										var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an,
										var_pay, var_cpc, var_geo, var_ua, var_publisher, var_ip, var_ref, var_token,
										var_bot, var_dop_int, var_dop_int_2, var_unique, var_day_week, var_hour_click, var_isp,
										var_country, var_geo_type, var_os, var_browser, var_model, var_brand, var_td3, var_cl_map,
										var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
										var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
					IF NOT flag THEN
						IF((unix_timestamp()-sql_time)>var_timeout AND sql_errors=0)THEN
							SET sql_errors=1;
							INSERT INTO engine_errors(`type`, error_name, error_text) VALUES (2,'#P25E','Timeout. Set lowspeed');
							CALL engine_proc_controller(2,'lowspeed');
						END IF;
						IF(var_unique = 1)THEN
							SET var_unique_camp = 1;
						ELSE
							IF(var_unique=2)THEN
								SET var_unique_camp = 1;
								SET var_unique = 0;
							ELSE
								SET var_unique_camp = 0;
								SET var_unique = 0;
							END IF;
						END IF;
						IF(var_cl_map=0)THEN
							INSERT INTO clicks_map(click_id, click_time, rc, rc_ip, rc_t, cpc) VALUES (var_id, var_click_time, 0, 0, 0,var_cpc);
						END IF;
						IF(var_ip<1000000000)THEN
							SET var_ip_text=var_ip;
							SET var_ip_1=0;
							SET var_ip_2=0;
							SET var_ip_3=0;
							SET var_ip_4=var_ip;
						ELSE
							CALL ip_convert(var_ip, var_ip_text, var_ip_1, var_ip_2, var_ip_3, var_ip_4);
						END IF;
						SET var_table_name = CONCAT('report_camp_', var_camp_id, '_', FROM_UNIXTIME(var_click_time, '%d%m%Y'));
						SET var_table_name_ip = CONCAT('report_camp_ip_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y'));
						SET var_table_name_token = CONCAT('report_camp_token_', var_camp_id, '_', FROM_UNIXTIME(var_click_time, '%d%m%Y'));
						SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name AND table_schema = database());
						IF(check_table = 0) THEN
							CALL report_create(var_table_name);
						END IF;
						SET sql_table = var_table_name;
						CALL report_update(var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page, var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an, var_pay, var_cpc, var_geo, var_ua, var_publisher, var_table_name, var_ref, var_bot,var_dop_int,var_isp, var_country, var_geo_type,var_os, var_browser,var_model, var_brand,var_td3, var_hour_click, var_day_week, var_unique, var_unique_camp,var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10);
						SET sql_table = '0';
						SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name_ip AND table_schema = database());
						IF(check_table = 0) THEN
							CALL report_create_ip(var_table_name_ip);
						END IF;
						SET sql_table = var_table_name_ip;
						CALL report_update_ip(var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page, var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an, var_pay, var_cpc, var_geo, var_ua, var_publisher, var_table_name_ip, var_ip_1, var_ip_2, var_ip_3, var_ip_4, var_ip_text, var_ref, var_bot, var_dop_int,var_isp, var_country, var_geo_type, var_hour_click, var_unique, var_unique_camp,var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10);
						SET sql_table = '0';
						IF(var_token!=0)THEN
							SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name_token AND table_schema = database());
							IF(check_table = 0) THEN
								CALL report_create_token(var_table_name_token);
							END IF;
							SET sql_table = var_table_name_token;
							CALL report_update_token(var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page, var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an, var_pay, var_cpc, var_geo, var_table_name_token, var_bot, var_isp, var_country, var_geo_type, var_hour_click, var_day_week, var_unique, var_unique_camp,var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10);
							SET sql_table = '0';
						END IF;
						SET last_id = var_id;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE cursor_1;
			SET sql_table = 'showcase';
			CALL showcase_update();
			SET sql_table = '0';
		END IF;
		DELETE FROM temp_table WHERE is_reload = 2;
END;
";
$sql[]="
CREATE PROCEDURE report_create (IN var_table_name VARCHAR(64)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.2\",\"date\":\"18.10.2019\"}*/
	SET @report_create_sql_1 = CONCAT('CREATE TABLE IF NOT EXISTS ', var_table_name, ' (
			id INT(12) NOT NULL AUTO_INCREMENT,
			unique_key VARCHAR(32) NOT NULL DEFAULT \"0\",
			hour_click INT(2) NOT NULL,
			day_week INT(2) NOT NULL,
			offer INT(6) NOT NULL,
			path_id INT(6) NOT NULL,
			landing_page INT(6) NOT NULL,
			ts_id INT(6) NOT NULL,
			rule_id INT(6) NOT NULL,
			offer_type tinyint(1) NOT NULL,
			an INT(6) NOT NULL,
			isp INT(6) NOT NULL,
			country INT(6) NOT NULL,
			geo_type INT(6) NOT NULL,
			model INT(6) NOT NULL,
			brand INT(6) NOT NULL,
			lang INT(6) NOT NULL,
			td3 INT(6) NOT NULL,
			os INT(6) NOT NULL,
			browser INT(6) NOT NULL,
			clicks INT(12) NOT NULL,
			`unique` INT NOT NULL DEFAULT \"0\",
			`unique_camp` INT NOT NULL DEFAULT \"0\",
			bots INT(12) NOT NULL,
			clicks_offer INT(12) NOT NULL,
			clicks_landing INT(12) NOT NULL,
			leads INT(12) NOT NULL,
			event_1 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_2 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_3 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_4 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_5 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_6 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_7 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_8 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_9 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_10 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			spend DECIMAL(18,8) NOT NULL,
			pay DECIMAL(18,8) NOT NULL,
			publisher INT(12) NOT NULL,
			referer_domain INT(12) NOT NULL,
			PRIMARY KEY(`id`),
			INDEX hour_click_idx_',var_table_name,' (hour_click),
			INDEX day_week_idx_',var_table_name,' (day_week),
			INDEX offer_idx_',var_table_name,' (offer),
			INDEX path_id_idx_',var_table_name,' (path_id),
			INDEX landing_page_idx_',var_table_name,' (landing_page),
			INDEX ts_id_idx_',var_table_name,' (ts_id),
			INDEX an_idx_',var_table_name,' (an),
			INDEX isp_idx_',var_table_name,' (isp),
			INDEX country_idx_',var_table_name,' (country),
			INDEX geo_type_idx_',var_table_name,' (geo_type),
			INDEX model_idx_',var_table_name,' (model),
			INDEX brand_idx_',var_table_name,' (brand),
			INDEX lang_idx_',var_table_name,' (lang),
			INDEX td3_idx_',var_table_name,' (td3),
			INDEX os_idx_',var_table_name,' (os),
			INDEX browser_idx_',var_table_name,' (browser),
			INDEX publisher_idx_',var_table_name,' (publisher),
			INDEX referer_domain_idx_',var_table_name,' (referer_domain)
		) CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=MyISAM;');
	PREPARE create_report FROM @report_create_sql_1;
	EXECUTE create_report;
	DEALLOCATE PREPARE create_report;
END;
";

$sql[]="
CREATE PROCEDURE report_create_ip (IN var_table_name VARCHAR(64)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.2\",\"date\":\"18.10.2019\"}*/
	SET @report_create_sql_1 = CONCAT('CREATE TABLE IF NOT EXISTS ', var_table_name, ' (
			id INT(12) NOT NULL AUTO_INCREMENT,
			unique_key VARCHAR(32) NOT NULL DEFAULT \"0\",
			hour_click INT(2) NOT NULL,
			offer INT(6) NOT NULL,
			path_id INT(6) NOT NULL,
			landing_page INT(6) NOT NULL,
			ts_id INT(6) NOT NULL,
			rule_id INT(6) NOT NULL,
			offer_type tinyint(1) NOT NULL,
			an INT(6) NOT NULL,
			isp INT(6) NOT NULL,
			country INT(6) NOT NULL,
			geo_type INT(6) NOT NULL,
			lang INT(6) NOT NULL,
			clicks INT(12) NOT NULL,
			`unique` INT NOT NULL DEFAULT \"0\",
			`unique_camp` INT NOT NULL DEFAULT \"0\",
			bots INT(12) NOT NULL,
			clicks_offer INT(12) NOT NULL,
			clicks_landing INT(12) NOT NULL,
			leads INT(12) NOT NULL,
			event_1 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_2 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_3 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_4 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_5 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_6 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_7 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_8 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_9 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_10 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			spend DECIMAL(18,8) NOT NULL,
			pay DECIMAL(18,8) NOT NULL,
			publisher INT(12) NOT NULL,
			ip_1 INT(3) NOT NULL,
			ip_2 INT(3) NOT NULL,
			ip_3 INT(3) NOT NULL,
			ip_4 INT(3) NOT NULL,
			ip_5 INT(3) NOT NULL,
			ip_6 INT(3) NOT NULL,
			PRIMARY KEY(`id`),
			INDEX hour_click_idx_',var_table_name,' (hour_click),
			INDEX offer_idx_',var_table_name,' (offer),
			INDEX path_id_idx_',var_table_name,' (path_id),
			INDEX landing_page_idx_',var_table_name,' (landing_page),
			INDEX ts_id_idx_',var_table_name,' (ts_id),
			INDEX an_idx_',var_table_name,' (an),
			INDEX isp_idx_',var_table_name,' (isp),
			INDEX country_idx_',var_table_name,' (country),
			INDEX geo_type_idx_',var_table_name,' (geo_type),
			INDEX lang_idx_',var_table_name,' (lang),
			INDEX publisher_idx_',var_table_name,' (publisher),
			INDEX ip_1_idx_',var_table_name,' (ip_1),
			INDEX ip_2_idx_',var_table_name,' (ip_2),
			INDEX ip_3_idx_',var_table_name,' (ip_3),
			INDEX ip_4_idx_',var_table_name,' (ip_4),
			INDEX ip_5_idx_',var_table_name,' (ip_5),
			INDEX ip_6_idx_',var_table_name,' (ip_6)
		) CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=MyISAM;');
	PREPARE create_report FROM @report_create_sql_1;
	EXECUTE create_report;
	DEALLOCATE PREPARE create_report;
END;
";

$sql[]="
CREATE PROCEDURE report_create_token (IN var_table_name VARCHAR(64)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.2\",\"date\":\"18.10.2019\"}*/
	SET @report_create_sql_1 = CONCAT('CREATE TABLE IF NOT EXISTS ', var_table_name, ' (
			id INT(12) NOT NULL AUTO_INCREMENT,
			unique_key VARCHAR(32) NOT NULL DEFAULT \"0\",
			hour_click INT(2) NOT NULL,
			day_week INT(2) NOT NULL,
			offer INT(6) NOT NULL,
			path_id INT(6) NOT NULL,
			landing_page INT(6) NOT NULL,
			ts_id INT(6) NOT NULL,
			rule_id INT(6) NOT NULL,
			offer_type tinyint(1) NOT NULL,
			an INT(6) NOT NULL,
			isp INT(6) NOT NULL,
			country INT(6) NOT NULL,
			geo_type INT(6) NOT NULL,
			clicks INT(12) NOT NULL,
			`unique` INT NOT NULL DEFAULT \"0\",
			`unique_camp` INT NOT NULL DEFAULT \"0\",
			bots INT(12) NOT NULL,
			clicks_offer INT(12) NOT NULL,
			clicks_landing INT(12) NOT NULL,
			leads INT(12) NOT NULL,
			event_1 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_2 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_3 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_4 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_5 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_6 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_7 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_8 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_9 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			event_10 DECIMAL(15,5) NOT NULL DEFAULT \"0\",
			spend DECIMAL(18,8) NOT NULL,
			pay DECIMAL(18,8) NOT NULL,
			t1 INT(6) NOT NULL,
			t2 INT(6) NOT NULL,
			t3 INT(6) NOT NULL,
			t4 INT(6) NOT NULL,
			t5 INT(6) NOT NULL,
			t6 INT(6) NOT NULL,
			t7 INT(6) NOT NULL,
			t8 INT(6) NOT NULL,
			t9 INT(6) NOT NULL,
			t10 INT(6) NOT NULL,
			PRIMARY KEY(`id`),
			INDEX hour_click_idx_',var_table_name,' (hour_click),
			INDEX day_week_idx_',var_table_name,' (day_week),
			INDEX offer_idx_',var_table_name,' (offer),
			INDEX path_id_idx_',var_table_name,' (path_id),
			INDEX landing_page_idx_',var_table_name,' (landing_page),
			INDEX ts_id_idx_',var_table_name,' (ts_id),
			INDEX an_idx_',var_table_name,' (an),
			INDEX isp_idx_',var_table_name,' (isp),
			INDEX country_idx_',var_table_name,' (country),
			INDEX geo_type_idx_',var_table_name,' (geo_type),
			INDEX t1_idx_',var_table_name,' (t1),
			INDEX t2_idx_',var_table_name,' (t2),
			INDEX t3_idx_',var_table_name,' (t3),
			INDEX t4_idx_',var_table_name,' (t4),
			INDEX t5_idx_',var_table_name,' (t5),
			INDEX t6_idx_',var_table_name,' (t6),
			INDEX t7_idx_',var_table_name,' (t7),
			INDEX t8_idx_',var_table_name,' (t8),
			INDEX t9_idx_',var_table_name,' (t9),
			INDEX t10_idx_',var_table_name,' (t10)
		) CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE=MyISAM;');
	PREPARE create_report FROM @report_create_sql_1;
	EXECUTE create_report;
	DEALLOCATE PREPARE create_report;
END;
";

$sql[]="
	CREATE PROCEDURE report_order (IN table_name VARCHAR(64), IN var_order TEXT) BEGIN
		/*{\"product\":\"Binom 1.10 (i)\",\"version\":\"1.10\",\"date\":\"08.05.2018\"}*/
		DECLARE sql_1, sql_2, sql_3, sql_4, sql_5 TEXT;
		SET sql_1=CONCAT('
			UPDATE
			  ',table_name,'
			SET
			  id1 = (SELECT @a:= @a + 1 FROM (SELECT @a:= 0) as tbl)
			WHERE level = 1
			ORDER BY ',var_order,';
		');
		SET sql_2=CONCAT('
			UPDATE
				',table_name,' AS table_1
				JOIN (
					SELECT group_1, id1 FROM ',table_name,' WHERE level=1
				) AS test ON 
				table_1.group_1=test.group_1
			SET table_1.id1=test.id1
			WHERE level!=1;
		');
		SET sql_3=CONCAT('
			UPDATE
			  ',table_name,'
			SET
			  id2 = (SELECT @a:= @a + 1 FROM (SELECT @a:= 0) as tbl)
			WHERE level = 2
			ORDER BY ',var_order,';
		');
		SET sql_4=CONCAT('
			UPDATE
				',table_name,' AS table_1
				JOIN (
					SELECT group_1, group_2, id2 FROM ',table_name,' WHERE level=2
				) AS test ON 
				table_1.group_1=test.group_1 AND table_1.group_2=test.group_2
			SET table_1.id2=test.id2
			WHERE level=3;
		');
		SET sql_5=CONCAT('
			UPDATE
			  ',table_name,'
			SET
			  id3 = (SELECT @a:= @a + 1 FROM (SELECT @a:= 0) as tbl)
			WHERE level = 3
			ORDER BY ',var_order,';
		');
		
		SET @sql_1=sql_1;
		PREPARE sql_1 FROM @sql_1;
		EXECUTE sql_1;
		DEALLOCATE PREPARE sql_1;
		
		SET @sql_2=sql_2;
		PREPARE sql_2 FROM @sql_2;
		EXECUTE sql_2;
		DEALLOCATE PREPARE sql_2;
		
		SET @sql_3=sql_3;
		PREPARE sql_3 FROM @sql_3;
		EXECUTE sql_3;
		DEALLOCATE PREPARE sql_3;
		
		SET @sql_4=sql_4;
		PREPARE sql_4 FROM @sql_4;
		EXECUTE sql_4;
		DEALLOCATE PREPARE sql_4;
		
		SET @sql_5=sql_5;
		PREPARE sql_5 FROM @sql_5;
		EXECUTE sql_5;
		DEALLOCATE PREPARE sql_5;
	END;
";

$sql[]='
	CREATE PROCEDURE report_select_group (IN group_num INT, IN var_group INT, IN camp_id INT, IN type_group VARCHAR(10), IN date_row VARCHAR(32), OUT var_group_title TEXT, OUT var_select_group TEXT, OUT name_group TEXT, OUT varFreeName TEXT) BEGIN
		/*{"product":"Binom 1.14","version":"1.12","date":"06.09.2020"}*/
		DECLARE var_token_select_group, varFreeNameTokens TEXT;
		DECLARE temp_var_group, var_old_geo_limiter INT;
		SET var_old_geo_limiter = (SELECT city_id FROM base_geo_ipv4 WHERE id = 0);
		IF(var_old_geo_limiter IS NULL)THEN
			SET var_old_geo_limiter = 0;
		END IF;
		SET var_select_group = group_num;
		SET name_group=CONCAT(\'group_\',group_num);
		IF(var_group=27)THEN
			SET temp_var_group = 1;
		ELSE
			SET temp_var_group = var_group-280;
		END IF;
		SET var_token_select_group = CONCAT(\'
			(IF(group_\',group_num,\'=0,"Unknown",
				(SELECT 
					CONCAT(
						(SELECT val FROM token_value WHERE id = group_\',group_num,\'),
						(SELECT  
							IF(
								GROUP_CONCAT(name SEPARATOR "" ) IS NOT NULL,
								CONCAT(" ",GROUP_CONCAT(name SEPARATOR "" )),
								""
							)
						FROM token_tags WHERE token_id = group_\',group_num,\' AND token_num=\',temp_var_group,\' AND camp_id=\',camp_id,\')
					) AS val)	
			))
		\');
		SET varFreeNameTokens = CONCAT(\'
			(IF(group_\',group_num,\'=0,"Unknown",(SELECT val FROM token_value WHERE id = group_\',group_num,\')))	
		\');
		SET varFreeName = \'"freename"\';
		CASE var_group
			WHEN 1 THEN 
				SET var_group_title = \'NULL\';
				SET var_select_group = \'NULL\';
				SET varFreeName = \'NULL\';
			WHEN 2 THEN 
				SET var_group_title = \'IF(rule_id>0,0,path_id)\'; 
				SET var_select_group = CONCAT(\'(SELECT IF(id!=0,CONCAT(name, " #tag:",status),name) AS name FROM paths WHERE id = group_\',group_num,\')\');
				SET varFreeName = CONCAT(\'(SELECT name FROM paths WHERE id = group_\',group_num,\')\');
			WHEN 3 THEN 
				SET var_group_title = CONCAT(\'CONCAT(path_id,"-",offer,"-",offer_type)\');
				SET varFreeName = CONCAT(\'
					IF(
						SUBSTRING_INDEX(group_\',group_num,\',"-",-1)=4,
						(SELECT url FROM offer_direct_url WHERE id = SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1)),
						IF(SUBSTRING_INDEX(group_\',group_num,\',"-",-1)=3,
							(SELECT name FROM offers AS offr WHERE id = SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1)),
							(SELECT name FROM campaigns WHERE id = SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1))
						)
					)\');
				SET var_select_group = CONCAT(\'
					IF(
						SUBSTRING_INDEX(group_\',group_num,\',"-",-1)=4,
						CONCAT("Direct: ",(
							SELECT CONCAT(
								url,
								" #tag:",
								(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND type=4 AND id_t=SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1) LIMIT 1)
							) AS id_t FROM offer_direct_url WHERE id = SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1))),
						IF(
							SUBSTRING_INDEX(group_\',group_num,\',"-",-1)=3,
							(
								SELECT 
									CONCAT((SELECT IF(id!=0,CONCAT(name," - "),"") AS name FROM networks WHERE id = offr.network),name," (id:",id,")"," #tag:",
									IF(
										(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND type=3 AND id_t=SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1) LIMIT 1) IS NOT NULL,
										(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND type=3 AND id_t=SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1) LIMIT 1),
										3
									)
								) AS name
								FROM 
									offers AS offr
								WHERE 
									id = SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1)
							),
							CONCAT("Campaign: ",(SELECT name FROM campaigns WHERE id = SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1)))
						)
					)\');
				SET name_group=CONCAT(\'CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(group_\',group_num,\',"-",2),"-",-1),"-",SUBSTRING_INDEX(group_\',group_num,\',"-",-1))\');
			WHEN 4 THEN 
				SET var_group_title = CONCAT(\'CONCAT(path_id,"-",landing_page)\');
				SET varFreeName = CONCAT(\'(SELECT name FROM landing_pages WHERE id = SUBSTRING_INDEX(group_\',group_num,\',"-",-1))\');
				SET var_select_group = CONCAT(\'
					(
						SELECT
							IF(
								lang="0" OR lang="",
								CONCAT(name," (id:",id,")"," #tag:",
									IF(
										(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND (type=1 OR type=2) AND id_t=SUBSTRING_INDEX(group_\',group_num,\',"-",-1)+0 LIMIT 1) IS NOT NULL,
										(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND (type=1 OR type=2) AND id_t=SUBSTRING_INDEX(group_\',group_num,\',"-",-1)+0 LIMIT 1),
										3
									)
								),
								CONCAT(
									name," (id:",id,")",
									" #tag:",
									IF(
										(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND (type=1 OR type=2) AND id_t=SUBSTRING_INDEX(group_\',group_num,\',"-",-1) LIMIT 1) IS NOT NULL,
										(SELECT status FROM path_com WHERE path_id = SUBSTRING_INDEX(group_\',group_num,\',"-",1) AND (type=1 OR type=2) AND id_t=SUBSTRING_INDEX(group_\',group_num,\',"-",-1) LIMIT 1),
										3
									),
									" (", lang, ")"
								)
							) 
						FROM 
							landing_pages
							WHERE 
							id = SUBSTRING_INDEX(group_\',group_num,\',"-",-1)
					)\');
				SET name_group=CONCAT(\'SUBSTRING_INDEX(group_\',group_num,\',"-",-1)\');
			WHEN 5 THEN 
				SET var_group_title = \'path_id\';
				SET varFreeName =  CONCAT(\'(SELECT IF(rule_id=0,"Default",name) AS name FROM paths WHERE id = group_\',group_num,\')\');
				SET var_select_group = CONCAT(\'
					(
						SELECT 
							IF(
								rule_id=0,
								"Default",
								CONCAT((SELECT name FROM rule WHERE id = rule_id)," - ", name)
							) AS name FROM paths WHERE id = group_\',group_num,\')
				\');
			WHEN 6 THEN 
				IF(type_group=\'direct\')THEN
					IF(var_old_geo_limiter = 0)THEN
						SET var_group_title = \'(SELECT name FROM base_geo_isp_names WHERE id = IF(ip<1000000000,(SELECT isp_id FROM base_geo_ipv6 WHERE id = table_rp.geo),(SELECT isp_id FROM base_geo_ipv4 WHERE id = table_rp.geo)))\';
					ELSE
						SET var_group_title = CONCAT(\'
							(SELECT name FROM base_geo_isp_names WHERE id = 
								IF(
									ip<1000000000,
									(SELECT isp_id FROM base_geo_ipv6 WHERE id = table_rp.geo),
									IF(
										table_rp.click_time>\',var_old_geo_limiter,\',
										(SELECT isp_id FROM base_geo_ipv4 WHERE id = table_rp.geo),
										(SELECT isp FROM backup_base_geo WHERE id = geo)
									)
								)
							)\'
						);
					END IF;
					SET var_select_group = CONCAT(\'group_\',group_num);
				ELSE
					SET var_group_title = \'(SELECT name FROM base_geo_isp_names WHERE id = isp)\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 42 THEN 
				IF(type_group=\'direct\')THEN
					IF(var_old_geo_limiter = 0)THEN
						SET var_group_title = \'(SELECT IF(org_name=1,name,org_name) FROM base_geo_isp_names WHERE id = IF(ip<1000000000,(SELECT isp_id FROM base_geo_ipv6 WHERE id = table_rp.geo),(SELECT isp_id FROM base_geo_ipv4 WHERE id = table_rp.geo)))\';
					ELSE
						SET var_group_title = CONCAT(\'
							(SELECT IF(org_name=1,name,org_name) FROM base_geo_isp_names WHERE id = 
								IF(
									ip<1000000000,
									(SELECT isp_id FROM base_geo_ipv6 WHERE id = table_rp.geo),
									IF(
										table_rp.click_time>\',var_old_geo_limiter,\',
										(SELECT isp_id FROM base_geo_ipv4 WHERE id = table_rp.geo),
										(SELECT isp FROM backup_base_geo WHERE id = geo)
									)
								)
							)
						\');
					END IF;
					SET var_select_group = CONCAT(\'group_\',group_num);
				ELSE
					SET var_group_title = \'(SELECT IF(org_name=1,name,org_name) FROM base_geo_isp_names WHERE id = isp)\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 7 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'
					IF(ip<1000000000, ip,(CONCAT(SUBSTRING(ip,1,(3-(12-LENGTH(ip))))+0,".",SUBSTRING(ip,(4-(12-LENGTH(ip))),3)+0,".", SUBSTRING(ip,(7-(12-LENGTH(ip))),3)+0,".", SUBSTRING(ip,(10-(12-LENGTH(ip))),3)+0)))\';
					SET var_select_group = CONCAT(\'IF(group_\',group_num,\' REGEXP "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", group_\',group_num,\', (SELECT CONCAT(s_ip,"-",e_ip) FROM base_geo_ipv6 WHERE id = group_\',group_num,\'))\');
				ELSE
					SET var_group_title = \'IF((ip_1=0 AND ip_2=0 AND ip_3=0),ip_4,CONCAT(ip_1,".",ip_2,".",ip_3,".", ip_4))\';
					SET var_select_group = CONCAT(\'IF(group_\',group_num,\' REGEXP "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", group_\',group_num,\', (SELECT CONCAT(s_ip,"-",e_ip) FROM base_geo_ipv6 WHERE id = group_\',group_num,\'))\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 8 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'IF(ip<1000000000, ip,(CONCAT(SUBSTRING(ip,1,(3-(12-LENGTH(ip))))+0,".",SUBSTRING(ip,(4-(12-LENGTH(ip))),3)+0,".", SUBSTRING(ip,(7-(12-LENGTH(ip))),3)+0,".0 - ",SUBSTRING(ip,1,(3-(12-LENGTH(ip))))+0,".",SUBSTRING(ip,(4-(12-LENGTH(ip))),3)+0,".", SUBSTRING(ip,(7-(12-LENGTH(ip))),3)+0,".255")))\';
					SET var_select_group = CONCAT(\'IF(group_\',group_num,\' REGEXP "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", group_\',group_num,\', (SELECT CONCAT(s_ip,"-",e_ip) FROM base_geo_ipv6 WHERE id = group_\',group_num,\'))\');
				ELSE
					SET var_group_title = \'IF((ip_1=0 AND ip_2=0 AND ip_3=0),ip_4,CONCAT(ip_1,".",ip_2,".",ip_3,".0 - ",ip_1,".",ip_2,".",ip_3,".255"))\';
					SET var_select_group = CONCAT(\'IF(group_\',group_num,\' REGEXP "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", group_\',group_num,\', (SELECT CONCAT(s_ip,"-",e_ip) FROM base_geo_ipv6 WHERE id = group_\',group_num,\'))\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 9 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'IF(ip<1000000000, ip,(CONCAT(SUBSTRING(ip,1,(3-(12-LENGTH(ip))))+0,".",SUBSTRING(ip,(4-(12-LENGTH(ip))),3)+0,".0.0 - ",SUBSTRING(ip,1,(3-(12-LENGTH(ip))))+0,".",SUBSTRING(ip,(4-(12-LENGTH(ip))),3)+0,".255.255")))\';
					SET var_select_group = CONCAT(\'IF(group_\',group_num,\' REGEXP "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", group_\',group_num,\', (SELECT CONCAT(s_ip,"-",e_ip) FROM base_geo_ipv6 WHERE id = group_\',group_num,\'))\');
				ELSE
					SET var_group_title = \'IF((ip_1=0 AND ip_2=0 AND ip_3=0),ip_4,CONCAT(ip_1,".",ip_2,".0.0 - ",ip_1,".",ip_2,".255.255"))\';
					SET var_select_group = CONCAT(\'IF(group_\',group_num,\' REGEXP "^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}", group_\',group_num,\', (SELECT CONCAT(s_ip,"-",e_ip) FROM base_geo_ipv6 WHERE id = group_\',group_num,\'))\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 10 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT device_td3_id FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT pointing_method FROM base_device_technical_data_3 WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'td3\';
					SET var_select_group = CONCAT(\'(SELECT pointing_method FROM base_device_technical_data_3 WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 29 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT device_model_id FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_device_model WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'(SELECT name FROM base_device_model WHERE id = table_rp.model)\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 11 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT device_brand_id FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_device_brand WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'brand\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_device_brand WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 12 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT device_model_id FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT model FROM base_device_model WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'model\';
					SET var_select_group = CONCAT(\'(SELECT model FROM base_device_model WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 13 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT device_td2_id FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT resolution FROM base_device_technical_data_2 WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'td2\';
					SET var_select_group = CONCAT(\'(SELECT resolution FROM base_device_technical_data_2 WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 14 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT device_td4_id FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT max_speed FROM base_device_technical_data_4 WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'td4\';
					SET var_select_group = CONCAT(\'(SELECT max_speed FROM base_device_technical_data_4 WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 15 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT browser FROM base_browser WHERE id=(SELECT browser FROM user_agents WHERE id = table_rp.ua))\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				ELSE
					SET var_group_title = \'(SELECT browser FROM base_browser WHERE id=table_rp.browser)\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 16 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT browser FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT CONCAT(browser," ",browser_version) FROM base_browser WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'browser\';
					SET var_select_group = CONCAT(\'(SELECT CONCAT(browser," ",browser_version) FROM base_browser WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 17 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT os FROM base_os WHERE id =(SELECT os FROM user_agents WHERE id = table_rp.ua))\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				ELSE
					SET var_group_title = \'(SELECT os FROM base_os WHERE id = table_rp.os)\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 18 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT os FROM user_agents WHERE id = table_rp.ua)\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_os WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'os\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_os WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 19 THEN 
				IF(type_group=\'direct\')THEN
					IF(var_old_geo_limiter = 0)THEN
						SET var_group_title = \'IF(ip<1000000000,(SELECT country_id FROM base_geo_ipv6 WHERE id = table_rp.geo),(SELECT country_id FROM base_geo_ipv4 WHERE id = table_rp.geo))\';
					ELSE
						SET var_group_title = CONCAT(\'
							IF(
								ip<1000000000,
								(SELECT country_id FROM base_geo_ipv6 WHERE id = table_rp.geo),
								IF(
									table_rp.click_time>\',var_old_geo_limiter,\',
									(SELECT country_id FROM base_geo_ipv4 WHERE id = table_rp.geo),
									(SELECT country FROM backup_base_geo WHERE id = geo)
								)
							)
						\');
					END IF;
					SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_country_names WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'country\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_country_names WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 20 THEN 
				IF(var_old_geo_limiter = 0)THEN
					SET var_group_title = \'
						IF(
							ip<1000000000,
							(SELECT city_id FROM base_geo_ipv6 WHERE id = geo),
							(SELECT city_id FROM base_geo_ipv4 WHERE id = geo)
						)\';
				ELSE
					/*заплатка для переходной версии баз GEO*/
					SET var_group_title = CONCAT(\'
						IF(
							ip<1000000000,
							(SELECT city_id FROM base_geo_ipv6 WHERE id = geo),
							IF(
								table_rp.click_time>\',var_old_geo_limiter,\',
								(SELECT city_id FROM base_geo_ipv4 WHERE id = geo),
								(SELECT city FROM backup_base_geo WHERE id = geo)
							)
						)\');
				END IF;
				SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_city_names WHERE id = group_\',group_num,\')\');
				SET varFreeName = var_select_group;
			/*--------------------------------------------------------*/
			/*регион*/
			WHEN 43 THEN 
				IF(var_old_geo_limiter = 0)THEN
					SET var_group_title = \'
						IF(
							ip<1000000000,
							0,
							(SELECT region_id FROM base_geo_ipv4 WHERE id = geo)
						)\';
				ELSE
					/*заплатка для переходной версии баз GEO*/
					SET var_group_title = CONCAT(\'0\');
				END IF;
				SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_region_names WHERE id = group_\',group_num,\')\');
				SET varFreeName = var_select_group;
			/*континент*/
			WHEN 44 THEN 
				IF(var_old_geo_limiter = 0)THEN
					SET var_group_title = \'
						IF(
							ip<1000000000,
							0,
							(SELECT continent_id FROM base_geo_ipv4 WHERE id = geo)
						)\';
				ELSE
					/*заплатка для переходной версии баз GEO*/
					SET var_group_title = CONCAT(\'0\');
				END IF;
				SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_continent_names WHERE id = group_\',group_num,\')\');
				SET varFreeName = var_select_group;
			/*таймзона города*/
			WHEN 45 THEN 
				IF(var_old_geo_limiter = 0)THEN
					SET var_group_title = \'
						IF(
							ip<1000000000,
							0,
							(SELECT city_id FROM base_geo_ipv4 WHERE id = geo)
						)\';
				ELSE
					/*заплатка для переходной версии баз GEO*/
					SET var_group_title = CONCAT(\'0\');
				END IF;
				SET var_select_group = CONCAT(\'(SELECT `timezone` FROM base_geo_city_names WHERE id = group_\',group_num,\')\');			
				SET varFreeName = var_select_group;
			/*координаты*/
			WHEN 46 THEN 
				IF(var_old_geo_limiter = 0)THEN
					SET var_group_title = \'
						IF(
							ip<1000000000,
							0,
							(SELECT CONCAT(longitude,":",latitude,":",radius) FROM base_geo_ipv4 WHERE id = geo)
						)\';
				ELSE
					/*заплатка для переходной версии баз GEO*/
					SET var_group_title = CONCAT(\'0\');
				END IF;
				SET var_select_group = CONCAT(\'(group_\',group_num,\')\');
				SET varFreeName = var_select_group;
			/*спутник*/
			WHEN 47 THEN 
				IF(var_old_geo_limiter = 0)THEN
					SET var_group_title = \'
						IF(
							ip<1000000000,
							0,
							(SELECT is_satellite FROM base_geo_ipv4 WHERE id = geo)
						)\';
				ELSE
					/*заплатка для переходной версии баз GEO*/
					SET var_group_title = CONCAT(\'0\');
				END IF;
				SET var_select_group = CONCAT(\'(group_\',group_num,\')\');
				SET varFreeName = var_select_group;
			/*proxy type*/
			WHEN 48 THEN 
				SET var_group_title = \'IFNULL((
						SELECT 
							base_proxy_types.name
						FROM 
							base_proxy LEFT JOIN
							base_proxy_types ON base_proxy_types.id = base_proxy.type_id
						WHERE base_proxy.id = (
							SELECT 
								proxy_base_id 
							FROM 
								clicks_proxy 
							WHERE 
								click_id=table_rp.id
						)	
				),"None")\';
				SET var_select_group =  CONCAT(\'
					(group_\',group_num,\')\'
				);
				SET varFreeName = var_select_group;
			/*crawler*/
			WHEN 49 THEN 
				SET var_group_title = \'IFNULL((
						SELECT 
							crawler_id 
						FROM 
							clicks_crawler 
						WHERE 
							click_id=table_rp.id
				),0)\';
				SET var_select_group =  CONCAT(\'
					(SELECT 
						IF(group_\',group_num,\'=0,"None",CONCAT(name," (",org_name,")"))
					FROM 
						base_crawlers
					WHERE id = group_\',group_num,\')\'
				);
				SET varFreeName = var_select_group;
			/*--------------------------------------------------------*/
			WHEN 30 THEN 
				IF(type_group=\'direct\')THEN
					IF(var_old_geo_limiter = 0)THEN
						SET var_group_title = \'IF(ip<1000000000,(SELECT cnct_id FROM base_geo_ipv6 WHERE id = table_rp.geo),(SELECT cnct_id FROM base_geo_ipv4 WHERE id = table_rp.geo))\';
					ELSE
						SET var_group_title = CONCAT(\'
							IF(
								ip<1000000000,
								(SELECT cnct_id FROM base_geo_ipv6 WHERE id = table_rp.geo),							
								IF(
									table_rp.click_time>\',var_old_geo_limiter,\',
									(SELECT cnct_id FROM base_geo_ipv4 WHERE id = table_rp.geo),
									(SELECT `type` FROM backup_base_geo WHERE id = geo)
								)
							)
						\');
					END IF;
					SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_cnct_names WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'geo_type\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_geo_cnct_names WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 31 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = CONCAT(\'UNIX_TIMESTAMP(FROM_UNIXTIME(table_rp.click_time,  "%Y-%m-%d 00:00:00"))\'); 
					SET var_select_group = CONCAT(\'FROM_UNIXTIME(group_\',group_num,\',  "%Y-%m-%d")\');
				ELSE
					SET var_group_title = CONCAT(\'"\',date_row,\'"\'); 
					SET var_select_group = CONCAT(\'FROM_UNIXTIME(group_\',group_num,\',  "%Y-%m-%d")\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 21 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(IF(table_rp.dop_int=0,(SELECT device_lang_id FROM user_agents WHERE id = table_rp.ua),table_rp.dop_int))\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_device_lang WHERE id = group_\',group_num,\')\');
				ELSE
					SET var_group_title = \'lang\';
					SET var_select_group = CONCAT(\'(SELECT name FROM base_device_lang WHERE id = group_\',group_num,\')\');
				END IF;
				SET varFreeName = var_select_group;
			WHEN 22 THEN 
				SET var_group_title = \'an\';
				SET var_select_group = CONCAT(\'(SELECT CONCAT(name," (id:",id,")") AS name FROM networks WHERE id = group_\',group_num,\')\');
				SET varFreeName = CONCAT(\'(SELECT name FROM networks WHERE id = group_\',group_num,\')\');
			WHEN 23 THEN 
					SET var_group_title = \'(SELECT url FROM clicks_referer_url WHERE click_id = table_rp.id LIMIT 1)\';
					SET var_select_group = CONCAT(\'group_\',group_num);
					SET varFreeName = var_select_group;
			WHEN 24 THEN 
				SET var_group_title = \'referer_domain\';
				SET var_select_group = CONCAT(\'(SELECT val FROM referer_value WHERE id = group_\',group_num,\')\');
				SET varFreeName = var_select_group;
			WHEN 25 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(FROM_UNIXTIME(table_rp.click_time, "%w"))\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				ELSE
					SET var_group_title = \'day_week\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 26 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(HOUR(FROM_UNIXTIME(table_rp.click_time)))\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				ELSE
					SET var_group_title = \'hour_click\';
					SET var_select_group = CONCAT(\'group_\',group_num);
				END IF;
				SET varFreeName = var_select_group;
			WHEN 27 THEN 
				IF(type_group=\'token_\')THEN
					SET var_group_title = \'t1\';
				ELSE
					SET var_group_title = \'publisher\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 282 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t2 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t2\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 283 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t3 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t3\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 284 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t4 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t4\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 285 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t5 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t5\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 286 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t6 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t6\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 287 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t7 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t7\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 288 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t8 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t8\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 289 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t9 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t9\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 290 THEN 
				IF(type_group=\'direct\')THEN
					SET var_group_title = \'(SELECT t10 FROM clicks_tokens WHERE click_id = table_rp.id LIMIT 1)\';
				ELSE
					SET var_group_title = \'t10\';
				END IF;
				SET var_select_group = var_token_select_group;
				SET varFreeName = varFreeNameTokens;
			WHEN 32 THEN 
				SET var_group_title = \'ts_id\';
				SET var_select_group = CONCAT(\'(SELECT CONCAT(name," (id:",id,")") AS name FROM traffic_sources WHERE id = group_\',group_num,\')\');
				SET varFreeName = CONCAT(\'(SELECT name FROM traffic_sources WHERE id = group_\',group_num,\')\');
			WHEN 33 THEN 
				SET var_group_title = CONCAT(\'"\',camp_id,\'"\'); 
				SET var_select_group = CONCAT(\'(SELECT CONCAT(name," (id:",id,")") AS name FROM campaigns WHERE id = group_\',group_num,\')\');
				SET varFreeName = CONCAT(\'(SELECT name AS name FROM campaigns WHERE id = group_\',group_num,\')\');
			WHEN 34 THEN 
				SET var_group_title = \'(SELECT status FROM conversion_status WHERE cnv_id = table_rp.cvr_id)\';
				SET var_select_group = CONCAT(\'group_\',group_num);
				SET varFreeName = var_select_group;
			WHEN 38 THEN 
				SET var_group_title = \'(SELECT status2 FROM conversion_status WHERE cnv_id = table_rp.cvr_id)\';
				SET var_select_group = CONCAT(\'group_\',group_num);
				SET varFreeName = var_select_group;
			WHEN 35 THEN 
				SET var_group_title = \'(table_rp.cpc)\';
				SET var_select_group = CONCAT(\'group_\',group_num);
				SET varFreeName = var_select_group;
			WHEN 36 THEN 
				SET var_group_title = \'(table_rp.pay)\';
				SET var_select_group = CONCAT(\'group_\',group_num);
				SET varFreeName = var_select_group;
			WHEN 37 THEN 
				SET var_group_title = \'(FROM_UNIXTIME(table_rp.click_time,  "%i"))\';
				SET var_select_group = CONCAT(\'group_\',group_num);
				SET varFreeName = var_select_group;
			WHEN 39 THEN 
				SET var_group_title = \'(table_rp.dop_int_2)\';
				SET var_select_group = CONCAT(\'(SELECT IF(type = 0, "Custom rotation", name) AS group_name FROM rotations WHERE id = group_\',group_num,\')\');		
				SET varFreeName = var_select_group;
			WHEN 40 THEN 
				SET var_group_title = \'(table_rp.dop_int_3)\';
				SET var_select_group = CONCAT(\'(IF(group_\',group_num,\'="1","Unique",(IF(group_\',group_num,\'="2","Unique (Campaign)","Non-unique"))))\');
				SET varFreeName = var_select_group;
			WHEN 41 THEN 
				SET var_group_title = CONCAT(\'(SELECT group_id FROM campaigns WHERE id = \',camp_id,\')\'); 
				SET var_select_group = CONCAT(\'(SELECT CONCAT(name," (id:",id,")") AS name FROM `groups` WHERE id = group_\',group_num,\')\');
				SET varFreeName =CONCAT(\'(SELECT name FROM `groups` WHERE id = group_\',group_num,\')\');
			WHEN 99999 THEN 
				SET var_group_title = \'(table_rp.id)\';
				SET var_select_group =  CONCAT(\'group_\',group_num);
				SET varFreeName = var_select_group;
			ELSE
				IF(var_group>300)THEN
					SET var_group_title = CONCAT(\'(SELECT value_id FROM clicks_tokens_lp WHERE click_id = table_rp.id AND name_id=\',(var_group-300),\' LIMIT 1)\');
					SET var_select_group = CONCAT(\'(SELECT val FROM token_value_lp WHERE id = group_\',group_num,\')\');
					SET varFreeName = var_select_group;
				ELSE
					IF(var_group>100 AND var_group<111)THEN
						SET var_group_title = CONCAT(\'IFNULL((SELECT event_val_\',(var_group-100),\' FROM clicks_events WHERE click_id = table_rp.id LIMIT 1),0)\');
						SET var_select_group =  CONCAT(\'IFNULL(group_\',group_num,\',0)\');
						SET varFreeName = var_select_group;
					END IF;
				END IF;
		END CASE;
	END;
';

$sql[]="
CREATE PROCEDURE report_update (IN var_id INT,IN var_click_time INT, IN var_camp_id INT, IN var_offer INT, IN var_path_id INT, IN var_landing_page INT, IN var_cvr_id INT, IN var_ts_id INT, IN var_rule_id INT, IN var_offer_click INT, IN var_offer_type INT, IN var_an INT, IN var_pay DECIMAL(18,8), IN var_cpc DECIMAL(18,8), IN var_geo INT, IN var_ua INT, IN var_publisher INT, IN var_table_name VARCHAR(64), IN var_ref INT, IN var_bot INT, IN var_lang INT,IN var_isp INT, IN var_country INT, IN var_geo_type INT,IN var_os INT, IN var_browser INT,IN var_model INT, IN var_brand INT,IN var_td3 INT, IN var_hour_click INT, IN var_day_week INT, IN var_unique INT, IN var_unique_camp INT, IN var_event_val_1 DECIMAL(15,5), IN var_event_val_2 DECIMAL(15,5), IN var_event_val_3 DECIMAL(15,5), IN var_event_val_4 DECIMAL(15,5), IN var_event_val_5 DECIMAL(15,5), IN var_event_val_6 DECIMAL(15,5), IN var_event_val_7 DECIMAL(15,5), IN var_event_val_8 DECIMAL(15,5), IN var_event_val_9 DECIMAL(15,5), IN var_event_val_10 DECIMAL(15,5)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.23\",\"date\":\"09.09.2020\"}*/
	DECLARE var_clicks_landing,var_cvr INT;
	IF(var_landing_page!=0) THEN 
		SET var_clicks_landing=1;
	ELSE 
		SET var_clicks_landing=0;
		SET var_offer_click=0;
	END IF;
	IF(var_cvr_id!=0)THEN 
		SET var_cvr=1;
	ELSE 
		SET var_cvr=0;
	END IF;
	SET @report_update_sql_1=CONCAT('SELECT (SELECT id FROM ', var_table_name, 
						' WHERE offer = ', var_offer,
						' AND hour_click = ', var_hour_click,
						' AND day_week = ', var_day_week,
						' AND path_id = ', var_path_id,
						' AND landing_page = ', var_landing_page,
						' AND ts_id = ', var_ts_id,
						' AND rule_id = ', var_rule_id,
						' AND offer_type = ', var_offer_type,
						' AND an = ', var_an,
						' AND isp = ', var_isp,
						' AND country = ', var_country,
						' AND geo_type = ', var_geo_type,
						' AND model = ', var_model,
						' AND brand = ', var_brand,
						' AND lang = ', var_lang,
						' AND td3 = ', var_td3,
						' AND os = ', var_os,
						' AND publisher = ', var_publisher,
						' AND referer_domain = ', var_ref,
						' AND browser = ', var_browser,' LIMIT 1) AS id_report INTO @id_report');
	PREPARE check_insrt_report FROM @report_update_sql_1;
	EXECUTE check_insrt_report;
	DEALLOCATE PREPARE check_insrt_report;
	IF(@id_report IS NULL) THEN 
		SET @report_update_sql_2 = CONCAT('INSERT INTO ',var_table_name,
							' (
									offer,hour_click,day_week,path_id,landing_page,ts_id,rule_id,
									offer_type,an,isp,country,geo_type,model,brand,lang,td3,os, 
									browser, clicks,`unique`,unique_camp,clicks_offer,clicks_landing,leads,
									event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
									spend,pay,publisher,referer_domain, bots
								) VALUES (',
								var_offer, ', ',
								var_hour_click, ', ',
								var_day_week, ', ',
								var_path_id, ', ',
								var_landing_page, ', ',
								var_ts_id, ', ',
								var_rule_id, ', ',
								var_offer_type, ', ',
								var_an, ', ',
								var_isp, ', ',
								var_country, ', ',
								var_geo_type, ', ',
								var_model, ', ',
								var_brand, ', ',
								var_lang, ', ',
								var_td3, ', ',
								var_os, ', ',
								var_browser, ', ',
								'1, ',
								var_unique, ', ',
								var_unique_camp, ', ',
								var_offer_click, ', ',
								var_clicks_landing, ', ',
								var_cvr, ', ',
								var_event_val_1, ', ',
								var_event_val_2, ', ',
								var_event_val_3, ', ',
								var_event_val_4, ', ',
								var_event_val_5, ', ',
								var_event_val_6, ', ',
								var_event_val_7, ', ',
								var_event_val_8, ', ',
								var_event_val_9, ', ',
								var_event_val_10, ', ',
								var_cpc, ', ',
								var_pay,', ',
								var_publisher,', ',
								var_ref,', ',
								var_bot,
								')');
		PREPARE insert_report FROM @report_update_sql_2;
		EXECUTE insert_report;
		DEALLOCATE PREPARE insert_report;
		SET @id_report=(SELECT LAST_INSERT_ID());
	ELSE
		SET @report_update_sql_2 = CONCAT(
				'UPDATE ',var_table_name,' SET ',
					'clicks = clicks + 1',
					', `unique` = `unique` + ',var_unique,
					', unique_camp = unique_camp + ',var_unique_camp,
					', clicks_offer = clicks_offer + ', var_offer_click,
					', clicks_landing = clicks_landing + ', var_clicks_landing,
					', bots = bots + ', var_bot,
					', leads = leads + ',var_cvr,
					', event_1 = event_1 + ',var_event_val_1,
					', event_2 = event_2 + ',var_event_val_2,
					', event_3 = event_3 + ',var_event_val_3,
					', event_4 = event_4 + ',var_event_val_4,
					', event_5 = event_5 + ',var_event_val_5,
					', event_6 = event_6 + ',var_event_val_6,
					', event_7 = event_7 + ',var_event_val_7,
					', event_8 = event_8 + ',var_event_val_8,
					', event_9 = event_9 + ',var_event_val_9,
					', event_10 = event_10 + ',var_event_val_10,
					', spend = spend + ', var_cpc,
					', pay = pay + ', var_pay,
					' WHERE id = ', @id_report
			);
		PREPARE update_report FROM @report_update_sql_2;
		EXECUTE update_report;
		DEALLOCATE PREPARE update_report;
	END IF;
	UPDATE clicks_map SET rc = @id_report, camp_id = var_camp_id WHERE click_id=var_id;
END;
";

$sql[]="
CREATE PROCEDURE report_update_ip (IN var_id INT, IN var_click_time INT, IN var_camp_id INT, IN var_offer INT, IN var_path_id INT, IN var_landing_page INT, IN var_cvr_id INT, IN var_ts_id INT, IN var_rule_id INT, IN var_offer_click INT, IN var_offer_type INT, IN var_an INT, IN var_pay DECIMAL(18,8), IN var_cpc DECIMAL(18,8), IN var_geo INT, IN var_ua INT, IN var_publisher INT, IN var_table_name VARCHAR(64), IN var_ip_1 INT, IN var_ip_2 INT, IN var_ip_3 INT, IN var_ip_4 INT, IN var_ip_text INT, IN var_ref INT, IN var_bot INT, IN var_lang INT, IN var_isp INT, IN var_country INT, IN var_geo_type INT, IN var_hour_click INT, IN var_unique INT, IN var_unique_camp INT, IN var_event_val_1 DECIMAL(15,5), IN var_event_val_2 DECIMAL(15,5), IN var_event_val_3 DECIMAL(15,5), IN var_event_val_4 DECIMAL(15,5), IN var_event_val_5 DECIMAL(15,5), IN var_event_val_6 DECIMAL(15,5), IN var_event_val_7 DECIMAL(15,5), IN var_event_val_8 DECIMAL(15,5), IN var_event_val_9 DECIMAL(15,5), IN var_event_val_10 DECIMAL(15,5)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.2\",\"date\":\"18.10.2019\"}*/
	DECLARE var_clicks_landing,var_cvr INT;
	IF(var_landing_page!=0) THEN 
		SET var_clicks_landing=1;
	ELSE 
		SET var_clicks_landing=0;
		SET var_offer_click=0;
	END IF;	
	IF(var_cvr_id!=0)THEN 
		SET var_cvr=1; 
	ELSE 
		SET var_cvr=0;
	END IF;
	SET @report_update_ip_sql_1=CONCAT('SELECT (SELECT id FROM ', var_table_name, 
						' WHERE offer = ', var_offer, 
						' AND hour_click = ', var_hour_click,
						' AND path_id = ', var_path_id,
						' AND landing_page = ', var_landing_page,
						' AND ts_id = ', var_ts_id,
						' AND rule_id = ', var_rule_id,
						' AND offer_type = ', var_offer_type,
						' AND an = ', var_an,
						' AND isp = ', var_isp,
						' AND country = ', var_country,
						' AND geo_type = ', var_geo_type,			
						' AND lang = ', var_lang,
						' AND publisher = ', var_publisher,
						' AND ip_1 = ', var_ip_1,
						' AND ip_2 = ', var_ip_2,
						' AND ip_3 = ', var_ip_3,
						' AND ip_4 = ', var_ip_4, ' LIMIT 1) AS id_report INTO @id_report');
	PREPARE check_insrt_report FROM @report_update_ip_sql_1;
	EXECUTE check_insrt_report;
	DEALLOCATE PREPARE check_insrt_report;
	IF(@id_report IS NULL) THEN 
		SET @report_update_ip_sql_2 = CONCAT('INSERT INTO ',var_table_name,
							' (
									offer,hour_click,path_id,landing_page,ts_id,rule_id,
									offer_type,an,isp,country,geo_type,lang,clicks,`unique`,
									unique_camp,clicks_offer,clicks_landing,leads,
									event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
									spend,pay,ip_1,ip_2,ip_3,ip_4,ip_5,ip_6,publisher, bots
								) VALUES (',
								var_offer, ', ',
								var_hour_click, ', ',
								var_path_id, ', ',
								var_landing_page, ', ',
								var_ts_id, ', ',
								var_rule_id, ', ',
								var_offer_type, ', ',
								var_an, ', ',
								var_isp, ', ',
								var_country, ', ',
								var_geo_type, ', ',
								var_lang, ', ',
								'1, ',
								var_unique, ', ',
								var_unique_camp, ', ',
								var_offer_click, ', ',
								var_clicks_landing, ', ',
								var_cvr, ', ',
								var_event_val_1, ', ',
								var_event_val_2, ', ',
								var_event_val_3, ', ',
								var_event_val_4, ', ',
								var_event_val_5, ', ',
								var_event_val_6, ', ',
								var_event_val_7, ', ',
								var_event_val_8, ', ',
								var_event_val_9, ', ',
								var_event_val_10, ', ',
								var_cpc, ', ',
								var_pay, ', ',
								var_ip_1, ', ',
								var_ip_2, ', ',
								var_ip_3, ', ',
								var_ip_4, ', ',
								CONCAT(var_ip_2,var_ip_3),', ',
								CONCAT(var_ip_2,var_ip_3,var_ip_4),', ',
								var_publisher,', ',
								var_bot,
								')');
		PREPARE insert_report FROM @report_update_ip_sql_2;
		EXECUTE insert_report;
		DEALLOCATE PREPARE insert_report;
		SET @id_report=(SELECT LAST_INSERT_ID());
	ELSE
		SET @report_update_ip_sql_2 = CONCAT(
				'UPDATE ',var_table_name,' SET ',
					'clicks = clicks + 1',
					', `unique` = `unique` + ',var_unique,
					', unique_camp = unique_camp + ',var_unique_camp,
					', clicks_offer = clicks_offer + ', var_offer_click,
					', clicks_landing = clicks_landing + ', var_clicks_landing,
					', bots = bots + ', var_bot,
					', leads = leads + ',var_cvr,
					', event_1 = event_1 + ',var_event_val_1,
					', event_2 = event_2 + ',var_event_val_2,
					', event_3 = event_3 + ',var_event_val_3,
					', event_4 = event_4 + ',var_event_val_4,
					', event_5 = event_5 + ',var_event_val_5,
					', event_6 = event_6 + ',var_event_val_6,
					', event_7 = event_7 + ',var_event_val_7,
					', event_8 = event_8 + ',var_event_val_8,
					', event_9 = event_9 + ',var_event_val_9,
					', event_10 = event_10 + ',var_event_val_10,
					', spend = spend + ', var_cpc,
					', pay = pay + ', var_pay,
					' WHERE id = ', @id_report
			);
		PREPARE update_report FROM @report_update_ip_sql_2;
		EXECUTE update_report;
		DEALLOCATE PREPARE update_report;
	END IF;
	UPDATE clicks_map SET rc_ip = @id_report, camp_id = var_camp_id WHERE click_id=var_id;
END;
";

$sql[]="
CREATE PROCEDURE report_update_token (IN var_id INT, IN var_click_time INT, IN var_camp_id INT, IN var_offer INT, IN var_path_id INT, IN var_landing_page INT, IN var_cvr_id INT, IN var_ts_id INT, IN var_rule_id INT, IN var_offer_click INT, IN var_offer_type INT, IN var_an INT, IN var_pay DECIMAL(18,8), IN var_cpc DECIMAL(18,8), IN var_geo INT, IN var_table_name VARCHAR(64), IN var_bot INT, IN var_isp INT, IN var_country INT, IN var_geo_type INT, IN var_hour_click INT, IN var_day_week INT, IN var_unique INT, IN var_unique_camp INT, IN var_event_val_1 DECIMAL(15,5), IN var_event_val_2 DECIMAL(15,5), IN var_event_val_3 DECIMAL(15,5), IN var_event_val_4 DECIMAL(15,5), IN var_event_val_5 DECIMAL(15,5), IN var_event_val_6 DECIMAL(15,5), IN var_event_val_7 DECIMAL(15,5), IN var_event_val_8 DECIMAL(15,5), IN var_event_val_9 DECIMAL(15,5), IN var_event_val_10 DECIMAL(15,5)) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.23\",\"date\":\"09.09.2020\"}*/
	DECLARE var_clicks_landing,var_cvr INT;
	DECLARE var_t1, var_t2, var_t3, var_t4, var_t5, var_t6, var_t7, var_t8, var_t9, var_t10 INT DEFAULT 0;
	IF((SELECT COUNT(*) FROM clicks_tokens WHERE click_id = var_id)>0) THEN
		SELECT  t1,t2,t3,t4,t5,t6,t7,t8,t9,t10
			INTO var_t1,var_t2,var_t3,var_t4,var_t5,var_t6,var_t7,var_t8,var_t9,var_t10
			FROM clicks_tokens
			WHERE click_id = var_id LIMIT 0,1;
	END IF;
	IF(var_landing_page!=0) THEN 
		SET var_clicks_landing=1;
	ELSE 
		SET var_clicks_landing=0;
		SET var_offer_click=0;
	END IF;
	IF(var_cvr_id!=0)THEN 
		SET var_cvr=1; 
	ELSE 
		SET var_cvr=0;
	END IF;
	SET @report_update_token_sql_1=CONCAT('SELECT (SELECT id FROM ', var_table_name, 
						' WHERE offer = ', var_offer,
						' AND hour_click = ', var_hour_click,
						' AND day_week = ', var_day_week,
						' AND path_id = ', var_path_id,
						' AND landing_page = ', var_landing_page,
						' AND ts_id = ', var_ts_id,
						' AND rule_id = ', var_rule_id,
						' AND offer_type = ', var_offer_type,
						' AND an = ', var_an,
						' AND isp = ', var_isp,
						' AND t1 = ', var_t1,
						' AND t2 = ', var_t2,
						' AND t3 = ', var_t3,
						' AND t4 = ', var_t4,
						' AND t5 = ', var_t5,
						' AND t6 = ', var_t6,
						' AND t7 = ', var_t7,
						' AND t8 = ', var_t8,
						' AND t9 = ', var_t9,
						' AND t10 = ', var_t10,
						' AND geo_type = ', var_geo_type,
						' AND country = ', var_country,' LIMIT 1) AS id_report INTO @id_report');
	IF(@report_update_token_sql_1 IS NOT NULL)THEN
		PREPARE check_insrt_report FROM @report_update_token_sql_1;
		EXECUTE check_insrt_report;
		DEALLOCATE PREPARE check_insrt_report;
		IF(@id_report IS NULL) THEN 
			SET @report_update_token_sql_2 = CONCAT('INSERT INTO ',var_table_name,
								' (
									offer,hour_click,day_week,path_id,landing_page,ts_id,
									rule_id,offer_type,an,isp,country,geo_type,clicks,
									`unique`,unique_camp,clicks_offer,clicks_landing,leads,
									event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
									spend,pay,t1,t2,t3,t4,t5,t6,t7,t8,t9,t10, bots
								) VALUES (',
									var_offer, ', ',
									var_hour_click, ', ',
									var_day_week, ', ',
									var_path_id, ', ',
									var_landing_page, ', ',
									var_ts_id, ', ',
									var_rule_id, ', ',
									var_offer_type, ', ',
									var_an, ', ',
									var_isp, ', ',
									var_country, ', ',
									var_geo_type, ', ',
									'1, ',
									var_unique, ', ',
									var_unique_camp, ', ',
									var_offer_click, ', ',
									var_clicks_landing, ', ',
									var_cvr, ', ',
									var_event_val_1, ', ',
									var_event_val_2, ', ',
									var_event_val_3, ', ',
									var_event_val_4, ', ',
									var_event_val_5, ', ',
									var_event_val_6, ', ',
									var_event_val_7, ', ',
									var_event_val_8, ', ',
									var_event_val_9, ', ',
									var_event_val_10, ', ',
									var_cpc, ', ',
									var_pay,', ',
									var_t1,', ',
									var_t2,', ',
									var_t3,', ',
									var_t4,', ',
									var_t5,', ',
									var_t6,', ',
									var_t7,', ',
									var_t8,', ',
									var_t9,', ',
									var_t10,', ',
									var_bot,
									')');
			PREPARE insert_report FROM @report_update_token_sql_2;
			EXECUTE insert_report;
			DEALLOCATE PREPARE insert_report;
			SET @id_report=(SELECT LAST_INSERT_ID());
		ELSE
			SET @report_update_token_sql_2 = CONCAT(
					'UPDATE ',var_table_name,' SET ',
						'clicks = clicks + 1',
						', `unique` = `unique` + ',var_unique,
						', unique_camp = unique_camp + ',var_unique_camp,
						', clicks_offer = clicks_offer + ', var_offer_click,
						', clicks_landing = clicks_landing + ', var_clicks_landing,
						', leads = leads + ',var_cvr,
						', event_1 = event_1 + ',var_event_val_1,
						', event_2 = event_2 + ',var_event_val_2,
						', event_3 = event_3 + ',var_event_val_3,
						', event_4 = event_4 + ',var_event_val_4,
						', event_5 = event_5 + ',var_event_val_5,
						', event_6 = event_6 + ',var_event_val_6,
						', event_7 = event_7 + ',var_event_val_7,
						', event_8 = event_8 + ',var_event_val_8,
						', event_9 = event_9 + ',var_event_val_9,
						', event_10 = event_10 + ',var_event_val_10,
						', bots = bots + ',var_bot,
						', spend = spend + ', var_cpc,
						', pay = pay + ', var_pay,
						' WHERE id = ', @id_report
				);
			PREPARE update_report FROM @report_update_token_sql_2;
			EXECUTE update_report;
			DEALLOCATE PREPARE update_report;
		END IF;
	END IF;
	UPDATE clicks_map SET rc_t = @id_report, camp_id = var_camp_id WHERE click_id=var_id;
END;
";

$sql[]="
CREATE PROCEDURE report_upload (IN var_group_1 INT, IN var_group_2 INT, IN var_group_3 INT, IN camp_id INT, IN date_type INT, IN report_table VARCHAR(32), IN emulation_mode INT) BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.23\",\"date\":\"26.09.2019\"}*/
	DECLARE type_report VARCHAR(10);
	DECLARE time_client DATETIME;
	DECLARE var_table_name VARCHAR(128);
	DECLARE count_date INT(3);
	DECLARE var_group_title_1,var_group_title_2,var_group_title_3 TEXT DEFAULT '';
	DECLARE var_select_group_1,var_select_group_2,var_select_group_3 TEXT DEFAULT '';
	DECLARE sql_group_select LONGTEXT DEFAULT '';
	DECLARE i INT(9);
	DECLARE temp_date_type INT;
	DECLARE check_table INT;
	DECLARE check_report INT DEFAULT 0;
	DECLARE sql_tr_temp LONGTEXT DEFAULT '';
	DECLARE sql_tr LONGTEXT DEFAULT '';
	DECLARE sql_TRUNCATE TEXT DEFAULT '';
	DECLARE name_group_1,name_group_2,name_group_3 TEXT DEFAULT '';
	DECLARE sql_all_report,sql_group1,sql_group2 LONGTEXT DEFAULT '';
	SET type_report='';
	IF(var_group_1>280 OR var_group_2>280 OR var_group_3>280)THEN
		SET type_report ='token_';
	END IF;
	IF(var_group_1=7 OR var_group_2=7 OR var_group_3=7)THEN
		SET type_report ='ip_';
	END IF;
	IF(var_group_1=8 OR var_group_2=8 OR var_group_3=8)THEN
		SET type_report ='ip_';
	END IF;
	IF(var_group_1=9 OR var_group_2=9 OR var_group_3=9)THEN
		SET type_report ='ip_';
	END IF;
	CALL time_convert(NOW(),time_client);
	CASE date_type
		WHEN 1 THEN 
			SET var_table_name = CONCAT('report_camp_',type_report,camp_id,'_', DATE_FORMAT(time_client,  '%d%m%Y'));
			SET count_date = 1;
		WHEN 2 THEN 
			SET var_table_name = CONCAT('report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL 1 DAY),  '%d%m%Y'));
			SET count_date = 1;
		WHEN 3 THEN 
			SET count_date = 7;
		WHEN 11 THEN 
			SET count_date=DATE_FORMAT(time_client, '%w');
		WHEN 4 THEN 
			SET count_date = 14;
		WHEN 5 THEN 
			SET count_date = DATE_FORMAT(time_client,  '%e');
		WHEN 6 THEN 
			SET var_table_name = CONCAT('month_report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL 1 MONTH),  '%m%Y'));
			SET count_date = 1;
		WHEN 7 THEN 
			SET count_date = DATE_FORMAT(time_client,  '%c');
		WHEN 8 THEN 
			SET count_date = 13;
		WHEN 9 THEN 
			SET count_date = 64;
	END CASE;
	CALL report_select_group(1, var_group_1, camp_id, type_report, '', var_group_title_1, var_select_group_1, name_group_1);
	CALL report_select_group(2, var_group_2, camp_id, type_report, '', var_group_title_2, var_select_group_2, name_group_2);
	CALL report_select_group(3, var_group_3, camp_id, type_report, '', var_group_title_3, var_select_group_3, name_group_3);
	SET sql_group_select=CONCAT('SELECT 
			sum(clicks) AS clicks,
			sum(bots) AS bots,
			sum(clicks_offer) AS lp_clicks,
			sum(clicks_landing) AS lp_views,
			sum(leads) AS leads,
			sum(spend) AS cost,
			sum(pay) AS revenue,
			sum(`unique`) AS unique_clicks,
			sum(unique_camp) AS unique_camp_clicks,
			sum(event_1) AS event_1,
			sum(event_2) AS event_2,
			sum(event_3) AS event_3,
			sum(event_4) AS event_4,
			sum(event_5) AS event_5,
			sum(event_6) AS event_6,
			sum(event_7) AS event_7,
			sum(event_8) AS event_8,
			sum(event_9) AS event_9,
			sum(event_10) AS event_10,
			',var_group_title_1,' AS group_1,
			',var_group_title_2,' AS group_2,
			',var_group_title_3,' AS group_3
		FROM
	');
	SET	temp_date_type=date_type;
	WHILE count_date > 0 DO
		SET count_date = count_date - 1;
		IF(temp_date_type = 3 OR temp_date_type = 11 OR temp_date_type = 4 OR temp_date_type = 5)THEN
			SET var_table_name = CONCAT('report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL count_date DAY),  '%d%m%Y'));
		ELSE
			CASE temp_date_type
				WHEN 7 THEN 
					IF(count_date = 0) THEN
						SET count_date = DATE_FORMAT(time_client,  '%e');
						SET temp_date_type = 5;
						SET var_table_name = '0';
					ELSE
						SET var_table_name = CONCAT('month_report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL count_date MONTH),  '%m%Y'));
					END IF;
				WHEN 8 THEN 
					IF(count_date>0)THEN
						IF(count_date<10)THEN
							SET var_table_name = CONCAT('month_report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL 1 YEAR),  CONCAT('0',count_date,'%Y')));
						ELSE
							SET var_table_name = CONCAT('month_report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL 1 YEAR),  CONCAT(count_date,'%Y')));
						END IF;
					ELSE
						SET var_table_name = '0';
					END IF;
				WHEN 9 THEN 
					IF(count_date = 0) THEN
						SET count_date = DATE_FORMAT(time_client,  '%e');
						SET temp_date_type = 5;
						SET var_table_name = '0';
					ELSE
						SET var_table_name = CONCAT('month_report_camp_',type_report,camp_id,'_', DATE_FORMAT((time_client- INTERVAL count_date MONTH),  '%m%Y'));
					END IF;
				ELSE
					SET var_table_name = var_table_name;
			END CASE;
		END IF;
		SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name AND table_schema = database());
		IF(check_table>0 AND var_table_name!='0')THEN
			SET check_report=check_report+1;
			SET sql_tr_temp=CONCAT('(',sql_group_select,var_table_name,' AS table_rp GROUP BY ',name_group_1,',',name_group_2,',',name_group_3,')');
			SET sql_tr=CONCAT(sql_tr,sql_tr_temp,' UNION ALL ');
		END IF;
	END WHILE;
	IF(RIGHT(sql_tr,4) = 'ALL ')THEN
		SET sql_tr = LEFT(sql_tr, (LENGTH(sql_tr)-11));
	END IF;
	SET sql_TRUNCATE=CONCAT('TRUNCATE ',report_table);
	SET sql_all_report=CONCAT('
		INSERT INTO `',report_table,'`(
				`level`,`group_1`,`group_2`,`group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`
			) 
			SELECT 3,group_1,group_2,group_3, 
				SUM(clicks),
				SUM(bots),
				SUM(lp_clicks),
				SUM(lp_views),
				SUM(leads),
				SUM(cost),
				SUM(revenue),
				sum(unique_clicks),
				sum(unique_camp_clicks),
				sum(event_1),
				sum(event_2),
				sum(event_3),
				sum(event_4),
				sum(event_5),
				sum(event_6),
				sum(event_7),
				sum(event_8),
				sum(event_9),
				sum(event_10)
			FROM(
				',sql_tr,'
			) AS report
			GROUP BY
			',name_group_1,',',name_group_2,',',name_group_3,';
	');
	IF(var_group_2=1 AND var_group_3=1)THEN
		SET sql_group1=CONCAT('
			UPDATE ',report_table,' SET level = 1;
		');
		SET sql_group2='0';
	ELSE
		SET sql_group1=CONCAT('
			INSERT INTO `',report_table,'`(
				`level`,`group_1`,`group_2`,`group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`
			) 
			SELECT 1,group_1, 0,0,
				SUM(clicks),
				SUM(bots),
				SUM(lp_clicks),
				SUM(lp_views),
				SUM(leads),
				SUM(cost),
				SUM(revenue),
				sum(unique_clicks),
				sum(unique_camp_clicks),
				sum(event_1),
				sum(event_2),
				sum(event_3),
				sum(event_4),
				sum(event_5),
				sum(event_6),
				sum(event_7),
				sum(event_8),
				sum(event_9),
				sum(event_10) 
			FROM 
			',report_table,'
			GROUP BY
			group_1;
		');
		IF(var_group_3=1)THEN
			SET sql_group2=CONCAT('
				UPDATE ',report_table,' SET level = 2 WHERE level != 1;
			');
		ELSE
			SET sql_group2=CONCAT('
				INSERT INTO `',report_table,'`(
					`level`,`group_1`,`group_2`,`group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`
				) 
				SELECT 2,group_1, group_2,0,
					SUM(clicks),
					SUM(bots),
					SUM(lp_clicks),
					SUM(lp_views),
					SUM(leads),
					SUM(cost),
					SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10)
				FROM 
				',report_table,'
				WHERE level!=1
				GROUP BY
				group_1,
				group_2;
			');
		END IF;
	END IF;
	IF(check_report>0)THEN
		CASE emulation_mode
			WHEN 0 THEN 
				SET @sql_TRUNCATE=sql_TRUNCATE;
				PREPARE reports_TRUNCATE FROM @sql_TRUNCATE;
				EXECUTE reports_TRUNCATE;
				DEALLOCATE PREPARE reports_TRUNCATE;
				
				SET @report_all_sql=sql_all_report;
				PREPARE reports FROM @report_all_sql;
				EXECUTE reports;
				DEALLOCATE PREPARE reports;
				
				SET @sql_group1=sql_group1;
				PREPARE sql_group1 FROM @sql_group1;
				EXECUTE sql_group1;
				DEALLOCATE PREPARE sql_group1;
				IF(sql_group2!='0')THEN
					SET @sql_group2=sql_group2;
					PREPARE sql_group2 FROM @sql_group2;
					EXECUTE sql_group2;
					DEALLOCATE PREPARE sql_group2;
				END IF;
				SELECT var_select_group_1,var_select_group_2,var_select_group_3, check_report AS status;
			WHEN 1 THEN 
				SELECT sql_TRUNCATE, sql_all_report, sql_tr, sql_group1, sql_group2, var_select_group_1, var_select_group_2, var_select_group_3, check_report AS status, name_group_1,name_group_2,name_group_3;
			WHEN 2 THEN 
				SELECT sql_TRUNCATE, sql_all_report, sql_tr, sql_group1, sql_group2, var_select_group_1, var_select_group_2, var_select_group_3, check_report AS status, name_group_1,name_group_2,name_group_3;
		END CASE;
	ELSE
		IF(emulation_mode!=2)THEN
			SET @sql_TRUNCATE=sql_TRUNCATE;
			PREPARE reports_TRUNCATE FROM @sql_TRUNCATE;
			EXECUTE reports_TRUNCATE;
			DEALLOCATE PREPARE reports_TRUNCATE;
		END IF;
		SELECT 0 AS status;
	END IF;
END;
";

$sql[]='
CREATE PROCEDURE report_upload_custom(IN var_group_1 INT, IN var_group_2 INT, IN var_group_3 INT, IN var_camp_id INT, IN start_date VARCHAR(32), IN end_date VARCHAR(32),IN report_table VARCHAR(32), IN emulation_mode INT) BEGIN
	/*{"product":"Binom 1.14","version":"1.3","date":"26.09.2019"}*/
	DECLARE type_report VARCHAR(10);
	DECLARE time_client DATETIME;
	DECLARE var_table_name VARCHAR(128);
	DECLARE count_date INT(3);
	DECLARE  start_date_u, end_date_u, date_now INT DEFAULT 0;
	DECLARE i INT(9);
	DECLARE check_table INT;
	DECLARE check_report INT DEFAULT 0;
	DECLARE var_group_title_1,var_group_title_2,var_group_title_3 TEXT DEFAULT \'\';
	DECLARE var_select_group_1,var_select_group_2,var_select_group_3 TEXT DEFAULT \'\';
	DECLARE sql_tr_temp LONGTEXT DEFAULT \'\';
	DECLARE sql_tr LONGTEXT DEFAULT \'\';
	DECLARE sql_TRUNCATE TEXT DEFAULT \'\';
	DECLARE sql_group_select LONGTEXT DEFAULT \'\';
	DECLARE sql_all_report,sql_group1,sql_group2 LONGTEXT DEFAULT \'\';
	DECLARE check_start_time, check_end_time, start_hour, end_hour  INT DEFAULT 0;
	DECLARE last_check_date VARCHAR(32);
	DECLARE name_group_1,name_group_2,name_group_3 TEXT DEFAULT \'\';
	DECLARE developer_mode LONGTEXT DEFAULT \'\';
	DECLARE start_click INT DEFAULT 0;
	DECLARE varFreeName1, varFreeName2, varFreeName3 TEXT DEFAULT \'\';
	SET type_report=\'\';
	IF(var_group_1>280 OR var_group_2>280 OR var_group_3>280)THEN
		SET type_report =\'token_\';
	END IF;
	IF(var_group_1=7 OR var_group_2=7 OR var_group_3=7)THEN
		SET type_report =\'ip_\';
	END IF;
	IF(var_group_1=8 OR var_group_2=8 OR var_group_3=8)THEN
		SET type_report =\'ip_\';
	END IF;
	IF(var_group_1=9 OR var_group_2=9 OR var_group_3=9)THEN
		SET type_report =\'ip_\';
	END IF;
	CALL time_convert(NOW(),time_client);
	/*фикс лишнего перебора*/
	SET start_click=(SELECT start_camp FROM campaigns WHERE id=var_camp_id LIMIT 1);
	IF(UNIX_TIMESTAMP(start_date)<start_click)THEN
		SET start_date = FROM_UNIXTIME(start_click, \'%Y-%m-%d 00:00:00\');
	END IF;
	IF(start_click IS NOT NULL) THEN 
		SET start_date_u=UNIX_TIMESTAMP(start_date);
		IF(start_date_u IS NULL OR start_date_u<=0)THEN
			SET start_date_u=48*24*60*60;
		END IF;
		SET end_date_u=UNIX_TIMESTAMP(end_date);
		SET start_hour=FROM_UNIXTIME(start_date_u,\'%H\');
		SET end_hour=FROM_UNIXTIME(end_date_u,\'%H\');
		/*SET count_date = CEILING(((UNIX_TIMESTAMP(FROM_UNIXTIME(end_date_u,\'%Y-%m-%d 23:59:59\'))+1) - (UNIX_TIMESTAMP(FROM_UNIXTIME(start_date_u,\'%Y-%m-%d 00:00\'))))/(60*60*24));*/
		SET count_date = TIMESTAMPDIFF(DAY, FROM_UNIXTIME(start_date_u,\'%Y-%m-%d 00:00\'), FROM_UNIXTIME(end_date_u,\'%Y-%m-%d 23:59:59\'))+1;
		WHILE count_date > 0 DO
			SET count_date = count_date - 1;
			SET date_now=UNIX_TIMESTAMP(end_date- INTERVAL count_date DAY);
			CALL report_select_group(1, var_group_1, var_camp_id, type_report, date_now, var_group_title_1, var_select_group_1, name_group_1, varFreeName1);
			CALL report_select_group(2, var_group_2, var_camp_id, type_report, date_now, var_group_title_2, var_select_group_2, name_group_2, varFreeName2);
			CALL report_select_group(3, var_group_3, var_camp_id, type_report, date_now, var_group_title_3, var_select_group_3, name_group_3, varFreeName3);
			SET sql_group_select=CONCAT(\'SELECT 
					sum(clicks) AS clicks,
					sum(bots) AS bots,
					sum(clicks_offer) AS lp_clicks,
					sum(clicks_landing) AS lp_views,
					sum(leads) AS leads,
					sum(spend) AS cost,
					sum(pay) AS revenue,
					sum(`unique`) AS unique_clicks,
					sum(unique_camp) AS unique_camp_clicks,
					sum(event_1) AS event_1,
					sum(event_2) AS event_2,
					sum(event_3) AS event_3,
					sum(event_4) AS event_4,
					sum(event_5) AS event_5,
					sum(event_6) AS event_6,
					sum(event_7) AS event_7,
					sum(event_8) AS event_8,
					sum(event_9) AS event_9,
					sum(event_10) AS event_10,
					\',var_group_title_1,\' AS group_1,
					\',var_group_title_2,\' AS group_2,
					\',var_group_title_3,\' AS group_3
				FROM
			\');
			SET var_table_name = CONCAT(\'report_camp_\',type_report,var_camp_id,\'_\', DATE_FORMAT((end_date- INTERVAL count_date DAY),  \'%d%m%Y\'));
			SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name AND table_schema = database());
			IF(check_table>0 AND var_table_name!=\'0\')THEN
				SET check_report=check_report+1;
				SET last_check_date = DATE_FORMAT((end_date- INTERVAL count_date DAY),  \'%d%m%Y\');
				SET developer_mode=CONCAT(developer_mode,DATE_FORMAT((end_date- INTERVAL count_date DAY),  \'%d%m%Y\'),\'-\',FROM_UNIXTIME(start_date_u, \'%d%m%Y\'),\';\');
				IF(check_start_time=0 AND DATE_FORMAT((end_date- INTERVAL count_date DAY),  \'%d%m%Y\') = FROM_UNIXTIME(start_date_u, \'%d%m%Y\'))THEN
					SET check_start_time=1;
					SET sql_tr_temp=CONCAT(\'(\',sql_group_select,var_table_name,\' AS table_rp WHERE clicks>0 AND (hour_click>\',start_hour,\' OR hour_click=\',start_hour,\') GROUP BY \',name_group_1,\',\',name_group_2,\',\',name_group_3,\')\');
				ELSE
					SET sql_tr_temp=CONCAT(\'(\',sql_group_select,var_table_name,\' AS table_rp WHERE clicks>0 GROUP BY \',name_group_1,\',\',name_group_2,\',\',name_group_3,\')\');
				END IF;
				SET sql_tr=CONCAT(sql_tr,sql_tr_temp,\' UNION ALL \');
			END IF;
		END WHILE;
		IF(RIGHT(sql_tr,4) = \'ALL \')THEN
			SET sql_tr = LEFT(sql_tr, (LENGTH(sql_tr)-(LENGTH(name_group_1)+LENGTH(name_group_2)+LENGTH(name_group_3)+23)));
			IF(last_check_date=FROM_UNIXTIME(end_date_u, \'%d%m%Y\'))THEN
				SET sql_tr=CONCAT(sql_tr,\' AND hour_click<=\',end_hour,\' GROUP BY \',name_group_1,\',\',name_group_2,\',\',name_group_3,\')\');
			ELSE
				SET sql_tr=CONCAT(sql_tr,\' GROUP BY \',name_group_1,\',\',name_group_2,\',\',name_group_3,\')\');
			END IF;
		END IF;
		SET sql_TRUNCATE=CONCAT(\'TRUNCATE \',report_table);
		SET sql_all_report=CONCAT(\'
			INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
				SELECT 3,\',var_group_3,\',group_1,group_2,group_3, SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM(
					\',sql_tr,\'
				) AS report
				GROUP BY
				\',name_group_1,\',\',name_group_2,\',\',name_group_3,\';
		\');
		IF(var_group_2=1 AND var_group_3=1)THEN
			SET sql_group1=CONCAT(\'
				UPDATE \',report_table,\' SET level = 1, level_type=\',var_group_1,\';
			\');
			SET sql_group2=\'0\';
		ELSE
			SET sql_group1=CONCAT(\'
				INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
				SELECT 1,\',var_group_1,\',group_1, 0,0,SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM 
				\',report_table,\'
				GROUP BY
				group_1;
			\');
			IF(var_group_3=1)THEN
				SET sql_group2=CONCAT(\'
					UPDATE \',report_table,\' SET level = 2, level_type=\',var_group_2,\' WHERE level != 1;
				\');
			ELSE
				SET sql_group2=CONCAT(\'
					INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
					SELECT 2,\',var_group_2,\',group_1, group_2,0,SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM 
					\',report_table,\'
					WHERE level!=1
					GROUP BY
					group_1,
					group_2;
				\');
			END IF;
		END IF;
		IF(check_report>0)THEN
			CASE emulation_mode
				WHEN 0 THEN 
					SET @sql_TRUNCATE=sql_TRUNCATE;
					PREPARE reports_TRUNCATE FROM @sql_TRUNCATE;
					EXECUTE reports_TRUNCATE;
					DEALLOCATE PREPARE reports_TRUNCATE;
					
					SET @report_all_sql=sql_all_report;
					PREPARE reports FROM @report_all_sql;
					EXECUTE reports;
					DEALLOCATE PREPARE reports;
					
					SET @sql_group1=sql_group1;
					PREPARE sql_group1 FROM @sql_group1;
					EXECUTE sql_group1;
					DEALLOCATE PREPARE sql_group1;
					
					IF(sql_group2!=\'0\')THEN
						SET @sql_group2=sql_group2;
						PREPARE sql_group2 FROM @sql_group2;
						EXECUTE sql_group2;
						DEALLOCATE PREPARE sql_group2;
					END IF;
					SELECT var_select_group_1,var_select_group_2,var_select_group_3, check_report AS status, varFreeName1, varFreeName2, varFreeName3;
				WHEN 1 THEN 
					SELECT sql_TRUNCATE, sql_all_report, sql_tr, sql_group1, sql_group2, var_select_group_1, var_select_group_2, var_select_group_3, check_report AS status, developer_mode, name_group_1,name_group_2,name_group_3, varFreeName1, varFreeName2, varFreeName3;
				WHEN 2 THEN 
					SELECT sql_TRUNCATE, sql_all_report, sql_tr, sql_group1, sql_group2, var_select_group_1, var_select_group_2, var_select_group_3, check_report AS status, developer_mode, name_group_1,name_group_2,name_group_3, varFreeName1, varFreeName2, varFreeName3;
			END CASE;
		ELSE
			IF(emulation_mode!=2)THEN
				SET @sql_TRUNCATE=sql_TRUNCATE;
				PREPARE reports_TRUNCATE FROM @sql_TRUNCATE;
				EXECUTE reports_TRUNCATE;
				DEALLOCATE PREPARE reports_TRUNCATE;
			END IF;
			SELECT 0 AS status;
		END IF;
	ELSE
		SELECT 0 AS status;
	END IF;
END;
';

$sql[]='
	CREATE PROCEDURE report_upload_direct (IN var_group_1 INT, IN var_group_2 INT, IN var_group_3 INT, IN camp_id INT, IN start_date VARCHAR(32), IN end_date VARCHAR(32), IN report_table VARCHAR(32), IN emulation_mode INT) BEGIN
		/*{"product":"Binom 1.13","version":"1.13","date":"11.03.2019"}*/
		DECLARE type_report VARCHAR(10) DEFAULT \'direct\';
		DECLARE var_group_title_1,var_group_title_2,var_group_title_3 TEXT DEFAULT \'\';
		DECLARE var_select_group_1,var_select_group_2,var_select_group_3 TEXT DEFAULT \'\';
		DECLARE sql_all_report,sql_tr LONGTEXT DEFAULT \'\';
		DECLARE sql_group1,sql_group2,sql_TRUNCATE LONGTEXT DEFAULT \'\';
		DECLARE name_group_1,name_group_2,name_group_3 TEXT DEFAULT \'\';
		DECLARE varFreeName1, varFreeName2, varFreeName3 TEXT DEFAULT \'\';
		SET start_date=UNIX_TIMESTAMP(start_date);
		SET end_date=UNIX_TIMESTAMP(end_date);
		IF(start_date IS NULL OR start_date<=0)THEN
			SET start_date=48*24*60*60;
		END IF;
		CALL report_select_group(1, var_group_1, camp_id, type_report, \'\', var_group_title_1, var_select_group_1,name_group_1, varFreeName1);
		CALL report_select_group(2, var_group_2, camp_id, type_report, \'\', var_group_title_2, var_select_group_2,name_group_2, varFreeName2);
		CALL report_select_group(3, var_group_3, camp_id, type_report, \'\', var_group_title_3, var_select_group_3,name_group_3, varFreeName3);
		SET sql_tr=CONCAT(\'
			(SELECT 
				COUNT(*) AS clicks,
				sum(table_rp.is_bot) AS bots,
				sum(IF(table_rp.landing_page>0,table_rp.offer_click,0)) AS lp_clicks,
				sum(IF(table_rp.landing_page>0,1,0)) AS lp_views,
				sum(IF(table_rp.cvr_id>0,1,0)) AS leads,
				sum(table_rp.cpc) AS cost,
				sum(table_rp.pay) AS revenue,
				sum(IF(table_rp.dop_int_3=1,1,0)) AS unique_clicks,
				sum(IF(table_rp.dop_int_3=0,0,1)) AS unique_camp_clicks,
				sum(cle.event_val_1) AS event_1,
				sum(cle.event_val_2) AS event_2,
				sum(cle.event_val_3) AS event_3,
				sum(cle.event_val_4) AS event_4,
				sum(cle.event_val_5) AS event_5,
				sum(cle.event_val_6) AS event_6,
				sum(cle.event_val_7) AS event_7,
				sum(cle.event_val_8) AS event_8,
				sum(cle.event_val_9) AS event_9,
				sum(cle.event_val_10) AS event_10,
				\',var_group_title_1,\' AS group_1,
				\',var_group_title_2,\' AS group_2,
				\',var_group_title_3,\' AS group_3
			FROM clicks AS table_rp 
			LEFT JOIN clicks_events AS cle ON cle.click_id = table_rp.id
			WHERE table_rp.camp_id = \',camp_id,\' AND table_rp.click_time>\',start_date,\' AND table_rp.click_time<\',end_date,\'
			GROUP BY \',name_group_1,\',\',name_group_2,\',\',name_group_3,\')
		\');
		SET sql_all_report=CONCAT(\'
			INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
				SELECT 3,\',var_group_3,\',group_1,group_2,group_3, SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM(
					(
						\',sql_tr,\'
					)
				) AS report
				GROUP BY
				\',name_group_1,\',\',name_group_2,\',\',name_group_3,\';
		\');
		IF(var_group_2=1 AND var_group_3=1)THEN
			SET sql_group1=CONCAT(\'
				UPDATE \',report_table,\' SET level = 1, level_type=\',var_group_1,\';
			\');
			SET sql_group2=\'0\';
		ELSE
			SET sql_group1=CONCAT(\'
				INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
				SELECT 1,\',var_group_1,\',group_1, 0,0,SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM 
				\',report_table,\'
				GROUP BY
				group_1;
			\');
			IF(var_group_3=1)THEN
				SET sql_group2=CONCAT(\'
					UPDATE \',report_table,\' SET level = 2, level_type=\',var_group_2,\' WHERE level != 1;
				\');
			ELSE
				SET sql_group2=CONCAT(\'
					INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
					SELECT 2,\',var_group_2,\',group_1, group_2,0,SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM 
					\',report_table,\'
					WHERE level!=1
					GROUP BY
					group_1,
					group_2;
				\');
			END IF;
		END IF;
		SET sql_TRUNCATE=CONCAT(\'TRUNCATE \',report_table);
		SET sql_all_report=CONCAT(\'
			INSERT INTO `\',report_table,\'`(`level`,`level_type`,`group_1`, `group_2`, `group_3`, `clicks`,`bots`,`lp_clicks`,`lp_views`,`leads`,`cost`,`revenue`,`unique_clicks`,`unique_camp_clicks`,`event_1`,`event_2`,`event_3`,`event_4`,`event_5`,`event_6`,`event_7`,`event_8`,`event_9`,`event_10`) 
				SELECT 3,\',var_group_3,\',group_1,group_2,group_3, SUM(clicks), SUM(bots), SUM(lp_clicks), SUM(lp_views), SUM(leads), SUM(cost), SUM(revenue),
					sum(unique_clicks),
					sum(unique_camp_clicks),
					sum(event_1),
					sum(event_2),
					sum(event_3),
					sum(event_4),
					sum(event_5),
					sum(event_6),
					sum(event_7),
					sum(event_8),
					sum(event_9),
					sum(event_10) FROM(
					\',sql_tr,\'
				) AS report
				GROUP BY
				group_1,group_2,group_3;
		\');
		CASE emulation_mode
			WHEN 0 THEN 
				SET @sql_TRUNCATE=sql_TRUNCATE;
				PREPARE reports_TRUNCATE FROM @sql_TRUNCATE;
				EXECUTE reports_TRUNCATE;
				DEALLOCATE PREPARE reports_TRUNCATE;
				
				SET @report_all_sql=sql_all_report;
				PREPARE reports FROM @report_all_sql;
				EXECUTE reports;
				DEALLOCATE PREPARE reports;
				
				SET @sql_group1=sql_group1;
				PREPARE sql_group1 FROM @sql_group1;
				EXECUTE sql_group1;
				DEALLOCATE PREPARE sql_group1;
				IF(sql_group2!=\'0\')THEN
					SET @sql_group2=sql_group2;
					PREPARE sql_group2 FROM @sql_group2;
					EXECUTE sql_group2;
					DEALLOCATE PREPARE sql_group2;
				END IF;
				SELECT var_select_group_1,var_select_group_2,var_select_group_3, 1 AS status, varFreeName1, varFreeName2, varFreeName3;
			WHEN 1 THEN 
				SELECT sql_TRUNCATE, sql_all_report, sql_tr, sql_group1, sql_group2, var_select_group_1, var_select_group_2, var_select_group_3, 1 AS status, name_group_1,name_group_2,name_group_3, varFreeName1, varFreeName2, varFreeName3;
			WHEN 2 THEN 
				SELECT sql_TRUNCATE, sql_all_report, sql_tr, sql_group1, sql_group2, var_select_group_1, var_select_group_2, var_select_group_3, 1 AS status, name_group_1,name_group_2,name_group_3, varFreeName1, varFreeName2, varFreeName3;
		END CASE;
	END;
';

//115
$sql[]="
CREATE PROCEDURE report_load (IN start_click_id INT, IN last_click_id INT, IN reload_stats INT) report_load: BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.1\",\"date\":\"15.10.2018\"}*/
	DECLARE sql_line, sql_time, var_timeout, sql_errors INT DEFAULT 0;
	DECLARE sql_table VARCHAR(255) DEFAULT '0';
	DECLARE
		last_id,check_table,i,var_ip_1,var_ip_2,var_ip_3,var_ip_4,var_bot,check_agent,
		var_id,var_click_time,var_camp_id,var_offer,var_path_id,var_landing_page,var_cvr_id,
		var_ts_id,var_rule_id,var_offer_click,var_offer_type,var_an,var_geo,var_ua,
		var_publisher,var_ref,var_token,var_dop_int,var_dop_int_2,var_day_week,var_hour_click,
		var_isp, var_country, var_geo_type, var_os, var_browser, var_model, var_brand, var_td3,
		var_cl_map, var_unique, var_unique_camp
	INT;
	DECLARE
		var_table_name,var_table_name_ip,var_ip_text,var_table_name_token
	VARCHAR(64);
	DECLARE log_id, flag INT DEFAULT 0;
	DECLARE var_ip BIGINT;
	DECLARE var_pay, var_cpc DECIMAL(14,5);
	DECLARE
		var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
		var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10
	DECIMAL(15,5);
	DECLARE time_client DATETIME;
	DECLARE cursor_1 CURSOR FOR
		SELECT
			cl.id, cl.click_time, cl.camp_id, cl.offer, cl.path_id, cl.landing_page,
			cl.cvr_id, cl.ts_id, cl.rule_id, cl.offer_click, cl.offer_type, cl.an,
			cl.pay, cl.cpc, cl.geo, cl.ua, cl.publisher, cl.ip, cl.referer_domain,
			(SELECT tokens FROM traffic_sources WHERE id = cl.ts_id) AS token,
			cl.is_bot, cl.dop_int, cl.dop_int_2, cl.dop_int_3,
			FROM_UNIXTIME(cl.click_time, '%w'),
			HOUR(FROM_UNIXTIME(cl.click_time, '%Y-%m-%d %H:%i:%S')),
			IF(cl.ip<1000000000,IF(bg6.isp_id IS NULL,0,bg6.isp_id),IF(bg4.isp_id IS NULL,0,bg4.isp_id)),
			IF(cl.ip<1000000000,IF(bg6.country_id IS NULL,0,bg6.country_id),IF(bg4.country_id IS NULL,0,bg4.country_id)),
			IF(cl.ip<1000000000,IF(bg6.cnct_id IS NULL,0,bg6.cnct_id),IF(bg4.cnct_id IS NULL,0,bg4.cnct_id)),
			IF(bdev.os IS NULL,0,bdev.os),
			IF(bdev.browser IS NULL,0,bdev.browser),
			IF(bdev.device_model_id IS NULL,0,bdev.device_model_id),
			IF(bdev.device_brand_id IS NULL,0,bdev.device_brand_id),
			IF(bdev.device_td3_id IS NULL,0,bdev.device_td3_id),
			IF(cm.click_id IS NULL,0,cm.click_id),
			event_val_1,event_val_2,event_val_3,event_val_4,event_val_5,
			event_val_6,event_val_7,event_val_8,event_val_9,event_val_10
		FROM
			temp_table_from_report_load AS cl
			LEFT JOIN base_geo_ipv4 AS bg4 ON bg4.id = cl.geo
			LEFT JOIN base_geo_ipv6 AS bg6 ON bg6.id = cl.geo
			LEFT JOIN user_agents AS bdev ON bdev.id = cl.ua
			LEFT JOIN clicks_map AS cm ON cm.click_id = cl.id
		ORDER BY cl.id DESC;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	/*-----------------*/
		DECLARE EXIT HANDLER FOR 145 BEGIN
			SET sql_errors=1;
			SET sql_time=unix_timestamp()-sql_time;
			SET @error_name=CONCAT('#P26E: Table ',sql_table,' crashed (SQL Line: ',sql_line,')');
			SET @error_text=CONCAT('Load time: ',sql_time,'; Proc.parameters: start_id = ',start_click_id,'; end_id = ',last_click_id);
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,2,NOW(),@error_name,@error_text);
			IF(sql_table!='0')THEN
				IF(sql_table='showcase')THEN
					REPAIR TABLE showcase_campaigns;
					REPAIR TABLE showcase_landings;
					REPAIR TABLE showcase_networks;
					REPAIR TABLE showcase_offers;
					REPAIR TABLE showcase_rotations;
					REPAIR TABLE showcase_sources;
				ELSE
					SET @temp_sql=CONCAT('REPAIR TABLE ',sql_table,';');
					PREPARE temp_sql FROM @temp_sql;
					EXECUTE temp_sql;
					DEALLOCATE PREPARE temp_sql;
				END IF;
			END IF;
		END;
		DECLARE EXIT HANDLER FOR 1213 BEGIN
			SET sql_errors=1;
			SET sql_time=unix_timestamp()-sql_time;
			SET @error_name=CONCAT('#P21E: Deadlock #1213 (SQL Line: ',sql_line,')');
			SET @error_text=CONCAT('Load time: ',sql_time,'; Proc.parameters: start_id = ',start_click_id,'; end_id = ',last_click_id);
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,2,NOW(),@error_name,@error_text);
			CALL engine_proc_controller(2,'restart');
		END;
		DECLARE EXIT HANDLER FOR 1614 BEGIN
			SET sql_errors=1;
			SET sql_time=unix_timestamp()-sql_time;
			SET @error_name=CONCAT('#P22E: Deadlock #1614 (SQL Line: ',sql_line,')');
			SET @error_text=CONCAT('Load time: ',sql_time,'; Proc.parameters: start_id = ',start_click_id,'; end_id = ',last_click_id);
			INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,2,NOW(),@error_name,@error_text);
			CALL engine_proc_controller(2,'restart');
		END;
		DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN
			IF(sql_errors=0)THEN
				SET sql_errors=1;
				SET sql_time=unix_timestamp()-sql_time;
				SET @error_name=CONCAT('#P23E: Unknown error (SQL Line: ',sql_line,')');
				SET @error_text=CONCAT('Load time: ',sql_time,'; Proc.parameters: start_id = ',start_click_id,'; end_id = ',last_click_id);
				INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,2,NOW(),@error_name,@error_text);
			END IF;
			SET sql_errors=1;
		END;
	/*-----------------*/
	SET sql_time=unix_timestamp();
	SET sql_line=1;
	SET var_timeout=45;
	DO SLEEP(FLOOR(1000 + RAND() * (250 - 1000))/1000);
	IF((SELECT COUNT(*) FROM engine_process_instant WHERE `type` = 2 AND proc_id!=0)=0)THEN
		SET sql_line=2;
		UPDATE temp_table SET `is_reload` = 2 WHERE `is_reload`=1;
		DROP TABLE IF EXISTS temp_table_from_report_load;
		SET sql_line=3;
		CREATE TEMPORARY TABLE temp_table_from_report_load
			SELECT
				cl.*,
				IF(ce.event_val_1 IS NULL,0,ce.event_val_1) AS event_val_1,
				IF(ce.event_val_2 IS NULL,0,ce.event_val_2) AS event_val_2,
				IF(ce.event_val_3 IS NULL,0,ce.event_val_3) AS event_val_3,
				IF(ce.event_val_4 IS NULL,0,ce.event_val_4) AS event_val_4,
				IF(ce.event_val_5 IS NULL,0,ce.event_val_5) AS event_val_5,
				IF(ce.event_val_6 IS NULL,0,ce.event_val_6) AS event_val_6,
				IF(ce.event_val_7 IS NULL,0,ce.event_val_7) AS event_val_7,
				IF(ce.event_val_8 IS NULL,0,ce.event_val_8) AS event_val_8,
				IF(ce.event_val_9 IS NULL,0,ce.event_val_9) AS event_val_9,
				IF(ce.event_val_10 IS NULL,0,ce.event_val_10) AS event_val_10
			FROM
				clicks AS cl
			LEFT JOIN clicks_events AS ce ON ce.click_id = cl.id
			WHERE
				cl.id > start_click_id AND cl.id<=last_click_id
			UNION
			SELECT
				cl.*,
				IF(ce.event_val_1 IS NULL,0,ce.event_val_1) AS event_val_1,
				IF(ce.event_val_2 IS NULL,0,ce.event_val_2) AS event_val_2,
				IF(ce.event_val_3 IS NULL,0,ce.event_val_3) AS event_val_3,
				IF(ce.event_val_4 IS NULL,0,ce.event_val_4) AS event_val_4,
				IF(ce.event_val_5 IS NULL,0,ce.event_val_5) AS event_val_5,
				IF(ce.event_val_6 IS NULL,0,ce.event_val_6) AS event_val_6,
				IF(ce.event_val_7 IS NULL,0,ce.event_val_7) AS event_val_7,
				IF(ce.event_val_8 IS NULL,0,ce.event_val_8) AS event_val_8,
				IF(ce.event_val_9 IS NULL,0,ce.event_val_9) AS event_val_9,
				IF(ce.event_val_10 IS NULL,0,ce.event_val_10) AS event_val_10
			FROM
			temp_table AS temp
			LEFT JOIN clicks AS cl ON cl.id = temp.click_id
			LEFT JOIN clicks_events AS ce ON ce.click_id = cl.id
			WHERE
				temp.is_reload=2;
		SET sql_line=4;
		IF(reload_stats=0)THEN
			SET sql_line=5;
			INSERT INTO engine_process(`type`, start_date, int_var, cnt) VALUES (2,UNIX_TIMESTAMP(),last_click_id, (last_click_id-start_click_id));
			SET log_id=(SELECT LAST_INSERT_ID());
			INSERT INTO engine_process_instant(proc_id,`type`) VALUES (log_id,2);
		END IF;
		SET sql_line=6;
		IF((SELECT COUNT(*) FROM temp_table_from_report_load)>0)THEN
			SET sql_line=7;
			CALL time_convert(NOW(),time_client);
			OPEN cursor_1;
				REPEAT
					FETCH cursor_1 INTO var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page,
										var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an,
										var_pay, var_cpc, var_geo, var_ua, var_publisher, var_ip, var_ref, var_token,
										var_bot, var_dop_int, var_dop_int_2, var_unique, var_day_week, var_hour_click, var_isp,
										var_country, var_geo_type, var_os, var_browser, var_model, var_brand, var_td3, var_cl_map,
										var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
										var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
					IF NOT flag THEN
						IF((unix_timestamp()-sql_time)>var_timeout)THEN
							SET sql_errors=1;
							SET sql_time=unix_timestamp()-sql_time;
							SET @error_name=CONCAT('#P25E: Timeout (SQL Line: 0)');
							SET @error_text=CONCAT('Load time: ',sql_time,'; Proc.parameters: start_id = ',start_click_id,'; end_id = ',last_click_id);
							INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,2,NOW(),@error_name,@error_text);
							CALL engine_proc_controller(2,'lowspeed');
							CALL engine_proc_controller(2,'restart');
							LEAVE report_load;
						END IF;
						SET sql_line=8;
						IF(var_unique = 1)THEN
							SET var_unique_camp = 1;
						ELSE
							IF(var_unique=2)THEN
								SET var_unique_camp = 1;
								SET var_unique = 0;
							ELSE
								SET var_unique_camp = 0;
								SET var_unique = 0;
							END IF;
						END IF;
						SET sql_line=9;
						IF(var_cl_map=0)THEN
							INSERT INTO clicks_map(click_id, click_time, rc, rc_ip, rc_t, cpc) VALUES (var_id, var_click_time, 0, 0, 0,var_cpc);
						END IF;
						IF(var_ip<1000000000)THEN
							SET var_ip_text=var_ip;
							SET var_ip_1=0;
							SET var_ip_2=0;
							SET var_ip_3=0;
							SET var_ip_4=var_ip;
						ELSE
							CALL ip_convert(var_ip, var_ip_text, var_ip_1, var_ip_2, var_ip_3, var_ip_4);
						END IF;
						SET var_table_name = CONCAT('report_camp_', var_camp_id, '_', FROM_UNIXTIME(var_click_time, '%d%m%Y'));
						SET var_table_name_ip = CONCAT('report_camp_ip_',var_camp_id,'_',FROM_UNIXTIME(var_click_time, '%d%m%Y'));
						SET var_table_name_token = CONCAT('report_camp_token_', var_camp_id, '_', FROM_UNIXTIME(var_click_time, '%d%m%Y'));
						SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name AND table_schema = '{data_base}');
						IF(check_table = 0) THEN
							SET sql_line=10;
							CALL report_create(var_table_name);
						END IF;
						SET sql_line=11;
						SET sql_table = var_table_name;
						CALL report_update(var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page, var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an, var_pay, var_cpc, var_geo, var_ua, var_publisher, var_table_name, var_ref, var_bot,var_dop_int,var_isp, var_country, var_geo_type,var_os, var_browser,var_model, var_brand,var_td3, var_hour_click, var_day_week, var_unique, var_unique_camp,var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10);
						SET sql_table = '0';
						SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name_ip AND table_schema = '{data_base}');
						IF(check_table = 0) THEN
							SET sql_line=12;
							CALL report_create_ip(var_table_name_ip);
						END IF;
						SET sql_line=13;
						SET sql_table = var_table_name_ip;
						CALL report_update_ip(var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page, var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an, var_pay, var_cpc, var_geo, var_ua, var_publisher, var_table_name_ip, var_ip_1, var_ip_2, var_ip_3, var_ip_4, var_ip_text, var_ref, var_bot, var_dop_int,var_isp, var_country, var_geo_type, var_hour_click, var_unique, var_unique_camp,var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10);
						SET sql_table = '0';
						IF(var_token!=0)THEN
							SET check_table = (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = var_table_name_token AND table_schema = '{data_base}');
							IF(check_table = 0) THEN
								SET sql_line=14;
								CALL report_create_token(var_table_name_token);
							END IF;
							SET sql_line=15;
							SET sql_table = var_table_name_token;
							CALL report_update_token(var_id, var_click_time, var_camp_id, var_offer, var_path_id, var_landing_page, var_cvr_id, var_ts_id, var_rule_id, var_offer_click, var_offer_type, var_an, var_pay, var_cpc, var_geo, var_table_name_token, var_bot, var_isp, var_country, var_geo_type, var_hour_click, var_day_week, var_unique, var_unique_camp,var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10);
							SET sql_table = '0';
						END IF;
						SET last_id = var_id;
					END IF;
				UNTIL flag END REPEAT;
			CLOSE cursor_1;
			SET sql_line=16;
			SET sql_table = 'showcase';
			CALL showcase_update();
			SET sql_table = '0';
			IF(reload_stats=0)THEN
				SET sql_line=17;
				CALL time_convert(NOW(),time_client);
				UPDATE engine_process SET end_date=UNIX_TIMESTAMP() WHERE id = log_id;
				DELETE FROM engine_process_instant WHERE proc_id = log_id;
			END IF;
		ELSE
			IF(reload_stats=0)THEN
				SET sql_line=18;
				CALL time_convert(NOW(),time_client);
				UPDATE engine_process SET end_date=UNIX_TIMESTAMP(),int_var=(SELECT MIN(id)-1 FROM clicks WHERE id>last_click_id) WHERE id = log_id;
				DELETE FROM engine_process_instant WHERE proc_id = log_id;
			END IF;
		END IF;
		SET sql_line=19;
		DELETE FROM temp_table WHERE is_reload = 2;
	ELSE
		SET sql_time=unix_timestamp()-sql_time;
		SET @error_name=CONCAT('#P24E: Duplication (SQL Line: 0)');
		SET @error_text=CONCAT('Load time: ',sql_time,'; Proc.parameters: start_id = ',start_click_id,'; end_id = ',last_click_id);
		INSERT INTO engine_errors(proc_id, `type`, error_date, 	error_name, error_text) VALUES (log_id,2,NOW(),@error_name,@error_text);
	END IF;
END;
";
?>