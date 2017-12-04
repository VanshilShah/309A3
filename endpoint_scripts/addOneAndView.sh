#!/bin/bash
curl -H "Content-Type: application/json" -X POST -d '{"body":"cow"}' https://shareschedule.herokuapp.com/api/messages
curl -X GET https://shareschedule.herokuapp.com/api/messages
echo "\n"
