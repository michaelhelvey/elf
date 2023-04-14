from django.urls import reverse

from app.factories import ListFactory, UserFactory
from app.utils.test import IntegrationTestCase


class ListCreateViewTests(IntegrationTestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_login(self.user)

    def test_a_user_can_view_the_list_create_page(self):
        response = self.client.get(reverse("list_create"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.getBySelectorOrFail(response, "h1").text, "Create a new list")

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


class ListDetailViewTest(IntegrationTestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_login(self.user)

    def test_user_must_be_logged_in_to_view_a_list(self):
        self.client.logout()
        ListFactory(user=self.user)
        response = self.client.get(reverse("list_detail", kwargs={"pk": 1}))
        self.assertRedirects(
            response, self.getLoginNextUrl(reverse("list_detail", kwargs={"pk": 1}))
        )

    def test_user_can_only_view_their_own_lists(self):
        ListFactory(user=self.user)
        other_user = UserFactory()
        other_list = ListFactory(user=other_user)
        response = self.client.get(reverse("list_detail", kwargs={"pk": other_list.pk}))
        self.assertEqual(response.status_code, 403)

    def test_a_user_can_view_items_in_a_list(self):
        the_list = ListFactory(user=self.user)
        item1 = the_list.items.create(title="Item 1")
        item2 = the_list.items.create(title="Item 2")

        response = self.client.get(reverse("list_detail", kwargs={"pk": the_list.pk}))

        self.assertEqual(response.status_code, 200)

        self.assertEqual(self.getBySelectorOrFail(response, "h1").text, the_list.title)
        self.assertEqual(
            self.getBySelectorOrFail(response, f"li[data-item-id='{item1.pk}']").text,
            item1.title,
        )
        self.assertEqual(
            self.getBySelectorOrFail(response, f"li[data-item-id='{item2.pk}']").text,
            item2.title,
        )
