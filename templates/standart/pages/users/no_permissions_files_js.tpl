$(document).ready(function() {
	var  panel_select = $('.panel_select'),	user_name, full_path;
	$('.user_name').append('<?php echo $arr_tpl['user_name'] ?>');
	$('.full_path').append('<?php echo $arr_tpl['path'] ?>');

	$('.' + panel_select.val()).css('display','block');

	console.log('ajax ok');

	
	panel_select.on('change',   function(){

		panel_value = panel_select.val();
		panel_name = $('.panel_select option:selected').html();

		$('.instruction_text').css('display','none');

		instruction_div =   $('.'+panel_value);
		instruction_div.css('display', 'block');
		
	});
	
});
	
function show_err(){
if($('.err_files').css('display')=='none'){
	$('.err_files').css('display','block');
}else{
	$('.err_files').css('display','none');
}
}