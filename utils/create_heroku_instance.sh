#!/bin/bash

#######################
# include util fns
. `dirname $0`/utils.sh
#######################

    APP_VARIANT='-test' # edit this line for a different heroku instance, e.g. -live, or just empty

  BASE_APP_NAME='ftlabs-chatbot'
     
BASE_GIT_HANDLE='heroku'

       APP_NAME="${BASE_APP_NAME}${APP_VARIANT}"
     GIT_HANDLE="${BASE_GIT_HANDLE}${APP_VARIANT}"
         REGION='eu'
            ORG='financial-times'
         ADDONS='logentries'

 GIT_REMOTE_CMD='git remote -v'

    CREATE_ARGS="create ${APP_NAME} --region ${REGION} --remote ${GIT_HANDLE} --org ${ORG}"
    ADDONS_ARGS="addons:create ${ADDONS} --app ${APP_NAME}"

echo "CREATE_ARGS=${CREATE_ARGS}"
echo "ADDONS_ARGS=${ADDONS_ARGS}"

echo "
###"
echo "# before creating heroku instance: ${GIT_REMOTE_CMD}"
echo "###"

$GIT_REMOTE_CMD

echo "
###"
echo "# creating heroku instance: heroku ${CREATE_ARGS}"
echo "###"

heroku $CREATE_ARGS

echo "
###"
echo "# after creating heroku instance: ${GIT_REMOTE_CMD}"
echo "###"

$GIT_REMOTE_CMD

echo "
###"
echo "# adding addons"
echo "###"

heroku $ADDONS_ARGS

echo "
###"
echo "# checking addons: heroku addons --app ${APP_NAME}"
echo "###"

heroku addons --app ${APP_NAME}

echo "
###"
