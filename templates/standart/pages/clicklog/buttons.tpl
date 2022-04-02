<div class="top_block">	
	<div class="block_button" style="margin-bottom:9px;">
		<a class="green-button" id="get_win_parameters"><img src="templates/standart/images/w-add.png" class="icon add_icon">Parameters</a>
		<?php if($arr_tpl['options']['fid_cl']!==0){ ?>
			<a class="gray-button" style="display:inline;"  id="clear_filters">
				<img src="templates/standart/images/filter.png" class="icon csv_icon">
				Clear filter
			</a>
		<?php }else{ ?>
			<a class="gray-button" style="display:inline;"  id="get_win_filters">
				<img src="templates/standart/images/filter.png" class="icon csv_icon">
				Set filter
			</a>
		<?php } ?>
			<button class="gray-button csv_export_button" style="display:inline;margin-left: 4px;">
				<img src="templates/standart/images/b-csv2.png" class="icon csv_icon">
				.csv
			</button>
	</div>
		<?php 
			echo $arr_tpl['filter_html'];
		?>
</div>