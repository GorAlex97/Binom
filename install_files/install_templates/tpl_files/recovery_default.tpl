<script>
	function check(){
		error_div = $(".error_block");
		error_div.html("");
		$(".error_block").parent().css("display","none");
	
		check_db = checkDatabaseData();
		
		if ((check_db == "correct")){
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
					if(data['status']==='true'){
						alert('No database');
					}else{
						if(data['status']==='warning'){
							$.ajax({
								url: "?page=recovery_start&type_load=ajax",
								type: "POST",
								data: {
										"db_host" : $("[name=\'db_host\']").val(),
										"db_user" : $("[name=\'db_user\']").val(),
										"db_pass" : $("[name=\'db_pass\']").val(),
										"db_name" : $("[name=\'db_name\']").val(),
										"timezone" : $("[name=\'timezone\'] option:selected").val()},
								success: function(data){
									data = JSON.parse(data);
									if(data['status']==='true'){
										alert('Finish');
									}else{
										alert(data);
									}
								}
							});
						}
					}
				}
			});
			
		}else{
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
</script>

<h3>Recovery</h3>
<div  style="display:none;background:#E53935;font-style:bold;color:#fff; margin-left: 15px;margin-right: 15px;">
	<span style="margin: 5px 10px;" class="error_block"></span>
</div> 
<p style="margin-bottom: 0px;">
	Below, enter <b>the root-acces</b>  for MySQL  and the database name for tracker.
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
				<tr>
					<td>
						<p>Timezone:</p>
					</td>
					<td>
						<select class="timezone" name="timezone" id="timezone">
							<option value="-12">(GMT -12:00) Eniwetok, Kwajalein</option>
							<option value="-11">(GMT -11:00) Midway Island, Samoa</option>
							<option value="-10">(GMT -10:00) Hawaii</option>
							<option value="-9">(GMT -9:00) Alaska</option>
							<option value="-8">(GMT -8:00) Pacific Time (US &amp; Canada)</option>
							<option value="-7">(GMT -7:00) Mountain Time (US &amp; Canada)</option>
							<option value="-6">(GMT -6:00) Central Time (US &amp; Canada), Mexico City</option>
							<option value="-5">(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima</option>
							<option value="-4">(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz</option>
							<option value="-3">(GMT -3:00) Brazil, Buenos Aires, Georgetown</option>
							<option value="-2">(GMT -2:00) Mid-Atlantic</option>
							<option value="-1">(GMT -1:00 hour) Azores, Cape Verde Islands</option>
							<option value="0">(GMT) Western Europe Time, London, Lisbon, Casablanca</option>
							<option value="1">(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris</option>
							<option value="2">(GMT +2:00) Kaliningrad, South Africa</option>
							<option selected value="3">(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg</option>
							<option value="4">(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi</option>
							<option value="5">(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent</option>
							<option value="6">(GMT +6:00) Almaty, Dhaka, Colombo</option>
							<option value="7">(GMT +7:00) Bangkok, Hanoi, Jakarta</option>
							<option value="8">(GMT +8:00) Beijing, Perth, Singapore, Hong Kong</option>
							<option value="9">(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk</option>
							<option value="10">(GMT +10:00) Eastern Australia, Guam, Vladivostok</option>
							<option value="11">(GMT +11:00) Magadan, Solomon Islands, New Caledonia</option>
							<option value="12">(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka</option>
						</select>
					</td>
				</tr>
			</table>
		</div>
		<div class="install_block_accesses" style="float: right;margin-right: 20px;margin-top: 25px;">
			<h4>Product Info</h4>

			<table class="install_table_accesses">
				<tr>
					<td>
						<p>Product:</p>
					</td>
					<td>
						<p><?php echo $arr_tpl['product']; ?></p>
					</td>
				</tr>
				<tr>
					<td>
						<p>Installer:</p>
					</td>
					<td>
						<p><?php echo $arr_tpl['installer']; ?></p>
					</td>
				</tr>
			</table>
		</div>

	<div class="install_buttons" style="width: auto;clear: both;padding-top: 20px;">
		<center>
			<a onclick="check()" class="green-button" style="width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;" >Start</a>
		</center>
	</div>
</form>