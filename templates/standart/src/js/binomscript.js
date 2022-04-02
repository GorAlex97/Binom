"use strict";
function consoleGreetings(){
	console.log( '%c BINOM TRACKER', 'font-size:25px;font-weight:bold;color:#439a46;' );
	console.log( '%c Tracker for professionals!', 'font-size:20px');
	console.log( '%c Site    https://binom.org/', 'font-size:15px;font-style:italic;' );
	console.log( '%c Support https://support.binom.org/', 'font-size:15px;font-style:italic;' );
	console.log( '%c Docs    https://docs.binom.org/', 'font-size:15px;font-style:italic;' );
	console.log( '%c Blog    https://blog.binom.org/', 'font-size:15px;font-style:italic;' );
}
try {
	if (!localStorage || localStorage.DISABLE_HELLO_CONSOLE_MESSAGE!=="1")
		consoleGreetings();
} catch (e) {
	consoleGreetings();
}

jQuery.fn.reverse = [].reverse;
// GLOBAL
function getURLParameter(name) {
	return decodeURI( (RegExp('[?&]'+name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1] || '');
}

function escapeHTML(unsafe) {
	unsafe = unsafe || "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

var checkNoProfit = function(){
	if ( BINOM.tt ){
		return BINOM.tt.tableOptions.availableColumns.indexOf('profit')==-1 && BINOM.tt.tableOptions.availableColumns.indexOf('roi')==-1;
	} else {
		return $('[name=user_group]').val() == 3;
	}
	return true;
};

function mapPageParamToName( page ){
	var pageName;
	switch( page ){
		case('campaigns'):
			pageName = 'Campaigns';
		break;
		case('rotations'):
			pageName = 'Rotations';
		break;
		case('landing_page'):
			pageName = 'Landing pages';
		break;
		case('offers'):
			pageName = 'Offers';
		break;
		case('affiliate_networks'):
			pageName = 'Affiliate Networks';
		break;
		case('traffic_sources'):
			pageName = 'Traffic Sources';
		break;
		default:
			pageName = page;
	}
	return pageName;
}

var BINOM = (function(){
	function getPageTypeViaGet(){
		// TODO обрабатывать логин
		var URLPage = getURLParameter( 'page' );
		if ( URLPage != '' ){
			return URLPage.toLowerCase();
		} else {
			return 'campaigns';
		}
	}

	function getPageType( page ){
		if ( page=='add_camp' || page=='edit_camp' ){
			return 'add_camp';
		} else if ( page=='add_user' || page=='edit_user' ){
			return 'add_user';
		} else {
			return page;
		}
	}

	var __page = getPageTypeViaGet();
	var __pageType = getPageType(__page);
	return {
		__page: __page,
		__pageType: __pageType
	};
}());

BINOM.RESPONSE_STATUS_CHECK = function( result ){
	try {
		if ( typeof result == 'string' ) {
			result = JSON.parse(result);
		}
		if ( result.status ) {
			if ( result.status == "reload" ) window.location.reload();
		}
	} catch (e) {
		console.error( 'ERROR# BINOM.RESPONSE_STATUS_CHECK Cant check status of response!' );
	}
}


function cloneArrayFull ( arr ){
	return JSON.parse( JSON.stringify(arr) );
}

BINOM._localStorageIsActive = checkLocalStorageActive();
BINOM._isMobileBrowser = window.innerWidth < 700;
BINOM.cursorOnWindow = true;


BINOM.DISABLE_CONTEXT_MENU = function(){
	try {
		var GETS = URLUtils.getGETParamsAsObject();
		var page = GETS.page || 'Campaigns';
		if ( window.vmStore.state && window.vmStore.state[page] ){
			window.vmStore.state[page].TT.contextMenuState.enabled = false;
		}
		if ( BINOM._localStorageIsActive ){
			localStorage.setItem('CONTEXT_MENU_DISABLED', 1);
		}
	} catch (e){
		console.error(e);
	}

}
BINOM.ENABLE_CONTEXT_MENU = function(){
	try {
		var GETS = URLUtils.getGETParamsAsObject();
		var page = GETS.page || 'Campaigns';
		if ( window.vmStore.state && window.vmStore.state[page] ){
			window.vmStore.state[page].TT.contextMenuState.enabled = true;
		}
		if ( BINOM._localStorageIsActive ){
			localStorage.removeItem('CONTEXT_MENU_DISABLED');
		}
	} catch (e){
		console.error(e);
	}
}

BINOM.DISABLE_NUM_TAB_HOTKEY = ()=>{
	try {
		if ( BINOM._localStorageIsActive ){
			localStorage.setItem('disableNumTabsHotkey', 1);
		}
	} catch(e) {
		console.error( e );
	}
}

BINOM.ENABLE_NUM_TAB_HOTKEY = ()=>{
	try {
		if ( BINOM._localStorageIsActive ){
			localStorage.removeItem('disableNumTabsHotkey');
		}
	} catch(e) {
		console.error( e );
	}
}

BINOM.CLEAR_MY_IMAGES_FROM_SERVER = function(){
	const modal = makeConfirmModal("Clear", "Cancel", clearImages, "Clear all your images from server?", "");

	function clearImages(){
		fetch(`./${window.API_URL}?action=images@clear_all_user_images`, {
			credentials: 'include'
		})
		.then(r=>r.json())
		.then(d=>{
			if (d.status="cleared")
				modal.close();
			else
				throw new Error( JSON.stringify(d) );
		})
		.catch(e=>{
			console.error(e)
		})
	}

	modal.show();
}

BINOM.DISABLE_HELLO_CONSOLE_MESSAGE = function() {
	try {
		if ( BINOM._localStorageIsActive ){
			localStorage.setItem('DISABLE_HELLO_CONSOLE_MESSAGE', "1");
		}
	} catch(e) {
		console.error( e );
	}
}

BINOM.ENABLE_HELLO_CONSOLE_MESSAGE = function() {
	try {
		if ( BINOM._localStorageIsActive ){
			localStorage.removeItem('DISABLE_HELLO_CONSOLE_MESSAGE');
		}
	} catch(e) {
		console.error( e );
	}
}

BINOM.HTML_SNIPPETS = {};
BINOM.HTML_SNIPPETS.LOADING_CIRCLE = `
<div class="sk-fading-circle">
  <div class="sk-circle1 sk-circle"></div>
  <div class="sk-circle2 sk-circle"></div>
  <div class="sk-circle3 sk-circle"></div>
  <div class="sk-circle4 sk-circle"></div>
  <div class="sk-circle5 sk-circle"></div>
  <div class="sk-circle6 sk-circle"></div>
  <div class="sk-circle7 sk-circle"></div>
  <div class="sk-circle8 sk-circle"></div>
  <div class="sk-circle9 sk-circle"></div>
  <div class="sk-circle10 sk-circle"></div>
  <div class="sk-circle11 sk-circle"></div>
  <div class="sk-circle12 sk-circle"></div>
</div>`;

$(document).on('mouseleave', function(){
	BINOM.cursorOnWindow = false;
});

$(document).on('mouseenter', function(){
	BINOM.cursorOnWindow = true;
});

function easySlider( t ){
	if ($(t).next().css('display')=='none'){
		$(t).next().css('display', 'block');
		$(t).find( 'img.easy-toggler-img' )[0].src = 'templates/standart/images/arrow_down.png';
	} else if ($(t).next().css('display')=='block') {
		$(t).next().css('display', 'none');
		$(t).find( 'img.easy-toggler-img' )[0].src = 'templates/standart/images/arrow_up.png';
	}
}

function LicenceRedLine(left_days){
	var left_days = parseInt(left_days);

	var html = `
		<a class="lic_alert" style="float:right;text-align:center;white-space:nowrap;" target="_blank" href="https://cp.binom.org/login">
			Your subscription has expired. You have ${7+left_days} days to renew the license.
		</a>
	`;
	$('.menu1').removeClass('menu1').addClass('menu1_alert');
	$(".menu1_alert .header-menu-right").prepend( html );
}

/* Check lic days */
$(document).ready(function(){

	// Check kuka
	var days_left_lic = $.cookie('days_left_lic');
	if (typeof days_left_lic=='undefined'){
		// отправляем запрос на чек дней лицензии
		$.ajax({
			url: `./${window.API_URL}?action=licence@get`,
			type: 'GET',
			success: function(res){

				var resObj;
				// Try to JSON parse
				try {
					resObj = JSON.parse( res );
				} catch (e){
					console.error( e );
					console.error( `Cannot check licence. Please, contact our support.` );
					console.error( res );
					return;
				}

				if (resObj.status=='false' || resObj.status=='error') {
					// Записываем куку на час
					var expireDate = moment(new Date()).add(60, 'm').toDate();
					$.cookie('days_left_lic', 0, {expires: expireDate});
				} else if ( resObj.status=='true') {
					var left_days = Math.ceil(resObj.seconds_left/(3600*24));
					// Показываем красную строку
					if(left_days<0){
						LicenceRedLine(left_days);
					}
					if(BINOM.__page == 'analysis_system'){
						$('#days_left_lic_span').html(left_days+' days');
					}
					// Записываем куку на 12 часов
					var expireDate = moment(new Date()).add((60*12), 'm').toDate();
					$.cookie('days_left_lic', left_days, {expires: expireDate});
				}

			}
		});

	} else if(days_left_lic<0){
		LicenceRedLine(days_left_lic);
	}
});
/* end Check lic days */

function drawNewUpdateButton(var_text){
	if(!var_text){
		var_text='New update!';
	}
	if ($('.new_update_menu_button').length==0){
		var buttonHTML = '<a class="menu_button1 new_update_menu_button" href="?page=update_system" style="float:right; color: #FF9800; font-weight: normal;">'+var_text+'</a>';
		$('.menu1 .header-menu-right').prepend(buttonHTML);
	}
}

function drawNewMessagesButton(){
	// todo переделать класс
	var buttonHTML = '<a class="menu_button1 new_messages_menu_button" style="float:right;color:#FF9800;font-weight:normal;cursor:pointer;">New messages!</a>';
	$('.menu1 .header-menu-right').prepend(buttonHTML);
	$('.new_messages_menu_button').on('click', function(){
		binomMessageWindow.drawWindow();
	});
}

/* Чек по времени */
$(document).ready(function(){

	//чек апдейта
	// Check update cookie
	var updateCookie = $.cookie('check_upd');
	if (typeof updateCookie=='undefined'){
		// отправляем запрос на чек апдейта
		// check update
		$.ajax({
			url: `./${window.API_URL}?action=update@check`,
			type: 'GET',
			success: function(res){
				var resObj;
				// Try to JSON parse
				try {
					resObj = JSON.parse( res );
				} catch (e){
					console.error( e );
					console.error( `Cannot check update. Please, contact our support.` );
					console.error( res );
					return;
				}

				if (BINOM.__page == 'analysis_system') {

					if ( resObj.status == 'error' ) {
						if (BINOM.monitorObj.monitorData.errors.length == 0)  BINOM.monitorObj.monitorData.errors = {};
						BINOM.monitorObj.monitorData.errors['300'] = resObj.message;
						BINOM.monitorObj.draw();
					}
				}

				if (resObj.status=='false' || resObj.status=='error' || resObj.is_fix==1) {
					// Записываем куку на полчаса
					var expireDate = moment(new Date()).add(30, 'm').toDate();
					$.cookie('check_upd', -1, {expires: expireDate});
				} else if ( resObj.status=='true') {
					// Показываем New Update
					drawNewUpdateButton();
					// Записываем куку что есть апдейт на пол часа
					var expireDate = moment(new Date()).add(30, 'm').toDate();
					$.cookie('check_upd', 1, {expires: expireDate});
				}

			}
		});
	} else if (updateCookie=='1') {
		//drawNewUpdateButton();
	} else if (updateCookie=='0'){
		// DO LITERALLY NOTHING
	}


	//чек сообщений
	var messagesCookie = $.cookie('check_msg');
	if (typeof messagesCookie=='undefined'){
		// TODO ОТПРАВЛЯТЬ ЗАПРОС НА ЧЕК СООБЩЕНИЙ
		fetch(`./${window.API_URL}?action=messages@get_all`,{
			method: 'GET',
			credentials: 'include'
		})
			.then(r=>r.json())
			.then(d=>{
				if (d.status && d.status=="false"){
					var expireDate = moment(new Date()).add(30, 'm').toDate();
					$.cookie('check_msg', -1, {expires: expireDate});
				} else if ( d.status && d.status=="true" ){
					var expireDate = moment(new Date()).add(30, 'm').toDate();
					$.cookie('check_msg', 1, {expires: expireDate});
					drawNewMessagesButton();
				} else {
					throw new Error(JSON.stringify(d));
				}
			})
			.catch(e=>{
				console.error('Cannot check tracker messages!')
				console.error(e);
			})
	} else if (messagesCookie=='1'){
		drawNewMessagesButton();
	} else if (messagesCookie=='0'){
		// DO LITERALLY NOTHING
	}

	//чек доменов
	var CheckDomainsCookie = $.cookie('check_domains');
	if (typeof CheckDomainsCookie=='undefined'){
		fetch(`./${window.API_URL}?action=domain_checker@check_all`,{
			method: 'GET',
			credentials: 'include'
		})
			.then(r=>r.json())
			.then(d=>{
				if (d.status && d.status=="error"){
					var expireDate = moment(new Date()).add(180, 'm').toDate();
					$.cookie('check_domains', -1, {expires: expireDate});
				} else if ( d.status && d.status=="true" ){
					var expireDate = moment(new Date()).add(20, 'm').toDate();
					$.cookie('check_domains', 1, {expires: expireDate});
				}
			})
	}


	//check update notifications
	fetch(`./${window.API_URL}?action=notification@get_UpdateNotification`,{
		method: 'GET',
		credentials: 'include'
	})

		.then(r=>r.json())
		.then(d=>{
			if ( d.status && d.status=="true" ){
				drawNewUpdateButton(d.msg);
			}else{
				if(updateCookie=='1'){
					var expireDate = moment(new Date()).add(1, 'm').toDate();
					$.cookie('check_upd', -1, {expires: expireDate});
				}
			}
		})
		.catch(e=>{
			console.error('Cannot check tracker notifications!')
			console.error(e);
		})

});
/* END CHECK UPDATE */

// Pressed Keys Handler
// Blur browser's tab handler
(function addKeyPressedStorage(){
	var SHIFT = 16;
	var CTRL = 17;

	BINOM.keyPressed = {shift: false, ctrl: false};
	// Button pressed Handler
	$(document).keydown(function( e ){
		var e = e || window.event;
		var keyCode = getKeyCode( e );
		switch(keyCode){
			case(SHIFT):
				BINOM.keyPressed.ctrl = false;
				BINOM.keyPressed.shift = true;
			break;
			case(CTRL):
				BINOM.keyPressed.shift = false;
				BINOM.keyPressed.ctrl = true;
			break;
		}
	});

	$(document).keyup(function( e ){
		var e = e || window.event;
		var keyCode = getKeyCode( e );
		switch(keyCode){
			case(SHIFT):
				BINOM.keyPressed.ctrl = false;
				BINOM.keyPressed.shift = false;
			break;
			case(CTRL):
				BINOM.keyPressed.ctrl = false;

				BINOM.keyPressed.shift = false;
			break;
		}
	});

	$(window).blur(function(e) {
		BINOM.keyPressed.shift = false;
		BINOM.keyPressed.ctrl = false;
	});

}());

// preload images
if (BINOM.__pageType=="report"){
	var buttonbackgroud = new Image();
	buttonbackgroud.src = "./templates/standart/images/but-bg.png";
}

var URLUtils = {
	// TODO more complex check
	historyIsActive: (function(){
		return !!(window.history && history.pushState);
	})(),
	parseGETString: function( getsString ){

		var result = Object.create(null);

		if ( getsString != "" ){
			var getsStringsArr = getsString.split("&");
			var tempArr;
			getsStringsArr.forEach(function( str ){
				tempArr = str.split("=");
				result[tempArr[0]]=tempArr[1];
			});
		}

		return result;
	},
	makeGetParamsFromObject: function( obj, firstSymbol ){
		firstSymbol = firstSymbol || '?';

		var result = firstSymbol;
		var prop;
		for ( prop in obj ){
			if ( prop && obj[prop] != "" )
			result += prop+'='+obj[prop]+'&';
		}

		result = result.substring(0, result.length - 1);

		return result;
	},
	// TODO TEST THIS FUNCTION
	/**
	* @param URL String full(!) URL
	* @return Object
	*/
	getGETParamsAsObject: function( URL ){

		var getsString;
		var result = Object.create(null);

		if ( typeof URL == 'undefined' ){
			getsString = window.location.search.substr(1);
		} else {
			getsString = URL.split("?")[1];
			if ( typeof getsString == 'undefined' ){
				getsString == '';
			}
		}
		var result = this.parseGETString( getsString );

		return result;
	},
	changeURLWithNewGETS: function( GETS, options={} ){
		const {
			forcedRedirect=false,
			pushState=false,
			pushStateObject={}
		} = options;
		return new Promise((resolve, reject)=>{
			const oldGETS = URLUtils.getGETParamsAsObject();

			// TODO вынести это отсюда. воообще не место этому здесь чгява
			if (BINOM.tt && BINOM.tt.markedRows && BINOM.tt.markedRows.selected){
				BINOM.tt.markedRows.selected = new Array();
			}

		    if ( typeof GETS == 'undefined' ){
		      return '';
		    }
		    var getsString;
		    if ( typeof GETS == 'object'  ) getsString = this.makeGetParamsFromObject( GETS );
		    else if ( typeof GETS == 'string ' ) getsString = GETS;

		    var newURL = window.location.origin + window.location.pathname + getsString;

		    if ( !this.historyIsActive || forcedRedirect ){
		    	window.location.href = newURL;
		    } else {
		    	const stateData = pushStateObject || null;
		    	if (pushState)
		    		window.history.pushState(stateData, '', newURL);
		    	else
		    		window.history.replaceState(stateData, '', newURL );

		    	resolve( newURL );
		    }
		    // emit subscribers
		    const newGETS = URLUtils.getGETParamsAsObject();
		    URLUtils.subscriber.emit( "#URL_CHANGED", newGETS );
		    for ( let p in newGETS ){
		    	if ( newGETS[p] && oldGETS[p] && newGETS[p] != oldGETS[p] ){
		    		URLUtils.subscriber.emit( p, newGETS[p] );
		    	} else if ( newGETS[p] && !oldGETS[p] ){
		    		URLUtils.subscriber.emit( p, newGETS[p] );
		    	}
		    }

		})

	},
	getURLWithNewGETS: function( GETS ){
	    if ( typeof GETS == 'undefined' ){
	      return '';
	    }

	    var getsString;
	    if ( typeof GETS == 'object'  ) getsString = this.makeGetParamsFromObject( GETS );
	    else if ( typeof GETS == 'string ' ) getsString = GETS;

	    var newURL = window.location.origin + window.location.pathname + getsString;

	    return newURL;
	},
	/**
	 * @param {object}
	*/
	changeGETsInURL: function( params, options ){
		const names = Object.keys( params );
		const GET = URLUtils.getGETParamsAsObject();
		names.forEach( (p) => {
			if (params[p] === false || params[p] === null){
				delete GET[p];
			} else {
				GET[p] = String(params[p]);
			}
		})
		return URLUtils.changeURLWithNewGETS( GET, options )
	},

	removeGETFromURL( name ){
		const GET = URLUtils.getGETParamsAsObject();
		if ( typeof GET[name]!="undefined" ){
			delete GET[name];
			URLUtils.subscriber.emit(name, null);
			URLUtils.changeURLWithNewGETS(GET);
		}
	},
	getParam(param) {
		const GET = URLUtils.getGETParamsAsObject();
		return GET[param];
	},


	subscriber: {
		subs:{},
		on(paramName, fn){
			if (!this.subs[paramName]) this.subs[paramName] = [];
			this.subs[paramName].push( fn );
			const GETS = URLUtils.getGETParamsAsObject();
			let val = null;
			if ( typeof GETS[paramName] != "undefined" ){
				val = GETS[paramName]
			}
			fn( val );
			// TODO вызывать один раз после подписки
		},
		off(paramName, fn){
			if ( !this.subs[paramName] ){
				const i = this.subs[paramName].indexOf(fn);
				if ( i>-1 )
					this.subs[paramName].splice(fn)
			}
		},
		emit(paramName, value){
			if ( this.subs[paramName] ){
				this.subs[paramName].forEach((f)=>{
					f(value);
				})
			}
		}
	},

	// HASH
	getHASHParamsAsObject: function( HASH ){
		var getsString;
		var result = Object.create(null);

		if ( typeof HASH == 'undefined' ){
			getsString = window.location.hash.substr(1);
		} else {
			if (HASH.indexOf('#')==0){
				getsString = HASH.replace('');
			}
		}

		result = this.parseGETString( getsString );

		return result;
	},
	addParamToHASH: function( param, value ){
		var hashObj = this.getHASHParamsAsObject();
		hashObj[param] = value;
		var newHash = this.makeGetParamsFromObject(hashObj, '#');
		window.location.replace(newHash);
	},
	removeParamToHash: function(param){
		var hashObj = this.getHASHParamsAsObject();
		delete hashObj[param];
		var newHash = this.makeGetParamsFromObject(hashObj, '#');
		if (newHash === ''){
			history.replaceState(null, null, ' '); // Clear URL from # symbol
		} else {
			window.location.replace(newHash);
		}
	},
	// \HASH
}

// polyFill for Object.keys
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

// forEach polyfill
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback, thisArg) {
    var T, k;
    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== 'function') {
        throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  };
}
// filter polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';
    if (this === void 0 || this === null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }
    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }
    return res;
  };
}
// Object assign polyfill
function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}
// isArray polyfill
if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

