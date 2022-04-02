<script>
	function check(){
		error_div = $(".error_block");
		error_div.html("");
		$(".error_block").parent().css("display","none");
	
		check_user = checkUserData();
		check_db = checkDatabaseData();
		
		if ((check_user == "correct") && (check_db == "correct")){
			$.ajax({
				url: "?page=check_db&type_load=ajax",
				type: "POST",
				data: {
						"db_host" : $("[name=\'db_host\']").val(),
						"db_user" : $("[name=\'db_user\']").val(),
						"db_pass" : $("[name=\'db_pass\']").val(),
						"db_name" : $("[name=\'db_name\']").val()},
				success: function(data){
					data = JSON.parse(data);
					if(data['status']==='warning'){
						if(confirm('The database detected an older version of the tracker. Delete to continue?')){ 
							$.ajax({
								url: "?page=drop_database&type_load=ajax",
								type: "POST",
								data: {
										"db_host" : $("[name='db_host']").val(),
										"db_user" : $("[name='db_user']").val(),
										"db_pass" : $("[name='db_pass']").val(),
										"db_name" : $("[name='db_name']").val()},
								success: function(data_drop){
									data_drop = JSON.parse(data_drop);
									if(data['status']==='false'){
										error_div.append("<p>" + data['error'] + "</p>");
										$(".error_block").parent().css("display","block");
									}else{
										$("#install_form").submit();
									}
								}
							});
						}
					}else{
						if(data['status']==='false'){
							data['errors'].forEach(
								function(item, i){
									error_div.append("<p>" + item + "</p>");
									$(".error_block").parent().css("display","block");
								}
							);
						}else{
							$("#install_form").submit();
						}
					}
				}
			});
			
		}else{
			if (check_user !== "correct")
				check_user.forEach(
					function(item, i){
						error_div.append("<p>" + item + "</p>");
					}
			);
			if (check_db !== "correct"){
				check_db.forEach(
					function(item, i){
						error_div.append("<p>" + item + "</p>");
					}
				);
			}
		}
	}
	
	function checkDatabaseData(){
		host = $("[name='db_host']").val();
		user = $("[name='db_user']").val();
		pass = $("[name='db_pass']").val();
		dbname = $("[name='db_name']").val();
		errors = [];

		if (!host){
			errors.push("Enter database host");
		}else{
			var re = /[\s]/;
			if (re.test(host)){
				errors.push("Enter valid database host");
			}
		}
		if (!user){
			errors.push("Enter database user");
		}else{
			var re = /[\s]/;
			if (re.test(user)){
				errors.push("Enter valid database user");
			}
		}
		if (!pass){
			errors.push("Enter database pass");
		}else{
			var re = /[\s]/;
			if (re.test(pass)){
				errors.push("Enter valid database pass");
			}
		}
		if (!dbname){
			errors.push("Enter database name")
		}else{
			var re = /^[a-zA-Z0-9_]{3,99}$/;
			if (!re.test(dbname)){
				errors.push("Enter valid database name");
			}
		}

		if (errors.length==0){
			return "correct";
		}
		else{
			$(".error_block").parent().css("display","block");
			return errors;
		}
	}
	
	function checkUserData(){
		mail = $("input[name='mail']").val();
		user = $("input[name='user']").val();
		pass = $("input[name='pass']").val();
		errors = [];

		if (!user){
			errors.push("Enter username");
		}else{
			var re = /^[a-zA-Z0-9_]{3,99}$/;
			if (!re.test(user)){
				errors.push("Enter valid username");
			}
		}
		if (!pass){
			errors.push("Enter password");
		}else{
			var re = /^[a-zA-Z0-9_]{3,99}$/;
			if (!re.test(user)){
				errors.push("Enter valid password");
			}
		}
		if (!mail){
			errors.push("Enter email");
		}
		else{
			var re = /^(([^<>()\[\]\\\\.,;:\s@"]+(\.[^<>()\[\]\\\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (!re.test(mail)){
				errors.push("Enter valid email");
			}
		}
		
		if (errors.length==0){
			return "correct";
		}
		else{
			$(".error_block").parent().css("display","block");
			return errors;
		}

	}
</script>
<h3>Step <?php if($_GET['page']=='step_2'){echo '2';}else{echo '3';} ?> - Enter accesses</h3>
<div  style="display:none;background:#E53935;font-style:bold;color:#fff; margin-left: 15px;margin-right: 15px;">
	<span style="margin: 5px 10px;" class="error_block"></span>
</div> 
<p style="margin-bottom: 0px;">
	Below, enter <b>the root-acces</b>  for MySQL  and the database name for tracker. 
	You don't need to create database, installer will do it itself. 
	Also you need to type your login / password in tracker, your mail and timezone. 
	All statistics will be displayed in this timezone. 
	<b>Attention!</b> Timezone can not be changed in tracker after this step.
</p>
<form id="install_form" action="?page=install" method="post">					
		<div class="install_block_accesses" style="margin-top: 25px;">
			<h4>MySQL</h4>
			<table class="install_table_accesses">
				<tr>
					<td>
						<p>Host:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="db_host" value="localhost"></input>
					</td>
				</tr>
				<tr>
					<td>
						<p>User:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="db_user" value="root"></input>
					</td>
				</tr>
				<tr>
					<td>
						<p>Password:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="db_pass"></input>
					</td>
				</tr>
				<tr>
					<td>
						<p>Database name:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="db_name"></input>
					</td>
				</tr>
			</table>
		</div>
		<div class="install_block_accesses" style="float: right;margin-right: 20px;margin-top: 25px;">
			<h4>Main Settings</h4>

			<table class="install_table_accesses">
				<tr>
					<td>
						<p>User email:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="mail"></input>
					</td>
				</tr>
				<tr>
					<td>
						<p>User login:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="user"></input>
					</td>
				</tr>
				<tr>
					<td>
						<p>Password:</p>
					</td>
					<td>
						<input class="input_text" type="text" name="pass"></input>
					</td>
				</tr>
				<tr>
					<td>
						<p>Timezone:</p>
					</td>
					<td>
						<select class="timezone" name="timezone" id="timezone">
								<option value="-12:00">GMT -12:00	Eniwetok, Kwajalein, Baker Isl.</option>
								<option value="-11:00">GMT -11:00	Samoa, Niue</option>
								<option value="-10:00">GMT -10:00	Hawaii–Aleutian, Tahiti</option>
								<option value="-9:30">GMT -9:30		Marquesas Isl., Marquesas Isl.</option>
								<option value="-9:00">GMT -9:00		Alaska, Gambier Isl.</option>
								<option value="-8:00">GMT -8:00		Clipperton Isl., Pacific Time (North America)</option>
								<option value="-7:00">GMT -7:00		Mountain Time</option>
								<option value="-6:00">GMT -6:00		Central Time (North America), Easter Isl.</option>
								<option value="-5:00">GMT -5:00		Ecuador, Peru, Cuba</option>
								<option value="-4:00">GMT -4:00		Bolivia, Chile, Eastern Caribbean, Venezuelan, Paraguay</option>
								<option value="-3:30">GMT -3:30		Newfoundland</option>
								<option value="-3:00">GMT -3:00		Argentina, Brasilia, French Guiana, Uruguay</option>
								<option value="-2:00">GMT -2:00		South Georgia and the South Sandwich Isl., Fernando de Noronha</option>
								<option value="-1:00">GMT -1:00		Eastern Greenland, Cape Verde</option>
								<option value="+0:00">GMT 			Greenwich Mean, Western European</option>
								<option value="+1:00">GMT +1:00 	Irish, Central European, Middle European, West Africa</option>
								<option value="+2:00">GMT +2:00 	Israel, Kaliningrad, Central Africa, Eastern European, South African</option>
								<option value="+3:00">GMT +3:00		Moscow, Turkey, Further-eastern European, East Africa, Indian Ocean</option>
								<option value="+3:30">GMT +3:30		Iran</option>
								<option value="+4:00">GMT +4:00		Armenia, Azerbaijan, Georgia, Volgograd</option>
								<option value="+4:30">GMT +4:30		Afghanistan</option>
								<option value="+5:00">GMT +5:00 	Yekaterinburg, Uzbekistan, Turkmenistan, Indian/Kerguelen, Pakistan</option>
								<option value="+5:30">GMT +5:30		Indian, Maldives, Sri Lanka</option>
								<option value="+5:45">GMT +5:45		Nepal</option>	
								<option value="+6:00">GMT +6:00		Bangladesh, Omsk, Bhutan, Kyrgyzstan</option>
								<option value="+6:30">GMT +6:30		Myanmar, Cocos Isl.</option>
								<option value="+7:00">GMT +7:00 	Krasnoyarsk, Thailand, Indochina, Western Indonesian</option>
								<option value="+8:00">GMT +8:00 	Hong Kong, Malaysia, Singapore, Philippine, China</option>
								<option value="+8:45">GMT +8:45 	Central Western Time (Australia)</option>
								<option value="+9:00">GMT +9:00 	Japan, Korea, Yakutsk, Eastern Indonesian</option>
								<option value="+10:00">GMT +10:00	Vladivostok, Papua New Guinea</option>
								<option value="+10:30">GMT +10:30	Lord Howe</option>
								<option value="+11:00">GMT +11:00	Kosrae, New Caledonia, Srednekolymsk, Solomon Isl.</option>
								<option value="+12:00">GMT +12:00 	Fiji, Magadan, Tuvalu, Kamchatka, New Zealand</option>
								<option value="+12:45">GMT +12:45 	Chatham</option>
								<option value="+13:00">GMT +13:00 	Tonga, Tokelau, Phoenix Isl.</option>
								<option value="+14:00">GMT +14:00 	Line Isl.</option>
							</select>
					</td>
				</tr>
			</table>
			<p style="margin-left: 22px;display: none;">
				
					Timezone <b>CAN NOT</b> be changed once the system is in use.
					All tracking data will be logged based on this selected timezone.
					Please make sure you set this to what you want. 
			</p>
		</div>
		
		

	<div class="install_buttons" style="width: auto;clear: both;padding-top: 20px;">
		<center>
			<a class="gray-button" href="?page=step_1" style="width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;">Back</a>
			<a onclick="check()" class="green-button" style="width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;" >Install</a>
		</center>
	</div>
</form>