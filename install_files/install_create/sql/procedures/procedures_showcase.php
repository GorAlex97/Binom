<?php 
$sql[]='
	CREATE PROCEDURE FastShowcaseHandler(
		IN var_showcase_table VARCHAR (65),IN var_start_date INT,
		IN var_end_date INT,IN var_select LONGTEXT,
		IN var_where LONGTEXT,IN var_group LONGTEXT
	) BEGIN
		/*{"product":"Binom 1.13","version":"1.1","date":"13.03.2019"}*/
		DECLARE flag INT DEFAULT 0;
		DECLARE custom_formula,custom_formulas_sql LONGTEXT DEFAULT \'\';
		DECLARE var_campaigns,var_landing_page,var_offers,var_total_type INT DEFAULT 0;
		DECLARE custom_formula_name VARCHAR(128);
		DECLARE cursor_formulas CURSOR FOR
			SELECT 
				formula, 
				key_name, 
				total_type,
				campaigns,
				landing_page,
				offers
			FROM columns_settings WHERE 
				is_custom = 1 AND
				(campaigns = 1 OR landing_page = 1 OR offers = 1) AND
				is_text=0
			GROUP BY key_name;
		DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;

		OPEN cursor_formulas;
			REPEAT
				FETCH cursor_formulas INTO 	custom_formula, custom_formula_name, var_total_type,
											var_campaigns,var_landing_page,var_offers;
				IF NOT flag THEN
					IF(
						((var_showcase_table=\'showcase_campaigns\' OR var_showcase_table=\'showcase_campaigns_days\') AND var_campaigns>0) OR 
						((var_showcase_table=\'showcase_landings\' OR var_showcase_table=\'showcase_landings_days\') AND var_landing_page>0) OR 
						((var_showcase_table=\'showcase_offers\' OR var_showcase_table=\'showcase_offers_days\') AND var_offers>0)
					)THEN
						SET custom_formulas_sql = CONCAT(custom_formulas_sql, \' IFNULL(\',custom_formula,\',0) AS \',custom_formula_name,\', \');
					END IF;
				END IF;
			UNTIL flag END REPEAT;
		CLOSE cursor_formulas;
		IF(LOCATE(\'days\', var_showcase_table)=0)THEN
			SET @temp_sql=CONCAT(\'
				SELECT 
					el_id,
					\',var_select,\'
				FROM (
					SELECT 
						*,
						\',custom_formulas_sql,\'
						IFNULL((revenue - cost),0) AS profit,
						IFNULL(ROUND(((revenue - cost) / cost),9),0) * 100 AS roi,
						IFNULL(ROUND((lp_clicks / lp_views),9),0)*100 AS lp_ctr,
						IFNULL(ROUND((leads  / clicks),9),0)*100 AS cr,
						IFNULL(ROUND((revenue / clicks),9),0) AS epc,
						IFNULL(ROUND((cost / clicks),9),0) AS cpc
					FROM (
						SELECT
							el_id,
							IFNULL(SUM(showcase.clicks),0) AS clicks,
							IFNULL(SUM(showcase.clicks_offer),0) AS lp_clicks,
							IFNULL(SUM(showcase.clicks_landing),0) AS lp_views,
							IFNULL(SUM(showcase.`unique`),0) AS unique_clicks,
							IFNULL(SUM(showcase.unique_camp),0) AS unique_camp_clicks,
							IFNULL(SUM(showcase.bots),0) AS bots,
							IFNULL(SUM(showcase.leads),0) AS leads,
							IFNULL(SUM(showcase.pay),0) AS revenue,
							IFNULL(SUM(showcase.spend),0) AS cost,
							IFNULL(SUM(showcase.event_1),0) AS event_1,
							IFNULL(SUM(showcase.event_2),0) AS event_2,
							IFNULL(SUM(showcase.event_3),0) AS event_3,
							IFNULL(SUM(showcase.event_4),0) AS event_4,
							IFNULL(SUM(showcase.event_5),0) AS event_5,
							IFNULL(SUM(showcase.event_6),0) AS event_6,
							IFNULL(SUM(showcase.event_7),0) AS event_7,
							IFNULL(SUM(showcase.event_8),0) AS event_8,
							IFNULL(SUM(showcase.event_9),0) AS event_9,
							IFNULL(SUM(showcase.event_10),0) AS event_10,
							(IF(
									"\',var_showcase_table,\'"="showcase_campaigns" OR 
									"\',var_showcase_table,\'"="showcase_campaigns_days",
									(SELECT ea FROM campaigns WHERE id = showcase.el_id),
									100
							)) AS ea
						FROM
							\',var_showcase_table,\' AS showcase
						WHERE
							UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),"-",MID(date_name,-6,2),"-",REPLACE(date_name,MID(date_name,-6,6),"")," 00:00:00"))>=\',var_start_date,\' AND
							UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),"-",MID(date_name,-6,2),"-",REPLACE(date_name,MID(date_name,-6,6),"")," 23:59:59"))<=\',var_end_date,\'
							\',var_where,\'
						GROUP BY \',var_group,\'
					) AS stat0
				) AS stat1
			\');
		ELSE
			SET @temp_sql=CONCAT(\'
				SELECT 
					el_id,
					hour_now,
					\',var_select,\'
				FROM (
					SELECT 
						*,
						\',custom_formulas_sql,\'
						IFNULL((revenue - cost),0) AS profit,
						IFNULL(ROUND(((revenue - cost) / cost),9),0) * 100 AS roi,
						IFNULL(ROUND((lp_clicks / lp_views),9),0)*100 AS lp_ctr,
						IFNULL(ROUND((leads  / clicks),9),0)*100 AS cr,
						IFNULL(ROUND((revenue / clicks),9),0) AS epc,
						IFNULL(ROUND((cost / clicks),9),0) AS cpc
					FROM (
						SELECT
							el_id,
							IF(
								hour_name=FROM_UNIXTIME("\',var_end_date,\'","%k"),
								1,
								0
							) AS hour_now,
							IFNULL(SUM(showcase.clicks),0) AS clicks,
							IFNULL(SUM(showcase.clicks_offer),0) AS lp_clicks,
							IFNULL(SUM(showcase.clicks_landing),0) AS lp_views,
							IFNULL(SUM(showcase.`unique`),0) AS unique_clicks,
							IFNULL(SUM(showcase.unique_camp),0) AS unique_camp_clicks,
							IFNULL(SUM(showcase.bots),0) AS bots,
							IFNULL(SUM(showcase.leads),0) AS leads,
							IFNULL(SUM(showcase.pay),0) AS revenue,
							IFNULL(SUM(showcase.spend),0) AS cost,
							IFNULL(SUM(showcase.event_1),0) AS event_1,
							IFNULL(SUM(showcase.event_2),0) AS event_2,
							IFNULL(SUM(showcase.event_3),0) AS event_3,
							IFNULL(SUM(showcase.event_4),0) AS event_4,
							IFNULL(SUM(showcase.event_5),0) AS event_5,
							IFNULL(SUM(showcase.event_6),0) AS event_6,
							IFNULL(SUM(showcase.event_7),0) AS event_7,
							IFNULL(SUM(showcase.event_8),0) AS event_8,
							IFNULL(SUM(showcase.event_9),0) AS event_9,
							IFNULL(SUM(showcase.event_10),0) AS event_10,
							(IF(
								"\',var_showcase_table,\'"="showcase_campaigns" OR 
								"\',var_showcase_table,\'"="showcase_campaigns_days",
								(SELECT ea FROM campaigns WHERE id = showcase.el_id),
								100
							)) AS ea
						FROM
							\',var_showcase_table,\' AS showcase
						WHERE
							UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),"-",MID(date_name,-6,2),"-",REPLACE(date_name,MID(date_name,-6,6),"")," ",hour_name,":00:00"))>=\',var_start_date,\' AND
							UNIX_TIMESTAMP(CONCAT(RIGHT(date_name,4),"-",MID(date_name,-6,2),"-",REPLACE(date_name,MID(date_name,-6,6),"")," ",hour_name,":59:59"))<=\',var_end_date,\'
							\',var_where,\'
						GROUP BY \',var_group,\'
					) AS stat0
				) AS stat1
			\');
		END IF;
		PREPARE temp_sql FROM @temp_sql;
		EXECUTE temp_sql;
		DEALLOCATE PREPARE temp_sql;
	END;
';

$sql[]="
CREATE PROCEDURE showcase_update () BEGIN
	/*{\"product\":\"Binom 1.4\",\"version\":\"1.23\",\"date\":\"09.09.2020\"}*/
	DECLARE flag TINYINT(1) DEFAULT 0;
	DECLARE 
		var_hour_name, var_date_name1,var_date_name2,var_date_name3,
		var_el_id,var_clicks,var_clicks_offer,var_clicks_landing,var_leads,
		var_bots,var_camp_id,var_unique,var_unique_camp 
	INT DEFAULT 0;
	DECLARE var_last_click INT DEFAULT 0;
	DECLARE var_spend,var_pay DECIMAL(18,8);
	DECLARE 
		var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
		var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10
	DECIMAL(15,5);
	DECLARE cursor_campaigns CURSOR FOR
		SELECT * FROM (SELECT  camp_id AS el_id, FROM_UNIXTIME(click_time, '%H') AS hour_name, FROM_UNIXTIME(click_time, '%d%m%Y') AS date_name1,FROM_UNIXTIME(click_time, '%m%Y') AS date_name2,FROM_UNIXTIME(click_time, '%Y') AS date_name3,COUNT(*) AS clicks,SUM(IF(dop_int_3=1,1,0)) AS `unique`,SUM(IF(dop_int_3!=0,1,0)) AS unique_camp,SUM(IF(landing_page=0,0,offer_click)) AS clicks_offer, SUM(IF(landing_page=0,0,1)) AS clicks_landing,SUM(IF(cvr_id=0,0,1)) AS leads, SUM(is_bot) AS bots,SUM(cpc) AS spend,SUM(pay) AS pay, MAX(id) AS last_click, camp_id AS camp_id, sum(event_val_1),sum(event_val_2),sum(event_val_3),sum(event_val_4),sum(event_val_5),sum(event_val_6),sum(event_val_7),sum(event_val_8),sum(event_val_9),sum(event_val_10) FROM temp_table_from_report_load WHERE camp_id!=0 GROUP BY camp_id, FROM_UNIXTIME(click_time, '%d%m%Y%H')) As stat;
	DECLARE cursor_landings CURSOR FOR
		SELECT * FROM (SELECT landing_page AS el_id, FROM_UNIXTIME(click_time, '%H') AS hour_name, FROM_UNIXTIME(click_time, '%d%m%Y') AS date_name1, FROM_UNIXTIME(click_time, '%m%Y') AS date_name2,FROM_UNIXTIME(click_time, '%Y') AS date_name3,COUNT(*) AS clicks,SUM(IF(dop_int_3=1,1,0)) AS `unique`,SUM(IF(dop_int_3!=0,1,0)) AS unique_camp,SUM(IF(landing_page=0,0,offer_click)) AS clicks_offer, SUM(IF(landing_page=0,0,1)) AS clicks_landing,SUM(IF(cvr_id=0,0,1)) AS leads,SUM(is_bot) AS bots,SUM(cpc) AS spend, SUM(pay) AS pay,MAX(id) AS last_click, camp_id AS camp_id, sum(event_val_1),sum(event_val_2),sum(event_val_3),sum(event_val_4),sum(event_val_5),sum(event_val_6),sum(event_val_7),sum(event_val_8),sum(event_val_9),sum(event_val_10) FROM temp_table_from_report_load WHERE landing_page!=0 AND camp_id!=0 GROUP BY landing_page, camp_id, FROM_UNIXTIME(click_time, '%d%m%Y%H')) As stat;
	DECLARE cursor_offers CURSOR FOR
		SELECT * FROM (SELECT offer AS el_id, FROM_UNIXTIME(click_time, '%H') AS hour_name, FROM_UNIXTIME(click_time, '%d%m%Y') AS date_name1,FROM_UNIXTIME(click_time, '%m%Y') AS date_name2,FROM_UNIXTIME(click_time, '%Y') AS date_name3,COUNT(*) AS clicks,SUM(IF(dop_int_3=1,1,0)) AS `unique`,SUM(IF(dop_int_3!=0,1,0)) AS unique_camp,SUM(IF(landing_page=0,0,offer_click)) AS clicks_offer, SUM(IF(landing_page=0,0,1)) AS clicks_landing,SUM(IF(cvr_id=0,0,1)) AS leads, SUM(is_bot) AS bots,SUM(cpc) AS spend,SUM(pay) AS pay,MAX(id) AS last_click, camp_id AS camp_id, sum(event_val_1),sum(event_val_2),sum(event_val_3),sum(event_val_4),sum(event_val_5),sum(event_val_6),sum(event_val_7),sum(event_val_8),sum(event_val_9),sum(event_val_10) FROM temp_table_from_report_load WHERE offer_type=3 AND camp_id!=0 AND offer!=0 GROUP BY offer, camp_id, FROM_UNIXTIME(click_time, '%d%m%Y%H')) As stat;
	DECLARE cursor_sources CURSOR FOR
		SELECT * FROM (SELECT ts_id AS el_id, FROM_UNIXTIME(click_time, '%H') AS hour_name, FROM_UNIXTIME(click_time, '%d%m%Y') AS date_name1,FROM_UNIXTIME(click_time, '%m%Y') AS date_name2,FROM_UNIXTIME(click_time, '%Y') AS date_name3,COUNT(*) AS clicks,SUM(IF(dop_int_3=1,1,0)) AS `unique`,SUM(IF(dop_int_3!=0,1,0)) AS unique_camp, SUM(IF(landing_page=0,0,offer_click)) AS clicks_offer,SUM(IF(landing_page=0,0,1)) AS clicks_landing,SUM(IF(cvr_id=0,0,1)) AS leads,SUM(is_bot) AS bots,SUM(cpc) AS spend,SUM(pay) AS pay,MAX(id) AS last_click,camp_id AS camp_id, sum(event_val_1),sum(event_val_2),sum(event_val_3),sum(event_val_4),sum(event_val_5),sum(event_val_6),sum(event_val_7),sum(event_val_8),sum(event_val_9),sum(event_val_10) FROM temp_table_from_report_load  WHERE camp_id!=0 AND ts_id!=0 GROUP BY ts_id, camp_id, FROM_UNIXTIME(click_time, '%d%m%Y%H')) As stat;
	DECLARE cursor_rotations CURSOR FOR
		SELECT * FROM (SELECT  dop_int_2 AS el_id, FROM_UNIXTIME(click_time, '%H') AS hour_name, FROM_UNIXTIME(click_time, '%d%m%Y') AS date_name1,FROM_UNIXTIME(click_time, '%m%Y') AS date_name2,FROM_UNIXTIME(click_time, '%Y') AS date_name3,COUNT(*) AS clicks,SUM(IF(dop_int_3=1,1,0)) AS `unique`,SUM(IF(dop_int_3!=0,1,0)) AS unique_camp,SUM(IF(landing_page=0,0,offer_click)) AS clicks_offer,SUM(IF(landing_page=0,0,1)) AS clicks_landing,SUM(IF(cvr_id=0,0,1)) AS leads,SUM(is_bot) AS bots,SUM(cpc) AS spend,SUM(pay) AS pay, MAX(id) AS last_click, camp_id AS camp_id, sum(event_val_1),sum(event_val_2),sum(event_val_3),sum(event_val_4),sum(event_val_5),sum(event_val_6),sum(event_val_7),sum(event_val_8),sum(event_val_9),sum(event_val_10) FROM temp_table_from_report_load WHERE camp_id!=0 AND dop_int_2!=0 AND (SELECT `type` FROM rotations WHERE id = dop_int_2)!=0 GROUP BY dop_int_2, camp_id, FROM_UNIXTIME(click_time, '%d%m%Y%H')) As stat;
	DECLARE cursor_networks CURSOR FOR
		SELECT * FROM (SELECT an AS el_id, FROM_UNIXTIME(click_time, '%H') AS hour_name, FROM_UNIXTIME(click_time, '%d%m%Y') AS date_name1,FROM_UNIXTIME(click_time, '%m%Y') AS date_name2,FROM_UNIXTIME(click_time, '%Y') AS date_name3, COUNT(*) AS clicks,SUM(IF(dop_int_3=1,1,0)) AS `unique`,SUM(IF(dop_int_3!=0,1,0)) AS unique_camp,SUM(IF(landing_page=0,0,offer_click)) AS clicks_offer,SUM(IF(landing_page=0,0,1)) AS clicks_landing,SUM(IF(cvr_id=0,0,1)) AS leads,SUM(is_bot) AS bots,SUM(cpc) AS spend,SUM(pay) AS pay, MAX(id) AS last_click, camp_id AS camp_id, sum(event_val_1),sum(event_val_2),sum(event_val_3),sum(event_val_4),sum(event_val_5),sum(event_val_6),sum(event_val_7),sum(event_val_8),sum(event_val_9),sum(event_val_10) FROM temp_table_from_report_load WHERE camp_id!=0 AND an!=0 AND offer_type=3 GROUP BY an, camp_id, FROM_UNIXTIME(click_time, '%d%m%Y%H')) As stat;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	OPEN cursor_campaigns;
		REPEAT
			FETCH cursor_campaigns INTO 
				var_el_id,var_hour_name,var_date_name1,var_date_name2,var_date_name3,var_clicks,var_unique,var_unique_camp,var_clicks_offer,
				var_clicks_landing,var_leads,var_bots,var_spend,var_pay,var_last_click,var_camp_id,
				var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
				var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
			IF NOT flag THEN
			
				SET @check_update = NULL; 
				UPDATE 	showcase_campaigns_days SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, 
					unique_camp=unique_camp+var_unique_camp,
					clicks_offer = clicks_offer + var_clicks_offer, 
					bots = bots +  var_bots, leads = leads + var_leads,
					spend = spend + var_spend,pay = pay + var_pay,
					clicks_landing = clicks_landing + var_clicks_landing 
				WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id AND hour_name = var_hour_name;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_campaigns_days 
					(el_id, hour_name, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, clicks_landing, bots, camp_id) VALUES (var_el_id,var_hour_name,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			
				SET @check_update = NULL; 
				UPDATE 	showcase_campaigns SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_campaigns (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,1,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_campaigns SET
					event_1 =  @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer,bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name2 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_campaigns (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,2,var_date_name2,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_campaigns SET 
					event_1 =  @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name3 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_campaigns (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,3,var_date_name3,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_campaigns;
	SET flag = 0;
	OPEN cursor_landings;
		REPEAT
			FETCH cursor_landings INTO 
				var_el_id,var_hour_name,var_date_name1,var_date_name2,var_date_name3,var_clicks,var_unique,var_unique_camp,var_clicks_offer,
				var_clicks_landing,var_leads,var_bots,var_spend,var_pay,var_last_click,var_camp_id,
				var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
				var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
			IF NOT flag THEN
				
				SET @check_update = NULL; 
				UPDATE 	showcase_landings_days SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, 
					unique_camp=unique_camp+var_unique_camp,
					clicks_offer = clicks_offer + var_clicks_offer, 
					bots = bots +  var_bots, leads = leads + var_leads,
					spend = spend + var_spend,pay = pay + var_pay,
					clicks_landing = clicks_landing + var_clicks_landing 
				WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id AND hour_name = var_hour_name;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_landings_days 
					(el_id, hour_name, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, clicks_landing, bots, camp_id) VALUES (var_el_id,var_hour_name,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				
				SET @check_update = NULL;
				UPDATE 	showcase_landings SET 
					event_1 =  @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_landings (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,1,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_landings SET 
					event_1 =  @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer,bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name2 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_landings (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,2,var_date_name2,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_landings SET 
					event_1 =  @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name3 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_landings (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,3,var_date_name3,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_landings;
	SET flag = 0;
	OPEN cursor_offers;
		REPEAT
			FETCH cursor_offers INTO 
				var_el_id,var_hour_name,var_date_name1,var_date_name2,var_date_name3,var_clicks,var_unique,var_unique_camp,var_clicks_offer,
				var_clicks_landing,var_leads,var_bots,var_spend,var_pay,var_last_click,var_camp_id,
				var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
				var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
			IF NOT flag THEN
				
				SET @check_update = NULL; 
				UPDATE 	showcase_offers_days SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, 
					unique_camp=unique_camp+var_unique_camp,
					clicks_offer = clicks_offer + var_clicks_offer, 
					bots = bots +  var_bots, leads = leads + var_leads,
					spend = spend + var_spend,pay = pay + var_pay,
					clicks_landing = clicks_landing + var_clicks_landing 
				WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id AND hour_name = var_hour_name;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_offers_days 
					(el_id, hour_name, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, clicks_landing, bots, camp_id) VALUES (var_el_id,var_hour_name,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				
				SET @check_update = NULL;
				UPDATE 	showcase_offers SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_offers (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,1,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_offers SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer,bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name2 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_offers (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,2,var_date_name2,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_offers SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name3 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_offers (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,3,var_date_name3,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_offers;
	SET flag = 0;
	OPEN cursor_rotations;
		REPEAT
			FETCH cursor_rotations INTO 
				var_el_id,var_hour_name,var_date_name1,var_date_name2,var_date_name3,var_clicks,var_unique,var_unique_camp,var_clicks_offer,
				var_clicks_landing,var_leads,var_bots,var_spend,var_pay,var_last_click,var_camp_id,
				var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
				var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
			IF NOT flag THEN
				
				SET @check_update = NULL; 
				UPDATE 	showcase_rotations_days SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, 
					unique_camp=unique_camp+var_unique_camp,
					clicks_offer = clicks_offer + var_clicks_offer, 
					bots = bots +  var_bots, leads = leads + var_leads,
					spend = spend + var_spend,pay = pay + var_pay,
					clicks_landing = clicks_landing + var_clicks_landing 
				WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id AND hour_name = var_hour_name;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_rotations_days 
					(el_id, hour_name, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, clicks_landing, bots, camp_id) VALUES (var_el_id,var_hour_name,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				
				SET @check_update = NULL;
				UPDATE 	showcase_rotations SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_rotations (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,1,var_date_name1,var_clicks, var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_rotations SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer,bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name2 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_rotations (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,2,var_date_name2,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_rotations SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name3 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_rotations (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,3,var_date_name3,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_rotations;
	SET flag = 0;
	OPEN cursor_sources;
		REPEAT
			FETCH cursor_sources INTO 
				var_el_id,var_hour_name,var_date_name1,var_date_name2,var_date_name3,var_clicks,var_unique,var_unique_camp,var_clicks_offer,
				var_clicks_landing,var_leads,var_bots,var_spend,var_pay,var_last_click,var_camp_id,
				var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
				var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
			IF NOT flag THEN
				
				SET @check_update = NULL; 
				UPDATE 	showcase_sources_days SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, 
					unique_camp=unique_camp+var_unique_camp,
					clicks_offer = clicks_offer + var_clicks_offer, 
					bots = bots +  var_bots, leads = leads + var_leads,
					spend = spend + var_spend,pay = pay + var_pay,
					clicks_landing = clicks_landing + var_clicks_landing 
				WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id AND hour_name = var_hour_name;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_sources_days 
					(el_id, hour_name, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, clicks_landing, bots, camp_id) VALUES (var_el_id,var_hour_name,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				
				SET @check_update = NULL;
				UPDATE 	showcase_sources SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_sources (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,1,var_date_name1,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL; 
				UPDATE 	showcase_sources SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer,bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name2 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_sources (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,2,var_date_name2,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_sources SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name3 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_sources (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,3,var_date_name3,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_sources;
	SET flag = 0;
	OPEN cursor_networks;
		REPEAT
			FETCH cursor_networks INTO 
				var_el_id,var_hour_name,var_date_name1,var_date_name2,var_date_name3,var_clicks,var_unique,var_unique_camp,var_clicks_offer,
				var_clicks_landing,var_leads,var_bots,var_spend,var_pay,var_last_click,var_camp_id,
				var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
				var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10;
			IF NOT flag THEN
				
				SET @check_update = NULL; 
				UPDATE 	showcase_networks_days SET
					event_1 = @check_update := event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks, `unique`=`unique`+var_unique, 
					unique_camp=unique_camp+var_unique_camp,
					clicks_offer = clicks_offer + var_clicks_offer, 
					bots = bots +  var_bots, leads = leads + var_leads,
					spend = spend + var_spend,pay = pay + var_pay,
					clicks_landing = clicks_landing + var_clicks_landing 
				WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id AND hour_name = var_hour_name;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_networks_days 
					(el_id, hour_name, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10,
					spend, pay, clicks_landing, bots, camp_id) VALUES (var_el_id,var_hour_name,var_date_name1,var_clicks,var_unique, var_unique_camp,var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,
					var_spend,var_pay,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				
				SET @check_update = NULL;
				UPDATE 	showcase_networks SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name1 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_networks (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,1,var_date_name1,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_networks SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp,clicks_offer = clicks_offer + var_clicks_offer,bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name2 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_networks (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,2,var_date_name2,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
				SET @check_update = NULL;
				UPDATE 	showcase_networks SET 
					event_1 = @check_update :=  event_1 + var_event_val_1,event_2 = event_2 + var_event_val_2,
					event_3 = event_3 + var_event_val_3,event_4 = event_4 + var_event_val_4,
					event_5 = event_5 + var_event_val_5,event_6 = event_6 + var_event_val_6,
					event_7 = event_7 + var_event_val_7,event_8 = event_8 + var_event_val_8,
					event_9 = event_9 + var_event_val_9,event_10 = event_10 + var_event_val_10,
					clicks = clicks + var_clicks,`unique`=`unique`+var_unique, unique_camp=unique_camp+var_unique_camp, clicks_offer = clicks_offer + var_clicks_offer, bots = bots +  var_bots, leads = leads + var_leads,spend = spend + var_spend,pay = pay + var_pay, last_click = var_last_click, clicks_landing = clicks_landing + var_clicks_landing WHERE el_id = var_el_id AND date_name = var_date_name3 AND camp_id = var_camp_id;
				IF(@check_update IS NULL)THEN
					INSERT INTO showcase_networks (el_id, date_type, date_name, clicks,`unique`,unique_camp, clicks_offer, leads,
					event_1,event_2,event_3,event_4,event_5,event_6,event_7,event_8,event_9,event_10, spend, pay, last_click, clicks_landing, bots, camp_id) VALUES (var_el_id,3,var_date_name3,var_clicks,var_unique, var_unique_camp, var_clicks_offer,var_leads,
					var_event_val_1,var_event_val_2,var_event_val_3,var_event_val_4,var_event_val_5,
					var_event_val_6,var_event_val_7,var_event_val_8,var_event_val_9,var_event_val_10,var_spend,var_pay,var_last_click,var_clicks_landing,var_bots,var_camp_id);
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_networks;
	SET flag = 0;
END;
";

$sql[]="
CREATE PROCEDURE CorrectionDataHandlerShowcase () BEGIN
	/*{\"product\":\"Binom 1.12\",\"version\":\"1.11\",\"date\":\"17.10.2018\"}*/
	DECLARE table_element_el_id, table_element_name, table_element_where, time_group1,time_group2,time_group3 TEXT;
	DECLARE table_number, type_number INT DEFAULT 1;
	WHILE table_number<7 DO
		CASE table_number
			WHEN 1 THEN 
				SET table_element_el_id='camp_id';
				SET table_element_name = 'campaigns';
				SET table_element_where = '1';
			WHEN 2 THEN 
				SET table_element_el_id='landing_id';
				SET table_element_name = 'landings';
				SET table_element_where = 'landing_id>0';
			WHEN 3 THEN 
				SET table_element_el_id='offer_id';
				SET table_element_name = 'offers';
				SET table_element_where = 'offer_type=3';
			WHEN 4 THEN 
				SET table_element_el_id='ts_id';
				SET table_element_name = 'sources';
				SET table_element_where = '1';
			WHEN 5 THEN 
				SET table_element_el_id='network_id';
				SET table_element_name = 'networks';
				SET table_element_where = 'offer_type=3';
			WHEN 6 THEN 
				SET table_element_el_id='rotation_id';
				SET table_element_name = 'rotations';
				SET table_element_where = '(SELECT `type` FROM rotations WHERE id = temp_update_data.rotation_id)=1';
		END CASE;
		SET table_number = table_number + 1;
		SET type_number = 1;
		WHILE type_number<5 DO
			CASE type_number
				WHEN 1 THEN 
					SET time_group1='FROM_UNIXTIME(click_time,\"%Y\")';
					SET time_group2='showcase.date_name = temp.year_name';
				WHEN 2 THEN 
					SET time_group1='FROM_UNIXTIME(click_time,\"%m%Y\")';
					SET time_group2='showcase.date_name = temp.month_name';
				WHEN 3 THEN 
					SET time_group1='FROM_UNIXTIME(click_time,\"%e%m%Y\")';
					SET time_group2='showcase.date_name = temp.day_name';
				WHEN 4 THEN 
					SET time_group1='FROM_UNIXTIME(click_time,\"%k-%e%m%Y\")';
					SET time_group2='CONCAT(showcase.hour_name,\"-\",showcase.date_name) = temp.hour_name';
					SET table_element_name = CONCAT(table_element_name,'_days');
			END CASE;
			SET type_number = type_number + 1;
			/*временные таблицы*/
			SET @temp_sql=CONCAT('DROP TABLE IF EXISTS temp_update_data_showcase_',table_element_name);
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			SET @temp_sql=CONCAT('
				CREATE TEMPORARY TABLE temp_update_data_showcase_',table_element_name,'
					SELECT 
						IF(temp_type=5,1,0) AS multoff,
						camp_id,
						',table_element_el_id,' AS el_id,
						FROM_UNIXTIME(click_time,\"%k-%e%m%Y\") AS hour_name,
						FROM_UNIXTIME(click_time,\"%e%m%Y\") AS day_name,
						FROM_UNIXTIME(click_time,\"%c%Y\") AS month_name,
						FROM_UNIXTIME(click_time,\"%Y\") AS year_name,
						SUM(IF(temp_type=5,1,0)) AS e_clicks,
						SUM(IF(temp_type=5,click_is_landing,0)) AS e_is_landing,
						SUM(IF(temp_type=5,click_is_unique_camp,0)) AS e_is_unique_camp,
						SUM(IF(temp_type=5,click_is_unique,0)) AS e_is_unique,
						SUM(IF(temp_type=5,click_is_bot,0)) AS e_is_bots,
						SUM(
							IF(
								temp_cvr_id IS NOT NULL AND temp_cvr_id!=0,
								1 - (IF(click_cvr_id IS NOT NULL AND click_cvr_id!=0,1,0)),
								IF(
									temp_type=5,
									IF(
										click_cvr_id IS NOT NULL AND click_cvr_id!=0,
										1,
										0
									),
									0
								)
							)
						) AS e_cvr_id,
						SUM(IF(temp_pay IS NOT NULL,temp_pay - click_pay,IF(temp_type=5,IF(click_pay IS NOT NULL,click_pay,0),0))) AS e_pay,
						SUM(IF(temp_offer_click IS NOT NULL,temp_offer_click - click_offer_click,IF(temp_type=5,IF(click_offer_click IS NOT NULL,click_offer_click,0),0))) AS e_offer_click,
						SUM(IF(temp_cpc IS NOT NULL,temp_cpc - click_cpc,IF(temp_type=5,IF(click_cpc IS NOT NULL,click_cpc,0),0))) AS e_cpc,
						SUM(IF(temp_event_val_1 IS NOT NULL,temp_event_val_1 - IFNULL(click_event_val_1,0),IF(temp_type=5,IF(click_event_val_1 IS NOT NULL,click_event_val_1,0),0))) AS e_event_val_1,
						SUM(IF(temp_event_val_2 IS NOT NULL,temp_event_val_2 - IFNULL(click_event_val_2,0),IF(temp_type=5,IF(click_event_val_2 IS NOT NULL,click_event_val_2,0),0))) AS e_event_val_2,
						SUM(IF(temp_event_val_3 IS NOT NULL,temp_event_val_3 - IFNULL(click_event_val_3,0),IF(temp_type=5,IF(click_event_val_3 IS NOT NULL,click_event_val_3,0),0))) AS e_event_val_3,
						SUM(IF(temp_event_val_4 IS NOT NULL,temp_event_val_4 - IFNULL(click_event_val_4,0),IF(temp_type=5,IF(click_event_val_4 IS NOT NULL,click_event_val_4,0),0))) AS e_event_val_4,
						SUM(IF(temp_event_val_5 IS NOT NULL,temp_event_val_5 - IFNULL(click_event_val_5,0),IF(temp_type=5,IF(click_event_val_5 IS NOT NULL,click_event_val_5,0),0))) AS e_event_val_5,
						SUM(IF(temp_event_val_6 IS NOT NULL,temp_event_val_6 - IFNULL(click_event_val_6,0),IF(temp_type=5,IF(click_event_val_6 IS NOT NULL,click_event_val_6,0),0))) AS e_event_val_6,
						SUM(IF(temp_event_val_7 IS NOT NULL,temp_event_val_7 - IFNULL(click_event_val_7,0),IF(temp_type=5,IF(click_event_val_7 IS NOT NULL,click_event_val_7,0),0))) AS e_event_val_7,
						SUM(IF(temp_event_val_8 IS NOT NULL,temp_event_val_8 - IFNULL(click_event_val_8,0),IF(temp_type=5,IF(click_event_val_8 IS NOT NULL,click_event_val_8,0),0))) AS e_event_val_8,
						SUM(IF(temp_event_val_9 IS NOT NULL,temp_event_val_9 - IFNULL(click_event_val_9,0),IF(temp_type=5,IF(click_event_val_9 IS NOT NULL,click_event_val_9,0),0))) AS e_event_val_9,
						SUM(IF(temp_event_val_10 IS NOT NULL,temp_event_val_10 - IFNULL(click_event_val_10,0),IF(temp_type=5,IF(click_event_val_10 IS NOT NULL,click_event_val_10,0),0))) AS e_event_val_10
					FROM temp_update_data
					WHERE ',table_element_where,'
					GROUP BY camp_id, ',table_element_el_id,', IF(temp_type=5,1,0), ',time_group1,';
			');
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			/*обновление данных*/
			SET @temp_sql = CONCAT('
				UPDATE 
					showcase_',table_element_name,' AS showcase
					INNER JOIN
					temp_update_data_showcase_',table_element_name,' AS temp ON 
						temp.multoff = 0 AND
						showcase.el_id = temp.el_id AND
						showcase.camp_id = temp.camp_id AND
						',time_group2,'
				SET
					showcase.clicks = showcase.clicks + temp.e_clicks,
					showcase.`unique` = showcase.`unique` + temp.e_is_unique,
					showcase.unique_camp = showcase.unique_camp + temp.e_is_unique_camp,
					showcase.clicks_offer = showcase.clicks_offer + temp.e_offer_click,
					showcase.clicks_landing = showcase.clicks_landing + temp.e_is_landing,
					showcase.leads = showcase.leads + temp.e_cvr_id,
					showcase.event_1 = showcase.event_1 + temp.e_event_val_1,
					showcase.event_2 = showcase.event_2 + temp.e_event_val_2,
					showcase.event_3 = showcase.event_3 + temp.e_event_val_3,
					showcase.event_4 = showcase.event_4 + temp.e_event_val_4,
					showcase.event_5 = showcase.event_5 + temp.e_event_val_5,
					showcase.event_6 = showcase.event_6 + temp.e_event_val_6,
					showcase.event_7 = showcase.event_7 + temp.e_event_val_7,
					showcase.event_8 = showcase.event_8 + temp.e_event_val_8,
					showcase.event_9 = showcase.event_9 + temp.e_event_val_9,
					showcase.event_10 = showcase.event_10 + temp.e_event_val_10,
					showcase.bots = showcase.bots + temp.e_is_bots,
					showcase.spend = showcase.spend + temp.e_cpc,
					showcase.pay = showcase.pay + temp.e_pay;
			');
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
			/*обновление данных мультиофферности*/
			SET @temp_sql = CONCAT('
				UPDATE 
					showcase_',table_element_name,' AS showcase
					INNER JOIN
					temp_update_data_showcase_',table_element_name,' AS temp ON 
						temp.multoff = 1 AND
						showcase.el_id = temp.el_id AND
						showcase.camp_id = temp.camp_id AND
						',time_group2,'
				SET
					showcase.clicks = showcase.clicks - temp.e_clicks,
					showcase.`unique` = showcase.`unique` - temp.e_is_unique,
					showcase.unique_camp = showcase.unique_camp - temp.e_is_unique_camp,
					showcase.clicks_offer = showcase.clicks_offer - temp.e_offer_click,
					showcase.clicks_landing = showcase.clicks_landing - temp.e_is_landing,
					showcase.leads = showcase.leads - temp.e_cvr_id,
					showcase.event_1 = showcase.event_1 - temp.e_event_val_1,
					showcase.event_2 = showcase.event_2 - temp.e_event_val_2,
					showcase.event_3 = showcase.event_3 - temp.e_event_val_3,
					showcase.event_4 = showcase.event_4 - temp.e_event_val_4,
					showcase.event_5 = showcase.event_5 - temp.e_event_val_5,
					showcase.event_6 = showcase.event_6 - temp.e_event_val_6,
					showcase.event_7 = showcase.event_7 - temp.e_event_val_7,
					showcase.event_8 = showcase.event_8 - temp.e_event_val_8,
					showcase.event_9 = showcase.event_9 - temp.e_event_val_9,
					showcase.event_10 = showcase.event_10 - temp.e_event_val_10,
					showcase.bots = showcase.bots - temp.e_is_bots,
					showcase.spend = showcase.spend - temp.e_cpc,
					showcase.pay = showcase.pay - temp.e_pay;
			');
			PREPARE temp_sql FROM @temp_sql;
			EXECUTE temp_sql;
			DEALLOCATE PREPARE temp_sql;
		END WHILE;
	END WHILE;
END;
";

$sql[]='
	CREATE PROCEDURE showcase_upload (IN el_type VARCHAR(32), IN start_date INT, IN end_date INT, IN date_type INT, IN where_sql TEXT CHARSET utf8, IN order_sql TEXT CHARSET utf8, IN var_parent_user_id INT, IN var_user_id INT, IN no_profit INT, IN fgroup_id INT, IN emulation_mode INT) BEGIN
		/*{"product":"Binom 1.15","version":"1.63","date":"23.03.2021"}*/
	DECLARE date_sql,date_sql_direct LONGTEXT DEFAULT \'1\';
	DECLARE 
		metrics_sql_1,metrics_sql_2,metrics_sql_2_sum,metrics_sql_2_direct,default_formulas,sql_permission,
		custom_formula,custom_formulas_sql, var_date_name, var_date_value, table_suffix
	LONGTEXT DEFAULT \'\';
	DECLARE 
		var_campaigns,var_landing_page,var_offers,var_rotations,var_affiliate_networks,var_traffic_sources,var_trends,var_users
	INT DEFAULT 0;
	DECLARE ElIDname VARCHAR(32) DEFAULT \'el_id\';
	DECLARE custom_formula_name,trend_table VARCHAR(128);
	DECLARE sql_join TEXT;
	DECLARE flag,var_is_round INT DEFAULT 0;
	DECLARE cursor_formulas CURSOR FOR
		SELECT 
			formula, 
			key_name, 
			is_round, 
			campaigns, 
			landing_page, 
			offers, 
			rotations, 
			affiliate_networks, 
			traffic_sources
		FROM columns_settings WHERE 
			user_id = var_parent_user_id AND 
			status = 1 AND 
			is_custom = 1 AND
			(\'campaigns\'!=el_type OR (groups = \'\' OR groups LIKE CONCAT(\'%[\',fgroup_id,\']%\')))
		ORDER BY id;
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET flag = 1;
	SET metrics_sql_1="
		clicks,
		lp_clicks,
		lp_views,
		unique_clicks,
		unique_camp_clicks,
		bots,
		leads,
		revenue,
		cost,
		event_1,
		event_2,
		event_3,
		event_4,
		event_5,
		event_6,
		event_7,
		event_8,
		event_9,
		event_10
	";
	IF(date_type=4)THEN
		SET metrics_sql_2=CONCAT("
			COUNT(showcase.id) AS clicks,
			IFNULL(SUM(IF(showcase.landing_page>0,showcase.offer_click,0)),0) AS lp_clicks,
			IFNULL(SUM(IF(showcase.landing_page>0,1,0)),0) AS lp_views,
			IFNULL(SUM(IF(showcase.dop_int_3=1,1,0)),0) AS unique_clicks,
			IFNULL(SUM(IF(showcase.dop_int_3=0,0,1)),0) AS unique_camp_clicks,
			IFNULL(SUM(showcase.is_bot),0) AS bots,
			IFNULL(SUM(IF(showcase.cvr_id>1,1,0)),0) AS leads,
			IF(",no_profit,"=0,IFNULL(SUM(showcase.pay),0),0) AS revenue,
			IFNULL(SUM(showcase.cpc),0) AS cost,
			IFNULL(SUM(events.event_val_1),0) AS event_1,
			IFNULL(SUM(events.event_val_2),0) AS event_2,
			IFNULL(SUM(events.event_val_3),0) AS event_3,
			IFNULL(SUM(events.event_val_4),0) AS event_4,
			IFNULL(SUM(events.event_val_5),0) AS event_5,
			IFNULL(SUM(events.event_val_6),0) AS event_6,
			IFNULL(SUM(events.event_val_7),0) AS event_7,
			IFNULL(SUM(events.event_val_8),0) AS event_8,
			IFNULL(SUM(events.event_val_9),0) AS event_9,
			IFNULL(SUM(events.event_val_10),0) AS event_10
		");
	ELSE
		SET metrics_sql_2=CONCAT("
			IFNULL(SUM(showcase.clicks),0) AS clicks,
			IFNULL(SUM(showcase.clicks_offer),0) AS lp_clicks,
			IFNULL(SUM(showcase.clicks_landing),0) AS lp_views,
			IFNULL(SUM(showcase.`unique`),0) AS unique_clicks,
			IFNULL(SUM(showcase.unique_camp),0) AS unique_camp_clicks,
			IFNULL(SUM(showcase.bots),0) AS bots,
			IFNULL(SUM(showcase.leads),0) AS leads,
			IF(",no_profit,"=0,IFNULL(SUM(showcase.pay),0),0) AS revenue,
			IFNULL(SUM(showcase.spend),0) AS cost,
			IFNULL(SUM(showcase.event_1),0) AS event_1,
			IFNULL(SUM(showcase.event_2),0) AS event_2,
			IFNULL(SUM(showcase.event_3),0) AS event_3,
			IFNULL(SUM(showcase.event_4),0) AS event_4,
			IFNULL(SUM(showcase.event_5),0) AS event_5,
			IFNULL(SUM(showcase.event_6),0) AS event_6,
			IFNULL(SUM(showcase.event_7),0) AS event_7,
			IFNULL(SUM(showcase.event_8),0) AS event_8,
			IFNULL(SUM(showcase.event_9),0) AS event_9,
			IFNULL(SUM(showcase.event_10),0) AS event_10
		");
	END IF;
	SET metrics_sql_2_sum="
		SUM(clicks) AS clicks,
		SUM(lp_clicks) AS lp_clicks,
		SUM(lp_views) AS lp_views,
		SUM(unique_clicks) AS unique_clicks,
		SUM(unique_camp_clicks) AS unique_camp_clicks,
		SUM(bots) AS bots,
		SUM(leads) AS leads, 
		SUM(revenue) AS revenue, 
		SUM(cost) AS cost,
		SUM(event_1) AS event_1,
		SUM(event_2) AS event_2,
		SUM(event_3) AS event_3,
		SUM(event_4) AS event_4,
		SUM(event_5) AS event_5,
		SUM(event_6) AS event_6,
		SUM(event_7) AS event_7,
		SUM(event_8) AS event_8,
		SUM(event_9) AS event_9,
		SUM(event_10) AS event_10
	";
	SET metrics_sql_2_direct=CONCAT("
			0 AS clicks,
			0 AS lp_clicks,
			0 AS lp_views,
			0 AS unique_clicks,
			0 AS unique_camp_clicks,
			0 AS bots,
			0 AS leads,
			0 AS revenue,
			0 AS cost,
			0 AS event_1,
			0 AS event_2,
			0 AS event_3,
			0 AS event_4,
			0 AS event_5,
			0 AS event_6,
			0 AS event_7,
			0 AS event_8,
			0 AS event_9,
			0 AS event_10
	");
	SET default_formulas=CONCAT("
		IF(",no_profit,"=0,IFNULL((revenue - cost),0),0) AS profit,
		IF(",no_profit,"=0,IFNULL(ROUND(((revenue - cost) / cost),9),0),0) * 100 AS roi,
		IFNULL(ROUND((lp_clicks / lp_views),9),0)*100 AS lp_ctr,
		IFNULL(ROUND((leads  / clicks),9),0)*100 AS cr,
		IF(",no_profit,"=0,IFNULL(ROUND((revenue / clicks),9),0),0) AS epc,
		IFNULL(ROUND((cost / clicks),9),0) AS cpc
	");
	IF(var_user_id!=0)THEN
		SET sql_permission=CONCAT(\'((SELECT id FROM users WHERE id = \',var_user_id,\' AND (user_group=1 OR campaigns=1  OR campaigns=4)) IS NOT NULL OR (SELECT id FROM users_permission WHERE user_id=\',var_user_id,\' AND el_id = showcase.camp_id AND el_type = 1) IS NOT NULL OR (SELECT id FROM users_permission WHERE user_id=\',var_user_id,\' AND el_id =(SELECT group_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 7) IS NOT NULL) AND ((SELECT id FROM users WHERE id = \',var_user_id,\' AND (user_group=1 OR sources=1  OR sources=4)) IS NOT NULL OR (SELECT id FROM users_permission WHERE user_id=\',var_user_id,\' AND el_id =(SELECT sources_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 2)) IS NOT NULL AND ((SELECT id FROM users WHERE id = \',var_user_id,\' AND (user_group=1 OR 	rotations=1  OR rotations=4)) IS NOT NULL OR (SELECT id FROM users_permission WHERE user_id=\',var_user_id,\' AND el_id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 3) IS NOT NULL OR (SELECT name FROM rotations WHERE id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id)) IS NULL OR (SELECT id FROM users_permission WHERE user_id=\',var_user_id,\' AND el_id = (SELECT group_id FROM rotations WHERE id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id)) AND el_type = 7) IS NOT NULL)\');
	ELSE
		SET sql_permission=\'1\';
	END IF;
	OPEN cursor_formulas;
		REPEAT
			FETCH cursor_formulas INTO 	custom_formula, custom_formula_name, var_is_round,
										var_campaigns,var_landing_page,var_offers,var_rotations,
										var_affiliate_networks,var_traffic_sources;
			IF NOT flag THEN
				IF(
					(el_type=\'campaigns\' AND var_campaigns=1) OR
					(el_type=\'offers\' AND var_offers=1) OR
					(el_type=\'landing_page\' AND var_landing_page=1) OR
					(el_type=\'rotations\' AND var_rotations=1) OR
					(el_type=\'affiliate_networks\' AND var_affiliate_networks=1) OR
					(el_type=\'traffic_sources\' AND var_traffic_sources=1) OR
					(el_type=\'trends\' AND var_trends=1) OR
					(el_type=\'users\' AND var_users=1)
				)THEN
					SET custom_formulas_sql = CONCAT(custom_formulas_sql, \' ROUND(IFNULL(\',custom_formula,\',0),\',var_is_round,\') AS `\',custom_formula_name,\'`, \');
				END IF;
			END IF;
		UNTIL flag END REPEAT;
	CLOSE cursor_formulas;
	CASE date_type
		WHEN 1 THEN
			SET date_sql=CONCAT("
				UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' 00:00:00\'))>=",start_date," AND
				UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' 00:00:00\'))<=",end_date," AND
				date_type = 1
			");
		WHEN 2 THEN
			SET date_sql=CONCAT("
				UNIX_TIMESTAMP(CONCAT(IF(date_name>100000,CONCAT(SUBSTRING(date_name,3,4),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,2,4),\'-\',SUBSTRING(date_name,1,1))),\'-01 00:00:00\'))>=",start_date," AND
				UNIX_TIMESTAMP(INTERVAL 1 MONTH + CONCAT(IF(date_name>100000,CONCAT(SUBSTRING(date_name,3,4),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,2,4),\'-\',SUBSTRING(date_name,1,1))),\'-01 00:00:00\'))-1<=",end_date," AND
				date_type = 2
			");
		WHEN 3 THEN
			SET date_sql=CONCAT("
				UNIX_TIMESTAMP(CONCAT(date_name,\'-01-01 00:00:00\'))>=",start_date," AND
				UNIX_TIMESTAMP(CONCAT(date_name,\'-12-31 00:00:00\'))<=",end_date," AND
				date_type = 3
			");
		WHEN 4 THEN
			SET date_sql = 1;
			SET date_sql_direct=CONCAT("
				click_time>=",start_date," AND
				click_time<=",end_date,"
			");
		WHEN 9 THEN
			SET table_suffix = \'_days\';
			SET date_sql=CONCAT("
				UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' \',hour_name,\':00:00\'))>=",start_date," AND
				UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' \',hour_name,\':00:00\'))<=",end_date," AND
				date_type = 1
			");
		ELSE
			IF(el_type=\'trends\')THEN
				SET date_sql=CONCAT("
					UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' 00:00:00\'))>=",start_date," AND
					UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' 00:00:00\'))<=",end_date," AND
					date_type = 1
				");
				SET trend_table = \'showcase_campaigns\';
				CASE date_type
					WHEN 8 THEN
						SET trend_table = \'showcase_campaigns_days\';
						SET date_type = 1;
						SET var_date_value = "UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' \',hour_name,\':00:00\'))";
						SET var_date_name = CONCAT("CONCAT(FROM_UNIXTIME(",var_date_value,", \'%H:00 - \'),FROM_UNIXTIME(",var_date_value,"+3600, \'%H:00\'))");
					WHEN 5 THEN
						SET date_type = 1;
						SET var_date_value = "UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' 00:00:00\'))";
						SET var_date_name = CONCAT("FROM_UNIXTIME(",var_date_value,", \'%Y-%m-%d\')");
					WHEN 6 THEN
						SET date_type = 1;
						SET var_date_value = "UNIX_TIMESTAMP(CONCAT(IF(date_name>10000000,CONCAT(SUBSTRING(date_name,5,4),\'-\',SUBSTRING(date_name,3,2),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,4,4),\'-\',SUBSTRING(date_name,2,2),\'-\',SUBSTRING(date_name,1,1))),\' 00:00:00\'))";
						SET var_date_name = CONCAT("CONCAT(
							FROM_UNIXTIME((",var_date_value,")-((FROM_UNIXTIME(",var_date_value,", \'%w\')-1)*24*60*60),\'%Y-%m-%d\'),
							\' - \',
							FROM_UNIXTIME(((",var_date_value,")-((FROM_UNIXTIME(",var_date_value,", \'%w\'))*24*60*60)+(7*24*60*60)),\'%Y-%m-%d\')
							)");
					WHEN 7 THEN
						SET date_type = 2;
						SET var_date_value = "UNIX_TIMESTAMP(CONCAT(IF(date_name>100000,CONCAT(SUBSTRING(date_name,3,4),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,2,4),\'-\',SUBSTRING(date_name,1,1))),\'-01 00:00:00\'))";
						SET var_date_name = CONCAT("FROM_UNIXTIME(",var_date_value,", \'%M %Y\')");
						SET date_sql=CONCAT("
							UNIX_TIMESTAMP(CONCAT(IF(date_name>100000,CONCAT(SUBSTRING(date_name,3,4),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,2,4),\'-\',SUBSTRING(date_name,1,1))),\'-01 00:00:00\'))>=",start_date," AND
							UNIX_TIMESTAMP(INTERVAL 1 MONTH + CONCAT(IF(date_name>100000,CONCAT(SUBSTRING(date_name,3,4),\'-\',SUBSTRING(date_name,1,2)),CONCAT(SUBSTRING(date_name,2,4),\'-\',SUBSTRING(date_name,1,1))),\'-01 00:00:00\'))-1<=",end_date," AND
							date_type = 2
						");
					ELSE
						SELECT \'error\';
					 END CASE;
			ELSE
				SELECT \'error\';
			END IF;
	END CASE;
	CASE el_type
		WHEN \'users\' THEN  
			SET sql_join=CONCAT("
				LEFT JOIN showcase_campaigns",table_suffix," AS showcase ON ",date_sql," AND 
				(((SELECT id FROM users_permission WHERE user_id=usr.id AND el_id = showcase.camp_id AND el_type = 1) IS NOT NULL OR (SELECT id FROM users_permission WHERE user_id=usr.id AND el_id = (SELECT group_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 7) IS NOT NULL OR usr.campaigns = 1 OR usr.campaigns = 4) AND ((SELECT id FROM users_permission WHERE user_id=usr.id AND el_id =(SELECT sources_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 2) IS NOT NULL OR usr.sources = 1 OR usr.sources = 4) AND ((SELECT id FROM users_permission WHERE user_id=usr.id AND el_id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 3) IS NOT NULL OR (SELECT name FROM rotations WHERE id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id)) IS NULL OR (SELECT id FROM users_permission WHERE user_id=usr.id AND el_id = (SELECT group_id FROM rotations WHERE id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id)) AND el_type = 7) IS NOT NULL OR usr.rotations = 1 OR usr.rotations = 4))
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					LEFT JOIN clicks AS showcase ON ",date_sql," AND 
					(((SELECT id FROM users_permission WHERE user_id=usr.id AND el_id = showcase.camp_id AND el_type = 1) IS NOT NULL OR (SELECT id FROM users_permission WHERE user_id=usr.id AND el_id = (SELECT group_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 7) IS NOT NULL OR usr.campaigns = 1 OR usr.campaigns = 4) AND ((SELECT id FROM users_permission WHERE user_id=usr.id AND el_id =(SELECT sources_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 2) IS NOT NULL OR usr.sources = 1 OR usr.sources = 4) AND ((SELECT id FROM users_permission WHERE user_id=usr.id AND el_id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id) AND el_type = 3) IS NOT NULL OR (SELECT name FROM rotations WHERE id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id)) IS NULL OR (SELECT id FROM users_permission WHERE user_id=usr.id AND el_id = (SELECT group_id FROM rotations WHERE id =(SELECT rotation_id FROM campaigns WHERE id = showcase.camp_id)) AND el_type = 7) IS NOT NULL OR usr.rotations = 1 OR usr.rotations = 4))
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
			END IF;
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					login,
					user_group,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
						SELECT 
							id,
							login,
							user_group,
							",metrics_sql_2_sum,"
						FROM (
							(
								SELECT
									usr.id AS id,
									usr.login AS login,
									usr.user_group AS user_group,
									",metrics_sql_2,"
								FROM 
									users AS usr
									",sql_join,"
								WHERE 
									usr.id!=0 AND usr.id!=1 AND usr.id!=\',user_id,\' AND (showcase.camp_id!=0 OR showcase.camp_id IS NULL)
								GROUP BY usr.id
							) UNION ALL (
								SELECT
									usr.id AS id,
									usr.login AS login,
									usr.user_group AS user_group,
									",metrics_sql_2_direct,"
								FROM 
									users AS usr
								WHERE 
									usr.id!=0 AND usr.id!=1 AND usr.id!=\',user_id,\'
							)
						) AS stat_0 GROUP BY id
				) AS stat ",where_sql," ",order_sql,"
			");
		WHEN \'trends\' THEN  
			SET @showcase_sql=CONCAT("
				SELECT 
					date_name,
					date_value,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
						SELECT
							",var_date_name," AS date_name,
							",var_date_value," AS date_value,
							camp.status AS status,
							camp.sources_id AS ts_id,
							camp.group_id AS group_id,
							camp.rotation_id AS rotation_id,
							",metrics_sql_2,"
						FROM 
							campaigns AS camp
							LEFT JOIN ",trend_table," AS showcase ON showcase.el_id = camp.id AND date_type=",date_type," AND ",date_sql," AND ",sql_permission," 
						WHERE 
							date_name IS NOT NULL AND 
							camp.id!=0
							",where_sql,"
						GROUP BY ",var_date_name,"
				) AS stat ORDER BY date_value ASC
			");
		WHEN \'campaigns\' THEN  
			SET sql_join=CONCAT("
				campaigns AS camp 
				LEFT JOIN showcase_campaigns",table_suffix," AS showcase ON showcase.el_id = camp.id AND ",date_sql," AND ",sql_permission," 
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					clicks AS showcase
					LEFT JOIN campaigns AS camp ON camp.id = showcase.camp_id AND ",sql_permission," 
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
			END IF;
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					color,
					(SELECT is_banned FROM `domains` WHERE id = domain_id) AS is_banned,
					(SELECT COUNT(*) AS paths FROM paths WHERE rotation_id = stat.rotation_id AND status = 1 AND rule_id=0) AS paths_count,
					(SELECT COUNT(*) AS rules FROM rule WHERE rotation_id = stat.rotation_id AND status = 1) AS rules_count,
					IF(landers.landers IS NULL, 0, landers.landers) AS landers_count,
					IF(offers.offers IS NULL, 0, offers.offers) AS offers_count,
					name,
					status,
					ea,
					create_date,
					start_date,
					keyword,
					ts_id,
					camp_ts_integration_id,
					ts_integration_id,
					group_id,
					rotation_id,
					current_cpc,
					auto_cpc,
					use_id,
					camp_tokens,
					domain_id,
					(SELECT name FROM `domains` WHERE id = domain_id) AS domain_name,
					(SELECT `ssl` FROM `domains` WHERE id = domain_id) AS domain_ssl,
					rotation_name,
					(SELECT name FROM groups WHERE id = group_id) AS group_name,
					(SELECT name FROM traffic_sources WHERE id = ts_id) AS ts_name,
					(SELECT tokens FROM traffic_sources WHERE id = ts_id) AS use_tokens,
					(SELECT COUNT(id) FROM notes WHERE type_id = stat.id AND type=\'camp\' AND text!=\'\') AS is_note,
					(SELECT GROUP_CONCAT(CONCAT(\'&\',field,\'=\',val) SEPARATOR \'\') AS tokens_url FROM tokens WHERE source_id = ts_id) AS tokens_url,
					(SELECT CONCAT(e_name,\'=\',e_value) FROM traffic_sources WHERE e_name IS NOT NULL AND e_name!=\'\' AND e_value IS NOT NULL AND e_value!=\'\' AND id=ts_id) AS e_token,
					(SELECT CONCAT(c_name,\'=\',c_value) FROM traffic_sources WHERE c_name IS NOT NULL AND c_name!=\'\' AND c_value IS NOT NULL AND c_value!=\'\' AND id=ts_id) AS c_token,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
						SELECT 
							id,
							color,
							name,
							status,
							ea,
							create_date,
							start_date,
							keyword,
							ts_id,
							group_id,
							rotation_id,
							rotation_name,
							camp_ts_integration_id,
							ts_integration_id,
							domain_id,
							use_id,
							camp_tokens,
							current_cpc,
							auto_cpc,
							",metrics_sql_2_sum,"
						FROM (
							(
								SELECT
									camp.id AS id,
									camp.color AS color,
									camp.name AS name,
									camp.status AS status,
									camp.ea AS ea,
									camp.date_cr AS create_date,
									camp.start_camp AS start_date,
									camp.keyword AS keyword,
									camp.sources_id AS ts_id,
									camp.group_id AS group_id,
									camp.rotation_id AS rotation_id,
									(SELECT name FROM rotations WHERE id = camp.rotation_id) AS rotation_name,
									(SELECT id FROM camp_ts_integrations WHERE camp_id = camp.id) AS camp_ts_integration_id,
									(SELECT id FROM ts_integrations WHERE ts_id = camp.sources_id) AS ts_integration_id,
									camp.`domain` AS domain_id,
									camp.use_id AS use_id,
									camp.camp_tokens AS camp_tokens,
									camp.cpc AS current_cpc,
									camp.auto_cpc AS auto_cpc,
									",metrics_sql_2,"
								FROM 
									",sql_join,"
								WHERE 
									showcase.camp_id!=0 AND ",date_sql_direct,"
								GROUP BY showcase.camp_id
							) UNION ALL (
								SELECT
									camp.id AS id,
									camp.color AS color,
									camp.name AS name,
									camp.status AS status,
									camp.ea AS ea,
									camp.date_cr AS create_date,
									camp.start_camp AS start_date,
									camp.keyword AS keyword,
									camp.sources_id AS ts_id,
									camp.group_id AS group_id,
									camp.rotation_id AS rotation_id,
									(SELECT name FROM rotations WHERE id = camp.rotation_id) AS rotation_name,
									(SELECT id FROM camp_ts_integrations WHERE camp_id = camp.id) AS camp_ts_integration_id,
									(SELECT id FROM ts_integrations WHERE ts_id = camp.sources_id) AS ts_integration_id,
									camp.`domain` AS domain_id,
									camp.use_id AS use_id,
									camp.camp_tokens AS camp_tokens,
									camp.cpc AS current_cpc,
									camp.auto_cpc AS auto_cpc,
									",metrics_sql_2_direct,"
								FROM 
									campaigns AS camp
								WHERE camp.id!=0
							)
						) AS stat_0 GROUP BY id
				) AS stat 
					LEFT JOIN (
						SELECT COUNT(*) AS landers, rotation_id AS lp_rotation_id FROM (
							SELECT 
								paths.rotation_id
							FROM 
								path_com 
								LEFT JOIN paths ON paths.id = path_com.path_id
								LEFT JOIN rule ON rule.id = paths.rule_id
							WHERE 
								path_com.status = 1 AND
								paths.status = 1 AND
								path_com.`type` IN (1) AND
								(rule.id = 0 OR rule.status = 1)
							GROUP BY CONCAT(paths.rotation_id,\'-\',path_com.id_t,\'-\',path_com.`type`)
						) AS cnt_lp GROUP BY rotation_id
					) AS landers ON landers.lp_rotation_id=stat.rotation_id
					LEFT JOIN (
						SELECT COUNT(*) AS offers, rotation_id AS o_rotation_id FROM (
							SELECT 
								paths.rotation_id
							FROM 
								path_com 
								LEFT JOIN paths ON paths.id = path_com.path_id
								LEFT JOIN rule ON rule.id = paths.rule_id
							WHERE 
								path_com.status = 1 AND
								paths.status = 1 AND
								path_com.`type` IN (3,4,5) AND
								(rule.id = 0 OR rule.status = 1)
							GROUP BY CONCAT(paths.rotation_id,\'-\',path_com.id_t,\'-\',path_com.`type`)
						) AS cnt_of GROUP BY rotation_id
					) AS offers ON offers.o_rotation_id=stat.rotation_id
				",where_sql," ",order_sql,"
			");
		WHEN \'landing_page\' THEN  
			SET sql_join=CONCAT("
				landing_pages AS lp
				LEFT JOIN showcase_landings",table_suffix," AS showcase ON showcase.el_id = lp.id AND ",date_sql," AND ",sql_permission," 
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					clicks AS showcase
					LEFT JOIN landing_pages AS lp ON lp.id = showcase.landing_page AND ",sql_permission," 
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
				SET ElIDname = "landing_page";
			END IF;
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					is_banned,
					name,
					status,
					offers,
					lang,
					type,
					url,
					group_id,
					(SELECT name FROM groups WHERE id = group_id) AS group_name,
					(SELECT COUNT(id) FROM notes WHERE type_id = stat.id AND type=\'landing\' AND text!=\'\') AS is_note,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
					SELECT
						id,
						is_banned,
						name,
						status,
						offers,
						lang,
						type,
						url,
						group_id,
						",metrics_sql_2_sum,"
					FROM (
						(
							SELECT
								lp.id AS id,
								lp.is_banned,
								lp.name AS name,
								lp.status AS status,
								lp.offers AS offers,
								lp.lang AS lang,
								lp.type AS type,
								lp.url AS url,
								lp.group_lp AS group_id,
								",metrics_sql_2,"
							FROM 
								",sql_join,"
							WHERE 
								showcase.",ElIDname,"!=0 AND ",date_sql_direct,"
							GROUP BY showcase.",ElIDname,"
							
						) UNION ALL (
							SELECT
								lp.id AS id,
								lp.is_banned,
								lp.name AS name,
								lp.status AS status,
								lp.offers AS offers,
								lp.lang AS lang,
								lp.type AS type,
								lp.url AS url,
								lp.group_lp AS group_id,
								",metrics_sql_2_direct,"
							FROM 
								landing_pages AS lp
							WHERE lp.id!=0
						)
					) AS stat_0 GROUP BY id
				) AS stat ",where_sql," ",order_sql,"
			");
		WHEN \'offers\' THEN  
			SET sql_join=CONCAT("
				offers AS of
				LEFT JOIN showcase_offers",table_suffix," AS showcase ON showcase.el_id = of.id AND ",date_sql," AND ",sql_permission," 
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					clicks AS showcase
					LEFT JOIN offers AS of ON of.id = showcase.offer AND ",sql_permission," 
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
				SET ElIDname = "offer";
			END IF;
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					is_banned,
					name,
					status,
					network_id,
					(SELECT name FROM networks WHERE id = network_id) AS network_name,
					geo,
					upsell,
					IF(cap_status=1,CONCAT(cap_cnv,\' / \',cap),\'\') AS cap,
					auto_payout,
					payout,
					url,
					currency,
					group_id,
					(SELECT name FROM groups WHERE id = group_id) AS group_name,
					(SELECT COUNT(id) FROM notes WHERE type_id = stat.id AND type=\'offer\' AND text!=\'\') AS is_note,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
					SELECT 
						id,
						is_banned,
						name,
						status,
						network_id,
						geo,
						upsell,
						cap,
						cap_cnv,
						cap_status,
						auto_payout,
						payout,
						url,
						currency,
						group_id,
						",metrics_sql_2_sum,"
					FROM (
						(
							SELECT
								of.id AS id,
								of.is_banned,
								of.name AS name,
								of.status AS status,
								of.network AS network_id,
								of.geo,
								of.upsell,
								of.cap,
								of.cap_cnv,
								of.cap_status,
								of.auto_payout,
								of.payout,
								of.url AS url,
								of.currency,
								of.group_of AS group_id,
								",metrics_sql_2,"
							FROM 
								",sql_join,"
							WHERE 
								showcase.",ElIDname,"!=0 AND ",date_sql_direct,"
							GROUP BY showcase.",ElIDname,"
						) UNION ALL (
							SELECT
								of.id AS id,
								of.is_banned,
								of.name AS name,
								of.status AS status,
								of.network AS network_id,
								of.geo,
								of.upsell,
								of.cap,
								of.cap_cnv,
								of.cap_status,
								of.auto_payout,
								of.payout,
								of.url AS url,
								of.currency,
								of.group_of AS group_id,
								",metrics_sql_2_direct,"
							FROM 
								offers AS of
							WHERE of.id!=0
						)
					) AS stat_0 GROUP BY id
				) AS stat ",where_sql," ",order_sql,"
			");
		WHEN \'rotations\' THEN  
			SET sql_join=CONCAT("
				rotations AS rt
				LEFT JOIN showcase_rotations",table_suffix," AS showcase ON showcase.el_id = rt.id AND ",date_sql," AND ",sql_permission," 
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					clicks AS showcase
					LEFT JOIN rotations AS rt ON rt.id = showcase.dop_int_2 AND ",sql_permission," 
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
				SET ElIDname = "dop_int_2";
			END IF;
			
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					number,
					name,
					status,
					(SELECT COUNT(*) FROM campaigns WHERE rotation_id = stat.id AND status = 1) AS camps,
					group_id,
					(SELECT name FROM groups WHERE id = group_id) AS group_name,
					(SELECT COUNT(*) AS paths FROM paths WHERE rotation_id = stat.id AND status = 1 AND rule_id=0) AS paths_count,
					(SELECT COUNT(*) AS rules FROM rule WHERE rotation_id = stat.id AND status = 1) AS rules_count,
					IF(landers.landers IS NULL, 0, landers.landers) AS landers_count,
					IF(offers.offers IS NULL, 0, offers.offers) AS offers_count,
					(SELECT COUNT(id) FROM notes WHERE type_id = stat.id AND type=\'rotation\' AND text!=\'\') AS is_note,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
					SELECT 
						id,
						number,
						name,
						status,
						group_id,
						",metrics_sql_2_sum,"
					FROM (
						(
							SELECT
								rt.id AS id,
								rt.number AS number,
								rt.name AS name,
								rt.status AS status,
								rt.group_id AS group_id,
								",metrics_sql_2,"
							FROM 
								",sql_join,"
							WHERE 
								rt.number!=0 AND showcase.",ElIDname,"!=0 AND ",date_sql_direct,"
							GROUP BY showcase.",ElIDname,"
							
						) UNION ALL (
							SELECT
								rt.id AS id,
								rt.number AS number,
								rt.name AS name,
								rt.status AS status,
								rt.group_id AS group_id,
								",metrics_sql_2_direct,"
							FROM 
								rotations AS rt
							WHERE rt.number!=0 AND id!=0
						)
					) AS stat_0 GROUP BY id
				) AS stat 
					LEFT JOIN (
						SELECT COUNT(*) AS landers, rotation_id FROM (
							SELECT 
								paths.rotation_id
							FROM 
								path_com 
								LEFT JOIN paths ON paths.id = path_com.path_id
								LEFT JOIN rule ON rule.id = paths.rule_id
							WHERE 
								path_com.status = 1 AND
								paths.status = 1 AND
								path_com.`type` IN (1) AND
								(rule.id = 0 OR rule.status = 1)
							GROUP BY CONCAT(paths.rotation_id,\'-\',path_com.id_t,\'-\',path_com.`type`)
						) AS cnt_lp GROUP BY rotation_id
					) AS landers ON landers.rotation_id=stat.id
					LEFT JOIN (
						SELECT COUNT(*) AS offers, rotation_id FROM (
							SELECT 
								paths.rotation_id
							FROM 
								path_com 
								LEFT JOIN paths ON paths.id = path_com.path_id
								LEFT JOIN rule ON rule.id = paths.rule_id
							WHERE 
								path_com.status = 1 AND
								paths.status = 1 AND
								path_com.`type` IN (3,4,5) AND
								(rule.id = 0 OR rule.status = 1)
							GROUP BY CONCAT(paths.rotation_id,\'-\',path_com.id_t,\'-\',path_com.`type`)
						) AS cnt_of GROUP BY rotation_id
					) AS offers ON offers.rotation_id=stat.id
				",where_sql," ",order_sql,"
			");
		WHEN \'affiliate_networks\' THEN  
			SET sql_join=CONCAT("
				networks AS nt
				LEFT JOIN showcase_networks",table_suffix," AS showcase ON showcase.el_id = nt.id AND ",date_sql," AND ",sql_permission," 
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					clicks AS showcase
					LEFT JOIN networks AS nt ON nt.id = showcase.an AND ",sql_permission," 
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
				SET ElIDname = "an";
			END IF;
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					name,
					status, 
					postback_url,
					offer_url_template,
					(SELECT COUNT(*) FROM offers WHERE network = stat.id AND status = 1) AS offers,
					(SELECT COUNT(id) FROM notes WHERE type_id = stat.id AND type=\'network\' AND text!=\'\') AS is_note,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
					SELECT 
						id,
						name,
						status,
						postback_url,
						offer_url_template,
						",metrics_sql_2_sum,"
					FROM (
						(
							SELECT
								nt.id AS id,
								nt.name AS name,
								nt.status AS status,
								nt.postback_url AS postback_url,
								nt.offer_url_template AS offer_url_template,
								",metrics_sql_2,"
							FROM 
								",sql_join,"
							WHERE 
								showcase.",ElIDname,"!=0 AND ",date_sql_direct,"
							GROUP BY showcase.",ElIDname,"
						) UNION ALL (
							SELECT
								nt.id AS id,
								nt.name AS name,
								nt.status AS status,
								nt.postback_url AS postback_url,
								nt.offer_url_template AS offer_url_template,
								",metrics_sql_2_direct,"
							FROM 
								networks AS nt
							WHERE nt.id!=0
						)
					) AS stat_0 GROUP BY id
				) AS stat ",where_sql," ",order_sql,"
			");
		WHEN \'traffic_sources\' THEN  
			SET sql_join=CONCAT("
				traffic_sources AS ts
				LEFT JOIN showcase_sources",table_suffix," AS showcase ON showcase.el_id = ts.id AND ",date_sql," AND ",sql_permission," 
			");
			IF(date_type=4)THEN
				SET sql_join=CONCAT("
					clicks AS showcase
					LEFT JOIN traffic_sources AS ts ON ts.id = showcase.ts_id AND ",sql_permission," 
					LEFT JOIN clicks_events AS events ON click_id=showcase.id
				");
				SET ElIDname = "ts_id";
			END IF;
			SET @showcase_sql=CONCAT("
				SELECT 
					id,
					name,
					status, 
					tokens,
					(SELECT COUNT(*) FROM campaigns WHERE sources_id = stat.id AND status = 1) AS camps,
					(SELECT COUNT(id) FROM notes WHERE type_id = stat.id AND type=\'ts\' AND text!=\'\') AS is_note,
					(SELECT id FROM ts_integrations WHERE ts_id = stat.id) AS ts_integration_id,
					e_name,
					e_value,
					postback_url,
					",metrics_sql_1,",
					",custom_formulas_sql,"
					",default_formulas,"
				FROM (
					SELECT 
						id,
						name,
						status,
						postback_url,
						e_name,
						e_value,
						tokens,
						",metrics_sql_2_sum,"
					FROM (
						(
							SELECT
								ts.id AS id,
								ts.name AS name,
								ts.status AS status,
								ts.postback_url AS postback_url,
								ts.e_name AS e_name,
								ts.e_value AS e_value,
								ts.tokens AS tokens,
								",metrics_sql_2,"
							FROM 
								",sql_join,"
							WHERE 
								showcase.",ElIDname,"!=0 AND ",date_sql_direct,"
							GROUP BY showcase.",ElIDname,"
						) UNION ALL (
							SELECT
								ts.id AS id,
								ts.name AS name,
								ts.status AS status,
								ts.postback_url AS postback_url,
								ts.e_name AS e_name,
								ts.e_value AS e_value,
								ts.tokens AS tokens,
								",metrics_sql_2_direct,"
							FROM 
								traffic_sources AS ts
							WHERE ts.id!=0
						)
					) AS stat_0 GROUP BY id
				) AS stat ",where_sql," ",order_sql,"
			");
		ELSE
			SELECT \'error\';
	END CASE;
	IF(emulation_mode=1)THEN
		SELECT @showcase_sql;
	ELSE
		PREPARE showcase_sql FROM @showcase_sql;
		EXECUTE showcase_sql;
		DEALLOCATE PREPARE showcase_sql;
	END IF;
	END;
';
?>