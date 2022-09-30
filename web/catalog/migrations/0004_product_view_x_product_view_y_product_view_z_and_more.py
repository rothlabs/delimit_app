# Generated by Django 4.1.1 on 2022-09-30 14:08

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_product_glb'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='view_x',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='product',
            name='view_y',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='product',
            name='view_z',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='sketch',
            name='publish_date',
            field=models.DateTimeField(default=datetime.datetime(2022, 9, 30, 14, 8, 49, 409488, tzinfo=datetime.timezone.utc)),
        ),
    ]
