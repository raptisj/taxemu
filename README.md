
<img src="./public/icon-256x256.png" alt="Taxemu" style="width:100px;height:100px" />

# Taxemu

_**Taxemu** is a tool to calculate your tax obligations. Made for one-person businesses and permanent employees._

The live project can be found [here.](https://www.taxemu.gr/)

If you want to contribute to the project, [read the contribution guidelines.](https://github.com/raptisj/taxemu/blob/main/CONTRIBUTING.md)

## Development

Clone and install.

```
git clone git@github.com:raptisj/taxemu.git
cd ./taxemu
npm i
```

Run a development server.

```
npm run dev
```

### Testing

Run the complete Jest test suite once:

```
npm test -- --runInBand
```

Run tests in watch mode while developing:

```
npm test -- --watch
```

Generate a coverage report:

```
npm test -- --coverage
```

When changing `rules/taxRules.json`, add or update a year-regression test with
expected values taken independently from the cited official source. Then run
both the test suite and `npm run build` before submitting the change.

## Authors

John Raptis(Code)

Thanos Dimitriou(UI, UX)
