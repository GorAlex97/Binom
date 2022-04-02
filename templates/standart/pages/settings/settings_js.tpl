//GLOBAL
__pageFormat = "settings";
__pageType = "settings";

BINOM.SETTINGS = Object.create(null);

$(window).ready(function () {
	$("#user_timezone [value='<?php echo $arr_tpl['settings']['user_info']['time_zone']; ?>']").prop("selected", true);
	$("#id_generate_camp_key_line [value='<?php echo $arr_tpl['settings']['custom_url']['generate_camp_key_line']; ?>']").prop("selected", true);
	$("#customtable_input [value='<?php echo $arr_tpl['settings']['settings']['table_colors']; ?>']").prop("selected", true);
	$("#conversion_logs_input [value='<?php echo $arr_tpl['settings']['settings']['conversion_logs']; ?>']").prop("selected", true);
	$("#default_hide_referrer [value='<?php echo $arr_tpl['settings']['settings']['default_hide_referrer']; ?>']").prop("selected", true);
	$("#second_sorting_column_input [value='<?php echo $arr_tpl['settings']['settings']['second_sorting_column']; ?>']").prop("selected", true);
	$("#second_sorting_type_input [value='<?php echo $arr_tpl['settings']['settings']['second_sorting_type']; ?>']").prop("selected", true);
});

function setLpPrSettingsData(){
	
	if ( location.hash == "#tab=lp-protect" && $('#default_hide_referrer_domain option').length <= 2 ){

		$.ajax({
			url: window.API_URL,
			type: 'post',
			data: {
				action: 'domain@get_all'
			}, 
			success: function( domains ){
				domains = JSON.parse(domains)

				for ( var i = 0; i < domains.length; i++ ){
					$('#default_hide_referrer_domain').append("<option value=" + domains[i].id +">" + domains[i].name + "</option>")
				}

				$('#default_hide_referrer_domain').val( $('#default_hide_referrer_domain')[0].dataset.chosenval )
				$('#default_hide_referrer_domain').chosen()
			}
		});	
	}
}

function addZclip(caller, target){

	$(caller).attr('data-was-zclipped', 1);

	$(caller).zclip({
		path:"templates/standart/js/jquery-zclip/ZeroClipboard.swf",
		copy:$(target).val(),
		beforeCopy:function(){
		},
		afterCopy:function(){
			$(caller).addClass("blue-button");
			$(caller).html("Done");
			setTimeout( function(){
				$(caller).removeClass("blue-button");
				$(caller).html("Copy");
			}, 2000 );
		}
	});

}

function download_import(){
	var data = new FormData();
    $.each(files, function( key, value ){
        data.append(key, value);
    });

	// Create and make "waiting please" window
	var loading_window = new makeLoadingModal("Uploading", "Upload file");
	loading_window.show();

	var import_load_callback = function(data){
		loading_window.close();
		if(data=='true'){
		   makeGoodAlertModal('OK', "Import Done", {"footer_ok_callback": "close"}).show();
		}else{
			if(data=='false'){
				makeBadAlertModal('OK', 'Version incorrect', {"footer_ok_callback": "close"}).show();
			}else{
				makeBadAlertModal('OK', 'Import Error: '+data, {"footer_ok_callback": "close"}).show();
			}
		}
	}

	$.ajax({
		url : "?ajax=1&type=download_import",
		method: "post",
		data: data,
		cache: false,
		processData: false,
		contentType: false,
	}).success(import_load_callback);
}

function setClipboardHandlers(){

	if (FlashDetect.installed){
		var buttons = $(".tab-content-block-active").find(".copy_button");
		var caller, target;
		buttons.each(function(i,item){
			if ( $(item).attr("data-was-zclipped") != 1 ){
				
				caller = "#"+$(item).attr("id");
				target = "#"+$(item).prev().attr("id");

				addZclip( caller, target );
			}

		});

	}
}

