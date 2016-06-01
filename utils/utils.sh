#!/bin/bash

#
# This script specifies assroted util fns
# and lists some how-tos.

##########################
###
# util fns
###

usage()
{
    echo "usage: $0 $*"
    exit 1;
}

error()
{
    echo "error: $*"
    exit 1;
}

debug()
{
    echo "debug: $*"
}

info()
{
    echo "info: $*"
}

###
# assorted how-tos in bash. 
###

## test if a value is empty, and error if so
# [ -z "$RELEASE_ENV" ] && error "RELEASE_ENV unspecified"
##

## test if a dir exists, and error if not
# [ -d $GitReposDir   ] || error "no such GitReposDir=$GitReposDir"
##

## check if there was precisely one arg specified on cmd line when invoking this script, 
## and exit with usage if not
# [ $# -eq 1 ] || usage
# ProjectName="$1"
##

## loop over a list of values, doing something to each one
# for DIR in space separated \
#            sequence of words ; do
#     do_somthing($DIR)
# done
##

## run a shell cmd and capture the STDOUT
# FRED=`which ruby`
##

