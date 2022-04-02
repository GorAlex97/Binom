<?php

$sql[]="
	INSERT INTO campaigns(id, user_id) VALUES (0,1);
	UPDATE campaigns SET id=0;
	ALTER TABLE campaigns AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO clicks(id) VALUES (0);
	UPDATE clicks SET id=0;
	ALTER TABLE clicks AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO clicks_events(id,click_id,camp_id) VALUES (0,0,0);
	UPDATE clicks_events SET id=0;
	ALTER TABLE clicks_events AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO clicks_map(click_id,click_time,camp_id,rc,rc_ip,rc_t,cpc) VALUES (0,0,0,0,0,0,0);
";

$sql[]="
	INSERT INTO clicks_referer_url(id, click_id, url) VALUES (0,0, 'Unknown');
	UPDATE clicks_referer_url SET id=0;
	ALTER TABLE clicks_referer_url AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO clicks_tokens(id, click_id) VALUES (0,0);
	UPDATE clicks_tokens SET id=0;
	ALTER TABLE clicks_tokens AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO clicks_tokens_lp(id, click_id, value_id, name_id) VALUES (0,0,0,0);
	UPDATE clicks_tokens_lp SET id=0;
	ALTER TABLE clicks_tokens_lp AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO conversion(id) VALUES (0);
	UPDATE conversion SET id=0;
	ALTER TABLE conversion AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO conversion_status(id,cnv_id,status,status2) VALUES (0,0,'Unknown','Unknown');
	UPDATE conversion_status SET id=0;
	ALTER TABLE conversion_status AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO `groups`(id) VALUES (0);
	UPDATE `groups` SET id=0;
	ALTER TABLE `groups` AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO landing_pages(id, status, name, url, group_lp, lang) VALUES (0,0,'DIRECT',0,0,0);
	UPDATE landing_pages SET id=0;
	ALTER TABLE landing_pages AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO networks(id, status, name) VALUES (0,0,0);
	UPDATE networks SET id=0;
	ALTER TABLE networks AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO offers(id) VALUES (0);
	UPDATE offers SET id=0;
	ALTER TABLE offers AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO offer_direct_url(id, url) VALUES (0,'');
	UPDATE offer_direct_url SET id=0;
	ALTER TABLE offer_direct_url AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO paths(id, status,  split, is_rule, name) VALUES (0,3,0,0,'Rules');
	UPDATE paths SET id=0;
	ALTER TABLE paths AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO rule(id, path_id, status, name) VALUES (0,0,0,'Default');
	UPDATE rule SET id=0;
	ALTER TABLE rule AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO  token_value (id,val)VALUES (0,'-');
	UPDATE token_value SET id=0;
	ALTER TABLE token_value AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO traffic_sources(id, name, tokens, postback_url, status, e_name, e_value) VALUES (0,0,0,0,0,0,0);
	UPDATE traffic_sources SET id=0;
	ALTER TABLE traffic_sources AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO  user_agents (id,user_agent,device_brand_id,device_model_id,device_lang_id,device_td1_id,device_td2_id,device_td3_id,device_td4_id,os,browser)VALUES (0,0,0,0,0,0,0,0,0,0,0);
	UPDATE user_agents SET id=0;
	ALTER TABLE user_agents AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO  rotations (id) VALUES (0);
	UPDATE rotations SET id=0;
	ALTER TABLE rotations AUTO_INCREMENT=1;
";

$sql[]="
	INSERT INTO  domains (id, name, `default`,`SSL`,`SSLstatus`,`SSLValidTime`) VALUES (0, '{domain}', 1, '{SSL}', 1, '".(time()+12*60*60)."');
	UPDATE domains SET id=0;
	ALTER TABLE domains AUTO_INCREMENT=1;
";
	
?>