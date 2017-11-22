# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-17 17:54
from __future__ import unicode_literals

import logging
import time

from django.db import migrations


logger = logging.getLogger(__name__)


def remove_create_subs(apps, schema_editor):
    subs = apps.get_model("pootle_statistics.Submission").objects.all()
    # type 10 is the now deleted SubmissionTypes.UNIT_CREATE
    to_delete = subs.filter(type=10)
    total = to_delete.count()
    offset = 0
    step = 10000
    start = time.time()

    while True:
        subs_chunk = to_delete[:step]
        to_delete.filter(
            id__in=set(
                subs_chunk.values_list("id", flat=True))).delete()
        logger.debug(
            "deleted %s/%s in %s seconds"
            % (offset + step, total, (time.time() - start)))
        if offset > total:
            break
        offset = offset + step


class Migration(migrations.Migration):

    dependencies = [
        ('pootle_store', '0035_set_created_by_again'),
        ('pootle_statistics', '0011_cleanup_submissions'),
    ]

    operations = [
        migrations.RunPython(remove_create_subs),
    ]
