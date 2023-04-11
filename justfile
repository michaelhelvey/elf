default:
	pnpm dev &
	pipenv run python manage.py runserver

format:
	pipenv run black -l 100 .

alias mm := makemigrations
makemigrations:
	pipenv run python ./manage.py makemigrations

migrate:
	pipenv run python ./manage.py migrate

alias t := test
test *ARGS:
	pipenv run pytest {{ARGS}}

test_coverage *ARGS:
	pipenv run pytest --cov {{ARGS}}

lint:
	pipenv run ruff .

fixtures:
	pipenv run python ./manage.py loaddata base

alias s := shell
shell:
	pipenv run python ./manage.py shell_plus --ipython

static-dev:
	pnpm dev

urls:
	pipenv run python ./manage.py show_urls

install:
	pipenv sync --dev
	pnpm install
	pnpm build
	pipenv run python ./manage.py collectstatic --no-input
