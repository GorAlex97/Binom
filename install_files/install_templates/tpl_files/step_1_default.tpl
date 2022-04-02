<h3>
	Step 1 - System check
</h3>
<p>
	The following tests in <b class="istall_p_bad">red</b> must be fixed before installation. Once the issues are resolved, click the Refresh button.<br>
	If you\'re not sure how to fix any of these issues, please submit a <a href="https://cp.binom.org/page/support" target="_blank">support ticket</a>
</p>
<table class="install_table">
	<tr>
		<td>
			
		</td>
		<td>
			<b>Present</b>
		</td>
		<td>
			<b>Recommended</b>
		</td>
	</tr>
<?php 
	$status = 'true';
	foreach($arr_tpl['parameters'] AS $val){
		if($val['status']=='bad'){$status = 'false';}
		?>
			<tr>
				<td  style="text-align: left;">
					<?php echo $val['name'] ?>
				</td>
				<td>
					<span class="istall_p_<?php echo $val['status'] ?>"><?php echo $val['present'] ?></span>
				</td>
				<td>
					<?php echo $val['recommended'] ?>
				</td>
			</tr>
		<?php
	}
?>
<table>
<div class="install_buttons" style="width:auto;padding-top: 5px;">
	<center>
		<a class="blue-button" href="javascript: location.reload();" style="width:80px;padding: 4px 5px;font-size: 15px; display: inline-block;">Refresh</a>
		<?php if($status=='true'){ ?>
		<a class="green-button" href="?page=step_2" style="width:80px;padding: 4px 5px;font-size: 15px;margin-left: 5px; display: inline-block;">Next</a>
		<?php } ?>
	</center>
</div>