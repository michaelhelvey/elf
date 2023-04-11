import os

from django.conf import settings
from django.shortcuts import render
from django.views.generic import View

"""
Developer-only views for testing email templates.
"""

template_dir = os.path.join(settings.BASE_DIR, "app", "templates", "email")


class EmailListView(View):
    async def get(self, request, *args, **kwargs):
        files = filter(lambda x: x.is_file(), os.scandir(template_dir))
        return render(
            request,
            "email/dev/list_emails.html",
            {"files": map(lambda x: x.name, files)},
        )


class EmailDetailView(View):
    async def get(self, request, *args, **kwargs):
        template = os.path.join(template_dir, kwargs["slug"])
        return render(request, template)
