# Assembly Voting JS Client

![Code coverage](https://raw.githubusercontent.com/aion-dk/js-client/main/.github/coverage_badge.svg)

Javascript API for building voter-facing election applications.

## Installing

Install directly from Github into your Javascript project.

```
npm install @aion-dk/js-client
```

## Documentation

https://aion-dk.github.io/js-client/

### Optional docker setup

```bash
$ bin/docker-build
$ bin/docker-sh
```

## Testing

To run tests:

```
yarn run test
````

To run the Benaloh flow and walkthrough test:

Delete the `.skip` instruction on line 9, in the test/benaloh_flow.test.ts, and on lines 11 and 90, in test/walkthrough.test.ts, and make sure you have Devbox’s services running and seeded.

```
yarn run test
````

To run the tests in watch mode:

```
yarn run tdd
```

To generate HTML documentation for external usage:

```
yarn run docs
```

## Publishing

```bash
$ bin/publish
```

## Sequence of client method calls, when everything works, and voter does not test encryption

[![](https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5cbmF1dG9udW1iZXJcblxucGFydGljaXBhbnQgdm90ZXIgYXMgVm90ZXJcbnBhcnRpY2lwYW50IGluYm94IGFzIEVtYWlsIDxicj4gaW5ib3hcblxucGFydGljaXBhbnQgYXBwIGFzIEFCQyBhcHBcbnBhcnRpY2lwYW50IGF2IGFzIEFWIGxpYnJhcnlcblxuYXBwIC0-PiB2b3RlcjogYXNrcyBmb3IgYmFsbG90IHJldHVybiBtZXRob2RcbnZvdGVyIC0-PiBhcHA6IGRpZ2l0YWxcbmFwcCAtPj4rIGF2OiBuZXcgQVZDbGllbnQodXJsKVxuYXYgLT4-LSBhcHA6IGNsaWVudFxuYXBwIC0-PisgYXY6IGNsaWVudC5yZXF1ZXN0QWNjZXNzQ29kZShvcGFxdWVWb3RlcklkLCBlbWFpbClcbmF2IC0-Pi0gYXBwOiBPS1xuYXBwIC0-PiB2b3RlcjogQ2hlY2sgZW1haWwsIGVudGVyIGFjY2VzcyBjb2RlXG52b3RlciAtPj4gaW5ib3g6IGNoZWNrcyBmb3IgYWNjZXNzIGNvZGVcbmluYm94IC0-PiB2b3RlcjogYWNjZXNzIGNvZGVcbnZvdGVyIC0-PiBhcHA6IEVudGVycyBhY2Nlc3MgY29kZVxuYXBwIC0-PisgYXY6IGNsaWVudC52YWxpZGF0ZUFjY2Vzc0NvZGUoYWNjZXNzQ29kZSlcbmF2IC0-Pi0gYXBwOiBPS1xuYXBwIC0-PisgYXY6IGNsaWVudC5yZWdpc3RlclZvdGVyKClcbmF2IC0-Pi0gYXBwOiBPS1xuYXBwIC0-PisgYXY6IGNsaWVudC5jb25zdHJ1Y3RCYWxsb3RDcnlwdG9ncmFtcyhDVlIpXG5hdiAtPj4tIGFwcDogZmluZ2VycHJpbnRcbmFwcCAtPj4gdm90ZXI6IHRlY2huaWNhbCBlbmNyeXB0aW9uIHRlc3Q_XG52b3RlciAtPj4gYXBwOiBubywgc3VibWl0IGJhbGxvdFxuYXBwIC0-PisgYXY6IGNsaWVudC5zdWJtaXRCYWxsb3RDcnlwdG9ncmFtcyhiYXNlNjRFbmNvZGVkQWZmaWRhdml0KVxuYXYgLT4-LSBhcHA6IHJlY2VpcHRcbmFwcCAtPj4gdm90ZXI6IHJlY2VpcHQiLCJtZXJtYWlkIjp7InRoZW1lIjoiZGVmYXVsdCJ9LCJ1cGRhdGVFZGl0b3IiOmZhbHNlLCJhdXRvU3luYyI6dHJ1ZSwidXBkYXRlRGlhZ3JhbSI6ZmFsc2V9)](https://mermaid-js.github.io/mermaid-live-editor/edit/#eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG5cbmF1dG9udW1iZXJcblxucGFydGljaXBhbnQgdm90ZXIgYXMgVm90ZXJcbnBhcnRpY2lwYW50IGluYm94IGFzIEVtYWlsIDxicj4gaW5ib3hcblxucGFydGljaXBhbnQgYXBwIGFzIEFCQyBhcHBcbnBhcnRpY2lwYW50IGF2IGFzIEFWIGxpYnJhcnlcblxuYXBwIC0-PiB2b3RlcjogYXNrcyBmb3IgYmFsbG90IHJldHVybiBtZXRob2RcbnZvdGVyIC0-PiBhcHA6IGRpZ2l0YWxcbmFwcCAtPj4rIGF2OiBuZXcgQVZDbGllbnQodXJsKVxuYXYgLT4-LSBhcHA6IGNsaWVudFxuYXBwIC0-PisgYXY6IGNsaWVudC5yZXF1ZXN0QWNjZXNzQ29kZShvcGFxdWVWb3RlcklkLCBlbWFpbClcbmF2IC0-Pi0gYXBwOiBPS1xuYXBwIC0-PiB2b3RlcjogQ2hlY2sgZW1haWwsIGVudGVyIGFjY2VzcyBjb2RlXG52b3RlciAtPj4gaW5ib3g6IGNoZWNrcyBmb3IgYWNjZXNzIGNvZGVcbmluYm94IC0-PiB2b3RlcjogYWNjZXNzIGNvZGVcbnZvdGVyIC0-PiBhcHA6IEVudGVycyBhY2Nlc3MgY29kZVxuYXBwIC0-PisgYXY6IGNsaWVudC52YWxpZGF0ZUFjY2Vzc0NvZGUoYWNjZXNzQ29kZSlcbmF2IC0-Pi0gYXBwOiBPS1xuYXBwIC0-PisgYXY6IGNsaWVudC5yZWdpc3RlclZvdGVyKClcbmF2IC0-Pi0gYXBwOiBPS1xuYXBwIC0-PisgYXY6IGNsaWVudC5jb25zdHJ1Y3RCYWxsb3RDcnlwdG9ncmFtcyhDVlIpXG5hdiAtPj4tIGFwcDogZmluZ2VycHJpbnRcbmFwcCAtPj4gdm90ZXI6IHRlY2huaWNhbCBlbmNyeXB0aW9uIHRlc3Q_XG52b3RlciAtPj4gYXBwOiBubywgc3VibWl0IGJhbGxvdFxuYXBwIC0-PisgYXY6IGNsaWVudC5zdWJtaXRCYWxsb3RDcnlwdG9ncmFtcyhiYXNlNjRFbmNvZGVkQWZmaWRhdml0KVxuYXYgLT4-LSBhcHA6IHJlY2VpcHRcbmFwcCAtPj4gdm90ZXI6IHJlY2VpcHQiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)
