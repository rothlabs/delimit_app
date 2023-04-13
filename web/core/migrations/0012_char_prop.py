# Generated by Django 4.1.1 on 2023-04-13 13:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0011_alter_float_prop_key_alter_part_prop_key_delete_key'),
    ]

    operations = [
        migrations.CreateModel(
            name='Char_Prop',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('key', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='core.char_atom')),
                ('part', models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='core.part')),
                ('val', models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='prop_val', to='core.char_atom')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
