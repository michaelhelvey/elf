from bs4 import BeautifulSoup
from bs4.element import Tag
from django.core import mail
from django.test import TestCase as DjangoTestCase


class IntegrationTestCase(DjangoTestCase):
    def getBySelectorOrFail(self, response, selector) -> Tag:
        element = self.getBySelector(response, selector)
        self.assertIsNotNone(element)
        self.assertIsInstance(element, Tag)

        return element

    def getBySelector(self, response, selector) -> Tag:
        soup = self.getSoup(response)
        element = soup.select_one(selector)
        return element

    def getSoup(self, response):
        return BeautifulSoup(response.content, "html.parser")

    def formErrors(self, response):
        self.assertTrue("form" in response.context_data, "No form in context")
        return response.context_data["form"].errors

    def assertLinkGoesToUrl(self, response, selector, url):
        link = self.getBySelectorOrFail(response, selector)
        response = self.client.get(link["href"])

        # In asserting that a link goes to a URL, if the response is a redirect,
        # then it will have a "url" property we can check (and we can trust that
        # the browser will follow it).  If it's not a redirect, then we can't
        # check the "url" property, because TemplateResponse doesn't have one,
        # but we can assume that a successful response to a request for a
        # specific path will "be" at that path.
        self.assertTrue(response.status_code < 400)
        response_url = response.url if hasattr(response, "url") else response._request.path_info
        self.assertEqual(response_url, url)

    def assertSelectorDoesNotExist(self, response, selector):
        element = self.getBySelector(response, selector)
        self.assertIsNone(element)

    def assertPageHasTitle(self, response, title):
        self.assertEqual(self.getSoup(response).title.text.strip(), title)

    def getLastEmail(self):
        self.assertEqual(len(mail.outbox), 1)
        return mail.outbox[0]
