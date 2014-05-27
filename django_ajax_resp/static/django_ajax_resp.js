//default - local backend
var api_base_path = "";
//To solve cross domain access - "405 Method not alloed" ERROR.
//var api_base_path = "proxy.php?q=http://192.168.71.180:8002";

var BaseController = function () {
};


BaseController.prototype.init = function (url, method, caller_html_elem_id) {
    if (method == undefined) {
        method = "GET";
    }
    this.callDjango(method, url, null, caller_html_elem_id);

};


BaseController.prototype.submitForm = function (form_id, clicked_button, action, method, caller_html_elem_id) {
    var form = jQuery("#" + form_id);
    var data = form.serializeArray();
    if (clicked_button != undefined) {
        data.push({'name': 'clicked_button', 'value': jQuery(clicked_button).val()});
    }
    var urlMapping = form.attr('action');
    if (action != undefined) {
        var urlMapping = action;
    }
    var html_method = form.attr('method');
    if (method != undefined) {
        var html_method = method;
    }
    this.callDjango(html_method, urlMapping, data, caller_html_elem_id);
};

/*
 * Make a ajax call to a django view
 * 
 * param: type - POST or GET
 */
BaseController.prototype.callDjango = function (callType, urlMapping, data, caller_html_elem_id) {
    dj_ajax_log("callDjango");
    dj_ajax_log("- callType:  " + callType);
    dj_ajax_log("- data:      " + data);
    dj_ajax_log("- url:       " + urlMapping);

    if (data == null || data == undefined) {
        data = []
    }
    data.push({name:'django-ajax-resp', value: true});
    if (caller_html_elem_id != undefined) {
        data.push({name:'caller_html_elem_id', value: caller_html_elem_id});

    }

    this.callBackendHtml(callType, urlMapping, data, jQuery.proxy(this.parseDjangoResponse, this));
};

BaseController.prototype._getReference = function (string, root) {
    root = root || this;
    return string.split(".").reduce(function (ref, item) {
        return ref[item]
    }, root)
};
//and use as var o = new getReference("Namespace.MyClass")()

BaseController.prototype.django_action__javascript = function (responseItem) {
    if (responseItem["type"] == "javascript") {
        response_action = responseItem["action"];
        response_data = responseItem["data"];
        target = responseItem["target"];
        //if the action is "recreate". we create a new instance of the object
        if (response_action.toLowerCase() == "recreate") {
            dj_ajax_log("Action is '" + response_action + "'. I will create a instance of js_class.");
            window[target] = new (this._getReference(responseItem["js_class"], window))(response_data);
            return;
        } else if (response_action.toLowerCase() == "global_function") {
            window[target](response_data)
        } else if (response_action.toLowerCase() == "object_function") {
            //target = object
            //js_class_action = object function name
            //response_data = function parameters, json
            js_class_action = responseItem["js_class_action"];
            window[target][js_class_action](response_data)
        } else if (typeof window[target] == "undefined") {
            dj_ajax_log("Target object '" + responseItem["target"] + "' doesn't exist. I will create a instance of js_class.");
            window[target] = new (this._getReference(responseItem["js_class"], window))(response_data);
        }

        if (typeof window[target][response_action] == "function") {
            window[target][response_action](response_data)
        } else {
            //is a variable
            window[target][response_action] = response_data
        }


    }
    ;
}


BaseController.prototype.django_action__html__html_load = function (responseItem) {
    if (responseItem["type"] == "html") {
        if (responseItem["action"] == "html_load") {
            html_str = responseItem["data"];
            html_str = html_str.replace(/^.*Content-Type:.*$/mg, "");
            target_div = jQuery(responseItem["target"]);
            if (target_div.length > 0) {
                target_div.html(html_str);
            } else {
                dj_ajax_log("Target DIV '" + responseItem["target"] + "' doesn't exist.");
            }
            ;
            this.django_action_html_execute_response_js(responseItem);
        }
        ;
    }
    ;
}

BaseController.prototype.django_action_html_execute_response_js = function (responseItem) {
    if (responseItem["js_class"] && responseItem["js_class"] != "") {
        if (responseItem["js_class_action"] == "create") {
            tempObj = new window[responseItem["js_class"]](this);
        }
        ;
    } else {
        //TODO: to test, new implementation allow to declare js class in a DIV of python template
        jsDiv = jQuery(responseItem["target"]).find("div[django-ajax-js-class]");
        if (jsDiv.length > 0) {
            js_class = jsDiv.attr('django-ajax-js-class');
            if (js_class != null && js_class != "") {
                tempObj = new window[js_class](this);
            }
        }
        ;
    }
    ;
}


