#!/usr/bin/env bash

POOTLE_DIR=/home/pootle/pootle
VIRTUALENV="/home/pootle/.pyenv/versions/pootle"
source "$VIRTUALENV/bin/activate"

trap 'kill $(jobs -p)' EXIT

cd $POOTLE_DIR
./manage.py rqworker &

sleep 0.5

./manage.py run_cherrypy --port=8088
pootle@linode:~$ cat daemonize.sh 
#!/usr/bin/env bash

POOTLE_DIR=/home/pootle/pootle
VIRTUALENV="/home/pootle/.pyenv/versions/pootle"
source "$VIRTUALENV/bin/activate"

trap 'kill $(jobs -p)' EXIT

cd $POOTLE_DIR
./manage.py rqworker &

sleep 0.5

./manage.py run_cherrypy --port=8088
