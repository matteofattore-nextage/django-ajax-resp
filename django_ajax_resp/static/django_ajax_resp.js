
//default - local backend
var api_base_path = "";
//To solve cross domain access - "405 Method not alloed" ERROR.
//var api_base_path = "proxy.php?q=http://192.168.71.180:8002";

var BaseController = function () {
};


BaseController.prototype.init = function (url, method) {
	if (method == undefined) {
		method = "GET";
	}
	this.callDjango(method, url, null);

};



BaseController.prototype.submitForm = function(form_id, action, method){
	var form = jQuery("#"+form_id);
	var data = form.serializeArray();
	var urlMapping = form.attr('action');
	if (action != undefined) {
		urlMapping = action;
	}
	var html_method = form.attr('method');
	if (method != undefined) {
		html_method = method;
	}
	this.callDjango(html_method, urlMapping, data);
};

/*
 * Make a ajax call to a django view
 * 
 * param: type - POST or GET
 */

BaseController.prototype.callDjango = function (callType, urlMapping, data) { 
	this.callBackendHtml(callType, urlMapping, data, jQuery.proxy(this.parseDjangoResponse, this));
	
};

BaseController.prototype.django_action__html__html_load = function(responseItem) {
	if (responseItem["type"] == "html") {
    	if (responseItem["action"] == "html_load") {
    		html_str = responseItem["data"];
    		html_str = html_str.replace(/^.*Content-Type:.*$/mg, "");
    		jQuery(responseItem["target"]).html(html_str);
			if (responseItem["js_class"] && responseItem["js_class"] != "") {
				if (responseItem["js_class_action"] == "create") {
					tempObj = new window[responseItem["js_class"]](this);
				};
			} else {
				//TODO: to test, new implementation allow to declare js class in a DIV of python template
				jsDiv = jQuery(responseItem["target"]).find("div[django-ajax-js-class]");
				if (jsDiv.length > 0) {
					js_class = jsDiv.attr('django-ajax-js-class');
					if (js_class != null && js_class != "") {
						tempObj = new window[js_class](this);
					}
				};
			};
    	};
	};	
}

BaseController.prototype.parseDjangoResponse = function (message) { 
	var data = jQuery.parseJSON(message);
	for(var key in data){
	    if (data.hasOwnProperty(key)){
	        var responseItem = data[key];
	    	action_funct_name = "django_action__" + responseItem["type"] + "__" + responseItem["action"];
	    	if (this[action_funct_name] && typeof(this[action_funct_name]) === "function") {
	    		this[action_funct_name](responseItem);
	    	} else {
	    		dj_ajax_log("Action function not fount (function name - " + action_funct_name + ")");
	    	};
		};
     };
		

     var forms = jQuery("form[django-ajax-resp-enable]");

     for(var i=0;i<forms.length;i++){
        form = jQuery(forms[i]);    // A DOM element, not a jQuery object
   		if (form.attr('django-ajax-resp-enable') === "true") {
 			form.submit(jQuery.proxy(function (e) {
 			    // prevent normal submit behaviour
 			    e.preventDefault();
 				this.submitForm(e.target.id);
 			}, this));
 		}
	  };
};

BaseController.prototype.callBackendHtml = function (callType, strURL, dataToSend, callback, errorCallback) { 
	var dataType = 'html';
	this.callBackend(callType, strURL, dataToSend, dataType, callback, errorCallback);
};
		


BaseController.prototype.callBackendJson = function (callType, strURL, dataToSend, callback, errorCallback) { 
	var dataType = 'json';
	this.callBackend(callType, strURL, dataToSend, dataType, callback, errorCallback);
};
	

BaseController.prototype.callBackend = function (callType, strURL, dataToSend, dataType, callback, errorCallback) { 
	showLoading();
    jQuery.ajax( 
            { 
                type: callType, 
                url: strURL,
                dataType: dataType,
                contentType: 'application/json',
                data: dataToSend,
                context:this,
                success: jQuery.proxy(function(message)  {
                	hideLoading();
                    if (message) 
                        { 
                        	if (message.error) {
                        		//Stabilire se definire un messaggio d'errore prestabilito da 
                        		//intercettare qui e chiamare la Callback
                        		if (errorCallback && typeof(errorCallback) === "function") {
                        			errorCallback(message);
                        		}
                        	} else {
                        		if (callback && typeof(callback) === "function") {
                        		    jQuery(callback(message), this);
                        		}
                        	}
                        }
                    else
                        {
                        	log('ajax call - Nothing came back....');
                        }
                 }, this)
             }
       );
};

showLoading = function() {
	jQuery("#loading").show();
};

hideLoading = function() {
	jQuery("#loading").hide();
};

function dj_ajax_log(msg) {
    setTimeout(function() {
        throw new Error(">> dj_ajax_log: " + msg);
    }, 0);
}

jQuery(function() {
	if (window.django_controller === undefined) {
		django_controller = new BaseController();				
	}
	jQuery("div[django-ajax-resp-url]").each(function(index) {
		window.django_controller.init(jQuery(this).attr('django-ajax-resp-url'), jQuery(this).attr('django-ajax-resp-method'));
	});
	if (jQuery("div#loading").length > 0){
		// ok ... nel template django è stato ridefinito un div con la clessidra
	} else {
		// lo aggiungo io
		jQuery("body").append('<div id="loading"> ' +
				' <div id="loading_alert">'	+
				'	 Please Wait' +
				'	</div>'+
				'	</div>'+
			'');
	}
});


