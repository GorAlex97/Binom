<?php  
	$sql[]="
		DROP TABLE IF EXISTS base_geo_ipv4;
	";	
	$sql[]="
		DROP TABLE IF EXISTS base_geo_ipv4;
	";
	$sql[]="
		DROP TABLE IF EXISTS base_geo_city_names;	
	";
	$sql[]="
		DROP TABLE IF EXISTS base_geo_cnct_names;	
	";
	$sql[]="
		DROP TABLE IF EXISTS base_geo_country_names;	
	";
	$sql[]="
		DROP TABLE IF EXISTS base_geo_isp_names;	
	";
	$sql[]="
		DROP TABLE IF EXISTS base_geo_continent_names;	
	";
	$sql[]="
		DROP TABLE IF EXISTS base_geo_region_names;	
	";
	
	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_ipv6 (
			id int(7) NOT NULL,
			s_ip binary(16) NOT NULL,
			e_ip binary(16) NOT NULL,
			continent_id INT NOT NULL DEFAULT '0',
			country_id int(3) NOT NULL,
			region_id INT NOT NULL DEFAULT '0',
			city_id int(6) NOT NULL,
			isp_id int(6) NOT NULL,
			cnct_id tinyint(1) NOT NULL,
			is_proxy tinyint(1) NOT NULL,
			is_satellite tinyint(1) NOT NULL DEFAULT '0',
			latitude decimal(9,4) NOT NULL DEFAULT '0',
			longitude decimal(9,4) NOT NULL DEFAULT '0',
			`radius` INT NOT NULL DEFAULT '0',
			is_old tinyint(1) NOT NULL DEFAULT '0',
			INDEX id (id),
			INDEX s_ip (s_ip)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
	
	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_ipv4 (
			id int(8) NOT NULL,
			s_ip bigint(12) NOT NULL,
			e_ip bigint(12) NOT NULL,
			continent_id tinyint(1) NOT NULL,
			country_id int(3) NOT NULL,
			region_id int(4) NOT NULL,
			city_id int(6) NOT NULL,
			cnct_id tinyint(1) NOT NULL,
			isp_id int(6) NOT NULL,
			is_proxy tinyint(1) NOT NULL,
			is_satellite tinyint(1) NOT NULL,
			longitude decimal(9,4) NOT NULL,
			latitude decimal(9,4) NOT NULL,
			radius int(4) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX s_ip (s_ip),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
	
	$sql[]="INSERT INTO base_geo_ipv4(
			id, s_ip, e_ip, continent_id, country_id, region_id, city_id, cnct_id, isp_id, is_proxy,
			is_satellite, longitude, latitude, radius, is_old) SELECT 
			0, 0, 0, 0, country_id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 FROM base_geo_ipv4 WHERE id = 0 LIMIT 1";

	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_city_names (
			id int(6) NOT NULL,
			name varchar(65) NOT NULL,
			timezone varchar(7) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";

	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_cnct_names (
			id int(1) NOT NULL,
			name varchar(11) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
		
	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_continent_names (
			id int(3) NOT NULL,
			name varchar(14) NOT NULL,
			code varchar(2) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX code (code),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
		
	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_country_names (
			id int(3) NOT NULL,
			name varchar(46) NOT NULL,
			country varchar(2) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX country (country),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
		
	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_isp_names (
			id int(6) NOT NULL,
			name varchar(95) NOT NULL,
			org_name varchar(55) NOT NULL,
			sorg_name varchar(95) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
		
	$sql[]="
		CREATE TABLE IF NOT EXISTS base_geo_region_names (
			id int(11) NOT NULL,
			name varchar(50) NOT NULL,
			code varchar(12) NOT NULL,
			is_old tinyint(1) NOT NULL,
			INDEX id (id),
			INDEX code (code),
			INDEX is_old (is_old)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;
	";
?>