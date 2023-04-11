FROM ghcr.io/michaelhelvey/python-node-x86_64:latest

WORKDIR /code

COPY . .

RUN pipenv sync --dev

RUN pnpm install
RUN pnpm build

RUN pipenv run python ./manage.py collectstatic --noinput

EXPOSE 8000

CMD ["pipenv", "run", "daphne", "-b", "0.0.0.0", "-p", "8000", "base_site.asgi:application"]
