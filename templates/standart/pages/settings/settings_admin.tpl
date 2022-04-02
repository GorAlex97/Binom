<?php  echo $arr_tpl['columns-list']; ?>

<script>
	window.SettingsJSONContainer = '<?php echo json_encode($arr_tpl["settings"]); ?>';
	window.SETTINGS_DATA = JSON.parse( window.SettingsJSONContainer );
</script>

<div class="settings_block">
	<input name="user_group" value="<?php //echo $arr_tpl['settings']['user_perm']['user_group']; ?>" type="hidden">

	<h3 class="settings_title" style="padding-top: 15px; padding-bottom: 15px; margin:0;">Binom Settings</h3>

	<div class="tab_header tab-menu">
		<div data-tab-name="tracking-links" class="tab-button tab-button-active">Tracking links</div>
		<div data-tab-name="user-info" class="tab-button">User</div>
		<div data-tab-name="stats" class="tab-button">Stats</div>
		<div data-tab-name="lp-protect" class="tab-button">LP Protect</div>

		<div data-tab-name="api" class="tab-button">API</div>

		<?php if($arr_tpl['settings']['user_perm'] == 1 ): ?>
			<div data-tab-name="import-export" class="tab-button">Import/Export</div>
		<?php endif; ?>

		<?php if($arr_tpl['settings']['user_perm'] == 1): ?>
			<div data-tab-name="url-customization" class="tab-button">URL Customization</div>
		<?php endif; ?>

		<div data-tab-name="2fa" class="tab-button">
			2FA
		</div>

		<div data-tab-name="notifications" class="tab-button">Notifications</div>

		<?php if($arr_tpl['settings']['user_perm'] == 1): ?>
			<div data-tab-name="clearings" class="tab-button">Clearings</div>
		<?php endif; ?>
	</div>

	<div class="tab-content-wrapper tab-content-wrapper-settings" >
		<div data-tab-name="tracking-links" class="tab-content-block tab-content-block-active">
			<div class="settings-tab">
				<h4>Click URL</h4>
				<p>
					With Binom you don't need to place any PHP code on your landing pages. Visitors are redirected based on data stored in a cookie and referrer.
				</p>
				<input readonly class="input-with-copy" value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('lp',1);?>=1" id="copy_value1" type="text"/>
				<a href="javascript:" id="copy_btn1" class="button copy_button">Copy</a>
				<h4>Postback URL</h4>
				<p>
					Server-to-server postback URLs are the most secure and reliable method to count conversions. Use the URLs below to pass conversions from affiliate networks. To get your postback links working you have to:
					<ol>
						<li>
							Include the {clickId} token in your offer URLs. For example, you can add <b>&clickid={clickid}</b> to the offer URL, to have the click ID passed to the postback via the subid parameter on the affiliate network/advertiser side.
						</li>
						<li>
							Copy-paste the postback URL to your affiliate network panel. Make sure to replace the tokens with affiliate network-specific tokens. The following is what your postback URL would look like on a HasOffers based network: <br>
							<a href="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={aff_sub}&<?php echo protection::get_key('payout',1);?>={payout}">
								<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={aff_sub}&payout={payout}
							</a>
						</li>
					</ol>
				</p>
				<p>
					Consult the affiliate network documentation or support to find out which tokens you should use to pass back click ID and payout. The payout parameter is optional, if you do not use it, you can manually specify the payout in the offer configuration. Do not put these URLs or any of the tracking pixels / scripts in your landing pages.
				</p>
				<input
					readonly
					value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={network_token}&<?php echo protection::get_key('payout',1);?>={payout}"
					id="copy_value2"
					type="text"
					class="input-with-copy"
				/>
				<a href="javascript:" id="copy_btn2" class="button copy_button">
					Copy
				</a>
				<p>
					Postback URL for conversions with statuses (signup, checkout, approve, reject, etc.):
				</p>
				<input 
					readonly 
					value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={network_token}&<?php echo protection::get_key('payout',1);?>={payout}&<?php echo protection::get_key('cnv_status',1) ?>={status}" 
					id="copy_value_postback_2"
					class="input-with-copy"
					type="text"
				/>
				<a href="javascript:" id="copy_btn_postback_2" class="button copy_button">
					Copy
				</a>
				<h4>Tracking pixel URL</h4>
				<p>
				In cases when your affiliate network only supports client-side pixels, you can use a conversion pixel or script. Conversion pixels are cookie-based and so you have to use the same domain for the cookie to work correctly. The clickid is also stored in a cookie, so conversion tracking will still work if the parameter is missing.
				</p>
				<p>
				Consult your affiliate network documentation or support to find out how to specify conversion pixels in their web panel. The payout parameter is optional, if you do not use it, you can manually specify payout in the offer configuration.
				</p>
				<p>
				Do not put these URLs or any of the postback URLs in your landing pages.
				</p>
				<input readonly id="copy_value4" value='<script>(function(){"use strict";function n(n,e){var r;void 0===e&&(e="uclick");var c=null===(r=n.match(/\?.+?$/))||void 0===r?void 0:r[0];return c?Array.from(c.matchAll(new RegExp("[?&](clickid|"+e+")=([^=&]*)","g"))).map((function(n){return{name:n[1],value:n[2]}})):[]}function e(n){var e=n();return 0===e.length?{}:e.reduce((function(n,e){var r;return Object.assign(n,((r={})[e.name]=""+e.value,r))}),{})}function r(r){void 0===r&&(r="uclick");var c,t,u=e((function(){return(function(n){return void 0===n&&(n="uclick"),Array.from(document.cookie.matchAll(new RegExp("(?:^|; )(clickid|"+n+")=([^;]*)","g"))).map((function(n){return{name:n[1],value:n[2]}}))})(r)})),i=e((function(){return n(document.referrer,r)})),o=e((function(){return n(document.location.search,r)}));return(c=[r,"clickid"],t=[u,i,o],c.reduce((function(n,e){return n.concat(t.map((function(n){return[e,n]})))}),[])).map((function(n){return{name:n[0],value:n[1][n[0]]}})).find((function(n){return n.value}))||null}var c,t,u,i;(i=document.createElement("img")).src=(t=""+"<?php echo $arr_tpl["domain_url"]; ?>"+"<?php echo $arr_tpl["settings"]["custom_url"]["click"]; ?>"+".php?payout=OPTIONAL",(u=r(c="<?php echo protection::get_key("uclick",1);?>"))?t+"&cnv_id="+(u.name===c?"OPTIONAL":u.value)+(u.name===c?"&"+c+"="+u.value:""):t+"&cnv_id=OPTIONAL"),i.referrerPolicy="no-referrer-when-downgrade"})();</script>' type="text" class="input-with-copy" />
				<a href="javascript:" id="copy_btn4" class="button copy_button">Copy</a>
			</div>
		</div>
		<div data-tab-name="user-info" class="tab-content-block">
			<div class="settings-tab">
				<div class="setting_left_block">
					<h4 class="bnm-settings-user-title" style="margin-left: 200px;">User info</h4>
					<form method="post" action="?page=save_settings&type=1" id="usr-info-form">
						<input name="id" value="<?php //echo $arr_tpl['settings']['user_info']['id']; ?>" type="hidden">
						<div class="field_set" style="text-align: left;padding-left: 70px;margin-top: 23px;margin-bottom: 4px;">
							<div style="text-align: left;">
								<span class="bnm-settings-inp-title" style="margin-right: 34px;">Login</span>

								<span class="user_login">
									<?php echo $arr_tpl['settings']['user_info']['login']; ?>
								</span>

								<div class="user_login_change_button">
									<img src="templates/standart/images/appbar.draw.pencil.png">
								</div>

								<input style="display:none" name="login" value="<?php echo $arr_tpl['settings']['user_info']['login']; ?>" type="text">

								<span class="gray-button user_login_change_button_cancel" style="display:none">
									Cancel
								</span>

							</div>
						</div>
						<div class="field_set old_password_field_set" style="display:none">
							<span style="margin-right: 34px;">Password</span>
							<input name="login_old_password"
								   type="password"
								   placeholder="Enter pass to change login"
								   onclick="this.placeholder=''"
								   onblur="this.placeholder='Enter pass to change login'">
						</div>
						<div class="field_set">
							<span class="bnm-settings-inp-title" style="margin-right:34px;">Email</span>
							<input name="email" value="<?php echo $arr_tpl['settings']['user_info']['email']; ?>" type="text">
						</div>
						<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
						<div class="field_set">
							<span class="bnm-settings-inp-title" style="margin-right: 34px;">Timezone</span>
							<select name="time_zone" id="user_timezone">
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
								<option value="+1:00">GMT +1:00 	Central European, Middle European, West Africa</option>
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
						</div>
						<?php endif; ?>
						<a onclick="saveUserInfo()" class="button_inactive save_user_info_button" style="display: block; width: 178px;margin-left: 140px;margin-top: 22px;">
							<img src="templates/standart/images/w-save.png" class="icon save_icon">
							Save
						</a>

					</form>
				</div>
				<div class="setting_right_block">
					<h4 class="bnm-settings-password-title" style="margin-left: 170px;">Change password</h4>
					<form method="post" action="?page=save_settings&type=1" id="pass-form">
						<input name="id" value="<?php //echo $arr_tpl['user']['id']; ?>" type="hidden">
						<div class="field_set">
							<span class="bnm-settings-inp-title">Old password</span>
							<input name="old_pass" value="" type="password">
						</div>
						<div class="field_set">
							<span class="bnm-settings-inp-title">New password</span>
							<input name="new_pass"  value="" type="password">
						</div>
						<div class="field_set">
							<span class="bnm-settings-inp-title">Re-enter</span>
							<input name="copy_new_pass"  value="" type="password">
						</div>
						<a onclick="saveNewPassword()" class="button_inactive save_new_password_button" style="display: block; width: 178px;margin-left: 140px;margin-top: 22px;">
						<img src="templates/standart/images/w-save.png" class="icon save_icon">Save</a>
					</form>
				</div>
			</div>
			<div class="clear"></div>
		</div>
		<div data-tab-name="stats" class="tab-content-block tab-content-block-settings-stats" >
			<div class="settings-tab" style="padding-top: 20px;">
				<form method="post" action="?page=save_settings&type=2" id="customize-form">
					<div class="setting_left_block" >
						<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
						<div class="field_set">
							<span class="bnm-settings-inp-title">User session (s)</span>
							<input 
								name="cookies" 
								value="<?php 
									if (isset($arr_tpl['settings']['settings']['cookies'])){
										echo $arr_tpl['settings']['settings']['cookies'];
									} else {
										echo '86400';
									}
								?>" 
								type="number" 
								style="margin-top: 10px;margin-right: 0px;" 
								min="600" 
								max="1200000"
						>
						</div>
						<?php endif; ?>

						<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
						<div class="field_set">
							<span class="bnm-settings-inp-title">Unique period (s)</span>
							<input name="cookies_click" value="<?php echo $arr_tpl['settings']['settings']['cookies_click'];?>" type="number" style="margin-right: 0px;" min="1" max="1200000">
						</div>
						<?php endif; ?>

						<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
							<div class="field_set">
								<span class="bnm-settings-inp-title">Instant unsub. period (s)</span>
								<input name="waiting_time" value="<?php echo $arr_tpl['settings']['status_scheme_options']['waiting_time'];?>" type="number" style="margin-right: 0px;" min="2" max="1200000">
							</div>
						<?php endif; ?>
						<div class="field_set">
							<span class="bnm-settings-inp-title">With-traffic filter min. clicks</span>
							<input
								name="with_traffic_limit"
								value="<?php
									if (isset($arr_tpl['settings']['settings']['with_traffic_limit']) ){
										echo $arr_tpl['settings']['settings']['with_traffic_limit'];
									} else {
										echo '1';
									}
								?>"
								type="number"
								style="margin-right: 0px;  <?php if ($arr_tpl["settings"]["user_perm"] !=1 ){echo 'margin-top: 10px;';} ?>"
								min="1"
								max="1200000"
							>
						</div>
						<?php if ($arr_tpl["settings"]["user_info"]["user_id"]=='1'): ?>
						<div class="field_set" style="text-align: right;">
							<span>Google API key</span>
							<input
								name="googleApiKey"
								style="margin-top: 20px; height: 25px;width: 200px; margin-left: 0; margin-right: 0;"
								value="<?php
										echo ($arr_tpl['settings']['settings']['googleApiKey']=='0'?'':$arr_tpl['settings']['settings']['googleApiKey']);
									?>"
								type="text"
								style="margin-right: 0px;"
							>
						</div>
						<?php endif; ?>
						<div class="field_set" style="text-align: left; margin-left: 5px; margin-top: 20px;">
							<label style="vertical-align: middle;" for="save_report_groups"><span class="bnm-settings-inp-title">Remember groups in reports</span></label>
							<input id="save_report_groups" <?php if($arr_tpl['settings']['settings']['save_report_groups']==1){echo 'checked';}?> style="height: 14px; width: 14px; margin:0; position: relative; left: 1px; vertical-align: middle;" type="checkbox" name="save_report_groups">
						</div>
						<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
						<div class="field_set" style="text-align: left; margin-left: 30px; margin-top: 20px;">
							<label style="vertical-align: middle;" for="gdpr_ip_option"><span class="bnm-settings-inp-title">IP anonymization (GDPR)</span></label>
							<input id="gdpr_ip_option" <?php if($arr_tpl['settings']['settings']['gdpr_ip_option']==1){echo 'checked';}?> style="height: 14px; width: 14px; margin:0; position: relative; left: 1px; vertical-align: middle;" type="checkbox" name="gdpr_ip_option">
						</div>
						<div class="field_set" style="text-align: left; margin-left: 33px; margin-top: 20px;">
							<label style="vertical-align: middle;" for="gdpr_cookie_option"><span class="bnm-settings-inp-title">No-Cookie Mode (GDPR)</span></label>
							<input id="gdpr_cookie_option" <?php if($arr_tpl['settings']['settings']['gdpr_cookie_option']==1){echo 'checked';}?> style="height: 14px; width: 14px; margin:0; position: relative; left: 1px; vertical-align: middle;" type="checkbox" name="gdpr_cookie_option">
						</div>
						<?php endif; ?>
					</div>
					<div class=" setting_right_block" >
						<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
						<div class="field_set" style="text-align: right;">
							<span class="bnm-settings-inp-title">Conversion Logs</span>
							<select id="conversion_logs_input" style="margin-top: 10px;" name="conversion_logs">
								<option value="nothing">Nothing</option>
								<option value="conversion">IN only</option>
								<option value="postback">OUT only</option>
								<option value="all">IN & OUT</option>
							</select>
						</div>
						<?php endif; ?>
						<div class="field_set" style="text-align: right;">
							<span class="bnm-settings-inp-title">Table style</span>
							<select id="customtable_input" style="margin-top: 10px;" name="table_colors">
								<option value="0">White</option>
								<option value="2">Gray/white</option>
								<option value="1">Colorize Rows</option>
								<option value="3">Colorize Cells</option>
							</select>
						</div>

						<div class="field_set" style="text-align: right;">
							<span class="bnm-settings-inp-title">Second sorting, column</span>
							<select id="second_sorting_column_input" style="margin-top: 10px;" name="second_sorting_column">
								<option value="clicks">Clicks</option>
								<option value="lp_clicks">LP Clicks</option>
								<option value="leads">Leads</option>
								<option value="revenue">Revenue</option>
								<option value="cost">Cost</option>
								<option value="profit">Profit</option>
								<option value="roi">ROI</option>
								<option value="unique_clicks">Unique</option>
							</select>
						</div>
						<div class="field_set" style="text-align: right;">
							<span class="bnm-settings-inp-title">Second sorting, type</span>
							<select id="second_sorting_type_input" style="margin-top: 10px;" name="second_sorting_type">
								<option value="desc">Descending</option>
								<option value="asc">Ascending</option>
							</select>
						</div>
						
						<div style="margin-top: 24px;">
							<div class="field_set" style="display: flex; align-items: center; padding-left: 45px">
								<label style="vertical-align: middle;" for="table_vertical_line"><span class="bnm-settings-inp-title" style="right: 4px;">Table vertical line</span></label>
								<input id="table_vertical_line" <?php if($arr_tpl['settings']['settings']['table_vertical_line']==1){echo 'checked';}?> style="margin-top: 20px;height: 14px;width: 14px; margin: 0 220px 0 0; vertical-align: middle; " type="checkbox" name="table_vertical_line">
							</div>
						</div>
						
						<div style="margin-top: 25px;">
							<div class="field_set" style="display: flex; align-items: center; padding-left: 45px">
								<label style="vertical-align: middle;" for="disable_shortcuts "><span class="bnm-settings-inp-title" style="right: 4px;">Disable shortcuts</span></label>
								<input id="disable_shortcuts" <?php if($arr_tpl['settings']['settings']['disable_shortcuts']==1){echo 'checked';}?> style="margin-top: 20px;height: 14px;width: 14px; margin: 0 220px 0 0; vertical-align: middle; " type="checkbox" name="disable_shortcuts">
							</div>
						</div>
						<div style="margin-top: 21px;">
							<div class="field_set" style="display: flex; align-items: center; padding-left: 45px">
								<label style="vertical-align: middle;" for="disable_shortcuts "><span class="bnm-settings-inp-title" style="right: 4px; margin-right: 20px;">Hide SFTP Editor</span></label>
								<input id="hide_sftp" <?php if($arr_tpl['settings']['settings']['hide_sftp']==1){echo 'checked';}?> style="margin-top: 20px;height: 14px;width: 14px; margin: 0 220px 0 0; vertical-align: middle; " type="checkbox" name="hide_sftp">
							</div>
						</div>
					</div>
				</form>
				<form method="post" action="?page=save_settings&type=2" id="customize-form-digits">
					<div class="clear"></div>
						<script>
							function adv_hideshow(){

								if ($("#adv_settings_div").css("display")=="none")
								{
									$("#adv_settings_div").show();
									 
									$(".adv_settings img").attr("src","templates/standart/images/arrow_up.png");
									if (!FlashDetect.installed){
										try {
											new Clipboard('#copy_btn_pixel');
											$("#copy_btn_pixel").replaceWith($("<a href='javascript:' id='copy_btn_pixel' class='button' style='float:right;' data-clipboard-target='#lp_pixel_input' >Copy</a>"));
										} catch (e){
											$("#lp_pixel_input").css({'width':'100%'});
										}
									} else {
										addZclip("#copy_btn_pixel", "#lp_pixel_input");
									}
								}
								else
								{
									$("#adv_settings_div").hide();
									$(".adv_settings img").attr("src","templates/standart/images/arrow_down.png");
								}
							}
						</script>

				</form>

				<script>
					function frml_hideshow(){
						if ( $("#frml_settings_div").css('display') == 'none' ){
							URLUtils.addParamToHASH( 'slider-columns', 'open' );
							$("#frml_settings_div").css('display', 'block');
							$(".custom_column_settings_toggler img").attr("src","templates/standart/images/arrow_up.png");
						} else {
							URLUtils.removeParamToHash( 'slider-columns' );
							$("#frml_settings_div").css('display', 'none');
							$(".custom_column_settings_toggler img").attr("src","templates/standart/images/arrow_down.png");
						}
					}
				</script>
				<a onclick="saveCustomizing(this)" class="button_inactive save_customizing_button" style="clear: both; display: block; width: 178px;margin: 0px auto;margin-top: 15px;">
					<img src="templates/standart/images/w-save.png" class="icon save_icon">
					Save
				</a>
				<a href="javascript: frml_hideshow();"
					class="adv_settings custom_column_settings_toggler"
					style="margin-left: 50px;width: 280px;font-size: 14px !important; color: #000;margin-bottom: 25px;">
					Columns
					<img src="templates/standart/images/arrow_down.png">
				</a>

				<div id="frml_settings_div" style="display:none">
					<div id="vue-app-container-columns"></div>
				</div>

				<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>

					<div onclick="status_relation_hideshow();" class="status_relation_settings" 
						style="
							margin-top: 40px;
							margin-left: 50px;
							width: 280px;
							font-size: 14px !important; 
							color: #000;
							cursor: pointer;
							font-weight:600
						"
					>
						Status scheme settings
						<img src="templates/standart/images/arrow_down.png" style="position:relative;bottom:1px;left:3px;">
					</div>

					
					<div class="status_relation_block" style="display:none">
						<div id="vue-app-container-status-relation">							
						</div>
					</div>
				<?php endif; ?>

					<script>
							
						function status_relation_hideshow(){
							if ( $('.status_relation_block').css('display')!='none' ){
								$('.status_relation_block').css('display', 'none');
								$('.status_relation_settings img').attr('src', ' templates/standart/images/arrow_down.png ')
							} else {
								$('.status_relation_block').css('display', 'block');
								$('.status_relation_settings img').attr('src', ' templates/standart/images/arrow_up.png ');
								$('body').scrollTop( $(document).height() );
							}
						}

					</script>

			</div>
		</div>
		<div data-tab-name="lp-protect" class="tab-content-block">
			<div class="settings-tab">
				<h4 style="font-size: 15px; font-weight: 600; margin-bottom:0;">LP Protect</h4>
				<p>If you want protect your LPs from direct access just append this code to the start of LP code and add 'LP Key' token to lander URL on LP settings page.</p>
				<input readonly value='<?php echo $arr_tpl['lp_lock'];?>' id="copy_value9" type="text" class="input-with-copy"/>
				<a href="javascript:" id="copy_btn9" class="button copy_button">Copy</a>
			</div>
			<h4 style="font-size: 15px; font-weight: 600; margin-bottom:0;">Meta-refresh settings</h4>
			<form id="bnm-settings-lp-pr" method="post" action="?page=save_settings&type=2">
				<div style="margin-top: 13px;">
					<span style="margin-right: 15px;">Default hide referrer</span>
					<select id="default_hide_referrer" style="margin: 0 0 0 50px; border-color: #ccc" name="default_hide_referrer">
						<option value="1">None</option>
						<option value="2">Meta refresh</option>
						<option value="3">Double meta refresh</option>
						<option value="4">Smart meta refresh</option>
					</select>
				</div>
				<div style="margin-top: 10px;">
					<span style="margin-right: 15px;">Meta-refresh default domain</span>
					<select id="default_hide_referrer_domain" style="margin-top: 0px;" data-chosenval="<?php echo $arr_tpl['settings']['settings']['default_hide_referrer_domain']; ?>"  name="default_hide_referrer_domain">
						<option value="-2">Auto domain</option>
						<option value="-1">Campaign's domain</option>
					</select>
				</div>
				<?php if ($arr_tpl["settings"]["user_perm"]==1): ?>
				<div style="margin-top: 10px;">
					<span class="bnm-settings-inp-title">LP live time (s)</span>
					<input style="width: 200px;height: 25px;font-size: 13px;padding: 5px 0px 5px 12px !important;border: 1px solid #ccc;background-color: #fff;border-radius: 5px !important;margin: 0 0 0 103px;" name="landtime" value="<?php echo $arr_tpl['settings']['settings']['landtime'];?>" type="number" min="2" max="1200000">
				</div>
				<?php endif; ?>
			</form>
			<a onclick="saveLpPrSettings(this)" class="button_inactive js-save-lp-pr-settings" style="clear: both; display: block; width: 178px;margin: 0px auto;margin-top: 30px;">
				<img src="templates/standart/images/w-save.png" class="icon save_icon">
				Save
			</a>
			<script>
				$(window).on('hashchange', function(){
					setLpPrSettingsData();
				})
				
				$(window).ready(function(){
					setLpPrSettingsData()
				})
			</script>
		</div>

		<div data-tab-name="api" class="tab-content-block">
			<div class="settings-tab">
				<h4>API key</h4>
				<p>
					This token identifies the caller and authorizes them to perform operations on the API. Add this parametr in your URL of report’s page then you’ll see save statistic in JSON-format.
				</p>
				<input readonly value="<?php echo $arr_tpl['settings']['api_token'];?>" id="copy_value3" type="text" class="input-with-copy"/>
				<a href="javascript:" id="copy_btn3" class="button copy_button">Copy</a>
			</div>
			<div class="system-inline-message info bnm-settings-api-info">
				<div class="system-inline-message__text">
					If you have technical background and want to know more about our API capabilities, please check following manuals: 
				</div>
				<div class="bnm-settings-api-info__links">
					<a href="https://api.binom.org/v1" target="_blank">https://api.binom.org/v1</a><br>
					<a href="https://api.binom.org/v2" target="_blank">https://api.binom.org/v2</a>
				</div>
			</div>
			<div class="settings-tab">
				<h4 style="display: inline-flex">Adspect Settings</h4>
				<div id="vue-app-container-adspect"></div>
			</div>
		</div>

		<div data-tab-name="notifications" class="tab-content-block">
			<div id="vue-app-container-notifications"></div>
		</div>

		<div data-tab-name="clearings" class="tab-content-block">
			<div id="vue-app-container-clearings"></div>
		</div>


		<?php
			$twofaEnabled = ($arr_tpl['settings']['user_info']['2fa_status']==1?true:false) ;
		?>

		<div data-tab-name="2fa" class="tab-content-block">
			<div class="settings-tab">
				<div class="twofa-qr-block-container" >

					<div class="twofa-block-left">
						<div class="twofa-qr-code-image" id="qrcode">
						</div>
					</div>

					<div class="twofa-block-right">

						<div class="twofa-qr-validate-container">
							<div class="twofa-cancel-block" style="<?php echo (!$twofaEnabled?'display: none':''); ?>">
								<button class="bnm-button bnm-button-green twofa-cancel-button" >
									Turn off
								</button>
							</div>
							<div class="twofa-validate-input-wrapper" style="<?php echo ($twofaEnabled?'display: none':''); ?>">
								<span class="twofa-enter-code-text">Enter code:</span>
								<input
									type="text"
									class="twofa-code-input input-with-copy"
									placeholder="Six digit code"
									onblur="this.placeholder='Six digit code'"
									onfocus="this.placeholder=''"
								/>
								<button class="bnm-button bnm-button-green twofa-validate-button">
									Validate
								</button>
							</div>
							<div class="twofa-secret-key-container">
								<span class="twofa-secret-key">
									<span>Secret Key:</span>
									<span><?php echo $arr_tpl['settings']['user_info']['2fa_secretKey']; ?></span>
								</span>
							</div>
						</div>

						<div class="twofa-title-text">
							<div class="twofa-howto-text">

								<p>
									For 2FA download <a href="https://support.google.com/accounts/answer/1066447?hl=en" target="_blank" >Google Authenticator</a> from <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank">Google Play</a> or <a href="https://itunes.apple.com/ru/app/google-authenticator/id388497605" target="_blank">App Store</a> on your mobile device, click add and then scan QR code to set up your account.
								</p>
								<p>
									<div class="system-inline-message disclaimer">
										<div class="system-inline-message__header">Warning!</div>
										<div class="system-inline-message__text">
											2FA will break your current API settings, in order to use both 2FA and API please read this <a href="https://docs.binom.org/2fa.php#p1" target="_blank">instruction</a>
										</div>
									</div>
								</p>
							</div>

						</div>
					</div>

				</div>

			</div>

			<script>
				var QRtext = "<?php echo $arr_tpl['settings']['user_info']['2fa_qrCode']; ?>";
				makeCode( QRtext );
				window.secret = "<?php echo $arr_tpl['settings']['user_info']['2fa_secretKey']; ?>";
			</script>

		</div>

		<?php if($arr_tpl['settings']['user_perm'] == 1 ): ?>
			<div data-tab-name="import-export" class="tab-content-block">
				<div class="settings-tab">
					<h4>Export / Import from Binom</h4>
					<div>
						<p>You can transfer your campaign (with maintaining URLs), offers, landers, sources, aff. networks, domains, groups, filters, notes from Binom to Binom.</p>
					</div>
					<div style="width: 370px;margin-left: 0px; float: left;padding-bottom: 20px;">
						<p>
							<strong>Export</strong><br><br>
							<a href="?page=export" target="_blank" class="gray-button" style="display:inline-block;width:130px; margin-top: -10px;">Download export file</a>
						</p>
					</div>
					<div style="width: 380px;margin-left: 0px; float: right;">

						<?php if($arr_tpl['settings']['settings']['import']==1): ?>
							<p>
								<strong>Import</strong><br>
							</p>
							<form id="import_form">
								<input name="import_file" id="import_file" type="file" style="width: 350px;border: none !important;margin-top: 3px;margin-left:13px;">
							</form>
							<a onclick="download_import()" class="green-button" style="display: block; margin-left: 20px;margin-top: 0px;width: 50px; position: relative; top:-8px;">
								<img src="templates/standart/images/w-save.png" class="icon save_icon">Load
							</a>
						<?php else: ?>
							<p>
								Import is available on a "clean" tracker
							</p>
						<?php endif; ?>

					</div>
					<div style="clear:both"></div>
					<h4>Import from Voluum</h4>
					<p>Also, you can transfer your campaign, offers, landers, sources, aff. networks from Voluum to Binom.</p>

					<script src="templates/standart/js/voluum/voluumImport.js"></script>
					<script src="templates/standart/js/voluum/voluumImportWindow.js"></script>

					<div style="width: 370px;margin-left: 0px; float: left;padding-bottom: 20px;">
						<p>
							<a onclick="VoluumImportWindow.show();" class="gray-button" style="display:inline-block; width:130px; margin-top: -10px">Import from Voluum</a>
						</p>
					</div>
				</div>
				<div class="clear"></div>
			</div>
		<?php endif; ?>
		<?php if($arr_tpl['settings']['user_perm'] == 1 ): ?>
			<div data-tab-name="url-customization" class="tab-content-block tab-content-block-url-customization">
				<form method="post" id="url_customization_form" action="?page=save_settings&type=3" />
					<div class="settings-tab">

						<div class="two-columns-wrapper url-customization-params">
							<div class="setting_left_block">
								<div class="field_set field_set_title">
									<h4 style="margin-left: 50px;margin-bottom:-10px;">Login</h4>
								</div>
								<div class="field_set">
									<span class="bnm-settings-inp-title" class="left_title">index.php </span>
									<input type="text" name="index" value="<?php echo $arr_tpl['settings']['custom_url']['index'] ?>" />
									<span class="right_title">.php</span>
								</div>

								<div class="field_set">
									<span class="bnm-settings-inp-title" class="left_title">arm.php </span>
									<input type="text" name="arm" value="<?php echo $arr_tpl['settings']['custom_url']['arm'] ?>" />
									<span class="right_title">.php</span>
								</div>

								<div class="field_set field_set_title">
									<h4 style="margin: 30px 0 -10px 50px">Campaign </h4>
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">camp_id </span>
									<input type="text" name="camp_id" value="<?php echo $arr_tpl['settings']['custom_url']['camp_id'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">key </span>
									<input type="text" name="key" value="<?php echo $arr_tpl['settings']['custom_url']['key'] ?>" />
								</div>

								<div class="field_set field_set_shifted">
									<span class="left_title" style="margin-right: 13px;">key length </span>
									<input type="text"
											name="generate_camp_key_length"
										    value="<?php echo $arr_tpl['settings']['custom_url']['generate_camp_key_length'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="left_title" style="margin-right: 13px;">key chars </span>
									<select style="width: 165px;margin: 0px;margin-top:20px;" name="generate_camp_key_line" id="id_generate_camp_key_line">
										<option value="1">a-z</option>
										<option value="2">A_Z</option>
										<option value="3">a-z A-Z</option>
										<option value="4">0-9 a-z</option>
										<option value="5">0-9 A-Z</option>
										<option value="6">0-9 a-z A-Z</option>
									</select>
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">set_bid </span>
									<input type="text" name="set_bid" value="<?php echo $arr_tpl['settings']['custom_url']['set_bid'] ?>" />
								</div>

								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">to_path </span>
									<input type="text" name="to_path" value="<?php echo $arr_tpl['settings']['custom_url']['to_path'] ?>" />
								</div><div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">to_lander </span>
									<input type="text" name="to_lander" value="<?php echo $arr_tpl['settings']['custom_url']['to_lander'] ?>" />
								</div>
							</div>
							<div class="setting_right_block">
								<div class="field_set field_set_title">
									<h4 style="margin-left: 50px;margin-bottom:-10px;">Global</h4>
								</div>
								<div class="field_set">
									<span class="left_title bnm-settings-inp-title" >click.php </span>
									<input type="text" name="click" value="<?php echo $arr_tpl['settings']['custom_url']['click'] ?>" />
									<span class="right_title">.php</span>
								</div>
								<div class="field_set field_set_title">
									<h4  style="margin: 75px 0 -10px 50px">Landing page</h4>
								</div>

								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">lp </span>
									<input type="text" name="lp" value="<?php echo $arr_tpl['settings']['custom_url']['lp'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">to_offer </span>
									<input type="text" name="to_offer" value="<?php echo $arr_tpl['settings']['custom_url']['to_offer'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">lp_type </span>
									<input type="text" name="lp_type" value="<?php echo $arr_tpl['settings']['custom_url']['lp_type'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">uclick </span>
									<input type="text" name="uclick" value="<?php echo $arr_tpl['settings']['custom_url']['uclick'] ?>" />
								</div>

								<div class="field_set field_set_title">
									<h4 style="margin-left: 50px;margin-bottom:-10px;">Postback</h4>
								</div>

								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">cnv_id </span>
									<input type="text" name="cnv_id" value="<?php echo $arr_tpl['settings']['custom_url']['cnv_id'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">payout </span>
									<input type="text" name="payout" value="<?php echo $arr_tpl['settings']['custom_url']['payout'] ?>" />
								</div>
								<div class="field_set field_set_shifted">
									<span class="bnm-settings-inp-title">cnv_status </span>
									<input type="text" name="cnv_status" value="<?php echo $arr_tpl['settings']['custom_url']['cnv_status'] ?>" />
								</div>
								<div class="field_set field_set_shifted" style="white-space: nowrap;">
									<span class="bnm-settings-inp-title" style="margin-right: 9px; position: relative; right:5px;">cnv_status2 </span>
									<input type="text" name="cnv_status2" value="<?php echo $arr_tpl['settings']['custom_url']['cnv_status2'] ?>" />
								</div>

							</div>
						</div>
					</div>
				</form>
				<div class="clear"></div>
				<div style="text-align:center;margin-top:35px;">
					<button onclick="saveUrlCustomization()" class="button_inactive save_url_customization_button" style="width: 150px;"><img src="templates/standart/images/w-save.png" class="icon save_icon">Save</button>
					<button onclick="backUrlCustomizationForDefault()" class="gray-button" style="width: 150px;">Back to default</button>
				</div>
			</div>
		<?php endif; ?>
	</div>
</div>


