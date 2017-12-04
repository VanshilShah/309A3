#!/bin/bash
curl -H "Content-Type: application/json" -X POST -d '{"body":"cow"}' https://shareschedule.herokuapp.com/api/messages
curl -H "Content-Type: application/json" -X POST -d '{"body":"chicken"}' https://shareschedule.herokuapp.com/api/messages
curl -H "Content-Type: application/json" -X POST -d '{"body":"pig"}' https://shareschedule.herokuapp.com/api/messages
curl -H "Content-Type: application/json" -X POST -d '{"body":"donkey"}' https://shareschedule.herokuapp.com/api/messages
curl -X GET https://shareschedule.herokuapp.com/api/messages
printf "\n"
