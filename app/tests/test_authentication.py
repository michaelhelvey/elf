import re

from allauth.account.models import EmailAddress
from django.shortcuts import reverse

from app.factories import UserFactory
from app.models import User
from app.utils.test import IntegrationTestCase


class UserHomePageTest(IntegrationTestCase):
    def test_home_page_shows_login_link_to_logged_out_user(self):
        response = self.client.get(reverse("home"))
        login_link = self.getBySelectorOrFail(response, "a#login-link")
        self.assertEqual(login_link.text.strip(), "Log In")

        self.assertSelectorDoesNotExist(response, "a#logout-link")
        self.assertLinkGoesToUrl(response, "a#login-link", reverse("account_login"))

    def test_home_page_shows_log_out_link_to_logged_in_user(self):
        user = UserFactory()
        self.client.force_login(user)

        response = self.client.get(reverse("home"))
        self.assertSelectorDoesNotExist(response, "a#login-link")
        self.assertLinkGoesToUrl(response, "a#logout-link", reverse("account_logout"))


class LoginTest(IntegrationTestCase):
    def test_user_can_log_in(self):
        passwd = "1234"
        user = UserFactory(password=passwd)

        response = self.client.get(reverse("account_login"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.getSoup(response).title.text.strip(), "Log In")

        response = self.client.post("/accounts/login/", {"login": user.email, "password": passwd})

        # On successful login, the user should be redirected to the profile page
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("profile"))

    def test_user_login_page_links(self):
        response = self.client.get(reverse("account_login"))

        self.assertEqual(response.status_code, 200)
        self.assertPageHasTitle(response, "Log In")

        # assert that we have a valid link to the sign up page
        self.assertLinkGoesToUrl(response, "a#create-account-link", reverse("account_signup"))


class CreateAccountTest(IntegrationTestCase):
    def test_user_can_create_account_and_verify_email(self):
        url = reverse("account_signup")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertPageHasTitle(response, "Create Account")

        passwd = "asdf1234*"
        user_form = UserFactory.build(password=passwd)

        response = self.client.post(
            url,
            {
                "email": user_form.email,
                "first_name": user_form.first_name,
                "last_name": user_form.last_name,
                "password1": passwd,
                "password2": passwd,
            },
        )

        user = User.objects.get(email=user_form.email)
        email_addr = EmailAddress.objects.get(email=user_form.email)

        self.assertEqual(email_addr.verified, False)

        self.assertEqual(user.email, user_form.email)
        self.assertEqual(user.first_name, user_form.first_name)
        self.assertEqual(user.last_name, user_form.last_name)
        self.assertEqual(user.is_active, True)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("account_email_verification_sent"))

        response = self.client.get(response.url)
        self.assertPageHasTitle(response, "Verify Your Email Address")

        email = self.getLastEmail()
        license_link_regex = r"go to (http:.*/accounts/confirm-email/.*)\n"
        license_link = re.search(license_link_regex, email.body).group(1)

        response = self.client.get(license_link)
        self.assertEqual(response.status_code, 200)

        self.assertPageHasTitle(response, "Confirm Email Address")
        self.assertEqual(
            self.getBySelectorOrFail(response, "button#confirm-address-button").text,
            "Confirm",
        )

        # We expect the user to be logged in when the confirm their email:
        self.client.force_login(user)

        response = self.client.post(license_link)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("profile"))

        email_addr.refresh_from_db()
        self.assertEqual(email_addr.verified, True)


class UserLogOutTest(IntegrationTestCase):
    def test_when_a_user_is_logged_out_they_are_redirected_to_the_home_page(
        self,
    ):
        response = self.client.get(reverse("account_logout"))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("home"))

    def test_user_can_log_out(self):
        user = UserFactory()
        self.client.force_login(user)

        url = reverse("account_logout")

        response = self.client.get(url)
        self.assertTrue(response.context["user"].is_authenticated)

        self.assertEqual(response.status_code, 200)
        self.assertPageHasTitle(response, "Log Out")
        self.assertEqual(self.getBySelectorOrFail(response, "h1").text.strip(), "Log Out")

        response = self.client.post(url)
        self.assertEqual(response.status_code, 302)

        response = self.client.get(response.url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.context["user"].is_authenticated)


class PasswordResetTest(IntegrationTestCase):
    def test_user_can_reset_password(self):
        user = UserFactory(password="1234")
        self.assertTrue(user.check_password("1234"))

        url = reverse("account_reset_password")
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertPageHasTitle(response, "Reset Password")

        response = self.client.post(url, {"email": user.email})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("account_reset_password_done"))

        response = self.client.get(response.url)
        self.assertPageHasTitle(response, "Password Reset Sent")
        self.assertLinkGoesToUrl(response, "a#home-link", reverse("home"))

        email = self.getLastEmail()
        reset_link_regex = r"reset your password.\s+(http:.*/accounts/password/reset/key/.*)\n"
        reset_link = re.search(reset_link_regex, email.body).group(1)

        response = self.client.get(reset_link)
        # If the key is valid, the user should be redirected to the reset page
        self.assertEqual(response.status_code, 302)

        response = self.client.get(response.url)
        self.assertEqual(response.status_code, 200)
        self.assertPageHasTitle(response, "Reset Password")
        self.assertEqual(
            self.getBySelectorOrFail(response, "h1").text.strip(),
            "Reset Password",
        )

        new_password = "zaxscf145*^^"
        response = self.client.post(
            response.context["action_url"],
            {"password1": new_password, "password2": new_password},
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("account_reset_password_from_key_done"))

        response = self.client.get(response.url)
        self.assertPageHasTitle(response, "Password Reset Successful")
