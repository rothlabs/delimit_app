# Generated by Django 4.1.1 on 2023-05-04 16:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_alter_part_bool_n_alter_part_bool_p_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='part_bool',
            old_name='p',
            new_name='r',
        ),
        migrations.RenameField(
            model_name='part_float',
            old_name='p',
            new_name='r',
        ),
        migrations.RenameField(
            model_name='part_int',
            old_name='p',
            new_name='r',
        ),
        migrations.RenameField(
            model_name='part_part',
            old_name='p',
            new_name='r',
        ),
        migrations.RenameField(
            model_name='part_string',
            old_name='p',
            new_name='r',
        ),
        migrations.RenameField(
            model_name='part_user',
            old_name='p',
            new_name='r',
        ),
    ]