#!/bin/bash

# invoke this script as a source from the main project dir, e.g. ". utils/export_env.sh"

#######################
# include util fns
. utils/utils.sh
#######################

DOTENV_FILE=.env

[ -e $DOTENV_FILE ] || error "no $DOTENV_FILE in current dir"

for A in $(cat $DOTENV_FILE); do echo $A; export $A; done