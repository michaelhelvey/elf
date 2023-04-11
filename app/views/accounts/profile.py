from django.views.generic import TemplateView


class UserProfileView(TemplateView):
    template_name = "account/profile.html"