BaseController.prototype.django_action__html__html_append = function (responseItem) {
    if (responseItem["type"] == "html") {
        if (responseItem["action"] == "html_append") {
            html_str = responseItem["data"];
            html_str = html_str.replace(/^.*Content-Type:.*$/mg, "");
            target_div = jQuery(responseItem["target"]);
            if (target_div.length > 0) {
                target_div.append(html_str);
            } else {
                dj_ajax_log("Target DIV '" + responseItem["target"] + "' doesn't exist.");
            }
            ;
            this.django_action_html_execute_response_js(responseItem);
        }
        ;
    }
    ;
}

BaseController.prototype.django_action__html__html_remove = function (responseItem) {
    if (responseItem["type"] == "html") {
        if (responseItem["action"] == "html_remove") {
            target_div = jQuery(responseItem["target"]);
            if (target_div.length > 0) {
                target_div.remove(html_str);
            } else {
                dj_ajax_log("Target DIV '" + responseItem["target"] + "' doesn't exist.");
            }
            ;
            this.django_action_html_execute_response_js(responseItem);
        }
        ;
    }
    ;
}

BaseController.prototype.django_action__html__html_popup = function (responseItem) {
    if (responseItem["type"] == "html") {
        if (responseItem["action"] == "html_popup") {
            html_str = responseItem["data"];
            html_str = html_str.replace(/^.*Content-Type:.*$/mg, "");

            var modalDivs = jQuery("div#django_ajax_resp_modal_div");

            if (modalDivs.length > 0) {
                modalDivs.html(html_str);
            } else {
                jQuery("body")
                    .append('<div id="django_ajax_resp_modal_div" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">' +
                        html_str +
                        '</div>');
            }
            jQuery('#django_ajax_resp_modal_div').modal();
        }
    }
};


BaseController.prototype.django_action__html__popup_close = function (responseItem) {
    if (responseItem["type"] == "html") {
        if (responseItem["action"] == "popup_close") {
            var modalDivs = jQuery("div#django_ajax_resp_modal_div");
            if (modalDivs.length > 0) {
                modalDivs.modal('hide');
                jQuery("body").remove("div#django_ajax_resp_modal_div");
            }
        }
    }
}


BaseController.prototype.django_action__html__html_popup_error = function (responseItem) {
    if (responseItem["type"] == "html") {
        if (responseItem["action"] == "html_popup") {
            html_str = responseItem["data"];
            html_str = html_str.replace(/^.*Content-Type:.*$/mg, "");

            var modalDivs = jQuery("div#django_ajax_resp_modal_div")
            if (modalDivs.length > 0)
                modalDivs.remove();

            jQuery("body").append('<div id="django_ajax_resp_modal_div" class="modal fade">' +
                html_str +
                '</div>');
            jQuery('#django_ajax_resp_modal_div').modal();
        }
    }
}

BaseController.prototype.django_action__redirect__post = function (responseItem) {
    if (responseItem["type"] == "redirect") {
        if (responseItem["action"] == "post") {
            post_data = responseItem["data"];
            target_url = responseItem["target"];
            //post_data = post_data.replace(/^.*Content-Type:.*$/mg, "");
            this.redirect("post", target_url, post_data);
        }
    }
}


BaseController.prototype.redirect = function (callType, urlMapping, data) {
    var form = document.createElement('form');
    form.action = urlMapping;
    form.method = callType;

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var field = document.createElement('input');
            field.type = 'hidden';
            field.name = key;
            field.value = data[key];

            form.appendChild(field);
        }
    }

    document.body.appendChild(form);
    form.submit();
}


