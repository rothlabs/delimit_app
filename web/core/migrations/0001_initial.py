# Generated by Django 4.1.1 on 2023-11-15 19:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Repo",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("repo", models.CharField(default="", max_length=16)),
                ("team", models.CharField(default="", max_length=16)),
                ("name", models.CharField(default="", max_length=64)),
                (
                    "description",
                    models.TextField(blank=True, default="", max_length=512),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Team",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("team", models.CharField(default="", max_length=16)),
                ("name", models.CharField(default="", max_length=64)),
                (
                    "description",
                    models.TextField(blank=True, default="", max_length=512),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Account",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("gdb_user", models.CharField(default="", max_length=16)),
                ("gdb_key", models.CharField(default="", max_length=16)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
