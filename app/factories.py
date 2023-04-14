import factory
from allauth.account.models import EmailAddress
from factory.django import DjangoModelFactory

from app.models import List, ListItem, User


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.LazyAttribute(
        lambda user: f"{user.first_name.lower()}.{user.last_name.lower()}@email.com"
    )
    password = factory.PostGenerationMethodCall("set_password", "password")

    @factory.post_generation
    def create_email(self, create, extracted, **kwargs):
        if not create:
            return

        EmailAddress.objects.create(user=self, email=self.email, primary=True, verified=True)


class ListFactory(DjangoModelFactory):
    class Meta:
        model = List

    user = factory.SubFactory(UserFactory)
    title = factory.Faker("sentence", nb_words=3)


class ListItemFactory(DjangoModelFactory):
    class Meta:
        model = ListItem

    list = factory.SubFactory(ListFactory)
    title = factory.Faker("sentence", nb_words=3)
    notes = factory.Faker("paragraph", nb_sentences=3)
    purchased = factory.Faker("boolean")