$(document).ready(function(){

	$('input[type=file]').change(function(){
		files = this.files;
	});

	if (!FlashDetect.installed){

		try {
			new Clipboard("#copy_btn1");
			new Clipboard("#copy_btn2");
			new Clipboard('#copy_btn_postback_2');
			new Clipboard("#copy_btn4");
			new Clipboard("#copy_btn3");
			new Clipboard("#copy_btn9");
			$("#copy_btn1").attr("data-clipboard-target", "#copy_value1");
			$("#copy_btn2").attr("data-clipboard-target", "#copy_value2");
			$("#copy_btn3").attr("data-clipboard-target", "#copy_value3");
			$("#copy_btn4").attr("data-clipboard-target", "#copy_value4");
			$("#copy_btn9").attr("data-clipboard-target", "#copy_value9");
			$('#copy_btn_postback_2').attr('data-clipboard-target', '#copy_value_postback_2');
		} catch (e){
			$("#url_input").css({"width":"100%"});
		}

	} else {}

	// From binomscript.js
	if ( FlashDetect.installed ){

		addTabsHandlers({
			onTabChangeActions: setClipboardHandlers, 
			hashOn: true
		});
		setClipboardHandlers();
	} else {
		addTabsHandlers({
			hashOn: true
		});
	}

	$(".user_login_change_button").on("click", function(){
		$(this).parent().parent().css("margin-top","29px");
		$(this).parent().parent().css("margin-bottom","0px");
		$(".user_login").css("display", "none");
		$("[name=login]").css(
			{
				"display":"inline",
				"margin-right":"5px",
				"width":"130px",
				"margin-top":"0px"
			}
		);
		$(".old_password_field_set").css("display", "block");
		$(".user_login_change_button").css("display", "none");
		$(".user_login_change_button_cancel").css("display", "inline-block");
	});

	$(".user_login_change_button_cancel").on("click", function(){
		$(this).parent().parent().css("margin-top","33px");
		$(this).parent().parent().css("margin-bottom","4px");
		var nowName = $(".user_login").text().trim();
		$(".old_password_field_set").css("display", "none");
		$("[name=login_old_password]").val("");
		$("[name=login]").val(nowName);
		$("[name=login]").css("display", "none");
		$(".user_login").css("display", "inline");
		$(".user_login_change_button").css("display", "inline");
		$(".user_login_change_button_cancel").css("display", "none");
	});

	window.TIMEZONE_CHANGED = false;
	$("[name=time_zone]").on("change", function(){
		window.TIMEZONE_CHANGED = true;
	});

	// Handlers that make save button active
	$("[name=login], [name=email], [name=time_zone]").on("input change", function(){
		$(".save_user_info_button").removeClass("button_inactive");
		$(".save_user_info_button").addClass("green-button");
	});

	$("[name=old_pass], [name=new_pass], [name=copy_new_pass]").on("input change", function(){
		$(".save_new_password_button").removeClass("button_inactive");
		$(".save_new_password_button").addClass("green-button");
	});

	$("#customize-form input,\
	   #customize-form select,\
	   #customize-form-digits input").on("input change", function(){
		$(".save_customizing_button").removeClass("button_inactive");
		$(".save_customizing_button").addClass("green-button");
	});

	$('#bnm-settings-lp-pr select, #bnm-settings-lp-pr input').on('change input', function(){
		$('.js-save-lp-pr-settings').removeClass("button_inactive");
		$('.js-save-lp-pr-settings').addClass("green-button");
	})

	$("#customize-form input,\
	   #customize-form select,\
	   #customize-form-digits input").on("input change", function(){
		$(".save_customizing_button").removeClass("button_inactive");
		$(".save_customizing_button").addClass("green-button");
	});

	$("#url_customization_form input, #url_customization_form select").on("input change", function(){
		$(".save_url_customization_button").removeClass("button_inactive");
		$(".save_url_customization_button").addClass("green-button");
	});



	$('.twofa-validate-button').on('click', function(){
		var fcode = $('.twofa-code-input').val();

		if (fcode.trim()==''){
			$('.twofa-code-input').addClass('error_field_border');
			return;
		} else {
			$('.twofa-code-input').removeClass('error_field_border');
		}
 
		$.ajax({
			method: "post",
			data:{
				ajax: 1,
				ajax_type: 'write',
				type: '2fa_enable',
				fcode: fcode,
				secret: window.secret
			},
			success: function( data ){
				data = JSON.parse(data);
				if (data.status=='true'){
					$('.twofa-cancel-block').css('display', 'block');
					$('.twofa-validate-input-wrapper').css('display', 'none');
				} else if (data.status=='false') {
					makeGoodAlertModal('OK','Incorrect code!',{footer_ok_callback:'close'}).show();
				}
			}
		})
	});

	$('.twofa-cancel-button').on('click', function(){
		function sendTurnOff(){
			
			$.ajax({
				method:"post",
				data: {
					ajax: 1,
					ajax_type:'write',
					type: '2fa_disable'
				},
				success: function(data){
					if (data.length==0){
						window.location.reload();
					}
				}
			});

		}

		const modalConfirm = makeConfirmModal( "OK", "Cancel", sendTurnOff, "", "Turn 2FA off?");
		modalConfirm.show();

	});

	// alert on enabling GDPR features
	$('#gdpr_ip_option').on('click', function(e){
		const $checkbox = $(this);
		
		if ( $checkbox.prop('checked') ){
			e.preventDefault();
			var w = makeConfirmModal(
				'Sure', 
				'Not Sure...',
				function(){$checkbox.prop('checked', true); $checkbox.trigger('change');},
				"",
				`Warning! This option will hide click’s IPs!<br>
				Are you sure you want to proceed?`,
				{
					closing_ok_wrap: true
				}
			);
			w.show();
		}
	});

	// alert on enabling GDPR features
	$('#gdpr_cookie_option').on('click', function(e){
		const $checkbox = $(this);
		if ( $checkbox.prop('checked') ){
			e.preventDefault();
			var w = makeConfirmModal(
					'Sure', 
					'Not Sure...',
					function(){$checkbox.prop('checked', true); $checkbox.trigger('change');},
					"",
					`Warning! This option will disable cookies! <br>
					Double check that redirects in your campaigns will continue to work in Chrome Incognito mode!<br>
					Are you sure you want to proceed?`,
					{
						closing_ok_wrap: true
					}
				);
			w.show();
		}
	});

});

