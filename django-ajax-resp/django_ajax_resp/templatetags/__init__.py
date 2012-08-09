from django.conf import settings
from django import template
BOOTSTRAP_BASE_URL = getattr(settings, 'BOOTSTRAP_BASE_URL',
    'http://twitter.github.com/bootstrap/assets/'
)

BOOTSTRAP_JS_BASE_URL = getattr(settings, 'BOOTSTRAP_JS_BASE_URL',
    BOOTSTRAP_BASE_URL + 'js/'
)

BOOTSTRAP_JS_URL = getattr(settings, 'BOOTSTRAP_JS_URL',
    None
)

BOOTSTRAP_CSS_BASE_URL = getattr(settings, 'BOOTSTRAP_CSS_BASE_URL',
    BOOTSTRAP_BASE_URL + 'css/'
)

BOOTSTRAP_CSS_URL = getattr(settings, 'BOOTSTRAP_CSS_URL',
    BOOTSTRAP_CSS_BASE_URL + 'bootstrap.css'
)

register = template.Library()

@register.simple_tag
def bootstrap_stylesheet_url():
    """
    URL to Bootstrap Stylesheet (CSS)
    """
    return BOOTSTRAP_CSS_URL