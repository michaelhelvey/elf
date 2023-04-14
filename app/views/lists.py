from django.contrib.auth.mixins import (LoginRequiredMixin,
                                        PermissionRequiredMixin)
from django.views.generic import CreateView, DetailView

from app.models import List


class ListCreateView(LoginRequiredMixin, CreateView):
    template_name = "lists/list_create.html"
    model = List
    fields = ["title"]

    def get_success_url(self):
        return self.object.get_absolute_url()

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)


class UserOwnsListMixin(PermissionRequiredMixin):
    def has_permission(self):
        return self.request.user == self.get_object().user


class ListDetailView(LoginRequiredMixin, UserOwnsListMixin, DetailView):
    model = List
    template_name = "lists/list_detail.html"
    context_object_name = "list"
