from django.db import models
from django.urls import reverse


class List(models.Model):
    title = models.CharField(max_length=255)
    user = models.ForeignKey("app.User", related_name="lists", on_delete=models.CASCADE)
    shared_with = models.ManyToManyField("app.User", related_name="shared_lists")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse("list_detail", kwargs={"pk": self.pk})

    def is_shared_with(self, user):
        return self.shared_with.filter(pk=user.pk).exists()


class ListItem(models.Model):
    list = models.ForeignKey("app.List", related_name="items", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    purchased = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.list.title}: {self.title}"