function buttonSavedActions( buttonSelector ){
	var buttonHTML = $( buttonSelector ).html(),
		tempButtonHTML = "Done!";

	$( buttonSelector ).removeClass("button_inactive").addClass("blue-button").html(tempButtonHTML);
	setTimeout(function(){
		$( buttonSelector ).removeClass("blue-button").addClass("green-button").html(buttonHTML);
	}, 1000);
}

function saveUserInfo(){

	if ( $('.save_user_info_button').hasClass("button_inactive") ){
		return;
	}
	var errors = 0;

	if ( $("[name=login]").val().trim() == "" ){
		$("[name=login]").addClass("error_field_border");
		errors = 1;
	}

	if ( $(".old_password_field_set").css("display") != "none" && $("[name=login_old_password]").val().trim() == "" ){
		$("[name=login_old_password]").addClass("error_field_border");
		errors = 1;
	}

	if (errors == 1){
		return;
	}

	var formData = {};

	$('#usr-info-form').serializeArray().forEach( function(obj){
		formData[obj["name"]] = obj["value"];
	});

	var modal_window;

	function sendAjax(){
		$.ajax({
			url:"",
			type:"post",
			data:{
				ajax: 1,
				ajax_type: "write",
				type: "save_settings_1",
				data: formData
			},
			success: function(data){
				data = JSON.parse( data );
				if ( data.error ){
					$("[name="+data.error+"]").addClass("error_field_border");
				}
				if ( data.status && data.status == "ok"){
					$(".user_login").text(formData["login"]);
					$(".user_login_change_button_cancel").trigger("click");
					buttonSavedActions( ".save_user_info_button" );

					var expireCookieTime = $("[name=cookies]").val();
					$.removeCookie('auth_key');
					$.cookie( 'auth_key', data.auth_key, expireCookieTime );
				}
			}
		});
	}

	if ( window.TIMEZONE_CHANGED ){
		var ok_callback = sendAjax;

		modal_window = makeConfirmModal(
			"Sure", 
			"Not sure...", function(){ ok_callback(); modal_window.close(); window.TIMEZONE_CHANGED=false; }, 
			"TIMEZONE CHANGE WARNING!", 
			" <b style='color:red;'>Time zone change will affect new clicks only.<br> Please consider time shift deference and possible statistics overlay!</b> ");
		modal_window.show();
	} else {
		sendAjax();

	}
}

