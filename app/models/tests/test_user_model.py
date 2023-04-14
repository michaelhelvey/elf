import pytest
from django.test import TestCase

from app.factories import UserFactory
from app.models import User


class UserTestCase(TestCase):
    def test_user_create_requires_email(self):
        with pytest.raises(ValueError) as error:
            User.objects.create_user(None)

        self.assertEqual(str(error.value), "The email field is required")

    def test_can_create_user(self):
        email = "example@example.com"
        user = User.objects.create_user(email, password="1234")
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.email, email)

    def test_can_create_superuser(self):
        email = "example@examplesuperuser.com"
        user = User.objects.create_superuser(email, password="1234")
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.email, email)

    def test_user_name(self):
        user = UserFactory.build(first_name="Michael", last_name="Scott")
        self.assertEqual(user.name, "Michael Scott")

    def test_user_str(self):
        user = UserFactory.build(
            first_name="Michael",
            last_name="Scott",
            email="michael.scott@dmifflin.com",
        )
        self.assertEqual(str(user), "Michael Scott <michael.scott@dmifflin.com>")
