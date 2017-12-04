#!/bin/bash
curl -H "Content-Type: application/json" -X POST -d '{"data":"cow"}' https://shareschedule.herokuapp.com/api/messages
curl -X GET https://shareschedule.herokuapp.com/api/messages
printf "\n"
