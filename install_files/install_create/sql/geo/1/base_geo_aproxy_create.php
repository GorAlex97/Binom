<?php 
	$sql[]="
		DROP TABLE IF EXISTS base_crawlers;
	";
	$sql[]="
	CREATE TABLE IF NOT EXISTS base_crawlers(
		id int(11) NOT NULL,
		user_agent varchar(510) NOT NULL,
		name varchar(255) NOT NULL,
		org_name varchar(255) NOT NULL,
		INDEX id(id),
		INDEX user_agent(user_agent)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
	$sql[]="
		DROP TABLE IF EXISTS base_proxy;
	";
	$sql[]="
	CREATE TABLE IF NOT EXISTS base_proxy(
		id int(11) NOT NULL,
		ip bigint(20) NOT NULL,
		type_id int(11) DEFAULT NULL,
		crawler_id int(11) DEFAULT NULL,
		INDEX id(id),
		INDEX ip(ip)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
	$sql[]="
		DROP TABLE IF EXISTS base_proxy_types;
	";
	$sql[]="
	CREATE TABLE IF NOT EXISTS base_proxy_types(
		id int(11) NOT NULL,
		name varchar(255) NOT NULL,
		INDEX id(id)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
	$sql[]="
		DROP TABLE IF EXISTS base_crawler_types;
	";
	$sql[]="
	CREATE TABLE IF NOT EXISTS base_crawler_types(
		id int(11) NOT NULL,
		name varchar(255) NOT NULL,
		INDEX id(id)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
?>
