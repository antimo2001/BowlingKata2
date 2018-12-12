# BowlingGame2

This repo is for self practice with typescript and mocha. It also shows a progress of me utilizing VScode tasks (think of them as build tasks) to execute the unit tests.

## Lessons I Learned

- to focus on a test-suite or test-case, use these: `describe.only(...)`, `it.only(...)`
- tasks.json is a config file for running tasks and even executing the npm scripts defined in package.json (noice)
- the debug node-module can be used in mocha unit tests ...sample: ```import debug from "debug"```
- launch.json is a config file for debugging within VSCode
- when adding a new repo and i want to publish on to github.com, i can follow some simple steps:
    1) at your local machine execute `git init {MY_NEW_REPO}`
    2) git commit (and you can continue git commit until you're ready to publish)
    3) open browser to your account at github.com (register and login as required)
    4) click button to create a new repo
    5) github.com should display a page to add existing local repo
    6) execute the git CLI commands to assign the new remote repo with your local repo: these are the CLI commands:
        ```git
        git remote add origin https://github.com/{MY_ACCOUNT}/{MY_NEW_REPO}.git
        git push -u origin master
        ```

## But I'm still confused about

- how do I use VSCode debugger with its config file launch.json; why it fails to stop at a certain breakpoint when i press F5?

## Ideas

- [x] redesign the method `TestSubject.playOpenFrame()` so that it takes a callback param? and so that the method can be a standalone function
- [ ] redesign Frame class and subclasses? why should each Frame instance contain a copy of the same throws array that the BowlingGame also has? ...only BowlingGame class should maintain the throws in an array