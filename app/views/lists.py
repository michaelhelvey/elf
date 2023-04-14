from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
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
        the_list = self.get_object()
        is_owner = self.request.user == the_list.user
        is_shared_with = self.request.user in the_list.shared_with.all()

        return is_owner or is_shared_with


class ListDetailView(LoginRequiredMixin, UserOwnsListMixin, DetailView):
    model = List
    template_name = "lists/list_detail.html"
    context_object_name = "list"

    def get_context_data(self, object, **kwargs):
        context = super().get_context_data(**kwargs)
        return {**context, "shared_by": self._get_shared_by(object)}

    def _get_shared_by(self, the_list):
        if the_list.is_shared_with(self.request.user):
            return the_list.user
