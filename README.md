# BowlingGame2

This repo is for self practice with typescript and mocha. It also shows a progress of me utilizing VScode tasks (think of them as build tasks) to execute the unit tests.

## Lessons Learned

- to focus on a test-suite or test-case, use these: `describe.only(...)`, `it.only(...)`
- tasks.json is a config file for running tasks and even executing the npm scripts defined in package.json (noice)
- the debug node-module can be used in mocha unit tests ...sample: ```import debug from "debug"```
- launch.json is a config file for debugging within VSCode

## Still Confused About

- launch.json and why it fails to stop a certain breakpoint when i press F5