function saveNewPassword(){

	if ( $(this).hasClass("button_inactive") ){
		return;
	}

	var oldPass = $("[name=old_pass]").val().trim(),
	newPass = $("[name=new_pass]").val().trim(),
	newPass2 = $("[name=copy_new_pass]").val().trim(),
	errors = 0;

	if (oldPass==''){
		$("[name=old_pass]").addClass("error_field_border");
		errors=1;
	}
	if (newPass==''){
		$("[name=new_pass]").addClass("error_field_border");
		errors=1;
	}
	if(newPass2==''){
		$("[name=copy_new_pass]").addClass("error_field_border");
		errors=1;
	}

	if (errors==1){
		return;
	} else {
		$("#pass-form .error_field_border").removeClass("error_field_border");
	}

	var formData = {};

	$('#pass-form').serializeArray().forEach( function(obj){
		formData[obj["name"]] = obj["value"];
	} );

	$.ajax({
		url:"",
		type:"post",
		data:{
			ajax: 1,
			ajax_type: "write",
			type: "save_settings_1",
			data: formData
		},
		success: function(data){
			data = JSON.parse( data );
			if ( data.error  ){

				if ( data.error=="old_pass" ){
					$("[name=old_pass]").addClass("error_field_border");
				}
				if ( data.error=="new_pass" ){
					$("[name=new_pass]").addClass("error_field_border");
					$("[name=copy_new_pass]").addClass("error_field_border");
				}
			} else if ( data.status && data.status == "ok" ) {
			
				$("[name=old_pass]").val("");
				$("[name=new_pass]").val("");
				$("[name=copy_new_pass]").val("");
				buttonSavedActions(".save_new_password_button");

				var expireCookieTime = $("[name=cookies]").val();
				$.removeCookie('auth_key');
				$.cookie( 'auth_key', data.auth_key, expireCookieTime );

			}

		}
	});
}

function saveCustomizing( button ){

	if ( $(button).hasClass("button_inactive") ){
		return;
	}

	var errors = 0;
	var inputs = $("#customize-form input, #customize-form-digits input");

	// validating
	inputs.each( function(i, item){
		if ( $(item).attr('name')=="googleApiKey" )
			return;

		if ( $(item).val().trim() == ""){
			$(this).addClass( "error_field_border" );
			errors = 1;
		}
	} );

	if ( errors==1 ){
		return;
	}

	var formData = {};
	var formDataDigits = {};
	
	$('#customize-form').serializeArray().forEach( function(obj){
		formData[obj["name"]] = obj["value"];
	} );
	
	delete formData['waiting_time'];

	$('#customize-form-digits').serializeArray().forEach( function(obj){
		formDataDigits[obj["name"]] = obj["value"];
	} );

	
	
	var allData={};
	
	allData['settings']=formData;
	allData['digits']=formDataDigits;
	allData['status_scheme_options'] = {};
	allData['status_scheme_options']['waiting_time'] = $('#customize-form [name=waiting_time]').val();

	$.ajax({
		url:"",
		type:"post",
		data:{
			ajax: 1,
			ajax_type: "write",
			type: "save_settings_2",
			data: allData
		},
		success: function(data){
			data = JSON.parse( data );
			if ( data.status && data.status == "ok" ) {
				buttonSavedActions(".save_customizing_button");
			}
		}
	});
}

function saveLpPrSettings(button){
	if ( $(button).hasClass("button_inactive") ){
		return;
	}
	
	var formData = {};
	var allData={};

	$('#bnm-settings-lp-pr').serializeArray().forEach( function(obj){
		formData[obj["name"]] = obj["value"];
	});

	allData['settings'] = formData

	$.ajax({
		url:"",
		type:"post",
		data:{
			ajax: 1,
			ajax_type: "write",
			type: "save_settings_2",
			data: allData
		},
		success: function(data){
			data = JSON.parse( data );
			if ( data.status && data.status == "ok" ) {
				buttonSavedActions(".js-save-lp-pr-settings");
			}
		}
	});
}

