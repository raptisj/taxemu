# OECD SDMX mapping for Taxemu

Official base endpoint:

    https://sdmx.oecd.org/public/rest/data/OECD.CTP.TPS

Request CSV with the Accept: text/csv header and query parameters:

    startPeriod=<year>&endPeriod=<year>&dimensionAtObservation=AllDimensions

## Dataflows

- Comparative: DSD_TAX_WAGES_COMP@DF_TW_COMP,2.1
- Decomposition: DSD_TAX_WAGES_DECOMP@DF_TW_DECOMP,2.1

Confirm the current dataflow version in OECD Data Explorer before adopting a
new edition. Address returned fields by header name, not column position.

## Main comparison and rank

Fetch this comparative key for a single person without children at 100% of
average wage:

    .AV_TW..S_C0.AW100._Z.A

The leading empty dimension requests all areas. Keep the unit dimension empty
in this broad query; AV_TW should return unit PT_COS_LB. Use GRC for Greece and
OECD_REP for the published OECD average.

Calculate Greece's descending rank from raw OBS_VALUE values for exactly:

    AUS AUT BEL CAN CHL COL CRI CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ISR
    ITA JPN KOR LVA LTU LUX MEX NLD NZL NOR POL PRT SVK SVN ESP SWE CHE TUR
    GBR USA

Fail if any of the 38 members is absent or duplicated. Exclude OECD_REP and all
other aggregates from ranking.

## Components and Greek average wage

Fetch these decomposition keys separately:

    GRC...S_C0.AW100._Z.A
    OECD_REP...S_C0.AW100._Z.A

They return multiple units. Filter explicitly:

- Income tax: AV_CIT plus AV_LIT, unit PT_COS_LB.
- Employee contributions: EESSC, unit PT_COS_LB.
- Employer contributions/payroll tax: ERSSC_PT, unit PT_COS_LB.
- Greek average gross wage: GWE, unit XDC, area GRC.

The raw components should reconcile with raw AV_TW. Independent one-decimal
rounding can cause a small difference in displayed component totals.

## Displayed household profiles

Fetch AV_TW, unit PT_COS_LB, for GRC and OECD_REP with a focused key:

    GRC+OECD_REP.AV_TW.PT_COS_LB.<household>.<principal>.<spouse>.A

| Taxemu card | Household | Principal | Spouse |
| --- | --- | --- | --- |
| Single, no children | S_C0 | AW100 | _Z |
| Single, 2 children | S_C2 | AW67 | _Z |
| Couple, one earner, 2 children | C_C2 | AW100 | NOEARN_UNEMP |

For child profiles, verify the current OECD methodology still assumes two
children aged 6–11 before preserving that wording in the UI.
