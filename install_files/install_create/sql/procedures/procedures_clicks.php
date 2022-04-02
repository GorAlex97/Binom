<?php 
$sql[]="
CREATE PROCEDURE saverClicks(IN countClicks INT)  BEGIN
	/*{\"product\":\"Binom 1.14\",\"version\":\"1.2\",\"date\":\"26.09.2019\"}*/
	DECLARE last_id, log_id  INT;
	DECLARE time_client DATETIME;
	CALL time_convert(NOW(),time_client);
	IF(countClicks>1499)THEN
		SET last_id=(SELECT id FROM temp_clicks ORDER BY id ASC LIMIT 1500,1);
	END IF;
	IF(last_id IS NULL)THEN
		SET last_id=(SELECT id FROM temp_clicks ORDER BY id DESC LIMIT 1);
	END IF;
	INSERT INTO clicks (id, click_time, camp_id, offer, path_id, landing_page, cvr_id, ts_id, rule_id, offer_click, offer_type, an, pay, cpc, geo, ua, ip, publisher, referer_domain, bidhash, token, is_bot, dop_int, dop_int_2, dop_int_3) SELECT id, click_time, camp_id, offer, path_id, landing_page, cvr_id, ts_id, rule_id, offer_click, offer_type, an, pay, cpc, geo, ua, ip, publisher, referer_domain, bidhash, token, is_bot, dop_int, dop_int_2, dop_int_3 FROM temp_clicks WHERE id <= last_id;
	DELETE FROM temp_clicks WHERE id <= last_id;
END;
";
?>