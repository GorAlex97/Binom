<div class="settings_block">
	<h1 class="settings_title">Settings</h1>

	<div class="tab_header tab-menu">
		<div data-tab-name="tracking-links" class="tab-button tab-button-active">Tracking links</div>
		<!-- <div data-tab-name="user-info" class="tab-button">User info</div> -->
		<!-- <div data-tab-name="stats" class="tab-button">Stats settings</div> -->
		<div data-tab-name="lp-protect" class="tab-button">LP Protect</div>
		<div data-tab-name="api" class="tab-button">API</div>
		<!-- <div data-tab-name="import-export" class="tab-button">Import/Export</div> -->
	</div>
	<div class="tab-content-wrapper tab-content-wrapper-settings">
		<div data-tab-name="tracking-links" class="tab-content-block tab-content-block-active">
				<div class="settings-tab">
					<h3>Tracking links</h3>
					<h4>Click URL</h4>
					<p>
						With Binom you don\'t need to place any PHP code on your landing pages. Visitors are redirected based on data stored in a cookie and referrer.
					</p>
					<input readonly value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('lp',1);?>=1" id="copy_value1" type="text"/>
					<a href="javascript:" id="copy_btn1" class="button">Copy</a>
					<h4>Postback URL</h4>
					<p>
					Server-to-server postback URLs are the most secure and reliable method to count conversions. Use the URLs below to pass conversions from affiliate networks. To get your postback links working you have to:
					<ol>
					<li>Include the {clickId} token in your offer URLs. For example, you can add <b>&clickid={clickid}</b> to the offer URL, to have the click ID passed to the postback via the subid parameter on the affiliate network/advertiser side.</li>
					<li>Copy-paste the postback URL to your affiliate network panel. Make sure to replace the tokens with affiliate network-specific tokens. The following is what your postback URL would look like on a HasOffers based network: <br><a href="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={aff_sub}&<?php echo protection::get_key('payout',1);?>={payout}"><?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={aff_sub}&payout={payout}</a></li>
					</ol>
					</p>
					<p>
					Consult the affiliate network documentation or support to find out which tokens you should use to pass back click ID and payout. The payout parameter is optional, if you do not use it, you can manually specify the payout in the offer configuration. Do not put these URLs or any of the tracking pixels / scripts in your landing pages.
					</p>
					<input readonly value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={network_token}&<?php echo protection::get_key('payout',1);?>={payout}" id="copy_value2" type="text"/>
					<a href="javascript:" id="copy_btn2" class="button">Copy</a>
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
					<input readonly id="copy_value4" value="<?php echo htmlspecialchars('<img src="'.$arr_tpl['domain_url'].protection::get_key('click',1).'.php?'.protection::get_key('cnv_id',1).'=OPTIONAL&'.protection::get_key('payout',1).'=OPTIONAL" style="display:none"/>') ; ?>" type="text" />
					<a href="javascript:" id="copy_btn4" class="button">Copy</a>
				</div>
		</div>
		<div data-tab-name="lp-protect" class="tab-content-block">
			<div class="settings-tab">
				<h3>LP Protect</h3>
				<p>If you want protect your LPs from direct access just append this code to the start of LP code and add 'LP Key' token to lander URL on LP settings page.</p>
				<input readonly value='<?php echo $arr_tpl['lp_lock'];?>' id="copy_value9" type="text"/>
				<a href="javascript:" id="copy_btn9" class="button">Copy</a>
			</div>
		</div>
	</div>

	<script>

		function addTabsHandlers( onTabChangeActions ){
			$(document).ready( function(){
				$(".tab-button").on("click",function(){
					var blockName = $(this).attr('data-tab-name');

					$(".tab-content-block-active").removeClass("tab-content-block-active");
					$(".tab-button-active").removeClass("tab-button-active");

					$(".tab-button[data-tab-name="+blockName+"]").addClass("tab-button-active");
					$(".tab-content-block[data-tab-name="+blockName+"]").addClass("tab-content-block-active");
					onTabChangeActions();
				});
			});
		}
		if ( FlashDetect.installed ){
			addTabsHandlers( setClipboardHandlers );
		} else {
			addTabsHandlers();
		}

	</script>

	<div style="display:none">
		<?php if($arr_tpl['user_group']==1){?>
			<div class="settings_dop_block2" style="margin-bottom: 10px;">
				<h3>Customize settings</h3>
				<form method="post" action="?page=customize_save" id="customize-form">
					<div style="float: left; width: 370px;margin-left: 20px;padding-bottom: 20px;">
						<div class="field_set">
							<span>User session (s)</span>
							<input name="cookies" value="<?php echo $arr_tpl['cookies'];?>" type="text" style="margin-top: 10px;margin-right: 0px;">
						</div>
						<div class="field_set">
							<span>Unique period (s)</span>
							<input name="cookies_click" value="<?php echo $arr_tpl['cookies_click'];?>" type="text" style="margin-right: 0px;">
						</div>
					</div>
					<div style="float: right; width: 380px;margin-left: 20px;">
						<div class="field_set" style="text-align: left;">
							<span>Table style</span>
							<select id="customtable_input" style="margin-top: 10px;margin-right: 0px;" name="table_colors">
							    <option value="0">White</option>
							    <option value="2">Gray/white</option>
							    <option value="1">Colorize</option>
						    </select>
						</div>

					</div>
					<a onclick="$('#customize-form').submit();" class="green-button" style="clear: both; display: block; width: 178px;margin: 0px auto;margin-top: 15px;">
					<img src="templates/standart/images/w-save.png" class="icon save_icon">Save</a>
				</form>
			</div>
		<?php } ?>
		<div class="settings_dop_block2" style="margin-bottom:10px;">
			<h3>Tracking links</h3>
			<h4>Click URL</h4>
			<p>
				With Binom you don\'t need to place any PHP code on your landing pages. Visitors are redirected based on data stored in a cookie and referrer.
			</p>
			<input readonly value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('lp',1);?>=1" id="copy_value1" type="text"/>
			<a href="javascript:" id="copy_btn1" class="button">Copy</a>
			<h4>Postback URL</h4>
			<p>
			Server-to-server postback URLs are the most secure and reliable method to count conversions. Use the URLs below to pass conversions from affiliate networks. To get your postback links working you have to:
			<ol>
			<li>Include the {clickId} token in your offer URLs. For example, you can add <b>&clickid={clickid}</b> to the offer URL, to have the click ID passed to the postback via the subid parameter on the affiliate network/advertiser side.</li>
			<li>Copy-paste the postback URL to your affiliate network panel. Make sure to replace the tokens with affiliate network-specific tokens. The following is what your postback URL would look like on a HasOffers based network: <br><a href="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?cnv_id={aff_sub}&payout={payout}"><?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?cnv_id={aff_sub}&payout={payout}</a></li>
			</ol>
			</p>
			<p>
			Consult the affiliate network documentation or support to find out which tokens you should use to pass back click ID and payout. The payout parameter is optional, if you do not use it, you can manually specify the payout in the offer configuration. Do not put these URLs or any of the tracking pixels / scripts in your landing pages.
			</p>
			<input readonly value="<?php echo $arr_tpl['domain_url'];?><?php echo protection::get_key('click',1);?>.php?<?php echo protection::get_key('cnv_id',1);?>={network_token}&<?php echo protection::get_key('payout',1);?>={payout}" id="copy_value2" type="text"/>
			<a href="javascript:" id="copy_btn2" class="button">Copy</a>
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
			<input readonly id="copy_value4" value="<?php echo htmlspecialchars('<img src="'.$arr_tpl['domain_url'].protection::get_key('click',1).'.php?'.protection::get_key('cnv_id',1).'=OPTIONAL&'.protection::get_key('payout',1).'=OPTIONAL" style="display:none"/>') ; ?>" type="text" />
			<a href="javascript:" id="copy_btn4" class="button">Copy</a>
			<?php if($arr_tpl['user_group']==1){?>
				<h4>API</h4>
				<p>
					This token identifies the caller and authorizes them to perform operations on the API. Add this parametr in your URL of report’s page then you’ll see save statistic in JSON-format.
				</p>
				<input readonly value="<?php echo $arr_tpl['api_token'];?>" id="copy_value3" type="text"/>
				<a href="javascript:" id="copy_btn3" class="button">Copy</a>
			<?php } ?>
		</div>
		<div class="clear"></div>
		<div class="settings_dop_block2">
			<h3>LP Protect</h3>
			<p>If you want protect your LPs from direct access just append this code to the start of LP code and add 'LP Key' token to lander URL on LP settings page.</p>
			<input readonly value='<?php echo $arr_tpl['lp_lock'];?>' id="copy_value9" type="text"/>
			<a href="javascript:" id="copy_btn9" class="button">Copy</a>
		</div>
		<div class="clear"></div>
	</div>
</div>
