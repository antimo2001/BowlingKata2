# BowlingGame2

This repo is for self practice with typescript and mocha. It also shows a progress of me utilizing VScode tasks (think of them as build tasks) to execute the unit tests.

## Lessons I Learned

### Lessons: Part 1

- the debug node-module can be used in mocha unit tests ...sample: ```import debug from "debug"```
- to focus on a test-suite or test-case, use these: `describe.only()`, `it.only()` ...see mocha's documentation about [exclusivity](https://mochajs.org/#exclusive-tests) and [inclusivity](https://mochajs.org/#inclusive-tests)
- launch.json is a config file for debugging within VSCode
- tasks.json is a config file for running tasks and even executing the npm scripts defined in package.json (noice)

### Lessons: Part 2

- its a best practice to create a git pre-commit hook to avoid committing any mocha tests with `describe.only()` or `describe.skip()` in them ...see the following:
    ```bash
    #!/bin/sh
    PATTERN="describe\.only\(\|it\.only\(|describe\.skip\(|it\.skip\("
    MESSAGE="Tried to commit mocha tests with .only or .skip; DO NOT DO THAT ANYMORE!"

    if git diff --name-only --cached | xargs grep -Hn --color=always $PATTERN; then
      echo ""
      echo $MESSAGE
      exit 1
    else
      exit 0
    fi
    ```
- Hint: use grep and the perl regex like this: `grep -Hn --color=always  -P "\s*(describe|it)\.(only|skip)\("  test/*.test.ts`

### Do you ever want to use a repl of typescript?

See [ts-node](https://www.npmjs.com/package/ts-node).  I also made an npm script to start one in this repo: `npm run tsc-repl`

### How to create a tag

To create a git tag, simply create a release at github.com and it prompts you to name the release, which also gives recommendations to the naming convention of tags (which I'm already used to semnatic versioning: see sample: `v1.2.3`)

### When adding a new repo and want to publish on to github.com, use these simple steps

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

### VSCode extension: Trigger On Save

My Review of the VSCode Extension: TriggerTaskOnSave

3 stars
This does successfully execute my tasks. However, it'd be helpful if the fileglob configuration was more intuitive. I have a simple typescript build/test workflow, but it took me some time to realize that the task was failing to trigger because I needed to configure the fileglobs. My package.json defines the fileglobs just fine. I had to configure it with a very generic glob: `**/**`. Also, I had an issue with disabling the trigger; sometimes I wouldn't want the trigger to execute because I'm still typing code. I would use the command-palette command to disable the trigger, but it still executes. Then I tried the toggle command (it still ran!). Then I tried clearing the selected task (but...it...still...triggered...) I had to go the workspace settings and modify the fileglob config (since I learned the hard way that definitely stops the trigger from firing).

TL;DR ...2 major issues ...fileglob config fails to be simple (or is poorly documented) ...disabling the trigger fails to consistently disable the trigger (even removing the selected task still caused it to trigger)

## But I'm still confused about

- how do I use VSCode debugger with its config file launch.json; why it fails to stop at a certain breakpoint when i press F5?

## Ideas

### Design

- [x] redesign the method `TestSubject.playOpenFrame()` so that it takes a callback param? ~~and so that the method can be a standalone function~~
- [x] redesign Frame class and subclasses? why should each Frame instance contain a copy of the same throws array that the BowlingGame also has? ...only BowlingGame class should maintain the throws in an array
- [x] refactor classes for 2 goals; new interface: `Scorable` that represents a `score` and so that the BowlingGame only has 10 instances of Frame class ...the prior design could have 10 frames with 2 BonusFrame instances, so up to 12 frames per game ...which is weird and doesn't represent a real bowling game of 10 frames
- [x] refactor so that all of BowlingGame class's methods are async!
- [ ] refactor so that Frame classes utilize Decorator pattern
- [ ] user-interface? maybe look at [www.bowlinggenius.com](http://www.bowlinggenius.com) for ideas to improve upon

### Future Exploration

- [x] i should learn how to use github's feature to create tags (instead of using branches to create my "tags", which i intended to be simply read-only branches while i continue to commit new code in to the master-branch) ...how do tags in git work? why doesn't Github Desktop have an easy button for tagging?
- [x] note-to-future-self: do **not** redesign using generator functions! Generators are most useful for a sequence to iterate thru **lazily** and **once** (think event-streams)!
