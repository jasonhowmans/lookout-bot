# Lookout bot

## What is it?
A simple little script that will watch the body of a webpage for changes, then announce when it notices something has changed.

## How to install
After cloning this repository, `cd` to the root directory and run `$ npm install` to install dependencies.

## How to use it
Just call the node watch file with a URL as the only argument. So if I wanted to watch google.com for changes, I'd run:  
`$ node watch 'https://www.google.com'`

## How it works
When the script is first called, it creates master a md5 hash of the page at the given URL. After this, it will make a new request every 10 seconds (the time can be changed by updating the `secondsToWait` variable in watch.js) and check against the master hash. When a change happens, it will use `say` on Mac to announce it to you.
