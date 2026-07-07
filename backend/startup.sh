#!/bin/bash
python manage.py migrate
python manage.py create_default_admin
