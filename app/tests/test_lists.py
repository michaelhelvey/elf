from django.urls import reverse

from app.factories import ListFactory, UserFactory
from app.models import List
from app.utils.test import IntegrationTestCase


class HomeViewTests(IntegrationTestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_login(self.user)

    def test_logged_in_user_sees_owned_and_shared_lists(self):
        owned_list = ListFactory(user=self.user)
        shared_list = ListFactory()
        shared_list.shared_with.add(self.user)

        response = self.client.get(reverse("home"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.getBySelectorOrFail(response, "#my-lists h2").text.strip(), "My Lists"
        )
        self.assertEqual(
            self.getBySelectorOrFail(response, "#shared-lists h2").text.strip(), "Shared With Me"
        )
        self.assertEqual(
            self.getBySelectorOrFail(
                response, f"article[data-list-id='{owned_list.pk}'] h1"
            ).text.strip(),
            owned_list.title,
        )
        self.assertEqual(
            self.getBySelectorOrFail(
                response, f'article[data-list-id="{shared_list.pk}"] h1'
            ).text.strip(),
            shared_list.title,
        )

    def test_lists_empty_state(self):
        response = self.client.get(reverse("home"))

        # sanity check that the user doesn't have any lists to show
        self.assertEqual(List.objects.filter(user=self.user).count(), 0)
        self.assertEqual(self.user.lists.count(), 0)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.getBySelectorOrFail(response, "#my-lists #empty-lists-text").text,
            "You don't have any lists yet.",
        )
        self.assertEqual(
            self.getBySelectorOrFail(response, "#shared-lists #empty-lists-text").text,
            "No lists have been shared with you yet.",
        )


class ListCreateViewTests(IntegrationTestCase):
    def setUp(self):
        self.user = UserFactory()
        self.client.force_login(self.user)

    def test_a_user_can_view_the_list_create_page(self):
        response = self.client.get(reverse("list_create"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.getBySelectorOrFail(response, "h1").text, "New List")

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


class ListDetailViewTests(IntegrationTestCase):
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

    def test_user_cannot_view_lists_owned_by_others(self):
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

        self.assertIsNone(self.getBySelector(response, "div#share-message"))

    def test_a_user_can_view_lists_shared_with_them(self):
        other_user = UserFactory()
        the_list = ListFactory(user=other_user)
        the_list.shared_with.add(self.user)

        response = self.client.get(reverse("list_detail", kwargs={"pk": the_list.pk}))

        self.assertEqual(response.status_code, 200)

        self.assertEqual(self.getBySelectorOrFail(response, "h1").text, the_list.title)
        self.assertEqual(
            self.getBySelectorOrFail(response, "div#share-message").text,
            f"Shared with you by {other_user.name}",
        )
