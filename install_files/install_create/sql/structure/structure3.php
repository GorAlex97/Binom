<?php

$sql[]="
	ALTER TABLE campaigns
		ADD CONSTRAINT campaigns_group_id FOREIGN KEY (group_id) REFERENCES `groups` (id),
		ADD CONSTRAINT campaigns_sources_id FOREIGN KEY (sources_id) REFERENCES traffic_sources (id);
";

$sql[]="
	ALTER TABLE rule_criteria 
		ADD CONSTRAINT rule_criteria_rule_com_id FOREIGN KEY (rule_com_id) REFERENCES rule_com(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";

$sql[]="
	ALTER TABLE conversion_status 
		ADD CONSTRAINT conversion_status_cnv_id FOREIGN KEY (cnv_id) REFERENCES conversion (id);
";

$sql[]="
	ALTER TABLE clicks
		ADD CONSTRAINT clicks_camp_id FOREIGN KEY (camp_id) REFERENCES campaigns (id),
		ADD CONSTRAINT clicks_cvr_id FOREIGN KEY (cvr_id) REFERENCES conversion (id),
		ADD CONSTRAINT clicks_landing_page FOREIGN KEY (landing_page) REFERENCES landing_pages (id),
		ADD CONSTRAINT clicks_an FOREIGN KEY (an) REFERENCES networks (id),
		ADD CONSTRAINT clicks_path_id FOREIGN KEY (path_id) REFERENCES paths (id),
		ADD CONSTRAINT clicks_rule_id FOREIGN KEY (rule_id) REFERENCES rule (id),
		ADD CONSTRAINT clicks_ts_id FOREIGN KEY (ts_id) REFERENCES traffic_sources (id);  
";

$sql[]="
	ALTER TABLE conversion
		ADD CONSTRAINT conversion_camp_id FOREIGN KEY (camp_id) REFERENCES campaigns (id),
		ADD CONSTRAINT conversion_lp FOREIGN KEY (lp) REFERENCES landing_pages (id);  	
";

$sql[]="	
	ALTER TABLE landing_pages
		ADD CONSTRAINT landing_pages_group_lp FOREIGN KEY (group_lp) REFERENCES `groups` (id) ON DELETE SET NULL;  
";

$sql[]="
	ALTER TABLE offers
		ADD CONSTRAINT offers_group_of FOREIGN KEY (group_of) REFERENCES `groups` (id),
		ADD CONSTRAINT offers_network FOREIGN KEY (network) REFERENCES networks (id);  
";

$sql[]="
	ALTER TABLE path_com
		ADD CONSTRAINT path_com_path_id FOREIGN KEY (path_id) REFERENCES paths (id) ON DELETE CASCADE;
";

$sql[]="
	ALTER TABLE rule
		ADD CONSTRAINT rule_path_id FOREIGN KEY (path_id) REFERENCES paths (id);  
";

$sql[]="
	ALTER TABLE rule_com
		ADD CONSTRAINT rule_com_rule_id FOREIGN KEY (rule_id) REFERENCES rule (id) ON DELETE CASCADE;
";

$sql[]="
	ALTER TABLE tokens
		ADD CONSTRAINT tokens_source_id FOREIGN KEY (source_id) REFERENCES traffic_sources (id);
";

$sql[]="	
	ALTER TABLE rotations 
		ADD CONSTRAINT rotations_group_id FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";

$sql[]="
	ALTER TABLE campaigns 
		ADD CONSTRAINT campaigns_rotation_id FOREIGN KEY (rotation_id) REFERENCES rotations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";

$sql[]="
	ALTER TABLE paths 
		ADD CONSTRAINT paths_rotation_id FOREIGN KEY (rotation_id) REFERENCES rotations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";

$sql[]="
	ALTER TABLE rule 
		ADD CONSTRAINT rule_rotation_id FOREIGN KEY (rotation_id) REFERENCES rotations(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";

$sql[]="
	ALTER TABLE clicks_events 
		ADD CONSTRAINT clicks_events_click_id FOREIGN KEY (click_id) REFERENCES clicks(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";

$sql[]="
	ALTER TABLE clicks_events 
		ADD CONSTRAINT clicks_events_camp_id FOREIGN KEY (camp_id) REFERENCES campaigns(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
";
	
$sql[]="
	CREATE UNIQUE INDEX ukey ON temp_table(in_progress,`thread`,click_id,`type`,is_reload);
";

$sql[]="
	CREATE UNIQUE INDEX `ukey` ON clicks_info(camp_id,uclick,el_type,el_id);
";
/*
$sql[]="
	ALTER TABLE `editor_profiles`
		ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
";*/
$sql[]="
	ALTER TABLE `ts_integrations`
		ADD CONSTRAINT ts_id FOREIGN KEY (`ts_id`) REFERENCES `traffic_sources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
";

$sql[]="
ALTER TABLE `camp_ts_integrations`
	ADD FOREIGN KEY (`camp_id`)  REFERENCES `campaigns`(`id`)  ON DELETE CASCADE  ON UPDATE CASCADE;
";
$sql[]="
ALTER TABLE `camp_ts_integrations`
	ADD FOREIGN KEY (`ts_integration_id`)  REFERENCES `ts_integrations`(`id`)  ON DELETE CASCADE  ON UPDATE CASCADE;
";

$sql[]="
ALTER TABLE `mobile_proxies`
    ADD CONSTRAINT `mobile_proxies_proxy` FOREIGN KEY (`proxy_id`) REFERENCES `proxies` (`id`) ON DELETE CASCADE;
COMMIT;
";

$sql[]="
ALTER TABLE `facebook_accounts`
    ADD CONSTRAINT `fb_account_proxy` FOREIGN KEY (`proxy_id`)
        REFERENCES `proxies` (`id`) ON UPDATE CASCADE;
";
?>