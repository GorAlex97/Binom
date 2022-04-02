<html>
	<head>
		<title>Install Binom</title>
		<link rel="shortcut icon" type="image/x-icon" href="templates/standart/images/logo.png"/>
		<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
		<link rel="stylesheet" href="templates/standart/css/style.css" />
		<link rel="stylesheet" href="install_files/install_templates/css/style.css" />
		<script type="text/javascript" src="templates/standart/js/jquery.js"></script>
		<script type="text/javascript" src="templates/standart/js/jqueryui192.js"></script>
	</head>
	<body id="body">
		<div class="head_menu">
				<div class="menu1">
					<a target="_blank" class="menu_button1" style="margin-left: 20px;" href="https://docs.binom.org/install.php">
						<img target="_blank" src="templates/standart/images/logo.png" style="width: 15px;margin-right: 5px; position: relative; top: 1px;">
						<b id="logo_text">Install Binom</b>
					</a>
					<a target="_blank" class="menu_button1" style="float:right;" href="https://cp.binom.org/page/support">
						Support
					</a>
					<a target="_blank" class="menu_button1" style="float:right;" href="https://docs.binom.org/install.php">
						Documentation
					</a>
					<a onclick="alert('<?php echo $arr_tpl['info']; ?>')" class="menu_button1" style="float:right;cursor:pointer;">
						About
					</a>
				</div>
			</div>
		<div class="main" style="margin:0;">
					
					<div class="install_block">
						<?php echo $arr_tpl['html'];?>
					</div>
					<div class="clear"></div>
				
		</div>
	</body>
</html>