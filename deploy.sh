#!/usr/bin/env bash

ssh pootle@vps.suttacentral.net '\
    source "/home/pootle/.pyenv/versions/pootle/bin/activate" &&\
    cd /home/pootle/pootle &&\
    git pull &&\
    ./manage.py migrate &&\
    make assets &&\
    sudo supervisorctl restart pootle\
'
