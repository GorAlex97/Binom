function submitConversionFilterForm(){ 

	const params = Object.create(null);

	params.num_page = 1;

	document.querySelectorAll('#act-form select').forEach((select)=>{
		const name = select.name;
		const value = select.value;
		params[name] = value;
	})

	const nameInputSelector = window.BINOM._isMobileBrowser ? '[name=search_name_mobile]' : '[name=search_name]'

	const name = document.querySelector(nameInputSelector);

	params.search_name = name.value || "";

	if ( params.date==10 || params.date==12 ){
		params.date_s = document.querySelector("[name=date_s]").value;
		params.date_e = document.querySelector("[name=date_e]").value;
	}

	URLUtils.changeGETsInURL( params );
	BINOM.tt.refetchData()
	makeFilterBlockApplyButtonRefresh();
}

$(document).ready(function() {
	window.initConversionTT();
});
