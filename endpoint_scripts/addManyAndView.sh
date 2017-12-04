#!/bin/bash
curl -H "Content-Type: application/json" -X POST -d '{"data":"cow"}' https://shareschedule.herokuapp.com/api/messages
curl -H "Content-Type: application/json" -X POST -d '{"data":"chicken"}' https://shareschedule.herokuapp.com/api/messages
curl -H "Content-Type: application/json" -X POST -d '{"data":"pig"}' https://shareschedule.herokuapp.com/api/messages
curl -H "Content-Type: application/json" -X POST -d '{"data":"donkey"}' https://shareschedule.herokuapp.com/api/messages
curl -X GET https://shareschedule.herokuapp.com/api/messages
printf "\n"
