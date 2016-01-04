#!/bin/bash

cd pootle/translations
git push

ssh pootle@vps.suttacentral.net '\
    /usr/bin/ionice -c 2 -n 7 -p$$ &&\
    source "/home/pootle/.pyenv/versions/pootle/bin/activate" &&\
    cd /home/pootle/translations &&\
    git pull &&\
    cd /home/pootle/pootle &&\
    /usr/bin/nice ./manage.py update_stores\
'

