<div id="wrap" class="wrap" style="display:none"></div>
<div class="window" id="win_cl_filter" style="display: none; width: 490px; height: 570px;">
	<a onclick="closeClicklogFilterWindow(this);" class="win_closebtn"></a>
	<div class="win_header">
		<span style="margin-bottom: 17px;" class="window_head_name">Filters</span>
	</div>
	<div class="win_cap ">

	</div>
	<div class="win_content filter_win_style" style="margin: 10px 12px 0 15px !important; width:475px;">
		<form action="" class="filter-form" id="filter_form" method="post">
			<input type="hidden" name="type" value="filters_clicklog_save">
			<input type="hidden" name="ajax" value="1">
			<input type="hidden" name="ajax_type" value="write">
			<div class="filter-rows-container">
				<div id="first_element" class="filter-row row_0" style="display: flex;">
					<select type="select" class="filter_group_name" style="width:150px;" name="filter_column[]">

					</select>
					<select class="filter_compare_type" name="filter_compare[]">
						<option value="=" style="display: block;">=</option>
						<option value="!=" style="display: block;">&lt;&gt;</option>
						<option value=">" style="display: block;">&gt;</option>
						<option value=">=" style="display: block;">&gt;=</option>
						<option value="<" style="display: block;">&lt;</option>
						<option value="<=" style="display: block;">&lt;=</option>
						<option value="LIKE" style="display: none;">IN</option>
						<option value="NOT LIKE" style="display: none;">NOT IN</option>
					</select>
					<input type="text" name="filter_value[]"  class="input filter_value" style="flex-grow: 1; margin-right: 15px; font-size: 14px;border-color: #aaa;height:25px;padding-left: 7px;border: 1px solid #aaa;background-color: #fff;border-radius: 5px;">
				</div>
			</div>
			<div class="filter-middle-block" style="margin-bottom: 50px;">
				<a class="button green-button add_condition_button" style="top: 5px;position: relative;" id="addlist_btn">
                    <img
                        src="./templates/standart/images/w-add.png"
                        class="icon add_icon"
                    />
					Add condition
				</a>
				<span class="filter-condition-descr">
					<i>
						There is operator <b>AND</b> between conditions!
						<i></i>
					</i>
				</span>
			</div>
		</form>
	</div>
	<div class="win_footer ">
		<div class="win-buttons-block">
			<a class="button win-save-button filter-button" id="save_filter">
				<img src="templates/standart/images/w-save.png" class="icon save_icon">
				Apply
			</a>
			<a class="button win-close-button" onclick="closeClicklogFilterWindow(this);">
				<img src="./templates/standart/images/w-close.png" class="icon close_icon">
				Close
			</a>
		</div>
	</div>
</div>
