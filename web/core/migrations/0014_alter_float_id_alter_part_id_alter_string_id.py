# Generated by Django 4.1.1 on 2023-04-17 13:04

import core.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0013_string_rename_val_float_v_remove_part_chars_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='float',
            name='id',
            field=models.CharField(default=core.models.random_id, max_length=16, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='part',
            name='id',
            field=models.CharField(default=core.models.random_id, max_length=16, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='string',
            name='id',
            field=models.CharField(default=core.models.random_id, max_length=16, primary_key=True, serialize=False),
        ),
    ]