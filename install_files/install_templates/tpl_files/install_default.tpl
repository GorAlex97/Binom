<script>
	$(document).ready(function() {
		install_step_1();
	});
	
	function error_handler(error){
		console.log(error);
		if(error['file']){
			$('.install_errors').html('<b>File:</b> '+error['file']+'<br>'+'<b>SQL:</b> '+error['sql']+'<br>'+error['error']);
		}else{
			$('.install_errors').html(error);
		}
		$('.install_errors').css('display','block');
		$('.install_block').css('height','350');
	}
	
	function install_step_4(step, cnt){
		perc=((52/cnt)*step)+10;
		progress_bar(perc,'Install: GEO Base '+step+'/'+cnt,2000);
		$.ajax({
			url: "?page=install_step_4&step="+step+"&type_load=ajax",
			type: "POST",
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					step=step+1;
					if(step>cnt){
						load_count_dir('device','install_step_5');
					}else{
						install_step_4(step,cnt);
					}
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function finish(){
		$('.install_progress_text').html('Binom has been successfully installed!');
		$('.install_progress_text').css('color','#699836'); 
		$('.install_progress_text').css('text-align','center'); 
		$('.install_buttons').css('display','block'); 
	}
	
	function install_step_8(){
		progress_bar(100,'Install: Finish...',1200);
		$.ajax({
			url: "?page=install_step_8&type_load=ajax",
			type: "POST",
			data: {
					"mail" : $("[name='mail']").val(),
					"user" : $("[name='user']").val(),
					"pass" : $("[name='pass']").val()
			},
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					finish();
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function install_step_7(){
		progress_bar(92,'Install: WURFL',5000);
		$.ajax({
			url: "?page=install_step_7&type_load=ajax",
			type: "POST",
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					install_step_8();
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function install_step_6(){
		progress_bar(82,'Install: Procedures',3000);
		$.ajax({
			url: "?page=install_step_6&type_load=ajax",
			type: "POST",
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					install_step_7();
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function install_step_5(step, cnt){
		perc=((14/cnt)*step)+62;
		progress_bar(perc,'Install: Device Base '+step+'/'+cnt,1000);
		$.ajax({
			url: "?page=install_step_5&step="+step+"&type_load=ajax",
			type: "POST",
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					step=step+1;
					if(step>cnt){
						install_step_6();
					}else{
						install_step_5(step,cnt);
					}
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function load_count_dir(name, function_name){
		$.ajax({
			url: "?page=load_count_dir&name="+name+"&type_load=ajax",
			type: "POST",
			success: function(data){
				window[ function_name ](1,data);
			}
		});
	}
	
	function install_step_3(){
		progress_bar(10,'Install: Structure',2200);
		$.ajax({
			url: "?page=install_step_3&type_load=ajax",
			type: "POST",
			data: {
					"db_host" : $("[name='db_host']").val(),
					"db_user" : $("[name='db_user']").val(),
					"db_pass" : $("[name='db_pass']").val(),
					"db_name" : $("[name='db_name']").val(),					
					"mail" : $("[name='mail']").val(),
					"user" : $("[name='user']").val(),
					"pass" : $("[name='pass']").val()
			},
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					load_count_dir('geo','install_step_4');
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function install_step_2(){
		//подготавливаем базу данных
		progress_bar(5,'Install: Create database',1500);
		$.ajax({
			url: "?page=install_step_2&type_load=ajax",
			type: "POST",
			data: {
					"db_host" : $("[name='db_host']").val(),
					"db_user" : $("[name='db_user']").val(),
					"db_pass" : $("[name='db_pass']").val(),
					"db_name" : $("[name='db_name']").val()
			},
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					install_step_3();
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
	
	function progress_bar(perc, msg_text, animate_time){
		perc=Math.ceil(perc);
		$(".install_progress_text").css("display","block");
		$(".install_progress_text").html(msg_text);
		width_progress=$(".pr_in_body").width();
		perc=width_progress*(perc/100);
		$( ".pr_in_line" ).animate({
			width: perc
		 }, animate_time);
	}
	
	function install_step_1(){
		//создаем настройки и правим права
		progress_bar(2,'Install: General settings',1200);
		$.ajax({
			url: "?page=install_step_1&type_load=ajax",
			type: "POST",
			data: {
					"db_host" : $("[name='db_host']").val(),
					"db_user" : $("[name='db_user']").val(),
					"db_pass" : $("[name='db_pass']").val(),
					"db_name" : $("[name='db_name']").val(),
					"timezone" : $("[name='timezone']").val()
			},
			success: function(data){
				data = JSON.parse(data);
				console.log(data);
				if(data['status']==='true'){
					install_step_2();
				}else{
					error_handler(data['error']);
				}
			}
		});
	}
</script>
<input type="hidden" name="db_host" value="<?php echo $arr_tpl['db_host']; ?>">
<input type="hidden" name="db_user" value="<?php echo $arr_tpl['db_user']; ?>">
<input type="hidden" name="db_pass" value="<?php echo $arr_tpl['db_pass']; ?>">
<input type="hidden" name="db_name" value="<?php echo $arr_tpl['db_name']; ?>">
<input type="hidden" name="mail" value="<?php echo $arr_tpl['mail']; ?>">
<input type="hidden" name="user" value="<?php echo $arr_tpl['user']; ?>">
<input type="hidden" name="pass" value="<?php echo $arr_tpl['pass']; ?>">
<input type="hidden" name="timezone" value="<?php echo $arr_tpl['timezone']; ?>">
<h3>Final step - Installation</h3>
<div class="pr_in_body">
	<div class="pr_in_line"></div>
</div>
<div style="height: 65px;">
	<div class="install_progress_text" style="display: none;">Binom has been successfully installed!</div>
	<div class="install_errors" style="display:none;width: auto;"></div>
	<div class="install_buttons" style="display:none;width: auto;">
		<center>
			<a class="green-button" id="finish_btn" href="?page=Campaigns" style="width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;">Finish</a>
			<a class="gray-button" id="back_btn" href="?page=step_2" style="width:80px;padding: 4px 5px;font-size: 15px; display:none;">Finish</a>
		</center>
	</div>
</div>