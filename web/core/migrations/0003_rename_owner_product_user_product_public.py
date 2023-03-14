# Generated by Django 4.1.1 on 2023-03-12 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_product_owner_alter_product_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='owner',
            new_name='user',
        ),
        migrations.AddField(
            model_name='product',
            name='public',
            field=models.BooleanField(default=False),
        ),
    ]
