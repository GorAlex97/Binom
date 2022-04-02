<div id="win_filter" class="window" style="display: none;width:550px;">

	<div class="win_header">
		<div>
			<a onclick="notewindow_hide2(this);" class="win_closebtn" style="margin-right: 10px;margin-top: 2px;"></a>
		</div>
		<span class="window_head_name">Filter</span>
	</div>

	<div class="win_content" style="margin-left:0px;margin-right:0px;"></div>
	<div class="win_footer"></div>
	<div></div>

</div>

<div class="block_filter_all">
	<div class="stats-over-table-panel">
		<div class="block_filter_1">
			<?php
				function button_link($group, $button, $arr_tpl){
					if(isset($arr_tpl['drilldown']) && (int)$arr_tpl['drilldown']!== 0){
						$result='&drilldown='.$arr_tpl['drilldown'].'&group2='.$group.'&group3=1';
					}else{
						$result='&group1='.$group.'&group2=1&group3=1';
					}

					$result='?page=Stats&'.
							(isset($arr_tpl['camp_get'])?$arr_tpl['camp_get']:'').
							$result.
							'&'.
							(isset($arr_tpl['date_get'])?$arr_tpl['date_get']:'').
							(isset($arr_tpl['order_name_get'])?$arr_tpl['order_name_get']:'').
							(isset($arr_tpl['order_type_get'])?$arr_tpl['order_type_get']:'').
							'&button='.$button;
					return $result;
				}
			?>
			<ul class="ul_parent" id="button_66">
				<li	class="li_parent">
					<a>Presets<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children" id="presets_elements">
						<?php if(isset($arr_tpl['report_templates'])){echo $arr_tpl['report_templates'];} ?>
						<a id="save_report_templates_el" style="font-weight: bold;" onclick="save_report_templates();"><li class="li_children">Save current</li></a>
					</ul>
				</li>
			</ul>
			<a id="button_1" href="<?php echo button_link(2,1,$arr_tpl) ?>" class="button_stat">
				<span>Paths</span>
			</a>
			<a id="button_2" href="<?php echo button_link(3,2,$arr_tpl) ?>" class="button_stat">
				Offers
			</a>
			<a id="button_3" href="<?php echo button_link(4,3,$arr_tpl) ?>" class="button_stat">
				Landers
			</a>
			<a id="button_4" href="<?php echo button_link(5,4,$arr_tpl) ?>" class="button_stat">
				Rules
			</a>
			<?php echo $arr_tpl['tokens_button'];?>
			<ul class="ul_parent" id="button_6">
				<li	class="li_parent">
					<a>Connection<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<a id="button_61" href="<?php echo button_link(6,61,$arr_tpl) ?>"><li class="li_children">Carrier</li></a>
						<a id="button_61" href="<?php echo button_link(42,61,$arr_tpl) ?>"><li class="li_children">ISP</li></a>
						<a id="button_151" href="<?php echo button_link(30,62,$arr_tpl) ?>"><li class="li_children">Connection type</li></a>
					</ul>
				</li>
			</ul>
			<ul class="ul_parent" id="button_7">
				<li	class="li_parent">
					<a>IP<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<a id="button_161" href="<?php echo button_link(7,161,$arr_tpl) ?>"><li class="li_children">IP-range 1.2.3.4</li></a>
						<a id="button_151" href="<?php echo button_link(8,15,$arr_tpl) ?>"><li class="li_children">IP-range 1.2.3.xxx</li></a>
						<a id="button_16" href="<?php echo button_link(9,16,$arr_tpl) ?>"><li class="li_children">IP-range 1.2.xxx.xxx</li></a>
					</ul>
				</li>
			</ul>
			<ul class="ul_parent" id="button_8">
				<li	class="li_parent">
					<a>Device<img src="templates/standart/images/arrow_btn.png">
					</a>
					<ul class="ul_children">
						<a id="button_17" href="<?php echo button_link(10,17,$arr_tpl) ?>"><li class="li_children">Device type</li></a>
						<a id="button_171" href="<?php echo button_link(29,171,$arr_tpl) ?>"><li class="li_children">Device name</li></a>
						<a id="button_18" href="<?php echo button_link(11,18,$arr_tpl) ?>"><li class="li_children">Device brand</li></a>
						<a id="button_19" href="<?php echo button_link(12,19,$arr_tpl) ?>"><li class="li_children">Device model</li></a>
						<a id="button_20" href="<?php echo button_link(13,20,$arr_tpl) ?>"><li class="li_children">Device resolution</li></a>
					</ul>
				</li>
			</ul>
			<ul class="ul_parent" id="button_9">
				<li	class="li_parent">
					<a>OS<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<a id="button_21" href="<?php echo button_link(17,21,$arr_tpl) ?>"><li class="li_children">OS name</li></a>
						<a id="button_22" href="<?php echo button_link(18,22,$arr_tpl) ?>"><li class="li_children">OS version</li></a>
					</ul>
				</li>
			</ul>
			<ul class="ul_parent" id="button_10">
				<li	class="li_parent">
					<a>Browser<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<a id="button_23" href="<?php echo button_link(15,23,$arr_tpl) ?>"><li class="li_children">Browser name</li></a>
						<a id="button_24" href="<?php echo button_link(16,24,$arr_tpl) ?>"><li class="li_children">Browser version</li></a>
					</ul>
				</li>
			</ul>
			<!--<a id="button_11" href="?page=Stats&<?php echo $arr_tpl['l_camp_id'];?>&group1=19&group2=1&group3=1&<?php echo $arr_tpl['l_date'];?>&button=25" class="button_stat">Country</a>-->
			<ul class="ul_parent" id="button_11">
				<li	class="li_parent">
					<a>Country<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<li class="li_children">
							<a id="button_25" href="<?php echo button_link(19,25,$arr_tpl) ?>">Country</a>
						</li>
						<li class="li_children">
							<a id="button_32" href="<?php echo button_link(20,32,$arr_tpl) ?>">Region / City</a>
						</li>
					</ul>
				</li>
			</ul>
			<a id="button_12" href="<?php echo button_link(21,6,$arr_tpl) ?>" href="" class="button_stat">Language</a>
			<!--<a id="button_7" href="" class="button_stat">Aff. Network</a>-->
			<ul class="ul_parent" id="button_13">
				<li	class="li_parent">
					<a>Referer<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<a id="button_27" href="<?php echo button_link(24,27,$arr_tpl) ?>"><li class="li_children">Referer domain</li></a>
						<a id="button_26" href="<?php echo button_link(23,26,$arr_tpl) ?>"><li class="li_children">Referer URL</li></a>
					</ul>
				</li>
			</ul>
			<ul class="ul_parent" id="button_14">
				<li	class="li_parent">
					<a>Part of day<img src="templates/standart/images/arrow_btn.png"></a>
					<ul class="ul_children">
						<a id="button_29" href="<?php echo button_link(25,29,$arr_tpl) ?>"><li class="li_children">Day of week</li></a>
						<a id="button_30" href="<?php echo button_link(26,30,$arr_tpl) ?>"><li class="li_children">Hour of day</li></a>
					</ul>
				</li>
			</ul>
			<a id="button_31"  href="<?php echo button_link(31,31,$arr_tpl) ?>" class="button_stat">Days</a>
			<a id="button_15"  href="?page=Stats&camp_id=<?php echo $arr_tpl['camp_id'];?>&group1=1&group2=1&group3=1&<?php echo (isset($arr_tpl['l_date'])?$arr_tpl['l_date']:'');?>&button=15&leads=1&num_page=1" class="button_stat">Leads</a>
		</div>
		<!--
		<div class="block_filter_2">
			<a id="button_9" href="" class="button_stat">List</a>
			<a id="button_10" href="" class="button_stat">Table</a>
			<a id="button_11" href="" class="button_stat">Chart</a>

			<a id="button_12" href="?page=Stats&<?php echo $arr_tpl['l_camp_id'];?>&group1=2&group2=4&group3=1&<?php echo $arr_tpl['l_date'];?>&button=12"  class="button_stat">Paths-Landers</a>
			<a id="button_13" href="?page=Stats&<?php echo $arr_tpl['l_camp_id'];?>&group1=4&group2=3&group3=1&<?php echo $arr_tpl['l_date'];?>&button=13" class="button_stat">Landers-Offers</a>
			<a id="button_14" href="?page=Stats&<?php echo $arr_tpl['l_camp_id'];?>&group1=6&group2=7&group3=1&<?php echo $arr_tpl['l_date'];?>&button=14" class="button_stat">ISP-IP</a>
		</div>-->
		<div class="block_filter_3 <?php echo ($arr_tpl["leads"]==1?"block_filter_3_leads":"") ?>">
				<form method="get" id="act-form">
					<?php //echo $arr_tpl['leads'];?>
					<?php if(isset($arr_tpl['fid']) && !empty($arr_tpl['fid'])){ ?>
						<input type="hidden" name="fid" id="refresh_fid" value="<?php echo $arr_tpl['fid'];?>">
					<?php } ?>
					<?php if(isset($arr_tpl['sfid']) && !empty($arr_tpl['sfid'])){ ?>
						<input type="hidden" name="sfid" id="refresh_fid" value="<?php echo $arr_tpl['sfid'];?>">
					<?php } ?>
					<!--
					<input type="hidden" name="order" value=<?php echo $arr_tpl['order'];?>>
					<input type="hidden" name="type" value=<?php echo $arr_tpl['type'];?>>

					<input type="hidden" name="num_page" value=<?php echo $arr_tpl['num_page'];?>>
					<input type="hidden" name="val_page" value=<?php echo $arr_tpl['val_page'];?>>
					-->
					<input type="hidden" name="page" value="Stats">
					<input type="hidden" name="camp_id" value="<?php echo $arr_tpl['camp_id'];?>">
					<input type="hidden" name="order_name" value="<?php echo $arr_tpl['order_name']; ?>">
					<input type="hidden" name="order_type" value="<?php echo $arr_tpl['order_type']; ?>">
					<div class="stats-main-buttons-block">
							<?php if (isset($arr_tpl['leads']) && $arr_tpl['leads'] == 1) { ?>
								<select name="group1" id="group1" class="group_select" disabled>
							<?php } else { ?>
								<?php if (isset($arr_tpl['drilldown']) && (int)$arr_tpl['drilldown']!== 0) { ?>
									<input type="hidden" name="drilldown" value="<?php echo $arr_tpl['drilldown']; ?>">
									<select name="drilldown" id="group1" class="group_select" disabled>
								<?php } else { ?>
									<select name="group1" id="group1" class="group_select" >
								<?php } ?>
							<?php } ?>
								<option value="1">Choose grouping</option>
								<option value="2">Paths</option>
								<option value="3">Offers</option>
								<option value="4">Landers</option>
								<option value="5">Rules</option>
								<option value="39">Rotations</option>
								<option value="6">ISP / Carrier</option>
								<option value="42">ISP / Organization</option>
								<option value="30">Connection type</option>
								<option value="7">IP</option>
								<option value="8">IP-range 1.2.3.xxx</option>
								<option value="9">IP-range 1.2.xxx.xxx</option>
								<option value="10">Device type</option>
								<option value="29">Device name</option>
								<option value="11">Device brand</option>
								<option value="12">Device model</option>
								<option value="13">Device resolution</option>
								<option value="14">Data speed</option>
								<option value="15">Browser</option>
								<option value="16">Browser version</option>
								<option value="17">OS name</option>
								<option value="18">OS version</option>
								<option value="19">Country</option>
								<option value="20">City</option>
								<option value="21">Language</option>
								<option value="22">Aff. Network</option>
								<option value="24">Referer domain</option>
								<option value="23">Referer URL</option>
								<option value="25">Day of week</option>
								<option value="26">Hour of day</option>
								<option value="31">Days</option>
								<?php if ($arr_tpl['leads'] == 1) { ?>
									<option selected>Leads</option>
								<?php } ?>
								<?php echo $arr_tpl['tokens_select'];?>
								<?php echo $arr_tpl['lp_tokens_select'];?>
								<option value="35">CPC</option>
								<option value="34">Conversion Status</option>
								<option value="38">Conversion Status 2</option>
								<option value="40">Uniqueness</option>
								<option value="101">Event 1</option>
								<option value="102">Event 2</option>
								<option value="103">Event 3</option>
								<option value="104">Event 4</option>
								<option value="105">Event 5</option>
								<option value="106">Event 6</option>
								<option value="107">Event 7</option>
								<option value="108">Event 8</option>
								<option value="109">Event 9</option>
								<option value="110">Event 10</option>
							</select>
							<?php if (isset($arr_tpl['leads']) && $arr_tpl['leads'] == 1) { ?>
							<select name="group2" id="group2" class="group_select" disabled>
							<?php } else { ?>
							<select name="group2" id="group2" class="group_select">
							<?php } ?>
								<option value="1">Choose grouping</option>
								<option value="2">Paths</option>
								<option value="3">Offers</option>
								<option value="4">Landers</option>
								<option value="5">Rules</option>
								<option value="39">Rotations</option>
								<option value="6">ISP / Carrier</option>
								<option value="42">ISP / Organization</option>
								<option value="30">Connection type</option>
								<option value="7">IP</option>
								<option value="8">IP-range 1.2.3.xxx</option>
								<option value="9">IP-range 1.2.xxx.xxx</option>
								<option value="10">Device type</option>
								<option value="29">Device name</option>
								<option value="11">Device brand</option>
								<option value="12">Device model</option>
								<option value="13">Device resolution</option>
								<option value="14">Data speed</option>
								<option value="15">Browser</option>
								<option value="16">Browser version</option>
								<option value="17">OS name</option>
								<option value="18">OS version</option>
								<option value="19">Country</option>
								<option value="20">City</option>
								<option value="21">Language</option>
								<option value="22">Aff. Network</option>
								<option value="24">Referer domain</option>
								<option value="23">Referer URL</option>
								<option value="25">Day of week</option>
								<option value="26">Hour of day</option>
								<option value="31">Days</option>
								<?php echo $arr_tpl['tokens_select'];?>
								<?php echo $arr_tpl['lp_tokens_select'];?>
								<option value="35">CPC</option>
								<option value="34">Conversion Status</option>
								<option value="38">Conversion Status 2</option>
								<option value="40">Uniqueness</option>
								<option value="101">Event 1</option>
								<option value="102">Event 2</option>
								<option value="103">Event 3</option>
								<option value="104">Event 4</option>
								<option value="105">Event 5</option>
								<option value="106">Event 6</option>
								<option value="107">Event 7</option>
								<option value="108">Event 8</option>
								<option value="109">Event 9</option>
								<option value="110">Event 10</option>
							</select>

							<?php if (isset($arr_tpl['leads']) && $arr_tpl['leads'] == 1) { ?>
							<select name="group3" id="group3" class="group_select" disabled>
							<?php } else { ?>
							<select name="group3" id="group3" class="group_select">
							<?php } ?>
								<option value="1">Choose grouping</option>
								<option value="2">Paths</option>
								<option value="3">Offers</option>
								<option value="4">Landers</option>
								<option value="5">Rules</option>
								<option value="39">Rotations</option>
								<option value="6">ISP / Carrier</option>
								<option value="42">ISP / Organization</option>
								<option value="30">Connection type</option>
								<option value="7">IP</option>
								<option value="8">IP-range 1.2.3.xxx</option>
								<option value="9">IP-range 1.2.xxx.xxx</option>
								<option value="10">Device type</option>
								<option value="29">Device name</option>
								<option value="11">Device brand</option>
								<option value="12">Device model</option>
								<option value="13">Device resolution</option>
								<option value="14">Data speed</option>
								<option value="15">Browser</option>
								<option value="16">Browser version</option>
								<option value="17">OS name</option>
								<option value="18">OS version</option>
								<option value="19">Country</option>
								<option value="20">City</option>
								<option value="21">Language</option>
								<option value="22">Aff. Network</option>
								<option value="24">Referer domain</option>
								<option value="23">Referer URL</option>
								<option value="25">Day of week</option>
								<option value="26">Hour of day</option>
								<option value="31">Days</option>
								<?php echo $arr_tpl['tokens_select'];?>
								<?php echo $arr_tpl['lp_tokens_select'];?>
								<option value="35">CPC</option>
								<option value="34">Conversion Status</option>
								<option value="38">Conversion Status 2</option>
								<option value="40">Uniqueness</option>
								<option value="101">Event 1</option>
								<option value="102">Event 2</option>
								<option value="103">Event 3</option>
								<option value="104">Event 4</option>
								<option value="105">Event 5</option>
								<option value="106">Event 6</option>
								<option value="107">Event 7</option>
								<option value="108">Event 8</option>
								<option value="109">Event 9</option>
								<option value="110">Event 10</option>
							</select>

							<?php if (isset($arr_tpl['leads']) && $arr_tpl['leads'] == 1) { ?>

								<div class="filter_block" style="margin-top: 0px;">

									<input type="hidden" name="leads" value="1">
										<div style="display: inline-block;vertical-align: top;">
											<input type="text" class="search_in_report" onclick="$(this).removeAttr('placeholder');" onblur="tryToReturnPlaceholderSearch(this);" name="search_name" placeholder="Search" value="<?php echo $arr_tpl['search_report'] ?>">

											<select name = "GEO">

												<?php $selected=0; while($row=$arr_tpl['geo_list_db']->fetch()){?>
													<?php if ($arr_tpl['geo_get']==$row['country']) {?>
														<option selected value="<?php echo $row['country'] ?>"><?php echo $row['country']; ?></option>
													<?php $selected=1;} else {?>
														<option value="<?php echo $row['country'] ?>"><?php echo $row['country']; ?></option>
													<?php } ?>
												<?php } ?>
												<?php if ($selected==1){ ?>
													<option value="All">All geo</option>
												<?php } else { ?>
													<option selected value="All">All geo</option>
												<?php } ?>
											</select>

											<select name = "Offer_fltr">
												<?php $selected=0; while($row=$arr_tpl['offer_list_db']->fetch()){?>
													<?php if ($arr_tpl['offer_get']==$row['id']) {?>
														<option selected value="<?php echo $row['id'] ?>"><?php echo $row['name']; ?></option>
													<?php $selected=1;} else {?>
														<option value="<?php echo $row['id'] ?>"><?php echo $row['name']; ?></option>
													<?php } ?>
												<?php } ?>
												<?php if ($selected==1){ ?>
													<option value="All">All offers</option>
												<?php } else { ?>
													<option selected value="All">All offers</option>
												<?php } ?>
											</select>

											<select name="date" id="timedate">
												<option value="1">Today</option>
												<option value="2">Yesterday</option>
												<option value="11">This Week</option>
												<option value="13">Last 2 Days</option>
												<option value="14">Last 3 Days</option>
												<option value="3">Last 7 Days</option>
												<option value="4">Last 14 Days</option>
												<option value="5">This Month</option>
												<option value="6">Last Month</option>
												<option value="7">This Year</option>
												<option value="8">Last Year</option>
												<option value="9">All Time</option>
												<option value="12">Custom Date</option>
												<option value="10">Custom Time</option>
											</select>

											<div class="bnm-stat-custom-date" id="custom_date" style="display: none">
												<span id="bnm-awesome-calendar">
													<input type="text" name="date_s"  value="<?php echo $arr_tpl['date_s'];?>" id="bnm-awesome-calendar-start">
													<input type="text" name="date_e"  value="<?php echo $arr_tpl['date_e'];?>" id="bnm-awesome-calendar-end">
												</span>

												<select style="float: none;" name="timezone" class="datetime_timezone">
													<?php for($i=-12;$i<=12;$i++){echo '<option value="'.($i==0?'+0':$i).'">'.($i>0?'+'.$i:$i).'</option>';} ?>
												</select>
											</div>

											<a class="blue-button" id="refresh-btn">
											<img src="templates/standart/images/w-refresh.png"  class="icon">Refresh</a>
										</div>
										<div style="display:inline-block;">
											<a class="green-button" id="edit" style="position: relative;display: inline-block;top:0px;" target="_blank" href="?page=edit_camp&id=<?php echo $arr_tpl['camp_id'];?>">
												<img src="templates/standart/images/w-edit3.png" class="icon edit_icon">Edit
											</a>
											<a class="gray-button" style="position: relative; top: 0px;" id="update_costs">
												<img src="templates/standart/images/b-cost.png" class="icon updatecosts_icon">Update costs
											</a>
										</div>
								</div>
							</div>
							<?php } else { ?>
								<!--- <input type="text" class="search_in_report" onclick="$(this).val('');" name="search_report" value="<?php echo $arr_tpl['search'];?>">-->
								<input type="text" class="search_in_report" onblur="tryToReturnPlaceholderSearch(this);" onclick="$(this).removeAttr('placeholder');"  name="search_report" placeholder="Search" value="<?php echo $arr_tpl['search_report'] ?>">
								<select name="date"  id="timedate" class="group_select">
									<option value="1">Today</option>
									<option value="2">Yesterday</option>
									<option value="11">This Week</option>
									<option value="13">Last 2 Days</option>
									<option value="14">Last 3 Days</option>
									<option value="3">Last 7 Days</option>
									<option value="4">Last 14 Days</option>
									<option value="5">This Month</option>
									<option value="6">Last Month</option>
									<option value="7">This Year</option>
									<option value="8">Last Year</option>
									<option value="9">All Time</option>
									<option value="12">Custom Date</option>
									<option value="10">Custom Time</option>
								</select>

								<div class="bnm-stat-custom-date" id="custom_date" style="display: none">
									<span id="bnm-awesome-calendar">
										<input type="text" name="date_s"  value="<?php echo $arr_tpl['date_s'];?>" id="bnm-awesome-calendar-start">
										<input type="text" name="date_e"  value="<?php echo $arr_tpl['date_e'];?>" id="bnm-awesome-calendar-end">
									</span>

									<select style="float: none;" name="timezone" class="datetime_timezone">
										<?php for($i=-12;$i<=12;$i++){echo '<option value="'.($i==0?'+0':$i).'">'.($i>0?'+'.$i:$i).'</option>';} ?>
									</select>
								</div>

								<a id="refresh-btn" class="blue-button" style="display: inline-block;top:0px;">
									<img src="templates/standart/images/w-refresh.png" class="icon">Refresh</a>

								<?php if (isset($arr_tpl['drilldown']) && (int)$arr_tpl['drilldown']!== 0) { ?>
									<a id="drilldown_close" onclick="drilldown_close()" class="blue-button" style="position:relative;top:0px;"><img src="templates/standart/images/w-report3.png" class="icon">Close</a>
								<?php } else { ?>
									<a id="drilldown" onclick="drilldown()" class="blue-button" style="display: none;position:relative;top:0px;"><img src="templates/standart/images/w-report3.png" class="icon">Drilldown</a>
								<?php } ?>
								<a class="green-button" id="edit" style="position: relative;display: inline-block;top:0px;" target="_blank" href="?page=edit_camp&id=<?php echo $arr_tpl['camp_id'];?>"><img src="templates/standart/images/w-edit3.png" class="icon edit_icon">Edit</a>

								</div>

								<ul class="dropdown-list stat_import">
									<li>
										<a class="dropdown-list__title stat_import__title gray-button" style="position: relative; top: 0px;" >
											<img src="templates/standart/images/b-csv2.png" class="icon csv_icon"><!--
											-->Export <img src="templates/standart/images/arrow_btn.png"/> <!--
										--></a>
										<ul class="dropdown-list__content stat_import__content">
											<li class="dropdown-list__button stat_import__button csv_export_button">CSV</li>
											<li class="dropdown-list__button stat_import__button download_txt_button">TXT</li>
											<li class="dropdown-list__button stat_import__button js_clipboard_button">Clipboard</li>
										</ul>		
									</li>
								</ul>
								<a class="gray-button" style="position: relative; top: 0px;" id="update_costs"><img src="templates/standart/images/b-cost.png" class="icon updatecosts_icon">Update costs</a>
							<?php } ?>

					
				
	
					<?php if (!isset($arr_tpl['leads']) || ($arr_tpl['leads'] != 1)) { ?>
						<ul class="dropdown-list stat_filters">
							<li>
								<a class="dropdown-list__title stat_filters__title gray-button" style="position: relative; top: 0px;" ><!--
									--><img src="templates/standart/images/filter.png" class="icon updatecosts_icon">Filters <img src="templates/standart/images/arrow_btn.png"/><!--
								--></a>
								<ul class="stat_filters__content dropdown-list__content ">
									<li class="dropdown-list__button stat_filters__button stat_filters__button--button stat_filters__button-new-filter">
										New Filter
									</li>
									<?php if ( !empty($arr_tpl['fid']) || !empty($arr_tpl['sfid']) ){ ?>
										<li 
											class="dropdown-list__button stat_filters__button stat_filters__button--button stat_filters__button-edit-applied-filter"
											<?php if( !empty($arr_tpl['fid']) ) { ?>
												data-filter-type="simple"
												data-filter-id="<?php echo $arr_tpl['fid']; ?>"
											<?php } else { ?>
												data-filter-type="smart"
												data-filter-id="<?php echo $arr_tpl['sfid']; ?>"
											<?php } ?>
										>
											Edit Filter	
										</li>
									<?php } ?>
									<li 
										class="dropdown-list__button stat_filters__button stat_filters__button--button stat_filters__button-clear-filter"
										style="<?php if ( empty($arr_tpl['fid']) && empty($arr_tpl['sfid']) ) { echo "display: none"; }?>"
									>
										Clear Filter
									</li>
									<?php foreach ($arr_tpl['filters'] as $f) { ?>
										<li class="dropdown-list__button stat_filters__button stat_filters__button--filter stat_filters__button--simple" 
											data-filter-type="simple" 
											data-filter-id="<?php echo $f['id']; ?>"
										>
											<div class="stat_filters__filter-name"><?php echo $f['name']; ?></div>
											<div class="stat_filters__hidden-buttons-container">
												<div class="stat_filters__hided-button stat-filters__edit-filter-button" ></div><!--
											 --><div class="stat_filters__hided-button stat-filters__delete-filter-button" ></div>
											</div>
										</li>
									<?php } ?>
									<?php foreach ($arr_tpl['smart_filters'] as $f) { ?>
										<li class="dropdown-list__button stat_filters__button stat_filters__button--filter stat_filters__button--smart" 
											data-filter-type="smart" 
											data-filter-id="<?php echo $f['id']; ?>"
										>
											<div class="stat_filters__filter-name"><?php echo $f['name']; ?></div>
											<div class="stat_filters__hidden-buttons-container">
												<div class="stat_filters__hided-button stat-filters__edit-filter-button"></div><!--
											 --><div class="stat_filters__hided-button stat-filters__delete-filter-button"></div>
											</div>
										</li>
									<?php } ?>
								</ul>
							</li>
						</ul>
					<?php } ?>
					

				</form>
		</div>
	</div>
</div>

