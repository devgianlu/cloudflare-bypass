# cloudflare-bypass
![Node.js CI](https://github.com/devgianlu/cloudflare-bypass/workflows/Node.js%20CI/badge.svg)
[![time tracker](https://wakatime.com/badge/github/devgianlu/cloudflare-bypass.svg)](https://wakatime.com/badge/github/devgianlu/cloudflare-bypass)

A NodeJS tool to bypass Cloudflare IUAM v2.

## Disclaimer
The public version of this repository is not being maintained anymore for obvious reasons. If you are interested, contact me privately.

## How it works
The JS challenge (`jsch`) consist of multiple concatenated JavaScript challenges. I am trying to reverse engineer all of them, all the challenges that have been reversed can be seen [here](challanges_source). 

The captcha challenge can be presented after the JS challenge, it consists of JavaScript challenges too, but it includes [78cc909d](challanges_source/78cc909d.js) which loads an hCaptcha and takes the token as result.
