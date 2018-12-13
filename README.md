# BowlingGame2

This repo is for self practice with typescript and mocha. It also shows a progress of me utilizing VScode tasks (think of them as build tasks) to execute the unit tests.

## Lessons I Learned

### Lessons: Part 1

- the debug node-module can be used in mocha unit tests ...sample: ```import debug from "debug"```
- to focus on a test-suite or test-case, use these: `describe.only`, `it.only` ...see mocha's documentation about [exclusivity](https://mochajs.org/#exclusive-tests) and [inclusivity](https://mochajs.org/#inclusive-tests)
- launch.json is a config file for debugging within VSCode
- tasks.json is a config file for running tasks and even executing the npm scripts defined in package.json (noice)

### Lessons: Part 2

- its a best practice to create a git pre-commit hook to avoid committing any mocha tests with `describe.only` or `describe.skip` in them ...see the following:
    ```bash
    #!/bin/sh
    PATTERN="^\s+(describe|it)\.(only|skip)"
    MESSAGE="Tried to commit mocha tests with .only or .skip; DO NOT DO THAT ANYMORE!"

    if git diff --name-only --cached | xargs grep -Hn --color=always $PATTERN; then
    echo ""
    echo $MESSAGE
    exit 1
    else
    exit 0
    fi
    ```

### when adding a new repo and want to publish on to github.com, use these simple steps

- at local machine and your root project folder, execute this git command: `git init {MY_NEW_REPO}`
- git commit (and you can continue git commit until you're ready to publish)
- open browser to your account at github.com (register and login as required)
- click button to create a new repo
- github.com should display a page to add existing local repo
- execute these git CLI commands to assign the new remote repo with your local repo:
    ```bash
    git remote add origin https://github.com/{MY_ACCOUNT}/{MY_NEW_REPO}.git
    git push -u origin master
    ```

## But I'm still confused about

- how do I use VSCode debugger with its config file launch.json; why it fails to stop at a certain breakpoint when i press F5?

## Ideas

### Design

- [x] redesign the method `TestSubject.playOpenFrame()` so that it takes a callback param? ~~and so that the method can be a standalone function~~
- [x] redesign Frame class and subclasses? why should each Frame instance contain a copy of the same throws array that the BowlingGame also has? ...only BowlingGame class should maintain the throws in an array

### Future Exploration

- [ ] i should learn how to use github's feature to create tags (instead of using branches to create my "tags", which i intended to be simply read-only branches while i continue to commit new code in to the master-branch)