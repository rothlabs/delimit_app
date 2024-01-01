# Generated by Django 5.0 on 2023-12-29 22:45

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import core.models

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Snap",
            fields=[
                (
                    "digest",
                    models.CharField(max_length=64, primary_key=True, serialize=False),
                ),
                ("content", models.JSONField()),
            ],
        ),
        migrations.CreateModel(
            name="Repo",
            fields=[
                (
                    "id",
                    models.CharField(
                        default=core.models.make_id,
                        max_length=16,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("make_time", models.DateTimeField(auto_now_add=True)),
                ("edit_time", models.DateTimeField(auto_now=True)),
                ("flex", models.JSONField()),
                (
                    "readers",
                    models.ManyToManyField(
                        related_name="readable_repos", to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "writers",
                    models.ManyToManyField(
                        related_name="writable_repos", to=settings.AUTH_USER_MODEL
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Commit",
            fields=[
                (
                    "id",
                    models.CharField(
                        default=core.models.make_id,
                        max_length=16,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("nodes", models.JSONField()),
                ("committed", models.BooleanField(default=False)),
                ("make_time", models.DateTimeField(auto_now_add=True)),
                ("edit_time", models.DateTimeField(auto_now=True)),
                ("flex", models.JSONField()),
                (
                    "authors",
                    models.ManyToManyField(
                        related_name="contributions", to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "committer",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="commits",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "readers",
                    models.ManyToManyField(
                        related_name="readable_commits", to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "roots",
                    models.ManyToManyField(related_name="stems", to="core.commit"),
                ),
                (
                    "writers",
                    models.ManyToManyField(
                        related_name="writable_commits", to=settings.AUTH_USER_MODEL
                    ),
                ),
                (
                    "repo",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="commits",
                        to="core.repo",
                    ),
                ),
            ],
        ),
    ]
