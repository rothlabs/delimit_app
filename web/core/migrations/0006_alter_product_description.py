# Generated by Django 4.1.1 on 2023-03-15 19:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_rename_user_product_owner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
    ]
