from django.urls import reverse

from app.factories import UserFactory
from app.utils.test import IntegrationTestCase


class ListCreateViewTests(IntegrationTestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_login(self.user)

    def test_a_user_can_create_a_list(self):
        response = self.client.post(reverse("list_create"), {"title": "My Great List"})
        self.assertEqual(self.user.lists.count(), 1)

        the_list = self.user.lists.first()
        self.assertEqual(the_list.title, "My Great List")

        self.assertRedirects(response, the_list.get_absolute_url())

    def test_list_create_view_requires_user_login(self):
        self.client.logout()
        response = self.client.get(reverse("list_create"))
        self.assertRedirects(response, self.getLoginNextUrl(reverse("list_create")))
