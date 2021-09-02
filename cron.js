'use strict';

const aws = require('aws-sdk');
const stepFunctions = new aws.StepFunctions({apiVersion: '2016-11-23'});

const maximumIterations = 1000; // we stay on the safe side here
const secondsInYear = 365 * 24 * 3600; // we do not (need to) take leap years into account

module.exports.start = async (event) => {
    await startExecution(event.task, event.rate);
};

module.exports.stop = async (event) => {
    const response = await listExecutions();
    let executions = response.executions.filter(execution => execution.name.startsWith(`${event.task}_`));

    // make sure we don't kill of our own execution
    if (event.executionId) {
        executions = executions.filter(execution => execution.executionArn !== event.executionId);
    }

    const work = [];
    executions.forEach(execution => work.push(stopExecution(execution.executionArn, event.rate || null)));
    await Promise.all(work);

    return event;
};

module.exports.calculateIterations = async (event) => {
    return new Array(Math.floor(Math.min(secondsInYear / event.rate, maximumIterations)));
};

module.exports.restart = async (event) => {
    await startExecution(event.task, event.rate);

    return event;
};

function startExecution(task, rate) {
    return stepFunctions.startExecution({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        name: `${task}_${+new Date}`,
        input: JSON.stringify({
            task: task,
            rate: rate
        }),
    }).promise();
}

function listExecutions() {
    return stepFunctions.listExecutions({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        statusFilter: 'RUNNING',
        maxResults: 1000
    }).promise();
}

function stopExecution(executionArn, rate) {
    return stepFunctions.stopExecution({
        executionArn: executionArn,
        error: 'forced stop',
        cause: rate ? `rate changed to ${rate} seconds` : 'manual stop'
    }).promise();
}
