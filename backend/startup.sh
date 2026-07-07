#!/bin/bash
# Railway deploy trigger
python manage.py migrate
python manage.py create_default_admin
