import factory
from allauth.account.models import EmailAddress
from factory.django import DjangoModelFactory

from app.models import User


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
