# Generated by Django 4.1.1 on 2022-09-30 14:10

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0004_product_view_x_product_view_y_product_view_z_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sketch',
            name='publish_date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