function saveUrlCustomization(){

	if ( $(this).hasClass("button_inactive") ){
		return;
	}

	// Clearing from errors highlighting
	$("#url_customization_form .error_field_border").removeClass("error_field_border");

	var inputs = $("#url_customization_form input"),
		errors = 0,
		inputsCustomization = $(".url-customization-params input");

	// Check empty input
	inputs.each( function(i, item){

		var val = $(item).val().trim();

		if ( val == ""){
			$(this).addClass( "error_field_border" );
			errors = 1;
		}

	} );

	// Check duplications of customization params
	inputsCustomization.each(function(i, item){

		var val1 = $(item).val().trim();

		inputsCustomization.each(function(j, item2){

			var val2 = $(item2).val().trim();

			if ( !$(item).is(item2) ){

				if ( val2==val1 ){
					errors=1;
					$(item2).addClass("error_field_border");
					return false;
				}

			}
		});

	});

	
	
	// Check key length
	var key_length = $("[name=generate_camp_key_length]").val().trim();
	if ( key_length<=5 ){
		$("[name=generate_camp_key_length]").addClass( "error_field_border" );
		errors = 1;
	}

	if ( errors==1 ){
		return;
	}

	var formData = {};

	$('#url_customization_form').serializeArray().forEach(
		function(obj){
			formData[obj["name"]] = obj["value"];
		}
	);

	$.ajax({
		url:"",
		type:"post",
		data:{
			ajax: 1,
			ajax_type: "write",
			type: "save_settings_3",
			data: formData
		},
		success: function(data){
			data = JSON.parse( data );
			if ( data.error ){
				
				var form_name;
				if ( data.error == 'key_length' ){
					form_name = 'generate_camp_key_length';
				} else {
					form_name = data.error;
				}

				if ( $('[name='+form_name+']').length >0 ){
					$('[name='+form_name+']').addClass( "error_field_border" );
				}

			}
			if ( data.status && data.status == "ok" ){

				if ( data.redirect != "false" ){
					window.location.href = data.redirect;
				} else {
					if ( data.status && data.status == "ok" ) {
						buttonSavedActions(".save_url_customization_button");
					}
				}

			}
		}
	});
}

function backUrlCustomizationForDefault(){
	
	var formSelector = "#url_customization_form";
	var paramInputs = $(formSelector+ " .two-columns-wrapper input[type=text] ");

	paramInputs.each(function(i , item){
		var value = $(item).parent().find("span").text().trim();
		$(item).val( value );
		
	});

	
	$(formSelector+" [name=index]").val("index");
	$(formSelector+" [name=click]").val("click");
	$(formSelector+" [name=arm]").val("arm");
	$(formSelector+" [name=generate_camp_key_length]").val(20);
	$(formSelector+" [name=generate_camp_key_line]").val(4);

	$(formSelector+" input, "+formSelector+" select ").trigger("change");
}

function clearColumnSettings(){
	var modal_window;
	function confirmOkCallback(){
		$.ajax({
			url: '',
			type: 'post',
			data: {
				ajax: 1,
				ajax_type: 'write',
				type: 'clear_all_column_options',
			},
			success: function(){
				makeGoodAlertModal("OK", "Cleared!", {'cross_button_hide' : true, 'footer_ok_callback': 'close' }).show();
				modal_window.close();
			}
		});
	}
	modal_window = makeConfirmModal("Delete", "Cancel", confirmOkCallback, "Clear column settings?","Are you sure to clear all columns settings of showing/hiding columns on all pages?", '');
	modal_window.show();
}

window.onload  = function(){
	var columnsList = JSON.parse( BINOM.columnsList );

	var columnsListObject = {columns: columnsList.columns};
	// GLOBAL LINK
	BINOM.COLUMNS_LIST = columnsListObject;

	// Open column slider when hash tag enbled
	var hashObj = URLUtils.getHASHParamsAsObject();
	if ( hashObj['slider-columns'] =='open' ){
		$("#frml_settings_div").css('display', 'block');
		$(".custom_column_settings_toggler img").attr("src","templates/standart/images/arrow_up.png");
	}

	if (hashObj['focus']){
		
		var inputName = decodeURIComponent(hashObj['focus'])
	   	var selector  = 'input[name=' + inputName + ']'
	   	var inputNode = document.querySelector(selector)
	   	if ( inputNode ){
	   		inputNode.focus()
	   		if ( inputNode.value ){
	   			var valLength = inputNode.value.length;
	   			inputNode.setSelectionRange(valLength, valLength)
	   		}	   		
	   	}
	   	
	}

}

