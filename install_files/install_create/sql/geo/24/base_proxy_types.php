<?php 
	$sql[]="
		INSERT INTO base_proxy_types (id, name) VALUES
		(1, 'Tor exit node'),
		(2, 'Fake crawler'),
		(3, 'Known attack source - HTTP'),
		(4, 'Cgi proxy'),
		(5, 'Anonymizing VPN service'),
		(6, 'Web proxy'),
		(7, 'Web scraper'),
		(8, 'Known attack source - SSH'),
		(9, 'Known attack source - MAIL'),
		(10, 'Crawler'),
		(11, 'Unrecognized'),
		(12, 'Unknown Proxy'),
		(0, 'None');
	";
?>