import readline from 'node:readline'
import {simpleProjectRootDir} from '@foo-dog/utils'

const readliner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

readliner.question(`Would you like to add the 'li' and 'lo' aliases to your shell? [y] : `, aliasAnswer => {
    console.log(typeof aliasAnswer)
    console.log(aliasAnswer)
    if (aliasAnswer.trim().length === 0 || aliasAnswer.toLowerCase() === "y" || aliasAnswer.toLowerCase() === "yes") {
        console.log(`TODO: add source ${simpleProjectRootDir()}/src/.aliases to .bash_rc`)
    }

    readliner.close();

    console.log("Thanks for installing!")
});