if (!Object.assign){
	Object.assign = function(target, source){
		var getOwnPropertySymbols = Object.getOwnPropertySymbols;
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var propIsEnumerable = Object.prototype.propertyIsEnumerable;
		var from;
		var to = toObject(target);
		var symbols;
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
		return to;
	};
}

function getPageNameViaPageType(){
	switch( BINOM.__pageType ){
		case 'campaigns':
			return 'Campaigns'
		break;
		case 'landing_page':
			return 'Landings';
		break;
		case 'offers':
			return 'Offers';
		break;
		case 'affiliate_networks':
			return 'Affiliate Networks';
		break;
		case 'traffic_sources':
			return 'Traffic Sources';
		break;
		case 'stats':
			return 'Reports';
		break;
	}
	return '';
}

function cloneObject(obj){
    if (null == obj || "object" != typeof obj) return obj;

    var copy;
    if ( obj.constructor )
    {
    	copy = obj.constructor();
    	for (var attr in obj)
	    {
	        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	    }
    }
    else
    {
    	copy = Object.create(null);
    	for (var attr in obj)
    	{
    		copy[attr] = obj[attr];
    	}
    }

    return copy;
}

function isNumeric( number ){
	return !isNaN( number );
}


/**
* @param format String (date|time|datetime)
*/
Date.prototype.getStringHumanReadable = function( format ){

	var day = '0'+this.getDate();
	var month = '0'+this.getMonth();
	var year = this.getFullYear();
	var hours = this.getHours();
	var minutes = '0'+this.getMinutes();

	if ( format == 'datetime' ){
		return year+'-'+month.substr(-2)+'-'+day.substr(-2)+' '+hours+':'+minutes.substr(-2);
	} else if ( format == 'time' ) {
		return hours+':'+minutes.substr(-2);
	} else if ( format == 'date' ){
		return year+'-'+month.substr(-2)+'-'+day.substr(-2);
	}
}

Array.prototype.findObjectByProp = function(prop, val, returnIndex) {

	if ( typeof returnIndex == 'undefined' ){
		returnIndex = false;
	}

	var result = new Array();

    for (var i=0;i<this.length;i++){
        if (typeof this[i] == "object" && this[i][prop]==val){
        	if ( returnIndex ){
        		result.push(i);
        	} else {
            	result.push(this[i]);
            }
        }
    }

    if (result.length==1){
        return result[0];
    } else if (result.length>0) {
        return result;
    } else {
        return false;
    }

}

Array.prototype.findIndexObjectByProp = function(prop, val){
	if ( this.length > 0 ){
	  	for (var i=0;i<this.length;i++){
			if (this[i][prop]==val){
			    return i;
			}
		}
	}
  	return false;
}

Array.prototype.remove = function(value) {
    var idx = this.indexOf(value);
    if (idx != -1) {
        this.splice(idx,1);
    }
    return false;
}

function setTabActive( tabName ){
	if ( $(".tab-button[data-tab-name="+tabName+"]").length==0 ){
		return;
	}
	$(".tab-content-block-active").removeClass("tab-content-block-active");
	$(".tab-button-active").removeClass("tab-button-active");

	$(".tab-button[data-tab-name="+tabName+"]").addClass("tab-button-active");
	$(".tab-content-block[data-tab-name="+tabName+"]").addClass("tab-content-block-active");
	if ( typeof onTabChangeActions == "function" ){
		onTabChangeActions();
	}
}

/*
* @param options
	onTabChangeActions function
	hashOn boolean
*/
function addTabsHandlers( options ){

	options = options || Object.create( null );

	function setHandlers(){
		$(".tab-button").on("click", function(){
			var tabName = $(this).attr('data-tab-name');
			if ( options.hashOn ) window.location.hash = 'tab='+tabName;
			setTabActive( tabName );
			if ( typeof options.onTabChangeActions == "function" ){
				options.onTabChangeActions( tabName );
			}
		});
	}

	if ( document.readyState !== "complete" ) {
		$(document).ready( function(){
			setHandlers();
			if ( options.hashOn ) setActiveTabFromHash();
		});
	} else {
		setHandlers();
		if ( options.hashOn ) setActiveTabFromHash();
	}

	if ( options.hashOn ) {
		$(window).on('hashchange', function(){
			setActiveTabFromHash();
		});
	}
}


function setActiveTabFromHash(){
	var hash = window.location.hash;

	if ( hash.length != 0 ){
		var hashParams = URLUtils.getHASHParamsAsObject();
		if ( hashParams['tab'] ) setTabActive( hashParams['tab'] );
	}
}

// Set value from storage to search - input
function setSearchValueFromStorage(){

	if ( BINOM._localStorageIsActive ){
		var page = getURLParameter('page').toLowerCase();
		var obj = localStorage.getItem('searching');
		var searchValue = '';
		if ( obj ){
			obj = JSON.parse( obj );
			searchValue = obj[page];
			if ( searchValue ){
				$(".search").val(searchValue);
				$(".search").trigger('change');
			}
		}
	}
}

$(document).ready(setSearchValueFromStorage);

/*
#######################
# STATISTICS FUNCTION #
#######################
*/
/**
 * Handler delete button - writen inline onclick
 * working only with main stats tables and their mechanism
 * of setting href to deleting button
 *
 * @param object {object} object of button - click target
 * @param page_type {string} this string that will be after word delete in header of window
 */
function deleteButtonHandler(object, page_type, text){

	var ok_callback, modal_window;

	// Callback of delete button
	ok_callback = function(){
		// make Delete (OK) button animating
		makeButtonInProcess(".modal_window--confirm .modal_window__ok-button", "Deleting...");
		// redirect on href which delete campaign
		window.location = object.dataset.href;
	};

	modal_window = makeConfirmModal("Delete", "Cancel", ok_callback, "Delete "+page_type, text);
	modal_window.show();
	return false;
}

/*
##############################
# END OF STATISTICS FUNCTION #
##############################
*/



// NEEDED FOR WINDOWS_CORE FOR SAVING SEARCH VALUE
// AFTER SAVING LAND/OFFER AND RELOAD PAGE
function afterSaveButton(){
	if ( (typeof submitForm != "undefined") && ( $("#act-form .search").val()!="" )  && __searchChanged==1){
		submitForm();
		return;
	} else {
		window.location.reload();
		return;
	}
	window.location.reload();
}

function changeNewLineOnBr(string){
	return string.replace(/(?:\r\n|\r|\n)/g, '<br />');
}

var binomMessageWindow = {

	messages : null,

	// read/close buttons
	read_button: '<a class="button win-save-button message-read-button"><img src="templates/standart/images/w-save.png" class="icon save_icon">Read</a>',
	close_button: '<a class="button win-close-button message-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>',

	drawWindow: function(){
		$('body').append(this.makeWindow());
		this.setMessageFromServer();
		this.setListeners();
	},

	makeWindow: function(){
		return  '<div id="wrap" class="wrap" style="display: block;"></div>\
				<div class="window window_read_message" id="1" style="display:block;width:400px;">\
					<a class="win_closebtn" onclick="binomMessageWindow.closeWindow()"></a>\
					<div class="win_header">\
						<span class="window_head_name" style="overflow:initial;">New message!</span>\
					</div>\
					<div class="win_cap">\
					</div>\
					<div class="win_content win_message_content">\
						<img class="message-text-loading" width="75px" src="templates/standart/images/loading.GIF">\
					</div>\
					<div class="win_footer">\
					' + this.makeFooter() + '\
					</div>\
				</div>';
	},

	closeWindow: function(){
		$(".window_read_message").remove();
		$(".wrap").css("display", "none");
	},


	makeMessageRead: function(that){
		var that = this;
		return function(){

			that.messages.forEach(function(msg){
				var p = fetch(`./${window.API_URL}?action=messages@read&id=${msg.id}`,
						{
							credentials: 'include',
							method: 'GET'
						})
							.catch(e=>console.error(e))
			});

			$('.new_messages_menu_button').remove();
			var expireDate = moment(new Date()).toDate();
			$.cookie('check_msg', 0, {expires: expireDate});
			that.closeWindow();

		}
	},

	setListeners: function(){
		var that = this;
		$(".message-close-button").on("click", this.closeWindow);
		$(".message-read-button").on("click", this.makeMessageRead(that))
	},

	makeFooter: function(){
		var that = this;
		var footer_block = '<div class="win-buttons-block">'+this.read_button + this.close_button+'</div>';
		return footer_block;
	},

	insertMessageInWindow:function(text){
		if (typeof text == 'string'){
			$(".window_read_message img.message-text-loading").remove();
			$(".window_read_message .win_content").append(text);
		} else if (Array.isArray(text)){
			$(".window_read_message img.message-text-loading").remove();
			text.forEach(function(msg){
				$(".window_read_message .win_content").append(msg.text);
				// add separator block
				$(".window_read_message .win_content").append('<div style="border-top:1px solid #eee;margin-top:10px;margin-bottom:10px;"></div>')
			})
		}

	},

	//Success callback
	setMessageFromServer:function(){
		var that = this;
		fetch(`./${window.API_URL}?action=messages@get_all`, {
				credentials: 'include',
				method: 'GET'
			})
				.then(r=>r.json())
				.then(d=>{
					that.messages = d.msg;
					that.insertMessageInWindow(d.msg)
				})
	},
}


// Set text cursor position
// Functions more for noteWindowTokens
function doGetCaretPosition (oField) {

  // Initialize
  var iCaretPos = 0;

  // IE Support
  if (document.selection) {

    // Set focus on the element
    oField.focus();

    // To get cursor position, get empty selection range
    var oSel = document.selection.createRange();

    // Move selection start to 0 position
    oSel.moveStart('character', -oField.value.length);

    // The caret position is selection length
    iCaretPos = oSel.text.length;
  }

  // Firefox support
  else if (oField.selectionStart || oField.selectionStart == '0')
    iCaretPos = oField.selectionStart;


  // Return results
  return iCaretPos;
}

function insertTextAtCursor(el, text) {
    var val = el.value, endIndex, range, doc = el.ownerDocument;
    if (typeof el.selectionStart == "number"
            && typeof el.selectionEnd == "number") {
        endIndex = el.selectionEnd;
        el.value = val.slice(0, endIndex) + text + val.slice(endIndex);
        el.selectionStart = el.selectionEnd = endIndex + text.length;
    } else if (doc.selection != "undefined" && doc.selection.createRange) {
        el.focus();
        range = doc.selection.createRange();
        range.collapse(false);
        range.text = text;
        range.select();
    }
}

function moveCaret(textNode, charCount) {
    var sel, range;
    if (window.getSelection) {
        // IE9+ and other browsers
        sel = window.getSelection();

        if (sel.rangeCount > 0) {
            var newOffset = sel.focusOffset + charCount;
            sel.collapse(textNode, Math.min(textNode.length, newOffset));
        }
    } else if ( (sel = window.document.selection) ) {
        // IE <= 8
        if (sel.type != "Control") {
            range = sel.createRange();
            range.move("character", charCount);
            range.select();
        }
    }
}

"x".constructor.prototype.addCommaSeparatorFloat = function(){
	return this.replace( /(?=\B(?:\d{3})+\b[\.])/g, ',' );
}

