from django_ajax_resp.django_ajax_resp import ResponseArray, ResponseItem
from django.forms.forms import Form
from django import forms

class Sum1Form(Form):
    result = forms.IntegerField(required = True)

def load_main(request):
    r_a = ResponseArray()     
    sum_1_form = Sum1Form()
    
    sum_1_form_resp = ResponseItem()
    sum_1_form_resp.render_values = {'sum_1_form' : sum_1_form}
    sum_1_form_resp.target = "#main_content" # the div to update
    sum_1_form_resp.action = "html_load"
    #js_class = "<JS_CLASS_NAME>"
    sum_1_form_resp.template = 'testform.html'
    r_a.append(sum_1_form_resp)
    return r_a.generate_response(request)

def sum1(request):
    if request.method == 'POST': 
        r_a = ResponseArray() 
        sum_1_form = Sum1Form(request.POST)
        alert = ResponseItem()
        alert.action = "html_load"
        if sum_1_form.is_valid():         
            ### Prepare and append alert message ###
            data = sum_1_form.cleaned_data
            if data['result'] == 12:
                alert.template = 'success.html'
                sum_1_form.clean()
            else:
                alert.template = 'fail.html' 
        else:
            alert.template = 'fail.html'
           
        alert.target = "#main_alert"  #the div to update with the result of the form submission
        r_a.append(alert)
                
        sum_1_form_resp = ResponseItem()
        sum_1_form_resp.render_values = {'sum_1_form' : sum_1_form}
        sum_1_form_resp.target = "#main_content"
        sum_1_form_resp.action = "html_load"
        #js_class = "<JS_CLASS_NAME>"
        sum_1_form_resp.template = 'testform.html'  #the div to update with form 
        r_a.append(sum_1_form_resp)
        
        return r_a.generate_response(request)
    else:
        r_a = ResponseArray()     
        
        #prepare empty form
        sum_1_form = Sum1Form()
        sum_1_form_resp = ResponseItem()
        sum_1_form_resp.render_values = {'sum_1_form' : sum_1_form}
        sum_1_form_resp.target = "#main_content"
        sum_1_form_resp.action = "html_load"
        #js_class = "<JS_CLASS_NAME>"
        sum_1_form_resp.template = 'testform.html'
        r_a.append(sum_1_form_resp)
        
        return r_a.generate_response(request)
    