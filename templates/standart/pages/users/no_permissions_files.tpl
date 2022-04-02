<div class="install_block">
	<h3 style="color:red">
		Files permission error.
	</h3>
	<div class='instruction_block'>

	<p>
	Для обновления трекера требуется установить правильные права и владельца на все папки и файлы трекера. Для этого вы можете использовать несколько способов. Ниже есть инструкция на более удобные.
	</p>

		<div class='instruction_panel_choice'>
			<p>
				Выберите вариант изменений прав на файлы трекера:
				<select  class='panel_select'>
					<option value='isp' selected>Через ISPmanager</option>
					<option value='ssh'>По SSH (без панели)</option>
				</select>
			</p>
		</div>

		

		<div class='instruction_info_block' style='margin-top:15px;'>

			<div class='isp  instruction_text' style='display:none;'>

				<!--<h4>Инструкция ISPmanager</h4>-->

				<p>
				1. Залогиньтесь в панель и перейдите в <b>File Manager</b> в левом меню панели.<br>
				<img src='templates/standart/images/install/instructions/isp-filemanager.png'>
				</p>
				<p>
				2. В файловой системе найдите папку с вашим трекером - <em><span class='full_path' style='font-weight: bold;'></span></em>
				</p>
				<p>
				3. Выберите эту папку и нажмите кнопку <b>Attr.</b> в верхнем меню.<br>
				<img src='templates/standart/images/install/instructions/isp-attr.png' >
				</p>
				<p>
				4. Измените права и владельца папки с трекером и <b>всех внутренних файлов</b>.<br>
				Права - <b>755</b>.<br>
				Владелец - <span style='font-weight: bold;' class='user_name'></span> (пользователя создавать не надо). <br><br>
				Пример:<br>
				<img src='templates/standart/images/install/instructions/isp-window.png' style='margin-top: 10px;' >
				</p>
				

			</div>

			<div class='ssh  instruction_text' style='display:none;'>

				<!--<h4>Инструкция SSH</h4>-->
				<p>
				1. Если у вас <b>Windows</b>, то <a href='https://the.earth.li/~sgtatham/putty/latest/x86/putty.exe' target='_blank'>Скачайте</a> программу <b>Putty.exe</b>.<br>
				В <b>MacOS</b> можете воспользоваться встроенным приложением <b>Terminal</b>.
				</p>
				<p>
				2. Подключитесь к вашему серверу по SSH. Для этого откройте <b>Putty</b>, введите IP-адрес вашего сервера в поле <b>Host name</b> и нажмите <b>Open</b>.<br>
				В <b>Terminal</b> (для MacOS) введите команду: <b>ssh root@[IP-адрес сервера]</b><br>
				Введите пароль.
				</p>
				<p>
				3. После подключения, введите следующие команды: 
				<div style='color:#fff;background-color: #000;margin-left: 15px; width: 500px; padding: 10px; font-size: 12px;'>
				chmod -R 755 <span class='full_path'></span><br>
				chown -R <span class='user_name'></span> <span class='full_path'></span>
				</div>
				</p>
			</div>
		</div>

	</div>
	<div class='install_buttons' style='width: 185px;padding-top: 5px;'>
		<a class='gray-button' href='?page=Campaigns' style='width: 80px; padding: 5 19 5 19;font-size: 15px;'>Back</a>
		<a class='green-button' href='' style='padding: 4px 27px;font-size: 15px;margin-left: 5px;'>Check</a>
	</div>
</div>