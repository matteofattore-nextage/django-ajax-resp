'''
Created on Jun 14, 2012

@author: teo
'''
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from django.utils import simplejson

class ResponseItem():

    target = ""
    action = ""
    message_type = "html"
    template = ""
    render_values = {}
    
    js_class = ""
    js_class_action = "create"
    
    def get_response_item(self, request = None):
        responseItem = {}
        responseItem["target"] = self.target   
        responseItem["action"] = self.action    
        responseItem["type"] = self.message_type
        responseItem["data"] = str(render_to_response(
                                  self.template, 
                                  self.render_values,
                                  context_instance=RequestContext(request)) )
        responseItem["js_class"] = self.js_class
        responseItem["js_class_action"] = self.js_class_action

        return responseItem


class ResponseArray():

    response_array = []

    def append(self, to_append):
        
        self.response_array.append(to_append)

    def generate_response(self):
        '''SEE ALSO: Django function json_response(x), implementation:
        def json_response(x):
        import json
        return HttpResponse(json.dumps(x, sort_keys=True, indent=2),
                            content_type='application/json; charset=UTF-8')
        ''' 
        return HttpResponse(simplejson.dumps(self.response_array), mimetype="application/json" )