BaseController.prototype.enableForms = function () {
    var forms = jQuery("form[django-ajax-resp-enable]");

    for (var i = 0; i < forms.length; i++) {
        var form = jQuery(forms[i]);    // A DOM element, not a jQuery object
        if (form.attr('django-ajax-resp-enable') === "true") {
            form.find(":submit").off('click');
            form.find(":submit").on('click', function () {
                dj_ajax_log("- clicked_button.id: " + this.id);
                jQuery.proxy(window.django_controller.submitForm(form_id = this.form.id, clicked_button = this,  action = undefined, method = undefined, caller_html_elem_id = this.form.parentNode.id), window.django_controller);
                //prevent normal submit to pass button value
                return false;
            });
            form.submit(jQuery.proxy(function (e) {
                // prevent normal submit behaviour
                e.preventDefault();
                dj_ajax_log("- e.target.id: " + e.target.id);
                this.submitForm(e.target.id);
            }, this));
        }
    }
    //if ajax upload is loaeded, discover file field
    try {
        jQuery(function () {
            //I check if AjaxUploadWidget is defined
            if (typeof AjaxUploadWidget !== 'undefined') {
                AjaxUploadWidget.autoDiscover();
            }
        });
    }
    catch (e) {
        console.log('problemi caricamento libreria ajax_upload');
    }
};


BaseController.prototype.parseDjangoResponse = function (message) {
    dj_ajax_log("parseDjangoResponse");

    var data = jQuery.parseJSON(message);
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var responseItem = data[key];
            var response_type = responseItem["type"].toLowerCase();
            if (response_type == 'javascript')
                action_funct_name = "django_action__" + response_type;
            else
                action_funct_name = "django_action__" + response_type + "__" + responseItem["action"];

            if (this[action_funct_name] && typeof(this[action_funct_name]) === "function") {
                this[action_funct_name](responseItem);
            } else {
                dj_ajax_log("Action function not fount (function name - " + action_funct_name + ")");
            }
            ;
        }
        ;
    }
    ;
    this.enableForms();
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
    jQuery.ajax(
        {
            type: callType,
            url: strURL,
            dataType: dataType,
            contentType: 'application/x-www-form-urlencoded',
            data: dataToSend,
            context: this,
            success: jQuery.proxy(function (message) {
                hideLoading();
                if (message) {
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
                else {
                    dj_ajax_log('ajax call - Nothing came back....');
                }
            }, this)
        }
    );
};

showLoading = function () {
    jQuery("#django_ajax_resp_loading_div").show();
};

hideLoading = function () {
    jQuery("#django_ajax_resp_loading_div").hide();
};

hidePopup = function () {
    jQuery('#django_ajax_resp_modal_div').modal('hide');
};


function dj_ajax_log(msg) {
    if (typeof console != "undefined") {
        console.log(">> dj_ajax_log: " + msg);
    }
}

jQuery(function () {
    if (window.django_controller === undefined) {
        django_controller = new BaseController();
    }
    jQuery("div[django-ajax-resp-url]").each(function (index) {
        var html_elem = jQuery(this);
        var url = html_elem.attr('django-ajax-resp-url');
        if (url == 'self') {
            url = location.href;
        }
        window.django_controller.init(url, html_elem.attr('django-ajax-resp-method'), html_elem.attr("id"));
    });
    jQuery("div[django-ajax-resp-timed-url]").each(function (index) {
        var html_elem = jQuery(this);
        var url = html_elem.attr('django-ajax-resp-timed-url');
        //lapse is the time that elapses between two automatic calls in milliseconds, the default value is 1 minute (60000 milliseconds)
        var lapse = html_elem.attr('django-ajax-resp-timed-lapse') || 60000
        if (url == 'self') {
            url = location.href;
        }
        var method = jQuery(this).attr('django-ajax-resp-timed-method');
        var html_elem_id = html_elem.attr("id");
        dj_ajax_log("'Django ajax resp framework' initiated the timed autocall to '" + url + "'  every  " + lapse + " milliseconds.");
        setInterval(function () {
            window.django_controller.init(url, method, html_elem_id);
        }, lapse);
    });

    if (jQuery("div#django_ajax_resp_loading_div").length > 0) {
        // ok ... nel template django è stato ridefinito un div con la clessidra
    } else {
        // lo aggiungo io
        jQuery("body").append('<div id="django_ajax_resp_loading_div"> ' +
            ' <div id="django_ajax_resp_loading_alert_div">' +
            '	 Please Wait' +
            '	</div>' +
            '	</div>' +
            '');
    }

    jQuery("a[django-ajax-resp-url]").each(function (index, e) {
        var elem = jQuery(e);
        elem.click(function () {

            var callType = "GET";
            var url = elem.attr('django-ajax-resp-url');

            dj_ajax_log('url: ' + url);

            window.django_controller.callDjango(callType, url, {});

            return false;
        });
    });
    window.django_controller.enableForms();
});


