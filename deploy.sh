#!/usr/bin/env bash

git push
ssh pootle@vps.suttacentral.net '\
    source "/home/pootle/.pyenv/versions/pootle/bin/activate" &&\
    cd /home/pootle/pootle &&\
    git pull &&\
    pip install -r requirements/dev.txt &&\
    ./manage.py migrate &&\
    make assets &&\
    sudo supervisorctl restart pootle\
'
