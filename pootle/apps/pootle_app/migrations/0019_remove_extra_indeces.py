# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2017-06-02 16:53
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pootle_app', '0018_set_directory_base_manager_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='permissionset',
            name='user',
            field=models.ForeignKey(db_index=False, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
