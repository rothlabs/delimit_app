# Generated by Django 4.1.1 on 2023-04-13 20:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_remove_char_parts_remove_float_parts_part_chars_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='parts',
            field=models.ManyToManyField(blank=True, related_name='products', to='core.part'),
        ),
    ]