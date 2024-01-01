# Generated by Django 5.0 on 2023-12-30 23:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0004_remove_commit_content"),
    ]

    operations = [
        migrations.CreateModel(
            name="Node",
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
                ("key", models.CharField(max_length=16)),
                (
                    "commit",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="core.commit"
                    ),
                ),
                (
                    "snap",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="core.snap"
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="node",
            constraint=models.UniqueConstraint(
                fields=("commit", "key"), name="commit_node"
            ),
        ),
    ]