from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template
import main_views

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', direct_to_template, {'template': 'main.html'}, name='main'),
    url(r'^loadtestform', main_views.load_main, name='loadtestform'),
    url(r'^sum1/', main_views.sum1, name='sum1'),
    #url(r'^sum2/', main_views.sum1, name='sum2'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
