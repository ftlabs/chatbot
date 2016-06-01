#!/bin/bash

echo "Sigh.
Because Windows is having a problem with pretty much everything to do with this project, 
this script is to start a bare-bones, local hubot instance on a windows box. 
It should be good enough to run the various packages, 
e.g. \"@ft price BT\"."

# NB. you need to have removed the entry for hubot-gtalk from package.json

ASSORTED_NODE_MODULES='node_modules/.bin:node_modules/hubot/node_modules/.bin'
PATH="$ASSORTED_NODE_MODULES:$PATH" ; node_modules/.bin/hubot --name ft