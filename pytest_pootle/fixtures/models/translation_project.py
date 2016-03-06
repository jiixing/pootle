#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (C) Pootle contributors.
#
# This file is a part of the Pootle project. It is distributed under the GPL3
# or later license. See the LICENSE file for a copy of the license and the
# AUTHORS file for copyright and authorship information.

import shutil

import pytest


def _require_tp(language, project):
    """Helper to get/create a new translation project."""
    from pootle_translationproject.models import create_translation_project

    return create_translation_project(language, project)


def _require_tp_with_obsolete_dir(language, project):
    """Helper to get/create a translation project in obsolete state."""
    from pootle_translationproject.models import create_translation_project

    tp = create_translation_project(language, project)
    tp.directory.makeobsolete()

    return tp


@pytest.fixture
def afrikaans_tutorial(afrikaans, tutorial):
    """Require Afrikaans Tutorial."""
    return _require_tp(afrikaans, tutorial)


@pytest.fixture
def arabic_tutorial_obsolete(arabic, tutorial):
    """Require Arabic Tutorial in obsolete state."""
    return _require_tp_with_obsolete_dir(arabic, tutorial)


@pytest.fixture
def english_tutorial(english, tutorial):
    """Require English Tutorial."""
    return _require_tp(english, tutorial)


@pytest.fixture
def french_tutorial(french, tutorial):
    """Require French Tutorial."""
    return _require_tp(french, tutorial)


@pytest.fixture
def spanish_tutorial(spanish, tutorial):
    """Require Spanish Tutorial."""
    return _require_tp(spanish, tutorial)


@pytest.fixture
def italian_tutorial(italian, tutorial):
    """Require Italian Tutorial."""
    return _require_tp(italian, tutorial)


@pytest.fixture
def russian_tutorial(russian, tutorial):
    """Require Russian Tutorial."""
    return _require_tp(russian, tutorial)


@pytest.fixture
def afrikaans_vfolder_test(afrikaans, vfolder_test):
    """Require Afrikaans Virtual Folder Test."""
    return _require_tp(afrikaans, vfolder_test)


def get_project_checkers():
    from translate.filters import checks

    return ['standard'] + list(checks.projectcheckers.keys())


@pytest.fixture(params=get_project_checkers())
def tp_checker_tests(request, english):
    from pytest_pootle.factories import ProjectFactory

    checker_name = request.param
    project = ProjectFactory(
        checkstyle=checker_name,
        source_language=english)

    def _remove_project_directory():
        shutil.rmtree(project.get_real_path())
    request.addfinalizer(_remove_project_directory)

    return (checker_name, project)
