<script>
$(document).ready(function() {
	var  panel_select = $('.panel_select');

	panel_select.on('change',   function(){
		$('#isp').css('display','none');
		$('#ssh').css('display','none');
		$('#'+panel_select.val()).css('display','block');
	});
});
</script>
<div class='instruction_block'>
	<h3>Step 2 - Permissions</h3>
	<div  style='display:<?php if($arr_tpl['files_status']!=='true'){echo 'block';}else{echo 'none';}?>;background:#E53935;font-style:bold;color:#fff; margin-left: 15px;margin-right: 15px;'>
		<span style='margin: 5px 10px;' class='error_block'>
			<p style='cursor:pointer;' onclick="if($('.err_files').css('display')=='none'){$('.err_files').css('display','block');}else{$('.err_files').css('display','none');}">Incorrect permissions on files.</p><div class='err_files' style='display:none;'><?php if($arr_tpl['files_status']!=='true'){echo $arr_tpl['files'];} ?></div>
		</span>
	</div> 
	<p>
		For install and update tracker you must to set the correct permissions and owner of all tracker's folders and files. To do this, you can use several methods described below
	</p>
	<div class='instruction_panel_choice'>
		<p>
			Select the option to change the permissions of the tracker files:
			<select  class='panel_select'>
				<option value='isp' selected>via ISPmanager</option>
				<option selected value='ssh'>via SSH (without web-panel)</option>
			</select>
		</p>
	</div>
	<div class='instruction_info_block' style='margin-top:15px;'>
		<div id='isp' class='isp  instruction_text' style='display:none;'>
			<p>
			1. Login to your panel and go to the <b>File Manager</b> in the left panel menus.<br>
			<img src='templates/standart/images/install/instructions/isp-filemanager.png'>
			</p>
			<p>
			2. Find the folder with your tracker in the file system - <em><span class='full_path' style='font-weight: bold;'><?php echo $arr_tpl['dir'] ?></span></em>
			</p>
			<p>
			3. Select the folder and click the button <b>Attrib.</b> in the top menu.<br>
			<img src='templates/standart/images/install/instructions/isp-attr.png' >
			</p>
			<p>
			4. Change permissions and <b>owner for the folder with all</b> tracker's files.<br>
			Permissions - <b>755</b>.<br>
			Owner - <span style='font-weight: bold;' class='user_name'><?php echo $arr_tpl['user_name']; ?></span> (do not need to create a user). <br><br>
			Sample:<br>
			<img src='templates/standart/images/install/instructions/isp-window.png' style='margin-top: 10px;' >
			</p>
		</div>
		<div id='ssh' class='ssh  instruction_text' style='display:block;'>
			<p>
			1. If you use <b>Windows</b>, you can <a href='https://the.earth.li/~sgtatham/putty/latest/x86/putty.exe' target='_blank'>download</a> the application <b>Putty.exe </b>.<br>
			In <b>MacOS</b> you can use the built-in <b>Terminal</b>.
			</p>
			<p>
			2. Connect to your server via SSH. To do this, open <b>Putty</b>, enter your server's IP-address in the <b>Host name</b> and click <b>Open</b>.<br>
			In <b>Terminal</b> (for MacOS), type the command: <b>ssh root@[IP-address of the server]</b> and enter password.<br>
			</p>
			<p>
			3. After connecting, type the following commands:
			<div style='color:#fff;background-color: #000;margin-left: 15px; width: 500px; padding: 10px; font-size: 12px;'>
			chmod -R 755 <?php echo $arr_tpl['dir'] ?><span class='full_path'></span><br>
			chown -R <?php echo $arr_tpl['user_name'].' '.$arr_tpl['dir'] ?><span class='user_name'></span> <span class='full_path'></span>
			</div>
			</p>
		</div>
	</div>
</div>
						
<div class='install_buttons' style='width: auto;padding-top: 5px;'>
	<center>
		<a class='gray-button' href='?page=step_1' style='width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;'>Back</a>
		<?php if($arr_tpl['files_status']!=='true'){?>
			<a class='blue-button' href='javascript: location.reload();' style='width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;'>Refresh</a>
		<?php }else{?>
			<a class='green-button' href='#' style='width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;'>Next</a>
		<?php }?>					
	<center>
</div>