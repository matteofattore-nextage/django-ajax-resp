django-ajax-resp
================

This framework helps devolopers to implement ajax frontend in a Django project without loose the power of django forms and django templates.

Installation
------------
1. Install using pip:

         pip install git+git://github.com/matteofattore-nextage/django-ajax-resp.git#egg=django_ajax_resp
         
2. Add to INSTALLED_APPS (settings.py):

        'django_ajax_resp',

Alternatively, you can add `git+git://github.com/matteofattore-nextage/django-ajax-resp.git#egg=django_ajax_resp` to your requirements.txt.


Includes
--------

Your main django template has to include:

    <link rel='stylesheet' type='text/css' href='{{STATIC_URL}}django_ajax_resp.css' />
	.....
	.....
	<!-- add at the end of template template -->
    <script src='{{STATIC_URL}}django_ajax_resp.js' type="text/javascript" charset="utf-8"></script>

Usage
-----

Move a form to ajax: 
(from the example within this github project repository)

1) add a empty div to your template, the div to fill with the form:

    <div id="main_content"></div>


2) create a separate template that contains just the form:

		<form id="formElem" name="formElem" action="{% url sum1 %}" method="post" django-ajax-resp-enable="true">{% csrf_token %}
			<div id="wrapper">
				<fieldset  class="step">
				    <legend>5 + 7</legend>
					{{sum_1_form}}
				</fieldset>
				<button class="btn btn-large btn-info" id="add" type="submit" name="bsignup"><b>Check</b></button>
			</div>
		</form>
note: 
- action="{% url sum1 %}": contains the reference to the url defined in url.py, that refers the view written to validate and elaborate the form post.
- django-ajax-resp-enable="true": enable the form to use "django-ajax" post.

3) 

Substitute all:
	
		render_to_response('...')  

with something like:

        r_a = ResponseArray() 
        
        ....  (1 or more block like the follow)
        sum_1_form_resp = ResponseItem()
        sum_1_form_resp.render_values = {'sum_1_form' : sum_1_form} 
        sum_1_form_resp.target = "#main_content"  #the div to be updated with the rendered django template (in this case the form) 
        sum_1_form_resp.action = "html_load"       #this is the only action supported by this version, contact me if you need a help about how implement new actions
        sum_1_form_resp.template = 'testform.html'  #the template to be filled with "render_values" values
        r_a.append(sum_1_form_resp)
        ...
        
        return r_a.generate_response(request)

-----

Similarly, you can implement the partial/dynamic updating of the web page as a result of a javascript call.

The javascript call:

    var callType = "GET";
	var urlMapping = "/campaign_form";  // The URL defined in the url.py
	data = { ... }
	window.django_controller.callDjango(callType, urlMapping, data);


About
-----
django-ajax-resp is written by Matteo Fattore.


License
-------

You can use this under Apache 2.0. See LICENSE file for details.

