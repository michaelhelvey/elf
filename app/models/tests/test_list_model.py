from django.test import TestCase

from app.factories import ListFactory, ListItemFactory, UserFactory


class TestList(TestCase):
    def test_a_user_has_lists(self):
        user = UserFactory()
        self.assertEqual(user.lists.count(), 0)

    def test_a_list_is_formatted_by_title(self):
        the_list = ListFactory(title="My Great List")
        self.assertEqual(str(the_list), "My Great List")

    def test_list_has_items(self):
        the_list = ListFactory()
        self.assertEqual(the_list.items.count(), 0)

    def test_list_item_is_formatted_by_list_and_text(self):
        the_list = ListFactory(title="Christmas 2022")
        item = ListItemFactory(title="My Great Item", list=the_list)
        self.assertEqual(str(item), "Christmas 2022: My Great Item")

    def test_a_user_can_share_lists(self):
        user = UserFactory()
        other_user = UserFactory()
        the_list = ListFactory(user=user)
        the_list.shared_with.add(other_user)
        self.assertEqual(the_list.shared_with.count(), 1)
        self.assertEqual(the_list.shared_with.first(), other_user)

    def test_shared_by_returns_true_if_list_is_shared(self):
        user = UserFactory()
        other_user = UserFactory()
        the_list = ListFactory(user=user)
        the_list.shared_with.add(other_user)
        self.assertTrue(the_list.is_shared_with(other_user))
