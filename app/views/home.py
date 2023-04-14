from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView

from app.models import List


class HomeView(LoginRequiredMixin, TemplateView):
    template_name = "home.html"

    def get_context_data(self, **kwargs):
        context_data =  super().get_context_data(**kwargs)

        return {
            **context_data,
            "owned_lists": self.request.user.lists.all(),
            "shared_lists": List.objects.filter(shared_with=self.request.user)
        }
