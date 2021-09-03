# Dynamic Cron

Example Serverless Framework project to run cron tasks as low as once per second using AWS Step Functions with the ability to change the rate on the fly. 

For more information please read this [related article](https://medium.com/@slootjes/dynamic-rate-cron-using-step-functions-91ad1afc8d43).

## Prerequisites
- Serverless Framework
- Configured AWS profile

## Commands

### Deploy

To deploy a new or update an existing stack, run this command:

`serverless deploy`

## Remove

To remove the stack, run this command:

`serverless remove`

## Usage

### Run task

Run the "start" Lambda with the following event to start a task or change the rate on an existing task:

`{"task": "dynamic-cron-dev-task", "rate": 10}`

### Stop task

Run the "stop" Lambda with the following event to stop the task:

`{"task": "dynamic-cron-dev-task"}`