"x".constructor.prototype.addCommaSeparatorInt = function(){
	return this.replace( /(?=\B(?:\d{3})+\b)/g, ',' );
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//#################
//#################
function calcSumSearch(){

	var sum_obj = {

			sum_clicks: 0,
			sum_leads: 0,
			sum_spend: 0,
			sum_rev: 0,
			sum_lpctr: 0,
			sum_of_cl: 0,
			sum_lnd_cl: 0,
			sum_cr: 0,
			sum_epc: 0,
			sum_cpc: 0

		},
		lpctr_used = ($(".table_stat .lpctr_td").length>0),
		sum_of_cl=0,
		sum_lnd_cl=0;

	re_comma = new RegExp("[,]", "g");

	$(".table_stat tr").each(function(i, elem){
		if ($(elem).css("display")!="none"){
			sum_obj["sum_clicks"] += parseFloat($(elem).find(".clicks_td").html().replace(re_comma,""));
			sum_obj["sum_leads"] += parseFloat($(elem).find(".leads_td").html().replace(re_comma,""));
			sum_obj["sum_spend"] += parseFloat($(elem).find(".cost_td").html().replace(re_comma,"").replace("$",""));
			sum_obj["sum_rev"] += parseFloat($(elem).find(".revenue_td").html().replace(re_comma,"").replace("$",""));
			if (lpctr_used){
				sum_of_cl=sum_of_cl+parseInt($(elem).find(".offer_clicks_hide").html().replace(re_comma,""));
				sum_lnd_cl=sum_lnd_cl+parseInt($(elem).find(".landing_clicks_hide").html().replace(re_comma,""));
			}
		}
	});



	if(sum_lnd_cl>0){
		sum_obj["sum_lpctr"]=(sum_of_cl/sum_lnd_cl)*100;
	}else{
		sum_obj["sum_lpctr"]=0;
	}
	if(sum_obj["sum_clicks"]>0){
		sum_obj["sum_cr"]=(sum_obj["sum_leads"]/sum_obj["sum_clicks"])*100;
	}else{
		sum_obj["sum_cr"]=0;
	}
	if(sum_obj["sum_clicks"]>0){
		sum_obj["sum_epc"]=(sum_obj["sum_rev"]/sum_obj["sum_clicks"]);
	}else{
		sum_obj["sum_epc"]=0;
	}
	if(sum_obj["sum_clicks"]>0){
		sum_obj["sum_cpc"]=(sum_obj["sum_spend"]/sum_obj["sum_clicks"]);
	}else{
		sum_obj["sum_cpc"]=0;
	}

	sum_obj["sum_profit"]=sum_obj["sum_rev"]-sum_obj["sum_spend"];

	if(sum_obj["sum_spend"]>0){
		sum_obj["sum_roi"]=(parseFloat(sum_obj["sum_profit"])/parseFloat(sum_obj["sum_spend"]))*100;
	}else{
		sum_obj["sum_roi"]=0;
	}

	return sum_obj;
}

//Make enable/disable buttons that not needed in group choice
function disabledNongroupButtons(){
	$("#delete, #clone, #report, #edit").removeAttr("href");
	$("#edit, #report, #clone, #note").attr("class", "button_inactive");
	$("#clear, #note").attr("onclick", "");
	$("#clear, #delete").attr("class", "gray-button_inactive");
}

function set_get(url,name,val){
	var re=name;
	if(url.search(re)==-1){
		url=url+'&'+name+'='+val;
	}else{
		var old_tag = name+'='+getURLParameter(name);
		url=url.replace(old_tag,name+'='+val);
	}
	return url;
}

function tryToReturnPlaceholderSearch(that){
	if ($(that).val().length == 0){
		that.placeholder="Search";
	}
}

function addZeroToNumber(number){
	if (number.toString().length == 1){
		return "0" + number.toString();
	}
	return number;
}

/**
 * Download land
*/
function download_land(){
	var lp_name = $("[name = \'lp_name\']").val();
	var data = new FormData();
	$.each(files, function( key, value ){
		data.append(key, value);
	});

	var blocker = new windowBlocker("#add_lp", {blocked_button_text:"Uploading"});
	// Blocking window
	blocker.block();

	var upload_button = $(".upload_land_button");
	makeButtonLoaded(upload_button, "Upload");

	$.ajax({
		url : "?ajax=1&type=download_land&land_name="+lp_name,
		method: "post",
		data: data,
		cache: false,
		processData: false,
		contentType: false,
	}).success(function(data){
		if(data.indexOf("Maximum number") + 1) {
			$("#download_land").parent().append("<p style=\'margin: 0;color: red;\'>Exceeded the limit number of files</p>");
			blocker.unblock();
			$(".upload_land_button .sk-fading-circle").remove();
			$(".upload_land_button").html('<img src="templates/standart/images/w-save.png" class="icon save_icon">Upload lander');
		}else{
			var obj = jQuery.parseJSON(data);
			$("#download_land").css("display","none");
			$("#lp_file_block").css("display","block");
			$("[name = \'lp_file\']").css("display","block");
			$("[name = \'lp_file\']").val(obj.path);
			$("#add_lp [name=lp_file]").prop("readonly", true);
            $("#add_lp [name=lp_file]").addClass("readonly_input");
			if(obj.error){
				$("#download_land").parent().append("<p style=\'margin: 0;color: red;\'>"+obj.error+"</p>");
			}
			// Unblocking window
			blocker.unblock();
			addCheckButtonToURL.init("input[name=lp_file]", true);
		}
	}).error(function(error){
		if (error.status==413){
			makeBadAlertModal("OK", "HTTP 413! Please, change your web-server's configuration \
									 (For Nginx: client_max_body_size, for Apache: LimitRequestBody)\
									 and try again.").show();
			blocker.unblock();
			addCheckButtonToURL.init("input[name=lp_file]", true);
			$(".upload_land_button").html('<img src="templates/standart/images/w-save.png" class="icon save_icon">Upload lander');
		}
	});
}

//#################
//#################

var offerPageHelper = {

	clipboard: -1,

	setZclipOnCopyBtn: function(){
		$("#copy_postback_url").zclip({
		    path:"templates/standart/js/jquery-zclip/ZeroClipboard.swf",
		    copy:$("#postback_url").val(),
		    beforeCopy:function(){
		    },
		    afterCopy:function(){
		        $("#copy_postback_url").addClass("blue-button");
		        $("#copy_postback_url").html("Done");
		        setTimeout(function(){
		        	$("#copy_postback_url").removeClass("blue-button");
		      		$("#copy_postback_url").html("Copy");
		        },2000);
		    }
		});
	},

	addCopyFuncTobutton: function(){

		if (!FlashDetect.installed){
			try {
				if (this.clipboard == -1){
					this.clipboard = new Clipboard("#copy_postback_url");
					$("#copy_postback_url").replaceWith( $("<button class='green-button' id='copy_postback_url' href='javascript:' data-clipboard-target='#postback_url'>Copy</button>") );
				}
			} catch (e){
				$("#url_input").css({'width':'100%'});
			}

		} else {
			this.setZclipOnCopyBtn();
		}
	},

	windowEditingOfferURLByTemplate: function(offer_url, template_url){

		var lastEditUrl = $(".window [name=of_networks]").attr("data-addurl");

		$(".window [name=of_networks]").attr("data-addurl", "");

		if ( lastEditUrl != "" && typeof lastEditUrl != "undefiend" ){
			offer_url = offer_url.replace(lastEditUrl, "");
		}

		// Разбор темплейт урла

		if (typeof template_url === "undefined" || template_url==null){
			return offer_url;
		}

		var regexpparams = /[&\?]([^=]+)=([^=\&]*)?/g,
			regresult,
			add_url = "",
			result_url = offer_url,
			hasParams = ( offer_url.indexOf("?") != -1 );

		var template_tokens = {};

		while( regresult = regexpparams.exec( template_url ) ){
			template_tokens[regresult[1]] = regresult[2];
		}
		var prop;
		for (prop in template_tokens){
			if ( template_tokens.hasOwnProperty(prop) ){

				if ( template_tokens[prop] == "{clickid}" ){

					if ( offer_url.indexOf(template_tokens[prop]) == -1 ) {
						if (hasParams){
							add_url += "&";
						} else {
							add_url += "?";
							hasParams = true;
						}
						add_url += prop+"="+template_tokens[prop];
					}

				} else {
					if ( offer_url.indexOf(prop+"=") == -1 ) {
						if (hasParams){
							add_url += "&";
						} else {
							add_url += "?";
							hasParams = true;
						}
						add_url += prop+"="+template_tokens[prop];
					}
				}

			}
		}
		if (add_url.length>0){
			$(".window [name=of_networks]").attr("data-addurl", add_url);
		}

		return result_url + add_url;
	},

	windowEditionOfferURLByTemplateClearURL: function(offer_url){
		var lastEditUrl = $(".window [name=of_networks]").attr("data-addurl");

		$(".window [name=of_networks]").attr("data-addurl", "");
		return offer_url.replace(lastEditUrl, "");
	}

}

var landingPageHelper = {
	clipboard: -1,

	setZclipOnCopyBtn: function(){
		$("#copy_btn10").zclip({
		    path:"templates/standart/js/jquery-zclip/ZeroClipboard.swf",
		    copy:$("#copy_value10").val(),
		    beforeCopy:function(){
		    },
		    afterCopy:function(){
		        $("#copy_btn10").addClass("blue-button");
		        $("#copy_btn10").html("Done");
		        setTimeout(function(){
		        	$("#copy_btn10").removeClass("blue-button");
		      		$("#copy_btn10").html("Copy");
		        },2000);
		    }
		});
	},

	addCopyFuncTobutton: function(){

		if (!FlashDetect.installed){

			try {
				if (this.clipboard == -1){
					this.clipboard = new Clipboard("#copy_btn10");
					$("#copy_btn10").replaceWith( $("<button class='green-button' id='copy_btn10' href='javascript:' data-clipboard-target='#copy_value10'>Copy</button>") );
				}
			} catch (e){
				/*	$("#url_input").css({'width':'100%'});*/
			}

		} else {
			this.setZclipOnCopyBtn();
		}

	}
}

var addTokensToURL = {

	list_of_tokens: {},

	opened_flag : false,


	init: function(jobj, win_id, type){
		if (!this.opened_flag){
			this.opened_flag = true;
			this.url_input = jobj;
			this.window_id = win_id;

			var additional_tokens = new Array();

			if (type=="lp"){
				additional_tokens.push({"param":"{lp_key}", "value": {"param":"lpkey", "view":"LP Key"}});
			}


			if (type=="of" || type=="lp"){
				this.list_of_tokens = {
							"{clickid}"        : {"param":"clickid", "view":"Click ID"},
							"{user_id}"        : {"param":"user_id", "view":"User ID"},
							"{campaign}"       : {"param":"campaign","view":"Camp ID"},
							"{trafficsource}"  : {"param":"trafficsource", "view":"Traffic Source"},
							"{trafficsource_name}"  : {"param":"trafficsource_name", "view":"Traffic Source Name"},
							"{clickcost}"      : {"param":"clickcost", "view":"Click Cost"},
							"{lander}"         : {"param":"lander", "view":"Land ID"},
							"{domain}"		   : {"param":"domain", "view":"Domain"},
							"{referer}"		   : {"param":"referer","view":"Referer"},
							"{time}"		   : {"param":"time", "view":"Time"},
							"{htime}"		   : {"param":"htime", "view":"Encoded Time"},
							"{device_name}"    : {"param":"device_name", "view":"Device Name"},
							"{device_brand}"   : {"param":"device_brand", "view":"Device Brand"},
							"{device_model}"   : {"param":"device_model", "view":"Device Model"},
							"{browser_name}"   : {"param":"browser_name", "view":"Browser Name"},
							"{browser_version}": {"param":"browser_version", "view":"Browser Version"},
							"{resolution}"	   : {"param":"resolution", "view":"Resolution"},
							"{os_name}"        : {"param":"os_name", "view":"OS Name"},
							"{os_version}"     : {"param":"os_version", "view":"OS Version"},
							"{country}"        : {"param":"country", "view":"Country"},
							"{country_code}"   : {"param":"country_code", "view":"Сountry code"},
							"{language}"       : {"param":"language", "view":"Language"},
							"{city}"           : {"param":"city", "view":"City"},
							"{isp}"            : {"param":"isp", "view":"ISP"},
					 		"{ip}"             : {"param":"ip", "view":"IP"},
							"{user_agent}"     : {"param":"user_agent", "view":"User Agent"},
							"{t1}"             : {"param":"t1", "view":"Token 1"},
							"{t2}"             : {"param":"t2", "view":"Token 2"},
							"{t3}"             : {"param":"t3", "view":"Token 3"},
							"{t4}"             : {"param":"t4", "view":"Token 4"},
							"{t5}"             : {"param":"t5", "view":"Token 5"},
							"{t6}"             : {"param":"t6", "view":"Token 6"},
							"{t7}"             : {"param":"t7", "view":"Token 7"},
							"{t8}"             : {"param":"t8", "view":"Token 8"},
							"{t9}"             : {"param":"t9", "view":"Token 9"},
							"{t10}"            : {"param":"t10", "view":"Token 10"}
						};
			} else if (type=="ts") {
				this.list_of_tokens = {
					"{externalid}" : {"param":"externalid", "view":"External ID"},
					"{payout}" : {"param":"payout", "view":"Payout"}
				}
			}

			for(var i=0;i<additional_tokens.length;i++){
				this.list_of_tokens[additional_tokens[i]["param"]] = additional_tokens[i]["value"];
			}

			if (type=="ts"){
				this.url_input.after("<div class='url-tokens-block'>\
						<a class='url-tokens-title'>You can use the following tokens:</a>\
								<div class='url-tokens-list url-tokens-list-ts' >\
								</div>\
				</div>");
			} else {
				this.url_input.after("<div class='url-tokens-block'>\
						<a class='url-tokens-title'>You can use the following tokens:</a>\
								<div class='url-tokens-list url-tokens-list-lpof'>\
								</div>\
				</div>");
			}
			this.setHandlers();
			this.setListOfTokens();
		}

	},

	checkInput: function(obj){
		var that = obj;
		return function(){
			if ($(".url-tokens-list").css("display")!="none"){
				that.setListOfTokens();
			}
		}
	},

	setListOfTokens: function(){
		var url_input = this.url_input;

		var tokens_keys = Object.keys(this.list_of_tokens),
		html_tokens_list = "";

		var needed_tokens_keys = tokens_keys.filter(function(plc){
			if (url_input.val().indexOf(plc) == -1){
				return true;
			} else {
				return false;
			}
		});

		for (var i=0; i<tokens_keys.length;i++){
			if (url_input.val().indexOf(tokens_keys[i]) == -1){
				html_tokens_list += "<span class='url-tokens-not-used' data-placeholder=" + tokens_keys[i] + "> <span class='url-tokens-name-plus'>+</span>"+this.list_of_tokens[tokens_keys[i]]["view"]+" </span>";
		 	} else {
		 		html_tokens_list += "<span class='url-tokens-used' data-placeholder=" + tokens_keys[i] + "> <span class='url-tokens-name-minus'>-</span>"+this.list_of_tokens[tokens_keys[i]]["view"]+" </span>";
		 	}
		}

		$(".url-tokens-list").html("");
		$(".url-tokens-list").append(html_tokens_list);
	},

	setHandlers: function(){
		$(".url-tokens-block").on("touchend click", ".url-tokens-not-used", this.addToken(this));
		$(".url-tokens-block").on("touchend click", ".url-tokens-used", this.removeToken(this));

		this.url_input.on("input", this.checkInput(this));
		$("#" + this.window_id + " .win-close-button").on("click", this.closeTokens(this));
		$("#" + this.window_id + " .win_closebtn").on("click", this.closeTokens(this));
	},

	toggleTokensList: function(obj){
		var that = obj;
		return function(){
			if ($(".url-tokens-block .url-tokens-list").css("display")=="none"){
				$(".url-tokens-block .url-tokens-list").css("display", "block");
				//$(".url-tokens-add-button").html("Close tokens");
				that.setListOfTokens();
			} else {

				that.closeTokens();
			}
		}
	},

	//@param token: JQuery Object
	toggleTokenChooser: function(token){
		if (token.hasClass("url-tokens-not-used")){
			token.removeClass("url-tokens-not-used");
			token.addClass("url-tokens-used");
			token.find(".url-tokens-name-plus").html("-").removeClass("url-tokens-name-plus").addClass("url-tokens-name-minus");
		} else if (token.hasClass("url-tokens-used")){
			token.removeClass("url-tokens-used");
			token.addClass("url-tokens-not-used");
			token.find(".url-tokens-name-minus").html("+").removeClass("url-tokens-name-minus").addClass("url-tokens-name-plus");
		}
	},

	addToken: function(){
		var that = this;
		return function(){
			var plc = $(this).attr("data-placeholder"),
			url_input_text = that.url_input.val();

			if (that.url_input.val()[that.url_input.val().length-1]!="="){
				if(url_input_text.indexOf("?")!=-1){
					if ( url_input_text.indexOf("?") == (url_input_text.length-1) ) {
						that.url_input.val(url_input_text + that.list_of_tokens[plc]["param"] +"="+plc);
					} else {
						that.url_input.val(url_input_text + "&" +that.list_of_tokens[plc]["param"] +"="+plc);
					}
				} else {
					that.url_input.val(url_input_text + "?" +that.list_of_tokens[plc]["param"] +"="+plc);
				}
			} else {
				that.url_input.val(url_input_text + plc);
			}
			that.toggleTokenChooser($(this));
			$(this).html($(this).html().replace("+", "-"));

			that.url_input.trigger("change");
			that.url_input.focus();
			create_qr();
		}
	},

	removeToken: function(obj){
		var that = obj;
		return function(){
			var url_input_text = that.url_input.val(),
			replace_re = new RegExp("[&?]*[0-9a-zA-Z_-~\.!*'\(\)]*" + "\=?" + this.getAttribute("data-placeholder"),"g" ),
			new_url, old_url;

			new_url = that.url_input.val(url_input_text.replace(replace_re, "") ).val();
			if (new_url != url_input_text){
				that.toggleTokenChooser($(this));

				if (new_url.indexOf("?")==-1){
					that.url_input.val(new_url.replace("&", "?"));
				}
			}

			that.url_input.trigger("change");
			that.url_input.focus();
			create_qr();

		}
	},

	closeTokens: function(obj){
		var that = obj;
		return function(){
			$(".url-tokens-block").css("display","none");
			$(".url-tokens-block").remove();
			that.opened_flag = false;
			return "xxx";
		}
	}
}

var noteWindowTokens = {

	input_selector: "",
	temp_timeout: "",
	textarea_focused: 0,
	time_now: "",


	init: function(input_selector){
		var that = this;
		this.clearTokens();
		this.input_selector = input_selector;
		$(input_selector).parent().append(this.makeHtmlBlock());
		this.setHandlers();
	},

	clearTokens: function(){
		if ($(this.input_selector).parent().find(".note-tokens").length>0){
			$(this.input_selector).parent().find(".note-tokens-wrapper").remove();
		}
	},

	drawTokens: function(){
	},

	makeFunctionWriter: function( fetchFunc ) {
		var that = this;
		return function(e){
			if ($(this).hasClass("note-tokens-disabled")){
				return;
			}
			var e = e || window.event,
				button = $(this);
			e.preventDefault();
			function fetchDateTimeCallBack( date_time ){
				var caret_position = doGetCaretPosition( document.getElementById(that.input_selector.replace("#","")) );
				// inserting before focus
				if (caret_position==0 && that.textarea_focused==0){
					if ($(that.input_selector).val().trim().length==0){
						$(that.input_selector).val($(that.input_selector).val() + date_time);
					} else {
						$(that.input_selector).val($(that.input_selector).val() +"\n"+ date_time);
					}
				} else {
					insertTextAtCursor(document.getElementById(that.input_selector.replace("#","")), date_time);
				}
				document.getElementById(that.input_selector.replace("#","")).focus();
				button.addClass("note-tokens-disabled");

				setTimeout(function(){
					button.removeClass("note-tokens-disabled");
				}, 1000);

				if (BINOM.__pageType=="add_camp"){
					somethingWasChanged();
				}
			}
			fetchFunc( fetchDateTimeCallBack );
		}
	},

	setHandlers: function(){
		for (var i=0;i<this.list_of_tokens.length;i++){
			$(".note_token_" + this.list_of_tokens[i]["class_postfix"]).on("click", this.makeFunctionWriter(noteWindowTokens[this.list_of_tokens[i]["action"]]));
		}
		var that = this;
		$(this.input_selector).on("click", function(){that.textarea_focused=1});
	},

	list_of_tokens: [
						{"name": "Time" ,   "class_postfix":"time", "action":"getTime"},
						{"name": "Date" ,   "class_postfix":"date", "action":"getDate"},
						{"name":"Datetime", "class_postfix":"Datetime", "action":"getDateTime"}
					],




	parseDate: function( date ){
		return date.getFullYear()+"-"+addZeroToNumber(date.getMonth()+1)+"-"+addZeroToNumber(date.getDate()) + " ";
	},
	parseTime: function( date ){
		return addZeroToNumber(date.getHours())+":"+addZeroToNumber(date.getMinutes()) + " ";
	},
	parseDateTime: function( date ){
		return date.getFullYear()+'-'+addZeroToNumber(date.getMonth()+1)+'-'+addZeroToNumber(date.getDate())+' '+addZeroToNumber(date.getHours() )+':'+addZeroToNumber( date.getMinutes() )+' ';
	},
	getDateFromClient: function(){
		return noteWindowTokens.parseDate( new Date() );
	},
	getTimeFromClient: function(){
		return noteWindowTokens.parseTime( new Date() );
	},
	getDateTimeFromClient: function(){
		return noteWindowTokens.parseDateTime( new Date() );
	},

	getTime: function( callback ){
		var that = this;
		$.ajax({
			url: "",
			type: "post",
			data: {
				ajax: 1,
				type: "get_current_date_time"
			},
			success: function( data ){
				try {
					x = new Date( data );
					x = noteWindowTokens.parseTime( x );
					callback( x );
				} catch (err) {
					callback( noteWindowTokens.getTimeFromClient() );
				}
			},
			error: function(){
				callback( noteWindowTokens.getTimeFromClient() );
			}
		});
	},

	getDate: function( callback ){
		var that = this;
		$.ajax({
			url: "",
			type: "post",
			data: {
				ajax: 1,
				type: "get_current_date_time"
			},
			success: function( data ){
				try {
					x = new Date( data );
					x = noteWindowTokens.parseDate( x );
					callback( x );
				} catch (err) {
					callback( noteWindowTokens.getDateFromClient() );
				}
			},
			error: function(){
				callback( noteWindowTokens.getDateFromClient() );
			}
		});

	},

	getDateTime: function( callback ){
		$.ajax({
			url: "",
			type: "post",
			data: {
				ajax: 1,
				type: "get_current_date_time"
			},
			success: function( data ){
				try {
					callback( data+" " );
				} catch (err) {
					callback( noteWindowTokens.getDateTimeFromClient() );
				}
			},
			error: function(){
				callback( noteWindowTokens.getDateTimeFromClient() );
			}
		});
	},

	makeHtmlBlock: function(){

		return "<div class='note-tokens-wrapper'>"+this.makeListOfTokens()+"</div>";
	},

	makeListOfTokens: function(){
		var html = "";
		for (var i=0;i<this.list_of_tokens.length;i++){
			html += " <span class='note-tokens note_token_"+this.list_of_tokens[i]["class_postfix"]+"' >" + this.list_of_tokens[i]["name"] + " </span> ";
		}
		return html;
	}
}

function replacerMinutes(string, hours, minutes){
	return hours + ':00';
}


function addAllWrapsClickHandler(){
	$("body").on("click", ".wrap", function(){
	var windows = $(".window");
	if ($(this).css("display")!="none" && windows.size()>0){

		// handling closing secondlayer window load_from_templates window
		if ( $(".window-second-layer").length>0 ){
			$(".window-second-layer").find(".win_closebtn").trigger("click");
			return;
		}

		for (var i=0; i<windows.size();i++){
			if (windows.eq(i).css("display")!="none"){
				windows.eq(i).find(".win_closebtn").trigger("click");
			}
		}
	}
	});
}

function create_qr(){
	if(BINOM.__pageType=='landing_page' || BINOM.__pageType=='add_camp'){
		var el_name;
		if($('[name="lp_type"]').val()==1){
			el_name='[name="lp_url"]';
		}else{
			el_name='[name="lp_file"]';
		}

		if($(el_name).val()==''){
			$('#qrcode').html('');
			$('#qrcode').css('display','none');
			$('#qrcode').css('opacity','0');
			$('.qr_ico').remove();
			$('.url-tokens-block').css('margin-top','-15px');
		}else{
			$('#qrcode').html('');
			if(!$("div").is(".qr_ico")){
				if($('[name="lp_type"]').val()==1){
					$('.url-tokens-block').before(function() {
						return '<div class="qr_ico" style="top: -46px;" onmouseover="show_qr(this);" onmouseout="hide_qr()">QR</div>';
					});
					$('.url-tokens-block').css('margin-top','-31px');
				}else{
					$('[name="lp_group"]').before(function() {
						// Height 0 px for do not moving group select
						return '<div class="qr_ico" style="top: -29px;height:0px;" onmouseover="show_qr(this);" onmouseout="hide_qr()">QR</div>';
					});
				}
			}
			$(el_name).css('padding-right','23px');
			try {
				var qr_url;
				if($('[name="lp_type"]').val()==1){
					qr_url=$(el_name).val();
				}else{
					qr_url=$(el_name).val();
				}
				makeCode($(el_name).val());
			}catch(e){
				$('#qrcode').html('');
				$('#qrcode').css('display','none');
				$('#qrcode').css('opacity','0');
				$('.qr_ico').remove();
				$('.url-tokens-block').css('margin-top','-15px');
				$(el_name).css('padding-right','3px');
			}
		}
	}
}

function hide_qr(){
	$('#qrcode').css('display','none');
	$('#qrcode').css('opacity','0');
}

function show_qr(el){
	var pos = $(el).offset();
    var elem_left = pos.left;
    var elem_top = pos.top;
	$('#qrcode').css('left',elem_left-245);
	$('#qrcode').css('top',elem_top+30);
	$('#qrcode').css('display','block');
	$("#qrcode").animate({
		opacity: 1
	},120);
}

$(document).ready(function(){
	var cssFix = function(){
	  var u = navigator.userAgent.toLowerCase(),
	  is = function(t){return (u.indexOf(t)!=-1)};
	  $(".body-container").addClass([
		(is('x11')||is('linux'))?' linux_os'
		  :is('mac')?' mac_os'
		  :is('win')?' win_os':' default_os'
	  ].join(''));
	  $("body").addClass([
		(is('x11')||is('linux'))?' linux_os'
		  :is('mac')?' mac_os'
		  :is('win')?' win_os':' default_os'
	  ].join(''));
	}();

	//Clear windows on click at black wrapper
	addAllWrapsClickHandler();

	setTimeout(function(){
			$(document).trigger("resize")
		}, 50);

});

function safeStringEscape(name){

	var replacer = function(char){
		return "";
	}

	var unsafe_reg = new RegExp("'", "g");
	name = name.replace(unsafe_reg, replacer);
	return name;
}

// @param string - string
// @param length - int  max length
function cutTheString(string, length){

	if ( string.length>length ){
		return string.substr(0, length-3) + "...";
	} else {
		return string;
	}
}

// For calling note window for camp need noteWindow.init(camp_id, "camp", false);
window.noteWindow = {

	/**
	 * @param id - id of land or offers
	 * @param object_type - 'landing' or 'offer'
	 */
	init: function(id, object_type, stars){

		if (typeof stars === "undefined" ){
			stars = true;
		}

		this.stars = stars;

		if (this.window_opened==0){
			if (typeof(id) != "undefined"){
				this.window_opened = 1;
				this.id = id;
				this.object_type = object_type;
				this.row_name = $(".selected_row td.name_td span span").eq(0).text();

				if (this.object_type == "camp" && !this.row_name) {
					this.row_name = $("#logo_text").text().replace("Binom / Stats: ", "");
				}

				// Set ajax_get_type and ajax_save_type to determine
				// What data['type'] will be send
				this.setAjaxTypesAndClassName(object_type);
				// Get text by ajax with id
				// Draw window as callback
				var text = this.getNote(this.id, this.noteWindow());
			} else {
				console.error('noteWindow Error: ID not found');
			}
		}
	},

	clear_note: function(){
		this.id = 0;
		this.object_type = 0;
		this.window_opened = 0;
	},

	//open window flag
	window_opened: 0,

	//id of object
	id: 0,

	//type of object
	object_type: "",


	row_name: "",

	//ajax data type parameter
	ajax_get_type: "",
	ajax_save_type: "",
	row_class_name: "",


	setAjaxTypesAndClassName: function(object_type){

		if (object_type == "landing"){
			this.ajax_get_type = 'get_landing_note';
			this.ajax_save_type = 'save_landing_note';
			this.row_class_name = "land";
		} else if (object_type == 'offer') {
			this.ajax_get_type = 'get_offer_note';
			this.ajax_save_type = 'save_offer_note';
			this.row_class_name = "offer";
		} else if (object_type == "camp"){
			this.ajax_get_type = "node";
			this.ajax_save_type = "node_camp_id";
			this.row_class_name = "campaign";
		}

	},

	getNote: function(id, callback){
		var id_param = "id";

		if (this.object_type=="camp"){
			id_param = "camp_id";
		}

		var data = {'ajax':1, 'type':this.ajax_get_type};
		data[id_param] = id;

		$.ajax({
			type: 'post',
			url: '',
			data: data,
			success: function(data){
				callback(data);
			}
		});
	},


	noteWindow: function(){
		var that = this;
		return function(text){
            closeAnotherWindows();
			$("body").append(noteWindow.getWindowHTML());
			$("#note_window textarea").val(text);
			that.setListeners();
			noteWindowTokens.init("#node_text");
			$(window).trigger('resize');
		}

	},

	setListeners: function(){
		$("#note_window .note-save-button").on("click", this.saveNote());
		$("#note_window .note-close-button").on("click", this.clearWindow());
		$("#note_window .win_closebtn").on("click", this.clearWindow());
	},

	saveNote : function(){
		var that = this;
		return function(){

			var id_param = 'id';

			if (that.object_type=="camp"){
				id_param = "camp_id";
			}

			var text = $("#note_window textarea").val();
			var data = {"ajax":1, "type":that.ajax_save_type, text:text};
			data[id_param] = that.id;

			$.ajax({
				url: "",
				type: "post",
				data: data
			}).success(function(data){

				if (text != ""){
					that.addStarToRow();
				} else {
					that.clearStarFromRow();
				}

				that.clearWindow()();
			});
		}
	},

	clearWindow: function(){
		var that = this;
		return function(){
			that.clear_note();
			$(".wrap.note_window_wrap").remove();
			$("#note_window").remove();
		}
	},

	addStarToRow: function(){

		BINOM.tt.tableData;

		function addStarToRow( row ){
			var el = document.createElement('template');
			el.innerHTML = row;
			var nameSpan = el.content.childNodes[0].getElementsByClassName('name_td')[0].getElementsByTagName('span')[0];
			if ( nameSpan.getElementsByTagName('img').length == 0 ){
				nameSpan.innerHTML += '<img style="margin-left:4px;" width="9px" src="templates/standart/images/green-star.png">';
			}
			return el.innerHTML;
		}
		BINOM.tt.updateRowViaClusterize(this.id, addStarToRow);
		var tableDataIndex = BINOM.tt.tableData.findIndexObjectByProp( 'id', this.id );
		BINOM.tt.tableData[tableDataIndex].is_note = "1";
	},

	clearStarFromRow: function(){
		function removeStarFromRow( row ){
			var el = document.createElement('template');
			el.innerHTML = row;
			el.content.childNodes[0].getElementsByClassName('name_td')[0].getElementsByTagName('span')[0].getElementsByTagName( 'img' )[0].outerHTML = '';
			return el.innerHTML;
		}
		BINOM.tt.updateRowViaClusterize(this.id, removeStarFromRow);
		var tableDataIndex = BINOM.tt.tableData.findIndexObjectByProp( 'id', this.id );
		BINOM.tt.tableData[tableDataIndex].is_note = "0";
	},

	getWindowHTML: function(){
		return  '<div id="wrap" class="wrap note_window_wrap" style="display: block;"></div>\
					<div class="window" id="note_window" style="display: block; width:600px;height:600px;">\
						<a class="win_closebtn"></a>\
						<div class="win_header">\
							<span class="window_head_name" title="'+this.row_name+'">Note:' + cutTheString(this.row_name, 50) + ' </span>\
						</div>\
						<div class="win_cap ">\
						</div>\
						<div class="win_content" >\
							<textarea id="node_text" style="width:100%; height:500px;resize:none;border:1px solid #ccc;"></textarea>\
						</div>\
						<div class="win_footer ">\
							<div class="win-buttons-block">\
								<a class="button win-save-button note-save-button"><img src="templates/standart/images/w-save.png" class="icon save_icon">Save</a>\
								<a class="button win-close-button note-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>\
							</div>\
						</div>\
					</div>';
	},
}



function closeAnotherWindows(){
    var windows = $(".window");

    for (var i = 0; i<windows.size(); i++){

        if (windows.eq(i).css("display") == "block"){
            $(".window .win_closebtn").trigger("click");
        }
    }

}

function makeButtonInProcess(button_selector, text){
	var loader_animation = '<div class="sk-fading-circle">\
				  <div class="sk-circle1 sk-circle"></div>\
				  <div class="sk-circle2 sk-circle"></div>\
				  <div class="sk-circle3 sk-circle"></div>\
				  <div class="sk-circle4 sk-circle"></div>\
				  <div class="sk-circle5 sk-circle"></div>\
				  <div class="sk-circle6 sk-circle"></div>\
				  <div class="sk-circle7 sk-circle"></div>\
				  <div class="sk-circle8 sk-circle"></div>\
				  <div class="sk-circle9 sk-circle"></div>\
				  <div class="sk-circle10 sk-circle"></div>\
				  <div class="sk-circle11 sk-circle"></div>\
				  <div class="sk-circle12 sk-circle"></div>\
				</div>';
		$(button_selector).html("").append(text).append(loader_animation);
}

//this window opened by click on button "Import"
//landings/offers page
var importWindow = {

	//type of import offer/landings
	object_type: "",

	//type of ajax request
	ajax_type: "import_from_textarea",

	//flag of opened window
	window_opened: 0,

	//sending request state
	sending_state: 0,

	init: function(object_type){
		this.window_opened = 1;
		this.setObjectName(object_type);
		this.drawWindow();
		this.setHandlers();
	},

	setObjectName: function(object_type){

		if (object_type=="landing_page"){
			this.object_type = "landing";
		} else if (object_type=="offers"){
			this.object_type = "offer";
		}

	},

	setHandlers: function(){
		$(".import-list-save-button").on("click", this.sendImportList());
		$(".import-list-close-button").on("click", this.closeWindow());
		$("#import_list_window .win_closebtn").on("click", this.closeWindow());
	},

	drawWindow: function(){
        closeAnotherWindows();
		$("body").append(this.getWindowHTML());
	},

	clearProperties: function(){
		importWindow.object_type = "";
		this.window_opened = 0;
	},

	clearWindow: function(){
		$(".wrap.import_list_window_wrap").remove();
		$("#import_list_window").remove();
	},

	disableSaveButton: function(){
		var loader_animation = '<div class="sk-fading-circle">\
				  <div class="sk-circle1 sk-circle"></div>\
				  <div class="sk-circle2 sk-circle"></div>\
				  <div class="sk-circle3 sk-circle"></div>\
				  <div class="sk-circle4 sk-circle"></div>\
				  <div class="sk-circle5 sk-circle"></div>\
				  <div class="sk-circle6 sk-circle"></div>\
				  <div class="sk-circle7 sk-circle"></div>\
				  <div class="sk-circle8 sk-circle"></div>\
				  <div class="sk-circle9 sk-circle"></div>\
				  <div class="sk-circle10 sk-circle"></div>\
				  <div class="sk-circle11 sk-circle"></div>\
				  <div class="sk-circle12 sk-circle"></div>\
				</div>';
		$("#import_list_window .win-save-button").html("").append("Sending").append(loader_animation);
	},

	enableSaveButton: function(){
		$("#import_list_window .win-save-button").html("").append('<img src="templates/standart/images/w-save.png" class="icon save_icon">Import');
	},

	sendImportList: function(){
		var that = this;
		return function(){
			// do nothing if request is sending
			if (that.sending_state==1){
				return;
			}
			that.disableSaveButton();
			that.sending_state = 1;
			$.ajax({
				url: "",
				type: "post",
				data: {"ajax":1, "type":that.ajax_type, "text":$("#import_list_text").val(), "object_type":that.object_type}
			}).done(function(data){
				that.sending_state = 0;
				that.enableSaveButton();
				data = JSON.parse(data);
				if (data["status"] != "error"){
					//alert(data["status"]);
					var alert_window = makeGoodAlertModal("OK", data["status"], {'cross_button_hide' : true ,'footer_ok_callback' : function(){makeButtonLoaded($(".modal_window__ok-button"),"Reloading");window.location.reload()}});
					alert_window.show();
					//window.location.reload();
				} else {
					var alert_window = makeBadAlertModal("OK", changeNewLineOnBr(data["error"]));
					alert_window.show();
					//alert(data["error"]);
				}
			});
		}
	},

	closeWindow: function(){
		var that = this;
		return function(){
			that.clearProperties();
			that.clearWindow();
		}
	},

	getInfoMessage: function(){
		if (this.object_type=="landing"){
			return "<p style='margin-top:0px;font-size:11px;'>Name|URL [|Group|Lang|Offers] &nbsp;&nbsp;&nbsp;  [] - optional</p>";
		} else if(this.object_type == "offer") {
			return "<p style='margin-top:0px;' ><span style='margin-top:0px;font-size:11px;margin-bottom:8px;'>Name|URL|Payout/Auto [|Geo(US,UK etc.)|Group|Aff. network|Upsell(\"Upsell\" or nothing)]\
			<span style='padding-left:15px;font-size:11px;'> [] - optional</span></p>";
		}
	},

	getWindowHTML: function(){
		return '<div id="wrap" class="wrap import_list_window_wrap" style="display: block;"></div>\
			<div  class="window" id="import_list_window" style="display: block; width:600px;height:600px;">\
			<a onclick="notewindow_hide(this);" class="win_closebtn"></a>\
			<div class="win_header">\
				<span class="window_head_name">'+this.object_type.capitalizeFirstLetter()+' import </span>\
			</div>\
			<div class="win_cap ">\
			</div>\
			<div class="win_content" >\
				'+this.getInfoMessage()+'\
				<textarea id="import_list_text" style="width:100%; height:500px;resize:none;border:1px solid #ccc;"></textarea>\
			</div>\
			<div class="win_footer ">\
				<div class="win-buttons-block">\
					<a class="button win-save-button import-list-save-button"><img src="templates/standart/images/w-save.png" class="icon save_icon">Import</a>\
					<a class="button win-close-button import-list-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>\
				</div>\
			</div>\
		</div>'
	},

}

/**
 * makes window totally unavailable and wrap onclickable
 * only way to make this available again is refresh the page
 * @param id {string} id of window that needed to be unavailable with "#"
*/

/**
* id - window selector #add_lp for instance
* options - dict of options
*	  {blocked_button_text:"updating"} for instance
*/
function windowBlocker(id, options){
	this.id = id;
	this.button_text = $(id+ " .win-save-button" ).html().trim();

	options = options || Object.create( null );

	this.blocked_button_text = options.blocked_button_text || '';

	this.block = function(){

		var id = this.id;
		var height_of_content = $(id+" .win_content").height(),
		block = "<div class='loaded_blocker_block'></div>",
		message = "I am updating costs of your clicks now, please, wait",
		loader_animation = '<div class="sk-fading-circle">\
					  <div class="sk-circle1 sk-circle"></div>\
					  <div class="sk-circle2 sk-circle"></div>\
					  <div class="sk-circle3 sk-circle"></div>\
					  <div class="sk-circle4 sk-circle"></div>\
					  <div class="sk-circle5 sk-circle"></div>\
					  <div class="sk-circle6 sk-circle"></div>\
					  <div class="sk-circle7 sk-circle"></div>\
					  <div class="sk-circle8 sk-circle"></div>\
					  <div class="sk-circle9 sk-circle"></div>\
					  <div class="sk-circle10 sk-circle"></div>\
					  <div class="sk-circle11 sk-circle"></div>\
					  <div class="sk-circle12 sk-circle"></div>\
					</div>';

		$(id+" .win-close-button").addClass("button_inactive");

		$("body").off("click", ".wrap");
		$(".wrap").off("click");

		$(id+" .win-save-button").html("").append(this.blocked_button_text).append(loader_animation);

		//$(id).append("<div class='window-wrapper-block'></div>");
		$("body").append("<div class='window-wrapper-block'></div>");
		addAllWrapsClickHandler();
		$(".window-wrapper-block").on("click", function(){

		})
	}
	this.unblock = function(){
		var id = this.id;
		$(".window-wrapper-block").remove();
		$(id+" .win-save-button").html(this.button_text);
		$(id+" .win-close-button").removeClass("button_inactive");
	}

}
// save for old using
function makeWindowLoaded(id){
	var height_of_content = $(id+" .win_content").height(),
	block = "<div class='loaded_blocker_block'></div>",
	message = "I am updating costs of your clicks now, please, wait",
	loader_animation = '<div class="sk-fading-circle">\
				  <div class="sk-circle1 sk-circle"></div>\
				  <div class="sk-circle2 sk-circle"></div>\
				  <div class="sk-circle3 sk-circle"></div>\
				  <div class="sk-circle4 sk-circle"></div>\
				  <div class="sk-circle5 sk-circle"></div>\
				  <div class="sk-circle6 sk-circle"></div>\
				  <div class="sk-circle7 sk-circle"></div>\
				  <div class="sk-circle8 sk-circle"></div>\
				  <div class="sk-circle9 sk-circle"></div>\
				  <div class="sk-circle10 sk-circle"></div>\
				  <div class="sk-circle11 sk-circle"></div>\
				  <div class="sk-circle12 sk-circle"></div>\
				</div>';

	$(id+" .win_closebtn").unbind();
	$(id+" .win_closebtn").attr("onclick", "");

	$(id+" .win-save-button").attr("onclick", "");
	$(id+" .win-save-button").unbind("click");

	$(id+" .win-close-button").attr("onclick", "");
	$(id+" .win-close-button").unbind("click");
	$(id+" .win-close-button").addClass("button_inactive");

	$("body").off("click", ".wrap");


	$(id+" .win-save-button").html("").append("Updating").append(loader_animation);

	$(id+ " .win_content").append("<div class='window-wrapper-block'></div>");

	// Now i do not need any choice for this message but...
	/* $(id+" .win_content").html(
		$(block).append("<h1 style='color:pink;font-style:italic'>"+message+"</h1>").append(loader_animation).css("height", height_of_content)
		); */
}


/**
* Same but for modal windows
* new function coz different css selectors
* for buttons and blocks
* @param id {string} css id selector
* @param text {string} text for button
*/
function makeModalWindowLoaded(id, text){
	var height_of_content = $(id+" .win_content").height(),
	block = "<div class='loaded_blocker_block'></div>",
	message = "I am updating costs of your clicks now, please, wait",
	loader_animation = '<div class="sk-fading-circle" style="margin-left:7px">\
				  <div class="sk-circle1 sk-circle"></div>\
				  <div class="sk-circle2 sk-circle"></div>\
				  <div class="sk-circle3 sk-circle"></div>\
				  <div class="sk-circle4 sk-circle"></div>\
				  <div class="sk-circle5 sk-circle"></div>\
				  <div class="sk-circle6 sk-circle"></div>\
				  <div class="sk-circle7 sk-circle"></div>\
				  <div class="sk-circle8 sk-circle"></div>\
				  <div class="sk-circle9 sk-circle"></div>\
				  <div class="sk-circle10 sk-circle"></div>\
				  <div class="sk-circle11 sk-circle"></div>\
				  <div class="sk-circle12 sk-circle"></div>\
				</div>';

	$(id+" .win_closebtn").unbind();
	$(id+" .win_closebtn").attr("onclick", "");
	$("body").off("click", id+" .win_closebtn");


	$(id+" .button").attr("onclick", "");
	$(id+" .button").unbind("click");

	/*$(id+" .win-close-button").attr("onclick", "");
	$(id+" .win-close-button").unbind("click");*/
	$(id+" .win-close-button").addClass("button_inactive");

	$("body").off("click", ".wrap");

	var animated_button;
	if ($(id+" .modal_window__ok-button").length>0){
		animated_button = $(id+" .modal_window__ok-button");
	} else {
		animated_button = $(id+" .modal_window__close-button");
	}

	animated_button.html("").append(text).append(loader_animation);

	//$(id+ " .win_content").append("<div class='window-wrapper-block'></div>");
}

/**
 * "Object" type is was choosed coz need to handle onclick anywhere
 * @param button_obj {jQUery obj} id of window that needed to be unavailable with "#"
*/
function makeButtonLoaded(button_obj, text) {
	var loader_animation = '<div class="sk-fading-circle">\
				  <div class="sk-circle1 sk-circle"></div>\
				  <div class="sk-circle2 sk-circle"></div>\
				  <div class="sk-circle3 sk-circle"></div>\
				  <div class="sk-circle4 sk-circle"></div>\
				  <div class="sk-circle5 sk-circle"></div>\
				  <div class="sk-circle6 sk-circle"></div>\
				  <div class="sk-circle7 sk-circle"></div>\
				  <div class="sk-circle8 sk-circle"></div>\
				  <div class="sk-circle9 sk-circle"></div>\
				  <div class="sk-circle10 sk-circle"></div>\
				  <div class="sk-circle11 sk-circle"></div>\
				  <div class="sk-circle12 sk-circle"></div>\
				</div>';
	$(button_obj).html("").append(text).append(loader_animation);
}

function rightblock() {
	if ($(".filter_block_stats").length > 0){
	    if ($(".filter_block_stats").offset().top>80) {
	    	$(".filter_block")
	    		.css("float","left")
	    		.css("marginLeft","-2px")
	    		.css("marginTop","5px");
	    } else {
	    	$(".filter_block")
	    		.css("float","right")
	    		.css("marginTop","3px");
	    }
	}
}

/*
####################
#     KEYBOARD     #
####################
*/
function getKeyCode(e){
	return (e.keyCode ? e.keyCode : e.which);
}
// Function that add keyboards handlers on all pages
function addKeyboardHandlers() {

	var ctrl_pressed=false, // flag that true if ctrl was keydowned and false if was keyupped (it seems closure)
		// it seems closure
		ctrlPressHandlerExist=false; // is ctrlHandler added?

	function checkPage(){
		if (typeof BINOM.__pageType != "undefined"){
			return true;
		}
		return false;
	}



	if (!checkPage()){

		return false;
	}

	var states = {};

	function setModalBlocker(){
		$(document).keydown(function(e){
			var e = e || window.event;
			if ($(".modal_window").length>0){
				var key_code = getKeyCode(e);
				if (key_code!=13 && key_code!=27){
					e.stopImmediatePropagation();
				}
			}
		});
	}

	setModalBlocker();

	function initStates(){
		// 1 is open 0 is close
		states["stat_tab"] = localStorage.typeStatState;
	}

	function addEnterHandlers(){
		var edit_action = ['landing_page', 'offers', "affiliate_networks", "traffic_sources", "users", "rotations"],
			apply_action_formats = ['stats', 'conversions', "report", 'clicklog'];

		$(document).on("keydown", function(e){
			var e = e || window.event;
			if ($(".modal_window").length>0 && getKeyCode(e) == 13){
				if ( $(".modal_window__ok-button")[0]){
					$(".modal_window__ok-button")[0].click();
				} else if ($(".modal_window__cancel-button")[0]){
					$(".modal_window__cancel-button")[0].click();
				}
				e.stopImmediatePropagation();
			}

		});



		$(document).keydown(function(e){
			var e = e || window.event;
			var openedWindow  = findOpenedWindow();
			if ( openedWindow && !isAnyInputFocus() ){
				if (getKeyCode(e) == 13){
					saveWindowAction( e, false );
					e.stopImmediatePropagation();
				}
			}

		});

		if (apply_action_formats.indexOf(BINOM.__pageType) != -1){

			$(document).on("keydown", function(e) {

				if (BINOM.__pageType=="stats" && $("#upd_costs").css("display")=="block"){
					if (getKeyCode(e) == 13){
						$("#upd_costs").find(".win-save-button")[0].click();
					}
				} else {
	                if (isAnyInputFocus()){
		                if ($("input:focus").hasClass("search_in_report") || $("input:focus").hasClass("search")){
	                    } else if ($("#upd_costs").css("display") == "block") {

	                    } else {
	                    	return;
	                    }
                	}
                }
				// Check: is apply button active?
				if (getKeyCode(e) == 13){
					if ($("#upd_costs").css("display") == "block") {

						$(".win-save-button").trigger( "click" );
						return;
                    }

					if ($("#refresh-btn").hasClass("green-button")){
						event.preventDefault();
						$("#refresh-btn").trigger("click");
					}
				}

			});
		}
	}

	function addShiftHandlers(){
		var list_of_type_pages = ['offers', 'landing_page', 'campaigns']
	}

	// @row_active {jQuery object}
	function getNextActionRow(row_active, direction){
		var next_row;
		if (direction=="up"){
			next_row = row_active.prev();
		} else if (direction=="down") {
			next_row = row_active.next();
		}
		if (next_row.length==0){
			return next_row;
		}
		while(next_row.css("display")=="none"){
			if (direction == "up"){
				next_row = next_row.prev();
			} else if (direction == "down") {
				next_row = next_row.next();
			}
		}
		return next_row;
	}
	// DELETE
	// @direction :string up or down
	function arrowForRowsHandlersAction(direction, event){
		var row = $(".tr_active"),
			row_action;
			row_action = getNextActionRow(row, direction);

		if (row.length>0){

			if (row_action.length>0 && row_action.css("display") != 0){
				row.trigger("click");
				row_action.trigger("click");
			} else if (row_action.length==0){
				row.trigger("click");
				// If derection is "up" take last element
				if (direction == "up"){
					$(".table_stat_tr").eq($(".table_stat_tr").length-1).trigger("click");
					$(".body-container").scrollTop($(".table_stat")[0].offsetHeight);
				} else if (direction == "down") {
					$(".table_stat_tr").eq(0).trigger("click");
					$(".body-container").scrollTop(0);
				}

			}
		} else {
			var new_active = $(".table_stat_tr").eq(0);

			while (new_active.css("display") == "none"){
				new_active == new_active.next();
				if (new_active.length == 0){
					break;
				}
			}
			new_active.trigger("click");
		}

		var row_pos = ($(".tr_active")[0].offsetTop+20),
			table_pos =  ($(".body-container").height()  + $(".body-container").scrollTop());
		if (row_pos>table_pos ){
			// +1 in line below is border height
			var scroll_top = $(".body-container").scrollTop() + $(".tr_active").height() + 1;
			//finish_scroll_top = $(".tr_active")[0].offsetTop + $(".tr_active").height());

			$(".body-container").scrollTop(scroll_top);
		}

		if ($(".tr_active")[0].offsetTop < $(".body-container").scrollTop()){
			// -1 in line below  is border height
			var scroll_top = $(".body-container").scrollTop() - $(".tr_active").height();

			$(".body-container").scrollTop(scroll_top -1);
		}
	}

	function addEscapeHandler(){

		$(document).on("keydown", function(e){
			var e = e || window.event, closed;
			if ($(".modal_window").length>0 && getKeyCode(e) == 27){
				var closed = false;
				// Try to click on cancel button
				if ($(".modal_window__cancel-button").length>0){
					$(".modal_window__cancel-button")[0].click();
					closed=true;
				}


				// Try to click on win_close button
				if ($(".modal_window .win_closebtn").length>0 && !closed){
					$(".modal_window__cancel-button")[0].click();
					closed=true;
				}

				// Try to click on ok button
				if ($(".modal_window__ok-button").length>0 && !closed){
					$(".modal_window__ok-button")[0].click();
					closed=true;
				}

				e.stopImmediatePropagation();
			}

		});

		var listOfAvailableTypes = ["add_camp", "add_rotation", "conversions", "users", "report", "settings", "add_user"];

		if ( window.__pageFormat == "statistic" || listOfAvailableTypes.indexOf(BINOM.__pageType) != -1){
			//Esc
			$(document).keydown(function(e){
				if (getKeyCode(e) == 27){
					$(".wrap").each(function(i, elem){
						if ($(elem).css("display")!=="none"){
							$(elem).trigger("click");
						}
					});
				}
			});
		}
	}

	// Change variable ctrlpressed defined above
	function addCtrlPressHandler(){

		$(document).on("keydown", function(e){
			// set ctrl press flag true
			if (getKeyCode(e) == 17){
				ctrl_pressed = true;
				setTimeout(function(){
					ctrl_pressed = false;
				}, 750)
			}
		});

		$(document).on("keyup", function(e){
			// set ctrl press flag false
			if (getKeyCode(e) == 17){
				ctrl_pressed = false;
			}
		});
		ctrlPressHandlerExist = true;
	}

	function addCtrlEHandler(){
		if (BINOM.__pageType=="campaigns" || BINOM.__pageType=="report"){
			if (!ctrlPressHandlerExist){
				addCtrlPressHandler();
			}

			$(document).on("keydown", function(e){


				if (isAnyInputFocus()){
					return;
				}
				var e = e || window.event;

					if (ctrl_pressed && getKeyCode(e)==69 ){
						if (BINOM.__pageType=="campaigns" && $(".tr_active").length==1){
							e.preventDefault();
							$("#edit")[0].click();
						} else if (BINOM.__pageType=="report") {
							e.preventDefault();
							$("#edit")[0].click();
						}

					}

			});
		}
	}

	function saveWindowAction(e, ctrl){
		if (window.BNM_DISABLE_SHORTCUTS == "1") return;

		if ( typeof ctrl == "undefined"){
			ctrl = true;
		}

		if (ctrl && !ctrl_pressed){
			return false;
		}

		if( !ctrl || ( ctrl && ctrl_pressed ) ){
			// find opened window
			$(".window").reverse().each(function(i, item){
				if ( $(item).parent().attr('id')=='note_window' ) return;
				if ($(item).css("display")!="none"){
					e.preventDefault();
					//trigger click on save button in window block
					var button = $(item).find(".win-save-button");
					if ( button.length == 0 ){
						button = $(item).find(".ok_button");
						if (button.length == 0){
							button = $(item).find(".modal-footer-button-ok");
						}
					}
					button.trigger("click");
					return false;
				}

			});

		}
	}

	function addCtrlSHandler(){

		var list_of_page_format_save=["offers", "landing_page", "affiliate_networks", "traffic_sources", "conversions", "users", "campaigns", "stats"];
		if (list_of_page_format_save.indexOf(BINOM.__pageType) != -1 || window.__pageFormat == "add_camp" || window.__pageFormat == "add_rotation"){

			if (!ctrlPressHandlerExist){
				addCtrlPressHandler();
			}

		}

		//For tracker-windows
		if (list_of_page_format_save.indexOf(BINOM.__pageType) != -1){

			$(document).on("keydown", function(e){
				var e = e || window.event;
				// S handler
				if (getKeyCode(e) == 83){
					saveWindowAction(e);
				}

			});
		}  else if (window.__pageFormat == "add_camp" || window.__pageFormat == "add_rotation") {

			$(document).on("keydown", function(e){
				if (window.BNM_DISABLE_SHORTCUTS == "1") return;

				var e = e || window.event;
				// S handler
				if (getKeyCode(e) == 83){

					if (ctrl_pressed){
						e.preventDefault();
						if (findOpenedWindow() != false){
							saveWindowAction(e);
						} else {
							if (window.__pageFormat == "add_camp"){
								$(".main_save_button_add_camp").trigger("click");
							} else if (window.__pageFormat == "add_rotation") {
								$(".main_save_button_add_rotation").trigger("click");
							}
						}
					}
				}

			});
		}
	}

	function addCtrlRHandler(){
		if (window.BNM_DISABLE_SHORTCUTS == "1") return;

		if ( window.__pageFormat == "add_camp"){

			if (!ctrlPressHandlerExist){
				addCtrlPressHandler();
			}

			$(document).on("keydown", function(e){

				var e = e || window.event;
				if (getKeyCode(e) == 82 && ctrl_pressed){
					e.preventDefault();
					$(".add_camp_statistic_button")[0].click();
				}

			});

		}

	}

	// Move between tabs - Camps, Lands and etc
	function addNumbersHandlers(){
		if (window.BNM_DISABLE_SHORTCUTS == '1') return;

		$(document).on("keydown", function(e){
			var e = e || window.event,
				keyCode = getKeyCode(e);

			if (isAnyInputFocus()){
				return;
			}
			if ( BINOM.keyPressed.ctrl  ) return;

			if (anyModalWindowOpened()) return;

			if (keyCode >= 48 && keyCode <= 58){

				if (BINOM._localStorageIsActive){
					try{
						const hotkeysDisabled = localStorage.getItem('disableNumTabsHotkey');
						if  ( hotkeysDisabled==1 ){
							return;
						}
					} catch(e){
						console.error('While check num tab hotkey available');
						console.error(e);
					}

				}

				switch (keyCode){
					case 49:
						$(".menu_campaigns")[0].click();
					break;
					case 50:
						$(".menu_landing_pages")[0].click();
					break;
					case 51:
						$(".menu_offers")[0].click();
					break;
					case 52:
						$(".menu_rotations")[0].click();
					break;
					case 53:
						$(".menu_networks")[0].click();
					break;
					case 54:
						$(".menu_traffic_sources")[0].click();
					break;
					case 55:
						$(".menu_trends")[0].click();
					break;
					case 56:
						$(".menu_conversions")[0].click();
					break;
					case 57:
						$(".menu_clicklog")[0].click();
					break;
					case 48:
						$(".menu_users")[0].click();
					break;
				}
			}
		});
	}

	function isAnyInputFocus(){
		const { tagName } = document.activeElement;
		if ( $(':focus').length>0 || tagName==='INPUT' || tagName==='TEXTAREA' ){ // TODO заменить на activeEleemtn и проверить
			return true;
		} else {
			return false;
		}
	}

	function anyModalWindowOpened(){
		var modalWindows = document.querySelectorAll('.modal-window, .window');

		var someWindowOpened = [].some.call(modalWindows, win=>{
			return win.offsetHeight>0;
		});

		return someWindowOpened;
	}


	(function(){
		initStates();
		// addArrowForTabsHandlers();
		addEnterHandlers();
		// addArrowForRowsHandlers();
		addEscapeHandler();
		addShiftHandlers();
		addCtrlSHandler();
		addCtrlRHandler();
		addNumbersHandlers();
		addCtrlEHandler();

	})();
}
/*
####################
####################
*/

function openStatTab(){
	if (checkLocalStorageActive()){
        localStorage.setItem('typeStatState',1);
    }
	$("#info_button").html("<img src=\"templates/standart/images/w-table.png\" class=\"icon stats_icon\"><span>Stat</span>");

	if ( BINOM.tt ){
		BINOM.tt.openTab();
	}

}

function closeStatTab(){
	if (checkLocalStorageActive()){
	   localStorage.setItem('typeStatState',0);
    }
	$("#info_button").html("<img src=\"templates/standart/images/w-note.png\" class=\"icon info_icon\"><span>Info</span>");

	if ( BINOM.tt ){
		BINOM.tt.closeTab();
	}
}

function onReadyToggleTabState(tab_state){
	return;
	if (tab_state==1){
		openStatTab();
	} else {
		closeStatTab();
	}
}

function toggleTabState(){
	if ( BINOM.tt && BINOM.tt.isFetchingData ) return;

	if ( BINOM.tt ){
		if ( BINOM.tt.tableOptions.tabOpen ){
			closeStatTab();
			if ( window.vmStore ){
				window.vmStore.commit(`TT/SET_TAB_STATE`, false);
			}
		} else {
			openStatTab();
			if ( window.vmStore ){
				window.vmStore.commit(`TT/SET_TAB_STATE`, true);
			}
		}
	}
	return;
}

// Check: can i use localstorage?
function checkLocalStorageActive(){
    if (typeof localStorage === 'object') {
        try {
            localStorage.setItem('localStorage', 1);
            localStorage.removeItem('localStorage');
            return  true;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}

$(document).ready(rightblock);

$(document).ready(addKeyboardHandlers);

function makeFilterBlockRefreshButtonApply(){
	$("#refresh-btn").removeClass("blue-button").addClass("green-button");
	$("#refresh-btn").html("<img src=\'templates/standart/images/w-ok.png\' class=\'icon\' style=\'position: relative; top: 1px;\'>Apply");
}

function makeFilterBlockApplyButtonRefresh(){
	$("#refresh-btn").removeClass("green-button").addClass("blue-button");
	$("#refresh-btn").html("<img src='templates/standart/images/w-refresh.png' class='icon'>Refresh");
}

// Changing select in stats (act-form) submit form
function setActFormOnChangeSelect(){
	const listOfPage = [
		'campaigns',
		'landing_page',
		'offers',
		'traffic_sources',
		'affiliate_networks',
		'rotations',
		'trends',
		'clicklog',
		'users'
	];

	const actionOnChangeFilterSelect = ( select )=>{
		const $select = $(select);
		const value = $select.val();
		const name = $select.attr( "name" );

		// Ничего не делать.
		// date GET потом подцепится при принятии в календаре
		if ( (name=="date" || name=="date_trends") && (value==10 || value==12) ) {
			makeFilterBlockRefreshButtonApply();
		} else {
			makeFilterBlockApplyButtonRefresh();
			submitForm(); // From helper.php for most pages		// clicklog and trends have submitForm of itself
		}

	}

	if ( listOfPage.indexOf( BINOM.__page )!=-1 ){
		$('#act-form select').on('change', function(e){
			const select = e.target;

			if ( BINOM.__page=="trends" ){
				if ( select.getAttribute('name')!='date_gradation' && select.getAttribute('name')!='date_trends' ){
					// $('#act-form').submit();
					actionOnChangeFilterSelect( select );
				}
			} else {
				actionOnChangeFilterSelect( select );
			}

		})

		if ( URLUtils.historyIsActive ){
			var GETS = URLUtils.getGETParamsAsObject();
			const state = {
				statFilterChange: true,
				page: GETS.page
			}

			history.replaceState(state, '', window.location.href);

		}

	}

}

$(document).ready(function(){
	setActFormOnChangeSelect();
})

$(window).resize(rightblock);

function hideTablePreload(){
	$(".body-container").height(window.innerHeight-$(".body-container").offset().top-45);
	$(".body-container table").css("display", "none");

	$(".body-container").append('<div class="table-load">\
		<div class="sk-fading-circle sk-fading-circle-black">\
			  <div class="sk-circle1 sk-circle"></div>\
			  <div class="sk-circle2 sk-circle"></div>\
			  <div class="sk-circle3 sk-circle"></div>\
			  <div class="sk-circle4 sk-circle"></div>\
			  <div class="sk-circle5 sk-circle"></div>\
			  <div class="sk-circle6 sk-circle"></div>\
			  <div class="sk-circle7 sk-circle"></div>\
			  <div class="sk-circle8 sk-circle"></div>\
			  <div class="sk-circle9 sk-circle"></div>\
			  <div class="sk-circle10 sk-circle"></div>\
			  <div class="sk-circle11 sk-circle"></div>\
			  <div class="sk-circle12 sk-circle"></div>\
			</div>\
		</div>');

	$(".table-load").css("width", "100%").css("height", "100%");
	$(".table-load .sk-fading-circle").css({
		width: "60px",
    	height: "60px",
    	top: "calc(50% - 30px)",
    	left: "calc(50% - 30px)",
    	position: "absolute"
	});
}
function showTablePostLoad(){
	//Ð£Ð±Ñ€Ð°Ñ‚ÑŒ Ð¸ÐºÐ¾Ð½ÐºÑƒ
	$(".table-load").remove();
	$(".body-container table").css("display", "table");
}

function makeCode (url) {
	var qrcode = new QRCode(document.getElementById("qrcode"), {width : 250,height : 250});
	qrcode.makeCode(url);
}

/* Find and return opened window
 * return {JQUERY OBJECT}
*/
function findOpenedWindow(){
	var window_blocks = $(".window");
	for (var i=window_blocks.length-1; i>=0; i--) {
		if (window_blocks[i].offsetHeight!=0){
			return window_blocks.eq(i);
		}
	}
	return false;
}

// USELESS (?)
var addCheckButtonToURL = {
	//Jquery obj
	block : $("<div>Test</div>").addClass("check_url_button"),
	url_selector : "",
	/*
	 * @param {string} selector for input with needed URL
	 */
	init: function(url_selector, relative){
		var url_input_block;

		if (typeof relative=="undefined"){ relative=false; }
		$(".check_url_button").remove();
		$(url_selector).off("keyup", this.checkInputFunction);
		this.url_selector = url_selector;
		this.relative = relative;
		url_input_block = $(url_selector);

		this.relative = relative;

		this.block.removeClass("check_url_button_inactive");
		this.block.removeClass("check_url_button_active");


		if ($(url_selector).val().length>0){
			this.block.addClass("check_url_button_active");
		} else {
			this.block.addClass("check_url_button_inactive");
		}

		url_input_block.after(this.block);
		this.setHandlers();
	},

	setHandlers: function(){
		$(".check_url_button").on("click", this.makeCheckFunction(this));
		$(this.url_selector).on("keyup change", this.checkInputFunction);
	},

	makeCheckFunction: function(that){
		var that = that;
		return function (){

			var url = $(that.url_selector).val().trim(),
			edited_url,
			win;
			if (url != ""){
				try{
					edited_url = that.editforCorrectURL(url);
					if(edited_url.indexOf("{lp_key}")>-1){
						$.ajax({
							"url":"",
							"type":"get",
							"async": false,
							"data":{"ajax":1, "type":"lp_key"}
						}).success(function(data){
							edited_url=edited_url.replace('{lp_key}', data);
							if (this.relative){
								win = window.open(edited_url, '_blank');
							} else {
								win = window.open(edited_url, '_blank');
							}
							win.focus();
						});
					}else{
						win = window.open(edited_url, '_blank')
						win.focus();
					}

			  	} catch (e) {
			  		//alert("Cant check this URL.");
			  		var alert_window = makeBadAlertModal("Close", "Cant check this URL.");
			  		alert_window.show();
			  	}
	  		}
	  	}
	},

	editforCorrectURL: function(url){
		if (!this.relative && url.indexOf("http://")!=0 && url.indexOf("https://")!=0){
			return "http://" + url;
		} else {
			return url;
		}
	},

	checkInputFunction: function(that){
		if ($(this).val().length == 0){
			$(".check_url_button").removeClass("check_url_button_active").addClass("check_url_button_inactive");
		} else {
			$(".check_url_button").removeClass("check_url_button_inactive").addClass("check_url_button_active");
		}
	}

}

/*
###################
#  MODAL WINDOWS  #
###################
*/

// header, footer, styles is not necesserily arguments
// styles is object with width, height params and other
// footer OK/SAVE button necessarily must have modal_window__ok-button class
// 	for correct listener adding
// footer Cancel/Close button necessarily must have modal_window__cancel-button class
//  for the same reason (btw auto hanging close action)
/**
 * z-index of this window 10000
 * where can be given html_code can be given jobj same way maybe (! it didnt test)
 *
 * @param header_text {string} title of window
 * @param content {string} html code of window content
 * @param footer {string} html code
 * @param options {object}
 *		@param footer_ok_callback {function} callback on click action on save/ok button
 *		@param css_class {string} string of window css class. This option can be given as
 *			   multiple classes separated by whitespaces
 * 		@param styles {object} object with css styles width, height, min-height
 * 		@param wrap {bool} Will draw black wrapp layer under window?
 *		@param cross_button_hide {boolean} Is cross button in top right hidden?
 * 		@param closing_ok_wrap {boolean} Closing window after "ok" action is true
 *		@param overflow_another_modal {boolean} If true then do not show when
 *				any modal already showed and didnt close
 */
var Modal = function(header_text, content, footer, options){

	this.header_text = header_text;
	this.content = content;

	this.footer = footer;

	this.css_class = options["css_class"];

	this.css_id = "modal"+($(".modal_window").length+1);

	this.getSelector = function(css_class){
		var classes = css_class.trim().split(" "),
			selector = "";
		if (classes.length>1){
			selector = classes.join(".");
		} else {
			selector = classes[0];
		}
		return "." + selector;
	};

	this.css_selector = this.getSelector(this.css_class);

	this.styles 				= options["styles"];
	this.wrap 					= options["wrap"];
	this.footer_ok_callback 	= options["footer_ok_callback"];
	this.footer_cancel_callback = options["footer_cancel_callback"];
	this.cross_button_hide 		= options["cross_button_hide"];
	this.closing_ok_wrap 		= options["closing_ok_wrap"];
	this.hide_if_overflow 		= options["hide_if_overflow"];

	this.show = function(){
		if (this.hide_if_overflow && $(".modal_window").length>0){
			return;
		}
		if (this.wrap==true){
			this.showWrapper();
		}
		var window_jobj = this.makeWindow();
		// Check is any handler is string which means one of inner embedded methods
		// for instance "close"
		// If so is, redefined callbacks for neede methods
		// !CAREFULLY THIS FUNCTION CAN REDEFINE
		// SOME object's PARAMETERS (this.footer_cancel_callback, this.cross_button_hide)
		this.checkHandlersInnerMethods();

		$("body").append(window_jobj);
		this.addHandlers();
	};



	this.makeWindow = function(){
		// If footer was not taken get default
		var footer = (this.footer==undefined?"":this.getFooterHTML);

		var window_jobj = $("<div></div>").addClass("modal_window")
							.addClass(this.css_class)
							.attr("id", this.css_id)
							.css("z-index", this.getZindex())
							.append(this.getHeaderHTML())
							.append(this.getContentHTML(this.content))
							.append(this.getFooterHTML());

		for ( var st in this.styles ){
			if ( this.styles.hasOwnProperty(st) ){
				try {
					window_jobj.css(st, this.styles[st]);
				} catch(e){
					console.error( '#Modal style error#' );
					console.error( e );
				}
			}
		}

		return window_jobj;
	};

	this.showWrapper = function(){
		if ( $(".modal_wrap").length>1){
			$(".modal_wrap").eq(0).css("opacity", 0.4);
		}
		$("body").append(this.getWrapHTML());
	};

	this.getWrapHTML = function(){
		return "<div class='modal_wrap "+this.css_class.trim()+"_wrap' style='opacity:"+this.getWrapOpacity()+";z-index:"+this.getZindex()+"' ></div>";
	};

	this.getContentHTML = function(content){
		return "<div class='modal_window_content'>"+content+"</div>";
	};

	this.getHeaderHTML = function(){
		var additional_class = (this.header_text==""?"modal_window__header--empty_text":""),
		cross_btn = (this.cross_button_hide?"":"<a class='win_closebtn'></a>"),
		header_html = "<div class='modal_window__header " + additional_class + "'><h1>"+this.header_text+"</h1>"+cross_btn+"</div>";

		return header_html;
	};

	this.getFooterHTML = function(){
		var footer_html = "<div class='modal_window__footer'>"+this.footer+"</div>";
		return footer_html;
	};

	this.getZindex = function(){
		var count_of_windows = $(".modal_window").length;
		return 10000+count_of_windows;
	};

	this.getWrapOpacity = function(){
		var count_of_wraps = $(".modal_wrap").length+1;
		return 0.8/count_of_wraps;
	};

	var _this = this;
	/**
	* @param css_selector {string} selector to taking window
	*/
	this.removeWindow = function(css_selector){
		if (typeof css_selector == "undefined"){
			css_selector = this.css_selector;
		}
		$(".modal_window"+css_selector).remove();
		$(".modal_wrap"+css_selector+"_wrap").remove();

		// Clear Handlers
		$("body").off("click", ".modal_window"+_this.css_selector+" .modal_window__ok-button");
		$("body").off("click", ".modal_window"+_this.css_selector+" .modal_window__cancel-button", _this.footer_cancel_callback);

	};

	this.close = function(){
		// WTF
		this.removeWindow.call(this.removeWindow, this.css_selector);
		$("body").off("click", ".modal_window"+this.css_selector+" .win_closebtn");
	},

	this.makeRemoveWindowhandler = function(){
		var that = this;
		return function(){
			that.removeWindow.call(this.removeWindow, that.css_selector);
			$("body").off("click", ".modal_window"+that.css_selector+" .win_closebtn");
		};
	};

	this.checkHandlersInnerMethods = function (){

		if (this.footer_ok_callback == "close"){
			this.footer_ok_callback = this.makeRemoveWindowhandler();
		}

	};

	this.makeClosingWrappedCallback = function(func){
		var that = this;
		return function(){
			func();
			that.removeWindow(that.css_selector);
		}
	};


	this.clearOKHandler = function(){
		$(".modal_window"+this.css_selector+" .modal_window__ok-button").off("click");
	};

	// TODO Переписать навешивание хендлеров - после отрисовка окна, без глобальных хендлеров с ожиданием
	this.addHandlers = function(){

		var ok_callback;
		$(".modal_window" + this.css_selector + " .win_closebtn").on("click", this.makeRemoveWindowhandler());

		$(".modal_window" + this.css_selector + " .modal_window__cancel-button").on("click", this.makeRemoveWindowhandler());

		if ( this.footer_ok_callback != undefined ){

			if (this.closing_ok_wrap){
				ok_callback = this.makeClosingWrappedCallback(this.footer_ok_callback);
			} else {
				ok_callback = this.footer_ok_callback;
			}
			$(".modal_window"+this.css_selector+" .modal_window__ok-button").on("click", ok_callback);
		}
		if (this.footer_cancel_callback != undefined){
			$(".modal_window"+this.css_selector+" .modal_window__cancel-button").on("click", this.footer_cancel_callback);
		}

	}

};

// Function that make classic confirm modal window
/**
* @param text_ok {string} text of ok button
* @param text_cancel {string} text of cancel button
* @param ok_callback {function} callback on OK/SAVE action
* @param header_text {string} text of header of modal window
* @param content_text {string} content text
* @return {Modal Object}
*/
var makeConfirmModal = function(text_ok, text_cancel, ok_callback, header_text, content_text, additional_options){
	//var content = content_text,
	var css_class = "";

	if (typeof additional_options !== "undefined"){
		if (additional_options.css_class){
			css_class = additional_options.css_class;
		}
	}

	var footer = '<div class="modal_window__buttons-block">\
			 <a class="button modal_window__ok-button" ><img src="templates/standart/images/w-ok.png" class="icon save_icon">'+text_ok+'</a>\
			 <a class="button  modal_window__cancel-button" ><img src="templates/standart/images/w-close.png" class="icon close_icon">'+text_cancel+'</a>\
			</div>',
	options = {"css_class":"modal_window--confirm" + css_class, "styles":{"width":"440px", "height":"auto", "min-height":"50px", "overflow":"hidden"}, "wrap":true, "footer_ok_callback":ok_callback};

	if (typeof additional_options != "undefined"){
		$.extend(options, additional_options);
	}
	var modal_window = new Modal(header_text, content_text, footer, options);

	return modal_window;
}

/**
* Make alert for errors and other bad messages
* @param text_cancel {string} text alert single button
* @param content_text {string} text of alert
* @param additional_options {object} options for modal
* @return {Modal Object}
*/
var makeBadAlertModal = function(text_cancel, content_text, additional_options){
	if (typeof additional_options == "undefined") {
		additional_options = {};
	}
	//var content = content_text,
	var footer = '<div class="modal_window__buttons-block">\
			 <a class="button modal_window__cancel-button" ><img src="templates/standart/images/w-close.png" class="icon close_icon">'+text_cancel+'</a>\
			</div>',
        wrap_showing = (additional_options.wrap?additional_options.wrap:true);
	var options = {"css_class":"modal_window--alert modal_window--bad-alert", "styles":{"width":"440px", "height":"auto", "min-height":"50px", "overflow":"hidden"}, "wrap":wrap_showing};
	if (typeof additional_options != "undefined"){
		$.extend(options, additional_options);
	}
	var modal_window = new Modal("", content_text, footer, options);
	return modal_window;
}

/**
 * Make alert for success and other good messages
 * @param text_cancel {string} text alert single button
 * @param content_text {string} text of alert
 * @param additional_options {object} options for modal
 * @return {Modal Object}
 */
var makeGoodAlertModal = function(text_ok, content_text, additional_options){

	var footer = '<div class="modal_window__buttons-block">\
			 <a class="button modal_window__ok-button" ><img src="templates/standart/images/w-ok.png" class="icon close_icon">'+text_ok+'</a>\
			</div>',

	options = {
		"css_class":"modal_window--alert modal_window--good-alert",
		"styles":{"width":"440px", "height":"auto", "min-height":"50px", "overflow":"hidden"},
		"wrap":true
	};

	if (typeof additional_options != "undefined"){
		$.extend(options, additional_options);
	}

	var modal_window = new Modal("", content_text, footer, options);
	return modal_window;
}

/**
* Make alert that cant be closed
* if that modal was showed you can just wait
* this.showLoadingModal - open
* this.closeLoadingModal - close this
*/
var makeLoadingModal = function(text_ok, content_text, additional_options){

	//var content = content_text,
	var footer = '<div class="modal_window__buttons-block">\
			 <a class="button modal_window__ok-button" ><img src="templates/standart/images/w-ok.png" class="icon close_icon">'+text_ok+'</a>\
			</div>',
	options = { "css_class":"modal_window--alert modal_window--good-alert",
				"styles":{"width":"440px", "height":"auto", "min-height":"50px", "overflow":"hidden"},
				"wrap":true,
				"cross_button_hide": true};


	this.modal_window = new Modal("", content_text, footer, options);

	this.show = function(){
		this.modal_window.show();
		makeModalWindowLoaded("#" + this.modal_window.css_id, text_ok);
	};

	this.close = function(){
		this.modal_window.removeWindow();
	};

	if (typeof additional_options != "undefined"){
		$.extend(options, additional_options);
	}
}

/*
#########################
# END OF MODAL WINDOWS  #
#########################
*/

/**
* Add to network window block settings
* in form of status-payouts double inputs
*/
// TODO удалить
var NetworkWindowStatusPayoutOptions = {

	// count of options
	number: 0,

	window_obj : new Object(),
	network_id : 0,
	network_options_list: {},
	network_options_using: 0,
	network_options_approve: {},
	/**
	 * @param obj {jQuery object} window object
	 * @param format {string} For edit or create? [create, edit]
	 */
	init: function(obj, format, network_id){

		if (!network_id){
			this.network_id = obj.find("[name=win_net_id]").val();
		} else {
			this.network_id = network_id;
		}

		this.window_obj = obj;
		// saving from double adding
		if (obj.find(".network-status-options").length>0){
			return;
		}

		if (format == "create"){
			this.drawInitOptions();
			this.addHandlers();
		} else if (format == "edit"){
			// Add load animation
			this.addLoadingAnimation();
			// Animation remove in ajax callback
			this.getOptionsAjax(this.network_id);
		}
	},

	hideOptions: function(){
		this.window_obj.find(".network-status-options").css("display", "none");
	},

	addLoadingAnimation: function(){
		var loader_animation = '\
				<div class="network-status-options__loading-animation">\
					<div class="sk-fading-circle sk-fading-circle-black">\
					<div class="sk-circle1 sk-circle"></div>\
					<div class="sk-circle2 sk-circle"></div>\
					<div class="sk-circle3 sk-circle"></div>\
					<div class="sk-circle4 sk-circle"></div>\
					<div class="sk-circle5 sk-circle"></div>\
					<div class="sk-circle6 sk-circle"></div>\
					<div class="sk-circle7 sk-circle"></div>\
					<div class="sk-circle8 sk-circle"></div>\
					<div class="sk-circle9 sk-circle"></div>\
					<div class="sk-circle10 sk-circle"></div>\
					<div class="sk-circle11 sk-circle"></div>\
					<div class="sk-circle12 sk-circle"></div>\
				</div>\
			</div>';

		makeButtonLoaded( this.window_obj.find(".win-save-button"), "loaded" );
		this.window_obj.find(".win-save-button").attr("onclick", "");
	},

	removeLoadAnimation: function(){
		this.window_obj.find(".network-status-options__loading-animation").remove();

		this.window_obj.find(".win-save-button").html("");
		this.window_obj.find(".win-save-button").html('<img src="templates/standart/images/w-save.png" class="icon save_icon">Save');
		this.window_obj.find(".win-save-button").attr("onclick","check_net_form()");
	},


	drawInitOptions: function(){
		this.number += 1;
		this.window_obj.find(".win_content form")
				.append(this.makeToggler())
				.append($(this.makeBlock()).css("display","none"));

		if (this.window_obj.find(".network-status-options__loading-animation")){
			this.removeLoadAnimation();
		}
		$(".network-status-options__button-delete").on("click", this.makeRemoveLineHandler());
		this.setToggleState();
	},

	setOptionsUsing: function(options_using){
		var checkbox = this.window_obj.find(".network-status-options__using-checkbox"),
			options_block = this.window_obj.find(".network-status-options");
		if (options_using==1){
			checkbox.prop("checked", true);
			options_block.css("display", "block");
		}
	},

	setLoadedData: function(data){
		this.network_options_using = data["options_using"];
		this.network_options_list = data["options"]["options_list"];
		this.network_options_approve = data["options"]["approve"];
	},

	redrawOptions: function(options_using, options_list){
		this.network_options_using = options_using;
		this.network_options_list = options_list;
		this.network_id = 0;
		this.removeAllLines();
		this.drawOptionsInputs();
		if (options_using){
			this.openOptions();
		} else {
			this.closeOptions();
		}
	},

	removeAllLines: function(){
		$(".network-status-options__line").remove();
	},

	drawOptionsInputs: function(){
		var input_line;
		for(var i=0;i<this.network_options_list.length;i++){
			// make input line
			input_line = this.addLine();
			input_line.find(".network-status-options__approve-radio").val(this.network_options_list[i][0]);
			// set values of inputs
			input_line.find(".network-status-options__status-input").val(this.network_options_list[i][0]);
			input_line.find(".network-status-options__payout-input").val(this.network_options_list[i][1]);
			$(".network-status-options__line-wrapper").append(
				input_line
			);

		}
		if (this.network_options_list.length==0){
			input_line = this.addLine();
			$(".network-status-options__line-wrapper").append(
				input_line
			);
		}
	},

	// TODO переписать - вынести установку занчений в this в отдельную функцию
	// TODO сделать работу drawLoadedOptions без входных аргументов - чисто на данных из this
	drawLoadedOptions: function(data){
		var form = this.window_obj.find(".win_content form"),
			input_line, display_options;

		if (this.network_options_using==1){
			display_options = "block";
		} else {
			display_options = "none";
		}

		form.append(this.makeToggler()).append($(this.makeWrapper()).css("display", display_options).append(this.makeControlBlock()).append(this.makeLineWrapper()).append(this.makeButtonAdd()) );

		if (this.network_options_using==1){
			$(".network-status-options__using-checkbox").prop("checked", true);
			$(".network-status-options__toggle-description").css("display", "inline");
		}

		for(var i=0;i<this.network_options_list.length;i++){
			// make input line
			input_line = this.addLine();
			input_line.find(".network-status-options__approve-radio").val(this.network_options_list[i][0]);
			if (this.network_options_approve == this.network_options_list[i][0]){
				input_line.find(".network-status-options__approve-radio").prop("checked", true);
			}
			// set values of inputs
			input_line.find(".network-status-options__status-input").val(this.network_options_list[i][0]);
			input_line.find(".network-status-options__payout-input").val(this.network_options_list[i][1]);
			$(".network-status-options__line-wrapper").append(
				input_line
			);

		}

		this.removeLoadAnimation();

		this.addHandlers();

		this.setToggleState();
	},

	makeControlBlock: function(){
		return '<div class="network-status-options__control-block">\
					'+this.makeCheckBox()+'\
				</div>';
	},

	makeToggler: function(){
		return '<div class="field_span network-status-options-header">\
						<span style="width: 150px;">Status-payout relation</span> \
					</div>\
					<div class="field_input network-status-options-description" style="margin-bottom: 0px;">\
						<input type="checkbox" name="options_using" class="network-status-options-toggler network-status-options__using-checkbox" style="margin-left: -2px;display: inline !important;width: 15px;">\
						<span class="network-status-options__toggle-description" style="display:none; position: relative; top:-5px;">If conversion status = A then Payout = B</span>\
					</div>';
	},

	setToggleState: function(){
	},

	makeCheckBox: function(){
		return "";
	},

	makeBlock: function(){
		var block = $(this.makeWrapper())

					.append(this.makeControlBlock())

					.append(
						$(this.makeLineWrapper())
							.append(this.makeLine())
					 ).append(this.makeButtonAdd());

		return block;
	},

	makeWrapper: function(){
		return '<div class="network-status-options"></div>'
	},

	makeLineWrapper: function(){
		return '<div class="network-status-options__line-wrapper"></div>';
	},

	makeLine: function(number) {
		if (typeof number == "undefined"){
			number = 1;
		}
		return '<div data-number='+number+' class="network-status-options__line">\
					<input placeholder="Conversion status" onfocus="this.placeholder=\'\'" onblur="this.placeholder=\'Conversion status\'" class="settings_input classic_input_narrow network-status-options__status-input" name="status-option[]">\
					<input placeholder="Payout or token {payout}" onfocus="this.placeholder=\'\'" onblur="this.placeholder=\'Payout or token {payout}\'" class="settings_input classic_input_narrow network-status-options__payout-input" name="payout-option[]">\
					<!-- '+ this.makeLineRadio(this.number) +' -->\
					'+ this.makeButtonDelete() +'\
				</div>';
	},

	makeLineRadio: function(){
		return '<label><input type="radio" class="network-status-options__approve-radio" name="approve-option" value="xx">Is approve</label>';
	},

	makeButtonAdd: function(){
		return ' <a class="button network-status-options__button-add" ><img src="templates/standart/images/w-add.png" class="icon close_icon">Add</a>';
	},

	makeButtonDelete: function(){
		return '<a class="network-status-options__button-delete"></a>';
	},

	makeAddLineButtonHadler: function(){
		var that = this;
		return function(){
			that.addLine();
		};
	},

	makeRemoveLineHandler: function(){
		var that = this;
		return function(){
			$(this).parent().remove();
			that.number = that.number - 1;
		}
	},

	toggleHandler: function(){
		if ($(".network-status-options").css("display") == "block"){
			this.closeOptions();
		} else {
			this.openOptions();
		}
		this.setToggleState();
	},

	openOptions: function(){
		$(".network-status-options").css("display", "block");
		$(".network-status-options__toggle-description").css("display", "inline");
		$(".network-status-options-header").css("margin-bottom", "0px");
		$("input[name=options_using]").prop("checked", true)
	},

	closeOptions: function(){
		$(".network-status-options__toggle-description").css("display", "none");
		$(".network-status-options").css("display", "none");
		$(".network-status-options-header").css("margin-bottom", "25px");
		$("input[name=options_using]").prop("checked", false)
	},

	makeTogglerHandler: function(){
		var that = this;
		return function(){
			that.toggleHandler();
		}
	},

	makeBlockRemoveHandler:function(){
		var that = this;
		return function(){
			that.removeOptions();
		};
	},

	makeRadioButtonValueHandler:function(){
		var that = this;
		return function(){
			// Double parent for getting line wrapper
			$(this).parent().parent().find(".network-status-options__approve-radio").val($(this).val());
		}
	},

	/**
	* @param that {NetworkWindowStatusPayoutOptions Object} link to NetworkWindowStatusPayoutOptions object
	*/
	removeOptions:function(){
		this.number = 0;
		this.window_obj = {};
		$(".network-status-options").remove();
		$(".network-status-options-toggler").remove();
		$(".network-status-options-header").remove();
		$(".network-status-options-description").remove();
	},

	getLineBlockObject: function(number){
		return $(".network-status-options__line-wrapper").find("[data-number="+number+"]");
	},

	/**
	* Add line to options and set handlers
	* @return jobj_line
	*/
	addLine: function(){
		if (this.number>9){
			return;
		}
		var line;
		this.number += 1;
		line = this.makeLine(this.number);

		$(".network-status-options__line-wrapper").append(line);

		var jobj_line = this.getLineBlockObject(this.number);

		jobj_line.find(".network-status-options__button-delete").on("click", this.makeRemoveLineHandler());
		jobj_line.find(".network-status-options__status-input").on("change keypress", this.makeRadioButtonValueHandler());
		return jobj_line
	},

	addHandlers: function(){
		$(".network-status-options__button-add").on( "click", this.makeAddLineButtonHadler() );
		$(".network-status-options-toggler").on( "click", this.makeTogglerHandler() );
		this.window_obj.find(".win_closebtn").on("click", this.makeBlockRemoveHandler());
		this.window_obj.find(".win-close-button").on("click", this.makeBlockRemoveHandler());
	},

	getOptionsAjax: function(id){
		$.ajax({
			"type":"post",
			"data":{
				"ajax":1,
				"type":"get_network_options",
				"id":id
			},
			"success": function(data){
				data = JSON.parse(data);
				if (data["options"]!=null && data["options"]["options_list"]!=""){
					NetworkWindowStatusPayoutOptions.setLoadedData(data);
					NetworkWindowStatusPayoutOptions.drawLoadedOptions(data);
					if (data["options_using"]==0){
						NetworkWindowStatusPayoutOptions.hideOptions();
					}

				} else {
					NetworkWindowStatusPayoutOptions.drawInitOptions();
					NetworkWindowStatusPayoutOptions.setOptionsUsing(data["options_using"]);
					NetworkWindowStatusPayoutOptions.addHandlers();
				}
			}
		});
	}
}

// Page_types list
function makeOpacityColorize(){
	var positive_class = "green_row_opacity";
	var negative_class = "red_row_opacity";
	var result_class;
	var positive_ranges = [0, 21, 41, 61, 81, 101, 121, 141, 161, 181, 200];
	var negative_ranges = [0, -21, -41, -61, -81, -100];
	var roi = 0;
	var volume = 0;
	var rows = $(".tr_profit_1, .tr_profit_3");
	var getROIReport = function (row){
		return parseFloat(rows.eq(i).find("td").eq(11).html().replace(/[,%]/g, ""));
	}
	var getROITrends = function (row){
		return parseFloat(rows.eq(i).find("td").eq(10).html().replace(/[,%]/g, ""));
	}
	var getROIStat = function (row){
		var ROItd = rows.eq(i).find(".roi_td");
		if ( ROItd.length > 0 ){
			return parseFloat(ROItd.html().replace(/[,%]/g, ""));
		}
		return '';
	}
	if (window.__pageFormat=="statistic" || window.__pageFormat=="report" || window.__pageFormat=="trends"){
		var getROI;
		for (var i=0, l=rows.length;i<l;i++){

			volume = 0;
			if (window.__pageFormat=="statistic"){
				getROI = getROIStat;
			} else if (window.__pageFormat=="report" ){
				getROI = getROIReport;
			} else if ( window.__pageFormat=="trends"){
				getROI = getROITrends;
			}

			roi = getROI(rows.eq(i));
			if (roi>0){
				for (var j=0, jl=positive_ranges.length;j<jl;j++){
					if (roi>positive_ranges[j]){
						volume = j + 1;
					}
				}
				result_class = positive_class;
			}
			else if (roi<0){
				for (var j=0, jl=negative_ranges.length;j<jl;j++){
					if (roi<negative_ranges[j]){
						volume = j + 1;
					}
				}
				result_class = negative_class;
			}
			rows.eq(i).addClass(result_class+"_"+volume);
		}

	} else if (window.__pageFormat=="report"){

	}
}


function removeErrorBorder( that ){
	$(that).removeClass("error_field_border");
}

$(document).ready(function(){
	makeOpacityColorize();
	setSearchValueFromStorage();

	// Clearing invalid/error border from input
	$("body").on("change input", ".error_field_border:not(.no_clear_error_on_input)", function(){
		removeErrorBorder( this );
	});

});

var loaderAnimation = function(){

	this.addLoadingAnimation = function(selector, opts){
		if (opts.width){
			width = opts.width;
			height = width;
		} else if (opts.height) {
			height = opts.height;
			width = height;
		}
		var loader_animation = '<div style="text-align:center">\
								<div style="width:'+width+';height:'+height+';" class="sk-fading-circle sk-fading-circle-black">\
								  <div class="sk-circle1 sk-circle"></div>\
								  <div class="sk-circle2 sk-circle"></div>\
								  <div class="sk-circle3 sk-circle"></div>\
								  <div class="sk-circle4 sk-circle"></div>\
								  <div class="sk-circle5 sk-circle"></div>\
								  <div class="sk-circle6 sk-circle"></div>\
								  <div class="sk-circle7 sk-circle"></div>\
								  <div class="sk-circle8 sk-circle"></div>\
								  <div class="sk-circle9 sk-circle"></div>\
								  <div class="sk-circle10 sk-circle"></div>\
								  <div class="sk-circle11 sk-circle"></div>\
								  <div class="sk-circle12 sk-circle"></div>\
								</div>\
							</div>';
		$(selector).append(loader_animation);
	}

	this.removeLoadingAnimation = function(selector, opts){
		$(selector+"sk-fading-circle").remove();
	}
}


var groupEditWindowLandings = (function(){

	var windowID = "group-edit-landing-window",
		windowSelector = "#"+windowID,
		landings = new Array();

	function init( landers ){
		if ( typeof landers == "undefined" || landers.length==0) {
			landers = getLandersForEditFromTables();
		}
		landings = landers;
		showWindow();
		setHandlers();
		$.ajax({
			url: "",
			type: "POST",
			data: {"type" : "load_group_lp",
				   "ajax":"1"},
			success:function(data) {
				$(windowSelector+" [name=lp_group_group]").append(data);
			}
		});

	};

	function getLandersForEditFromTables(){
		var landers = BINOM.tt.getCheckedMeaningful();
		return landers;

	};

	function getLanguagesSelect(){
		var select = $("#add_lp [name=lang_lp]").clone().attr("name","lp_group_lang");
		select.find(":selected").removeAttr("selected");
		select.prepend("<option value='not_change' selected >Do not change</option>");
		return select[0].outerHTML;
	}

	function getGroupsSelect(){
		var select = $("#add_lp [name=lp_group]").clone().attr("name", "lp_group_group");
		select.find(":selected").removeAttr("selected");
		select.prepend("<option value='no_change' selected>Do not change</option> ");
		return select[0].outerHTML;
	}

	function makeWindowHTML(){
		return '<div id="wrap" class="wrap '+windowID+'_wrap" style="display: block;"></div>\
				 <div class="window" id="'+windowID+'" style="width:600px;height:200px;">\
					 <a onclick="notewindow_hide(this);" class="win_closebtn"></a>\
					 <div class="win_header">\
						 <span class="window_head_name">Edit landings</span>\
					 </div>\
					 <div class="win_cap ">\
					 </div>\
					 <div class="win_content" style="height:140px">\
						<div class="field_input">\
							<span class="left_field">Domain</span>\
							<div class="right_field">\
								<input type="text" name="lp_group_domain"\
								 	placeholder="Do not change"\
									onfocus="this.placeholder=\'\'"\
									onblur="this.placeholder=\'Do not change\'" />\
							</div>\
							<span class="left_field">Group</span>\
							<div class="right_field">\
								<select name="lp_group_group">\
									<option value="not_change" selected>Do not change</option>\
									<option></option>\
								</select>\
							</div>\
							<span class="left_field">Language</span>\
							<div class="right_field">\
								'+getLanguagesSelect()+'\
							</div>\
						</div>\
			         </div>\
					 <div class="win_footer ">\
						 <div class="win-buttons-block">\
							 <a class="button win-save-button note-save-button"><img src="templates/standart/images/w-save.png" class="icon save_icon">Edit</a>\
							 <a class="button win-close-button note-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>\
						 </div>\
					 </div>\
				 </div>';
	}

	function getParamsToChange(){
		var domain = $(windowSelector+" [name=lp_group_domain]").val(),
			group = $(windowSelector+" [name=lp_group_group]").val(),
			lang = $(windowSelector + " [name=lp_group_lang]").val(),
			paramObj = {};

		if ( typeof domain != 'undefined' && domain!='' ) paramObj['domain']=domain;

		if ( typeof group != 'undefined' && group!='not_change' ) paramObj['group']=group;

		if ( typeof lang != 'undefined' && lang!='not_change' ) paramObj['lang']=lang;

		return paramObj;

	}

	function sendChanging(){
		var params = getParamsToChange(),
			landings = getLandings();
		var dataToSend = {
			params: params,
			landings: landings
		};
		dataToSend = JSON.stringify( dataToSend );
		$.ajax({
			"url":"",
			"type":"post",
			data:{
				"ajax":1,
				"ajax_type":"write",
				"type":"mass_landing_edit",
				data:dataToSend
			},
			success: function( data ){
				clearWindow();
				window.location.reload();
			}
		});
	}

	function setHandlers(){
		var that = this;
		$(windowSelector+" .win-save-button").on("click", function(){ sendChanging.call(that) });
		$(windowSelector+" .win-close-button").on("click", clearWindow);
		$(windowSelector+" .win_closebtn").on("click", clearWindow);
	}

	function showWindow(){
		var html = makeWindowHTML();
		$("body").append(html);
	};
	function clearWindow(){
		$( "."+windowID+"_wrap" ).remove();
		$( windowSelector ).remove();
	};

	function getLandings(){
		return landings;
	}

	return {
		init: init,
		show: showWindow,
		hide: clearWindow,
		getLandings: getLandings
	}

})();

var groupEditWindowOffers = (function(){

		var windowID = "group-edit-offer-window",
			windowSelector = "#"+windowID,
			offers = new Array();

		function init( offersIn ){
			if ( typeof offersIn == "undefined" || offersIn.length==0) {
				offers = getOffersForEditFromTables();
			} else {
				offers = offersIn;
			}

			showWindow();
			setHandlers();

			$.ajax({
				url: "",
				type: "POST",
				data: {
				   "type" : "load_group_of",
				   "ajax":"1"
				},
				success:function(data) {
					$(windowSelector+" [name=of_group_group]").append(data);
				}
			});

		};

		function getOffersForEditFromTables(){
			var choosedRows = BINOM.tt.getCheckedMeaningful();
				offers = new Array();

			choosedRows.forEach(function(item){
				offers.push(item);
			});

			return offers;

		};

		function getGeoSelect(){
			var select = $("#add_of [name=geo_of]").clone().attr("name","of_group_geo");
			select.find(":selected").removeAttr("selected");
			select.prepend("<option value='not_change' selected >Do not change</option>");
			return select[0].outerHTML;
		}

		function makeWindowHTML(){
			return '<div id="wrap" class="wrap '+windowID+'_wrap" style="display: block;"></div>\
					 <div class="window" id="'+windowID+'" style="width:600px;height:160px;">\
						 <a onclick="notewindow_hide(this);" class="win_closebtn"></a>\
						 <div class="win_header">\
							 <span class="window_head_name">Edit offers</span>\
						 </div>\
						 <div class="win_cap ">\
						 </div>\
						 <div class="win_content" style="height:100px">\
							<div class="field_input">\
								<span class="left_field">Group</span>\
								<div class="right_field">\
									<select name="of_group_group">\
										<option value="not_change" selected>Do not change</option>\
										<option></option>\
									</select>\
								</div>\
								<span class="left_field">Geo</span>\
								<div class="right_field">\
									' + getGeoSelect() + '\
								</div>\
							</div>\
				         </div>\
						 <div class="win_footer ">\
							 <div class="win-buttons-block">\
								 <a class="button win-save-button note-save-button"><img src="templates/standart/images/w-save.png" class="icon save_icon">Edit</a>\
								 <a class="button win-close-button note-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>\
							 </div>\
						 </div>\
					 </div>';
		}

		function getParamsToChange(){
			var group = $(windowSelector+" [name=of_group_group]").val(),
				geo = $(windowSelector + " [name=of_group_geo]").val(),
				paramObj = {};

			if ( typeof group != 'undefined' && group!='not_change' )
				paramObj['group']=group;

			if ( typeof geo != 'undefined' && geo!='not_change' )
				paramObj['geo']=geo;

			return paramObj;

		}

		function sendChanging(){

			var params = getParamsToChange(),
				offers = getOffers();

			var dataToSend = {
				params: params,
				offers: offers
			};
			dataToSend = JSON.stringify( dataToSend );
			$.ajax({
				"url":"",
				"type":"post",
				data:{
					"ajax":1,
					"ajax_type":"write",
					"type":"mass_offer_edit",
					data:dataToSend
				},
				success: function( data ){
					window.location.reload();
				}
			});
		}

		function setHandlers(){
			var that = this;
			$(windowSelector+" .win-save-button").on("click", function(){ sendChanging.call(that) });
			$(windowSelector+" .win-close-button").on("click", clearWindow);
			$(windowSelector+" .win_closebtn").on("click", clearWindow);
		}

		function showWindow(){
			var html = makeWindowHTML();
			$("body").append(html);
		};
		function clearWindow(){
			$( "."+windowID+"_wrap" ).remove();
			$( windowSelector ).remove();
		};

		function getOffers(){
			return offers;
		}

		return {
			init: init,
			show: showWindow,
			hide: clearWindow,
			getOffers: getOffers
		}

})();

/**
* @param itemType String landing/offer/source/network and other
* @param id String/Integer ID of item
* @param callback Function that will be called on success
*/
function getDataAboutItemAsunc( itemType, itemId, callback ){

	if ( typeof callback != 'function' ) {
		callback = function(){ console.error( 'Callback on get Item Data was not passed!' ); }
	}

	$.ajax({
		type: 'post',
		url: '',
		data: {
			'ajax': 1,
			'type': 'get_item',
			'itemType': itemType,
			'itemId': itemId
		},
		success: function(data){ callback(data); }
	});
}

function checkStatusMarkedRows(  ){

	var status = '';
	var deletedCount = 0;
	var activeCount = 0;

	if ( BINOM.tt.markedRows.checked.length <= 1 && BINOM.tt.markedRows.selected.length <=1 ){
		id = BINOM.tt.markedRows.checked[0] || BINOM.tt.markedRows.selected[0];
		if ( $('tr#ttrowuid'+id).hasClass('deleted_item') ) {
			return 'deleted';
		} else {
			return 'active';
		}
	}
	for ( var i=0,l=BINOM.tt.markedRows.checked.length;i<l;i++ ){
		var id = BINOM.tt.markedRows.checked[i];
		if ( BINOM.tt.tableData.findObjectByProp('id',id).status == 0 ){
			deletedCount += 1;
		} else {
			activeCount += 1;
		}
	}
	if ( BINOM.tt.markedRows.checked.length == deletedCount ){
		status = 'deleted';
	} else if ( BINOM.tt.markedRows.checked.length == activeCount ){
		status = 'active';
	} else {
		status = 'both';
	}
	return status;
}

function get_id_of_selected_element(){
	if ( BINOM.tt.markedRows.selected.length == 1 ){
		return BINOM.tt.markedRows.selected[0];
	} else if ( BINOM.tt.markedRows.checked.length == 1 ) {
		return BINOM.tt.markedRows.checked[0];
	} else {
		return null;
	}
}

window.DEVHIDED = {
	openTypesOfClearing: function(){
		$('.clearing_type_row').css('display', 'block');
	}
};

var ClearingWindow = function( campsToClear ){
	var windowClass = 'window-clearing-campaign';
	var windowSelector = '.'+windowClass;
	var _drawed = false;
	var _that = this;

	this.camp_id = new Array();

	if ( typeof campsToClear != 'undefined' ){
		this.camp_id = campsToClear;
	}

	var textAlert = `

		<div class="system-inline-message disclaimer">
			<div class="system-inline-message__header">Warning!</div>
				<div class="system-inline-message__text">
					<ol style="font-size:13px;">
						<!-- <li>Warning, it is not recommended to perform clearings while tracker is under any load</li> -->
						<li>It is not recommended to perform clearings while running high volume traffic</li>
						<!-- <li>This clearing is added to the execution queue</li> -->
						<li>Clearing execution queue will be updated, for more information please check the <a href="?page=analysis_system" target="_blank" >Monitor tab</a></li>
					</ol>
				</div>
		</div>
	`;

	this.draw = function(){
		var contentHTML = _that.makeContent();
		return '<div id="wrap" class="wrap '+windowClass+'_wrap" style="display: block;"></div>\
				<div class="window '+windowClass+'" style="width:600px;" id="'+windowClass+'">\
					<a class="win_closebtn"></a>\
					<div class="win_header">\
						<span class="window_head_name">Clearing </span>\
					</div>\
					<div class="win_cap ">\
					</div>\
					<div class="win_content" style="width:570px;overflow:hidden;" >\
						'+contentHTML+'\
						'+textAlert+'\
			    	</div>\
					<div class="win_footer ">\
						<div class="win-buttons-block">\
						 	<a class="button win-save-button note-save-button"><img src="templates/standart/images/w-refresh2.png" class="icon save_icon">Clear</a>\
							<a class="button win-close-button note-close-button" ><img src="./templates/standart/images/w-close.png" class="icon close_icon">Close</a>\
						</div>\
					</div>\
				</div>';
	}
	this.makeContent = function(){
		var html = `
				<!-- <span class="clear_camp_title" style="text-align:center;"></span> -->

				<div class="clearing_type_row" style="display:none;">
					<span class="left_field">Type</span>
					<div class="right_field" style="min-height:40px;line-height:40px;">
						<div style="display:inline-block">
							<div style="display:inline-block;width: 53px;">
								<label><input type="radio" value="1" name="clearing_type" checked> Full </label>
							</div>
							<label><input type="radio" value="2" name="clearing_type"> Fast </label>
						</div>
					</div>
				</div>
				<span class="left_field">Interval</span>
				<div class="right_field" style="min-height:40px;line-height:40px;">
					<div style="display:inline-block;width:150px;">
						<div style="display:inline-block;width: 53px;">
							<label> <input type="radio" value="1" name="clearing_interval" checked /> Full </label>
						</div>
						<label> <input type="radio" value="2" name="clearing_interval" /> Interval </label>
					</div>
					<div class="clearing_interval_block" style="display:none;">
						<input type="text" id="clearing_time_start" name="clearing_time_start" checked /> 
						<div style="display:none;">
							<input type="text" id="clearing_time_end" name="clearing_time_end" />
						</div>
					</div>
				</div>
				<span class="left_field">Start</span>
				<div class="right_field" style="min-height:40px;line-height:40px;">
					<div style="display:inline-block;width:150px;">
						<label> <input type="radio" value="1" name="clearing_start" checked /> Now </label>
						<label> <input type="radio" value="2" name="clearing_start" /> At the time </label>
					</div>
					<div class="clearing_start_block" style="display:none;">
						<input type="text" id="clearing_start_timer" name="clearing_start_timer"/>
					</div>
				</div>
		`;
		return html;
	}
	this.open = function( ){

		if ( BINOM.tt.markedRows.selected.length==1 || BINOM.tt.markedRows.checked.length==1 ){

			if (_that.camp_id.length==0){
				if ( BINOM.tt.markedRows.selected.length==1 ) {
					_that.camp_id = [ BINOM.tt.getSelectedMeaningful()[0] ];
				} else if ( BINOM.tt.markedRows.checked ) {
					_that.camp_id = [ BINOM.tt.getCheckedMeaningful()[0] ];
				}
			}

			var camp = BINOM.tt.tableData.findObjectByProp('id', _that.camp_id);
			_that.camp_name = camp.name || '';
			_that.show();
			$(windowSelector).find('.window_head_name').html( 'Clear '+_that.camp_name.substr(0,150)+':'+_that.camp_id );
		} else if ( BINOM.tt.markedRows.checked.length>1 ) {

			if (_that.camp_id.length==0){
				BINOM.tt.getCheckedMeaningful().forEach(( camp_id )=>{
					_that.camp_id.push( camp_id );
				});
			}

			if ( _that.camp_id.length <= 5 ){
				_that.camp_name = _that.camp_id.join(', ');
			} else {
				_that.camp_name = _that.camp_id.slice(0,5).join(', ') + ' and <b style="color: #A22" title="'+_that.camp_id.slice(5).join(', ')+'">' + ( _that.camp_id.length-5 )  + '</b> other campaigns';
			}

			_that.show();
			$(windowSelector).find('.window_head_name').html( 'Clear camps: '+_that.camp_name );
		}

	}
	this.close = function(){
		_that.camp_id = [];
		_that.camp_name = null;

		$('[name=clearing_type]').eq(0).prop('checked', true);
		$('[name=clearing_interval]').eq(0).prop('checked', true);
		$('[name=clearing_start]').eq(0).prop('checked', true);

		$('.clearing_interval_block').css('display', 'none');
		$('.clearing_start_block').css('display', 'none');

		$('#clear_camp_title').html( '' );
		_that.hide();
	}
	this.show = function(){
		if ( !_drawed ) _that.init();
		$(windowSelector).css( 'display', 'block' );
		$(windowSelector+ '_wrap').css( 'display', 'block' );
	}
	this.hide = function(){
		$(windowSelector).css( 'display', 'none' );
		$(windowSelector+ '_wrap').css( 'display', 'none' );
	}

	var intervalPickerAdded = false;
	this.clearingIntervalChange = function(){
		var radio = $(this);
		if ( radio.val() == "2" ) {
			$(".clearing_interval_block").css('display', 'inline-block');

			if ( !intervalPickerAdded ){

				$('#clearing_time_start').periodpicker({
					end: '#clearing_time_end',
					formatMonth: 'MMMM',
					formatDecoreDate: 'YYYY-MM-DD',
					formatDate: 'YYYY-MM-DD',
					formatDecoreDateWithYear: 'YYYY-MM-DD',
					formatDecoreDateWithoutMonth: 'YYYY-MM-DD',
					maxDate: moment().add('days', 1),
					i18n:{
						'en':{
							'OK' : 'Apply',
						}
					}
				});
				intervalPickerAdded = true;
			}

		}
		else {
			$(".clearing_interval_block").css('display', 'none');
		}

	}

	var clearingStartPickerAdd = false;
	this.clearingStartChange = function(){
		var radio = $(this);
		if ( radio.val() == "2" ) {
			$(".clearing_start_block").css('display', 'inline-block');
			if ( !clearingStartPickerAdd ) {

				$('#clearing_start_timer').periodpicker({
					formatMonth: 'MMMM',
					formatDate: 'YYYY-MM-DD',
					minDate: moment( ).format('YYYY-MM-DD'),
					formatDecoreDateWithYear: 'YYYY-MM-DD HH:mm',
					formatDecoreDateTimeWithYear: 'YYYY-MM-DD HH:mm',
					formatDecoreDateWithoutMonth: 'YYYY-MM-DD HH:mm',
					formatDecoreDate: 'YYYY-MM-DD HH:mm',
					cells:[1,2],
					norange: true,
					yearsLine: false,
					timepicker: true,
					timepickerOptions: {
						hours: true,
						minutes: false,
						seconds: false,
						ampm: false,
						twelveHoursFormat: false
					},
					i18n:{
						'en':{
							'OK' : 'Apply',
						}
					}
				});
				clearingStartPickerAdd = true;
			}
		} else {
			$(".clearing_start_block").css('display', 'none');
		}
	}
	this.collectDataFromWindow = function(){

		if ( _that.camp_id == null ) throw new Error( 'Try to clear camp. Camp ID is not defined.' );

		var type = $('[name=clearing_type]:checked').val();
		var intervalOn = ($('[name=clearing_interval]:checked').val()==2);

		var start_interval=0,
			end_interval=99999999999,
			start_clear=0;

		if ( intervalOn ) {
			start_interval = $('#clearing_time_start').val();
			end_interval = $('#clearing_time_end').val();
		}

		var timerOn = ( $('[name=clearing_start]:checked').val()==2 );
		if ( timerOn ) {
			var start_clear = $('#clearing_start_timer').periodpicker('valueString');
			start_clear = ( start_clear=='' ? 0 : start_clear );
		}

		var clearData = Object.create(null);

		clearData.clear_type = type;
		const campsList = _that.camp_id || [];
		clearData.camp_id = JSON.stringify( campsList );
		clearData.start_interval = start_interval;
		clearData.end_interval = end_interval;

		clearData.start_clear = start_clear;

		return clearData;
	}
	this.sendData = function( data, callback ){
		var ajaxDataObj = Object.create(null);

		ajaxDataObj.ajax = 1;
		ajaxDataObj.ajax_type = 'write';
		ajaxDataObj.type = 'clear_camp';

		var p;
		for ( p in data ) ajaxDataObj[p] = data[p];

		$.ajax({
			url: '',
			type: 'post',
			data: ajaxDataObj,
			success: function( data ){
				if ( typeof callback == "function" )
					callback()

				if ( BINOM && BINOM.tt && typeof BINOM.tt.refetchData=='function' ){
					_that.close()
					BINOM.tt.refetchData();
				} else {
					window.location.reload();
				}
			}
		});
	}
	this.validateData = function( data ){
		if (data){
			var errors = 0;
			if ( $('[name=clearing_start]:checked').val()==2 && data.start_clear==0 ){
				$('.clearing_start_block').addClass('period-picker-container_error');
				errors++;
			} else {
				$('.clearing_start_block').removeClass('period-picker-container_error');
			}
			if ( $('[name=clearing_interval]:checked').val()==2 && data.start_interval==0 ){
				$('.clearing_interval_block').addClass('period-picker-container_error');
				errors++;
			} else {
				$('.clearing_interval_block').removeClass('period-picker-container_error');
			}
		}

		return errors==0;
	};

	this.save = function(){
		var data = _that.collectDataFromWindow();
		if (_that.validateData(data)){
			var wb = new windowBlocker('#'+windowClass, {blocked_button_text:"Sending..."});
			wb.block();
			_that.sendData( data, ()=>wb.unblock() );
		}
	}

	this.setHandlers = function(){
		$('[name=clearing_interval]').on('change', _that.clearingIntervalChange);
		$('[name=clearing_start]').on('change', _that.clearingStartChange);
		$('body').on('click', windowSelector+' .win_closebtn', _that.close);
		$('body').on('click', windowSelector+' .win-close-button', _that.close);
		$('body').on('click', windowSelector+' .win-save-button', _that.save)
	}
	this.init = function(){
		if ( !_drawed ){
			var windowHTML = _that.draw();
			$('body').append( windowHTML );
			_that.setHandlers();
			_drawed = true;
		}
	}

}

function pinModalWindowToTopOfTheWindow(){
	var windowHeight = window.innerHeight;
	var wins = $('.window');
	wins.each(function(i, w){
		w = $(w);
		if ( w.css('display')=='block' ){
			if ( (w.outerHeight()+81)>windowHeight ){
				w.css('margin-top', 0);
			} else {
				w.css('margin-top', '81px');
			}
		}
	});
}


window.BINOM.BLOCK_CSV_CLICK = false;
window.BINOM.BLOCK_CSV_CLICK_TIME = 5000;

function clearCSVBLOCK(){
	window.BINOM.BLOCK_CSV_CLICK = false;
}

function doCSVExport(){

	if ( BINOM.tt && BINOM.tt.tableOptions.mainSetColumns ){
		// Make string from columns list separated by ,
		var columns = BINOM.tt.tableOptions.mainSetColumns.join(',');
		var GETs = URLUtils.getGETParamsAsObject();
		GETs.export = 'csv';
		GETs.columnsforprint = columns;
		// Make URL with old GETs parameters + columns
		var downloadURL = URLUtils.getURLWithNewGETS( GETs );

		// Remove if file already was downloaded
		$("#iframe-downloader").remove();

		// Make iframe for download files
		var iframe = document.createElement("iframe");
		iframe.setAttribute( "src", downloadURL );
		iframe.setAttribute( "id", "iframe-downloader" );
		iframe.setAttribute( "style", "display:none");
		document.body.appendChild(iframe);
	}

	window.BINOM.BLOCK_CSV_CLICK = true;
	setTimeout( function(){ window.BINOM.BLOCK_CSV_CLICK=false }, BINOM.BLOCK_CSV_CLICK_TIME );
}

// Set handlers for most of pages
$(document).ready(function(){

	$( 'body' ).on('click', '.csv_export_button', function(){

		if ( !window.BINOM.BLOCK_CSV_CLICK ) {
			doCSVExport();
		}

	});

});

var ChartRenderer = function( options ) {

	var _that = this;

	var _chart = null;
	var _slider = null;

	this.options = options || Object.create(null);
	this.chartData = null;

	this.editDataForChart = function(){

	}
	/**
	* @param data Array [ [x], [chart], [chart2] ... ]
	*/
	this.setData = function( data ){
		this.chartData = data;

	}

	this.spliceData = function(data, from, to){
		data = _that.chartData;
		// TODO
		return data;
	}

	this.make = function(){
		_that.drawChart();

		if ( _that.options.drawSlider )
		{
			$('#'+_that.options.canvasID).after( '<div class="chart-slider"></div>' );
			_that.drawSlider();
		}
	}

	this.drawChart = function( ){

		if ( !_that.options.canvasID ) {
			console.error( 'BLOCKID FOR DRAWING CHART WAS NOT PASSSED!' );
			return;
		}

		if ( _that.charData === null ){
			console.error( 'DATA FOR DRAWING CHART WAS NOT PASSSED!' );
			return;
		}

		var d = _that.chartData;

		var x = d[0];
		var ys = d.slice(1);

		// TODO Слить в Options
		Chart.defaults.global.animation.duration = 0;

		var ctx = document.getElementById(_that.options.canvasID).getContext('2d');

		_chart = new Chart(ctx, {
		    // The type of chart we want to create
		    type: 'line',

		    // The data for our dataset
		    data: {
		        labels: x,
		        datasets: ys
		    },

		    // Configuration options go here
		    options: {
		    	scales: {
			    	xAxes: [{
		                ticks: {
		                    maxTicksLimit: 24
		                }
		            }]
		        }
		    }
		});
	}

	// TODO При обновлении если правый слайдер приклеен к границе
	// отодвигать его при каждом обновлении
	this.drawSlider = function(){

		var dataForSlider = _that.chartData[0];

		$('.chart-slider').ionRangeSlider({
			type: 'double',
			grid: true,
			values: dataForSlider,
			onFinish: function (data) {
				var _chartCaretFrom = data.from_value;
			    var _chartCaretTo = data.to_value;
			    _that.updateChartDataBySlider( _chartCaretFrom, _chartCaretTo );
		    },
		});
		_slider = $('.chart-slider').data('ionRangeSlider');

		$('.irs.js-irs-0').css( 'margin-left', '40px');
	}

	this.updateChartDataBySlider = function( from_value, to_value ){
		var from_x_index = _that.chartData[0].indexOf( from_value );
		var to_x_index = _that.chartData[0].indexOf( to_value );
		var slicedData = [];
		slicedData[0] = _that.chartData[0].slice( from_x_index, to_x_index+1 );

		for ( var i=1;i<_that.chartData.length;i++ )
		{
			slicedData[i] = Object.create(null);
			var prop;
			for ( prop in _that.chartData[i] ){
				if ( _that.chartData[i].hasOwnProperty(prop) ){
					if (prop!='data') slicedData[i][prop]=_that.chartData[i][prop];
					else slicedData[i][prop]=_that.chartData[i].data.slice( from_x_index, to_x_index+1 );
				}
			}
		}

		_that.updateChart( slicedData );
	}

	this.updateSlider = function( values ){
		if ( _slider == null ) return;

		_slider.update({
			values: values,
			from: values.length-100,
			to: values.length-1
		});
	}

	this.reRenderChart = function( updateData ) {
		_that.chartData = updateData;
		_that.updateSlider( updateData[0] );


		_that.updateChartDataBySlider( updateData[0][updateData[0].length-100], updateData[0][updateData[0].length-1] );
	}


	this.updateChart = function( updateData ) {
		updateData = updateData || false;
		if ( updateData )
		{
			if (_chart!=null)
			{
				_chart.data.labels =  updateData[0];
				_chart.data.datasets = updateData.slice(1);
				_chart.update();
			}
		}
	}

}

BINOM.UTILS = {};
/**
* @param Options Array
*/
BINOM.UTILS.makeInnerMessage = ( options )=>{
	let type, header, subheader, text;

	if ( options.type ) type = options.type;
	else type = 'info';
	if ( options.header ) header = options.header;
	else header = type.substr(0,1).toUpperCase()+type.substr(1);

	if ( options.subheader ) subheader = options.subheader;
	else subheader = false;

	if ( options.text ){
		if ( Array.isArray(options.text) ){
			text = '';
			options.text.forEach( (paragrpah)=>{
				text += `<span>${paragrpah}</span>`;
			});
		} else  {
			text = `<span>${options.text}<span>`;
		}
	} else {
		text = '';
	}

	let html = `
		<div class="system-inline-message ${type}">
			<div class="system-inline-message__header">${header}</div>
			${subheader!=''
				?`<div class="system-inline-message__sub-header"> 
					${subheader}
				</div>`
				:``
			}
			${text!=''
				?`<div class="system-inline-message__text">
					${text}
				</div>`
				:``
			}
		</div>
	`;
	return html;
}





//Awesome calendar

// calendarType:
//10 - calendar with timePicker,
//12 - calendar with date only
function setAwesomeCalendar(calendarType){
	if ( calendarType == 10 ){
		$('#bnm-awesome-calendar').periodpicker('setOption', 'timepicker', true)
		$('#bnm-awesome-calendar').periodpicker('setOption', 'cells', [1,2])
		$('#bnm-awesome-calendar').periodpicker('change')
	} else if ( calendarType == 12 ){
		$('#bnm-awesome-calendar').periodpicker('setOption', 'timepicker', false)
		$('#bnm-awesome-calendar').periodpicker('setOption', 'cells', [1,3])
		$('#bnm-awesome-calendar').periodpicker('change')
	}
}

function setCustomDateBlock(date_filter_value){
	if ( date_filter_value == 12 || date_filter_value == 10 ){
		setAwesomeCalendar(date_filter_value)
		$('#custom_date').css('display', 'block');
		$('.mobile-custom-date').removeClass('mobile-custom-date--disabled');
		$('.mobile-custom-date').addClass('mobile-custom-date--enabled');
	} else {
		$('#custom_date').css('display', 'none');
		$('.mobile-custom-date').removeClass('mobile-custom-date--enabled');
		$('.mobile-custom-date').addClass('mobile-custom-date--disabled');
	}
}

function initAwesomePicker(){
	if ( $('#bnm-awesome-calendar').length ){

		if ( BINOM.__page=='trends' ){
			var date_sValue = $('[name=date_s_trends]').val();
			if ( date_sValue != undefined ){
				if (date_sValue.indexOf('1970-01-01')!=-1){
					$('[name=date_s_trends]').val( moment().format('YYYY-MM-DD 00:00') )
				}
			}
		} else {
			var date_sValue = $('[name=date_s]').val();
			if ( date_sValue != undefined ) {
				if (date_sValue.indexOf('1970-01-01')!=-1){
					$('[name=date_s]').val( moment().format('YYYY-MM-DD 00:00') )
				}
			}
		}



		$('#bnm-awesome-calendar').periodpicker({
			todayButton: false,
			start:'#bnm-awesome-calendar-start',
			end: '#bnm-awesome-calendar-end',
			formatDate: 'YYYY-MM-DD',
			formatDecoreDateWithYear: 'YYYY-MM-DD',
			formatDecoreDateWithoutMonth: 'YYYY-MM-DD',
			formatDecoreDateTimeWithYear: 'YYYY-MM-DD',
			formatDecoreDate: 'YYYY-MM-DD',
			formatDecoreDateTime: 'YYYY-MM-DD HH:mm',
			yearsLine: false,
			i18n:{
				'en':{
					'OK' : 'Apply',
				}
			},
			onOkButtonClick: function(){
				const datePickerValue = this.startinput.val()

				setTimeout( ()=>{
					if ( BINOM.__page == 'stats' ){
						$('#act-form').submit();
					} else {
						let params;

						if ( BINOM.__page=='trends' ){
							const date_s_trends = $('[name=date_s_trends]').val();
							const date_e_trends = $('[name=date_e_trends]').val();
							const date_trends = $('[name=date_trends]').val();
							params = {date_trends, date_s_trends, date_e_trends};
						} else if ( BINOM.__page ){
							const date_s = $('[name=date_s]').val();
							const date_e = $('[name=date_e]').val();
							const date = $('[name=date]').val();
							params = {date_e, date_s, date};

							const dateRangeCheckResult = preLoadingStatDateRangeCheck(date_s);
							const timeZoneValue = $('#stats-timezone').val();
							const isDateTimeFrame = $('#date_filter').val() == '10';

							if (dateRangeCheckResult) {
								if (isDateTimeFrame) {
									// Кастом тайм > 30 последних дней и любая таймзона (включая стандартную) - ошибка
									makeBadAlertModal("OK", "Please choose reporting period <br> less than last 30 days").show();
									return;
								} else if ($('#date_filter').val() == '12' && timeZoneValue != BINOM_SETTINGS.DEFAULT_TIMEZONE) {
									// Кастом дейт >30 дней и таймзона НЕ дефолтная - ошибка
									makeBadAlertModal("OK", "Please choose default time zone or reporting period <br> less than last 30 days").show();
									return;
								}
							}

						}

						URLUtils.changeGETsInURL(params)
							.then(()=>{
								BINOM.tt.refetchData();
								makeFilterBlockApplyButtonRefresh();
							})
					}
				}, 50)
			},

			onAfterShow: function(){
				const pickerCssTopVal =  parseFloat( this.picker[0].style.top )
				this.picker[0].style.top = pickerCssTopVal + 12
			},

			// timepicker opts
			timepicker: true,
			formatDateTime: 'YYYY-MM-DD HH:mm',
			formatDecoreDateTimeWithoutMonth: 'YYYY-MM-DD HH:mm',
			formatDecoreDateTimeWithYear: 'YYYY-MM-DD HH:mm',
			timepickerOptions:{
				hours: true,
				minutes: false,
				seconds: false,
				ampm: false,
				twelveHoursFormat: false
			}
		});
	}

	var date_filter_type
	if ( BINOM.__page == 'trends' ){
		date_filter_type = getURLParameter('date_trends') || $.cookie('date_trends');
	} else if (BINOM.__page=='clicklog') {
		date_filter_type = getURLParameter('date');
	} else {
		date_filter_type = getURLParameter('date')  || $.cookie('date');
	}

	if ( date_filter_type == 12 || date_filter_type == 10 ){
		setCustomDateBlock(date_filter_type)
	}

	$('.period_picker_from_time').on('change', function() {
		this.value = moment(this.value, 'HH:00').format('HH:00');
		var dateValues = $('#bnm-awesome-calendar').periodpicker('value');
		$('#bnm-awesome-calendar').periodpicker('value', [moment(dateValues[0], 'YYYY-MM-DD HH:00').format('YYYY-MM-DD HH:00'), dateValues[1]]);
	});
	$('.period_picker_to_time').on('change', function() {
		this.value = moment(this.value, 'HH:00').format('HH:00');
		var dateValues = $('#bnm-awesome-calendar').periodpicker('value');
		$('#bnm-awesome-calendar').periodpicker('value', [dateValues[0], moment(dateValues[1], 'YYYY-MM-DD HH:00').format('YYYY-MM-DD HH:00')]);
	});
}

$(document).ready( function(){
	initAwesomePicker();
	setPeriodPickerOptions();

	$('#bnm-awesome-calendar-start').on('change', function () {
        $("#refresh-btn").removeClass("blue-button").addClass("green-button");
		$("#refresh-btn").html("&nbsp;&nbsp;<img src=\'templates/standart/images/w-ok.png\' class=\'icon\' style=\'position: relative; top: 1px;\'>Apply&nbsp;&nbsp;");

    });

	$('body').on('change', '#date_filter, #timedate', function(){
		setCustomDateBlock(this.value)

		if ( this.value == 12 || this.value == 10 ){
			var dateSFormat = this.value == 12 ? 'YYYY-MM-DD' : 'YYYY-MM-DD 00:00';
			var dateEFormat = this.value == 12 ? 'YYYY-MM-DD' : 'YYYY-MM-DD 23:59';

			var date_s_value = $.cookie('date_s');
			var date_e_value = $.cookie('date_e');

			$('input[name="m-date_s"]').val(moment(date_s_value).format(dateSFormat));
			$('input[name="m-date_e"]').val(moment(date_e_value).format(dateEFormat));

			$('#bnm-awesome-calendar').periodpicker('show')

			setPeriodPickerOptions();

			if ($('#date_filter, #timedate').val() == '12') {
				$('#bnm-awesome-calendar').periodpicker('regenerate', [1,3]);
				$('#bnm-awesome-calendar').periodpicker('show');
			}
		}
	})

	$('body').on('change', '#stats-timezone', function() {
		setPeriodPickerOptions();
	})

	// Mobile custom date
	$('body').on('change', 'input[name="m-date_s"]', function(){
		var date_e_value = $('input[name="m-date_e"]').val()
		var date_s_value = this.value

		$('#bnm-awesome-calendar').periodpicker('value', [date_s_value, date_e_value]);
	})
	$('body').on('change', 'input[name="m-date_e"]', function(){
		var date_s_value = $('input[name="m-date_s"]').val()
		var date_e_value = this.value

		$('#bnm-awesome-calendar').periodpicker('value', [date_s_value, date_e_value]);
	})

})

const getURLCookieOption = ( option ) => {
    const fromURL = decodeURIComponent(URLUtils.getParam(option) || '');
    const fromCookie = $.cookie(option) || false;
    return fromURL || fromCookie;
}

function preLoadingStatDateRangeCheck(date_s) {
	var date_s = moment(date_s);

	// var timeDiff = Math.abs(date_e.getTime() - date_s.getTime());
	// var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

	var acceptableDateS = moment().add(-31, 'days');
	var chosenDateS = moment(date_s);

	return !chosenDateS.isAfter(acceptableDateS);
}

function setPeriodPickerOptions() {
	if (BINOM.__page == 'trends' || BINOM.__page == 'triggers' || $('#bnm-awesome-calendar').length == 0) {
		return;
	}

	var isDefaultTimeZoneValue
	if (BINOM.__page == 'conversions' || BINOM.__page == 'clicklog') {
		isDefaultTimeZoneValue = true;
	} else {
		isDefaultTimeZoneValue = $('#stats-timezone').val() == BINOM_SETTINGS.DEFAULT_TIMEZONE;
	}

	var isCustomDateTimeFrame = $('#date_filter, #timedate').val() == '10';
	var isCustomDateframe = $('#date_filter, #timedate').val() == '12';


	var minDate = null;
	if (isCustomDateTimeFrame) {
		minDate = moment().add(-29, 'days').format('YYYY-MM-DD');
	} else if (isCustomDateframe && !isDefaultTimeZoneValue) {
		minDate = moment().add(-29, 'days').format('YYYY-MM-DD');
	}

	$('#bnm-awesome-calendar').periodpicker('setOption','minDate', minDate);

}



// hard work on vue and vuex and whatever
function initContextMenu(){
	var page = getURLParameter('page') || 'Campaigns';

	if (page == 'Traffic_Sources') page = 'TrafficSources';

	// Add context menu handler
	$('body').on('contextmenu', '.tt_data_table tr', function( e ){

		try{
			if (window.vmStore.state[page].TT.contextMenuState.showed){
				const x = window.vmStore.dispatch( 'TT/CLOSE_TT_CONTEXT_MENU' )
			}
			window.vmStore.dispatch( 'TT/OPEN_TT_CONTEXT_MENU', { event: e } );
		} catch (e){
			console.error(e);
		}
	});

}


$(document).ready(function(){
	if ( BINOM.__page ){
		document.body.classList.add('bnm-current-page__' + BINOM.__page)
	}
})

const RoutingUtilStorage = function () {

	function makeStorage() {
		const storage = {};
		storage.minimizedRules = {};
		return storage;
	}

	if (localStorage.routingUtilStorage) {
		this.storage = JSON.parse(localStorage.routingUtilStorage);
	} else {
		this.storage = makeStorage();
	}

	/**
	 @rule_id String|Number
	 @minimized Boolean
	**/
	this.writeMinimizedRule = function(rule_id, minimized) {
		if (!rule_id) return;
		if (!this.storage.minimizedRules) this.storage.minimizedRules = {};

		if (minimized) {
			this.storage.minimizedRules[rule_id] = minimized;
		} else {
			delete this.storage.minimizedRules[rule_id];
		}
		this.writeStorage();
	}
	this.isRuleMinimized = function(rule_id) {
		if (!this.storage.minimizedRules) return false;
		return this.storage.minimizedRules[rule_id];
	}

	this.writeCachedRouting = function(routing) {
		this.storage.cachedRouting = JSON.parse(JSON.stringify(routing));
		// FIND Tokens criteria and clear it from token id - make it ROUTING type 81 + number
		if (this.storage.cachedRouting.rules) {
			this.storage.cachedRouting.rules.forEach((rule) => {
				if (rule.criteria) {
					rule.criteria.forEach((cri) => {
						if (cri.type > 90) { // condtiion for find tokens criterion
							const tokenID = cri.type - 90;
							if (ROUTING.tokens.length) {
								const token = ROUTING.tokens.find(token => token.id == tokenID);
								cri.type = Number(token.type) + 80;
							}
						}
					})
				}
			})
		}
		this.writeStorage();
	}
	this.clearCachedRouting = function() {
		delete this.storage.cachedRouting;
		this.writeStorage();
	}

	this.writeStorage = function() {
		localStorage.routingUtilStorage = JSON.stringify(this.storage);
	}

}

$.fn.bnm_inputCross = function() {
	const input = this;
	const div = $('<div class="search-interactive search-interactive-floated"></div>');
	const crossButton = $('<div class="search-interactive__cross"></div>');
	div.append(crossButton);
	this.after(div);
	div.prepend(this);

	const setCrossVisibility = () => {
		if (input.val()) {
			crossButton.css('display', 'block');
		} else {
			crossButton.css('display', 'none');
		}
	}
	setCrossVisibility();

	input.on('input', () => {
		setCrossVisibility();
	})

	crossButton.on('click', () => {
		input.val('');
		input.trigger('change');
		input.trigger('input');
		input.focus();
	})
}

$(document).ready(() => {
	$('.search').bnm_inputCross();
	// qtip
	$('.tooltip').qtip({
		position: {
            my: 'center left',
            at: 'bottom right'
        },
        show:{
            event: 'click'
        },
        hide: {
            event: 'unfocus'
        },
        style: {
            classes: 'qtip-dark qtip-shadow'
        }
    });
})
