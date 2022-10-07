# Generated by Django 4.1.2 on 2022-10-07 16:42

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('date', models.DateTimeField(default=django.utils.timezone.now)),
                ('file', models.FileField(default='product/default.glb', upload_to='product')),
                ('view_x', models.FloatField(default=100)),
                ('view_y', models.FloatField(default=100)),
                ('view_z', models.FloatField(default=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Sketch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('date', models.DateTimeField(default=django.utils.timezone.now)),
                ('file', models.FileField(default='sketch/default.svg', upload_to='sketch')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Shoe',
            fields=[
                ('product_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='catalog.product')),
                ('heel_height', models.FloatField(default=0.5)),
                ('sketch_xy', models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='sketch_xy', to='catalog.sketch', verbose_name='Top Sketch')),
                ('sketch_yz', models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, related_name='sketch_yz', to='catalog.sketch', verbose_name='Side Sketch')),
            ],
            options={
                'abstract': False,
            },
            bases=('catalog.product', models.Model),
        ),
    ]
