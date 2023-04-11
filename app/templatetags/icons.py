from django import template
from django.template import loader

register = template.Library()


@register.simple_tag(name="icon")
def icon(name, css):
    template = loader.get_template(f"icons/{name}.svg")
    return template.render({"css": css})
