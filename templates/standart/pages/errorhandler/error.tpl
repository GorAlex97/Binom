<div class="main" style="margin:0;">
	<div class="install_block">
		<h3 style="color:#008ad8">
			Ooops...
		</h3>
		<?php 
			if(isset($arr_tpl['html'])){
				echo $arr_tpl['html'];
			}else{
		?>
			<p style="text-align:center;font-size: 17px;">
				Something went wrong.
				<br>
				Don't stop your traffic just copy error log and provide it to our <a target="_blank" style="color:#008ad8" href="https://support.binom.org/">support</a>.
			</p>
			<div style="margin:0 auto; width: 227px;">
				<a 
					href="javascript:" 
					style="padding: 3px 11px 3px 11px;" 
					class="bnm-button blue-button copy-error-log-button"
					
				>Copy error log</a>
				<a href="" style="padding: 3px 17px 3px 17px;" class="bnm-button bnm-button-green">Reload page</a>
			</div>
			<center><img style="margin: 20px 20px 60px 20px;" src="templates/standart/images/fatal_error.gif"></center>
		<?php 
			}
		?>
		<textarea id="error-log-text" style="display: none;">
			<?php print_r($arr_tpl['log']) ?>
		</textarea>
	</div>
	<div class="clear"></div>
	<script>
		var copyErrorLogButton = document.querySelector(".copy-error-log-button");
		var c = new Clipboard(copyErrorLogButton, {
			text: function(){
				return document.querySelector("#error-log-text").value;
			}
		});
	</script>
</div>