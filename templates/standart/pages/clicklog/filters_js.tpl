function onGetWinFiltersClick(){
	$('#win_cl_filter').css('display','block');
	$('#wrap').css('display','block');
	$('.filter_group_name').html('');

	if ( !BINOM.tt ){
		console.error( 'Cannot init Clicklog Filters. Table was not created.' );
		return;
	}

	BINOM.tt.tableOptions.showedColumns.forEach( function(value, index){
		var name, name2;
		name = value;
		if ( BINOM.tt.tableOptions.columns[value].name ){
			name2 = BINOM.tt.tableOptions.columns[value].name;
		} else {
			name2 = value;
		}
		$('.filter_group_name').append('<option value="'+name+'">'+name2+'</option>');
	})

}

$(document).ready(function() {
	
	$(".chosen-select").chosen();
	$(".chosen-container").css("float", "left");
	
	$('#addlist_btn').click(function(){
		$('.filter-rows-container').append('<div class="filter-row">'+$('#first_element').html()+'<a class="delete_btn filter-delete-button" style="margin-top:0;top: 2px;position: relative;float:none;" onclick="filter_delete(this)" style="position:relative;float:none;top:2px;"></a></div>');
		if($('.filter-row').length>11){
			$('#addlist_btn').css('display','none');
		}
	});

	$('#filter_form').on('submit', function(){
		return false;
	});

	$('#save_filter').click(function(){
		var form_data = $('#filter_form').serialize();
		$.ajax({
			url : "",
			method: "post",
			data: form_data,
			success: function(data) {
				var url=document.location.href;
				URLUtils.changeGETsInURL({fid_cl: data, num_page: 1});
				closeClicklogFilterWindow();
				BINOM.tt.refetchData();
			},
		});
	});

	$('.filter_group_name').on('change', function(event) {
		var value = event.target.value;
		var compareType = $('.filter_compare_type').val();
		if (value === 'click_id') {
			if (compareType === 'LIKE') {
				$('.filter_compare_type').val('=');
			} else if (compareType === 'NOT LIKE') {
				$('.filter_compare_type').val('!=');
			}
			$('.filter_compare_type [value="LIKE"]').css('display', 'none');
			$('.filter_compare_type [value="NOT LIKE"]').css('display', 'none');
		} else {
			$('.filter_compare_type [value="LIKE"]').css('display', 'block');
			$('.filter_compare_type [value="NOT LIKE"]').css('display', 'block');
		}
	});
});

function closeClicklogFilterWindow(){
	$('#win_cl_filter').css('display', 'none');
	$('#wrap').css('display', 'none');
}

function filter_delete(el){
	$(el).parent().detach(); 
	$('#addlist_btn').css('display','inline');
};