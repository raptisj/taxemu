# 2026 salaried-engineer estimate

Based on the official-source research supplied by the user on 2026-10-02. The cited documents have not been independently retrieved in this environment. The annual example below is covered by independent regression fixtures.

## Scope and rule inputs

First release: full-year private-sector salaried engineers with former ΤΣΜΕΔΕ coverage, EOPYY healthcare, coverage code 1022, and 12 insured months. An engineering degree alone does not establish eligibility. Other years, occupational-risk code 1023, partial-year employment, subsidies, public-sector employment, and parallel self-employment need separate support.

| Contribution | Employee | Employer |
| --- | --- | --- |
| Main pension | 6.67% | 13.33% |
| Healthcare, kind + cash | 1.65% + 0.40% | 3.80% + 0.25% |
| Other compulsory payroll branches, grouped | 1.65% | 1.41% |
| Percentage subtotal | 10.37% | 18.79% |

Percentage contributions use the applicable €7,761.94 monthly ceiling. The engineer profile stores these components directly; deriving them from Taxemu's general employee rate would propagate its current 13.33% versus the supplied 13.37% discrepancy. Investigate the general-rate discrepancy as a separate correction against Circular 38/2024's coverage table.

| Category | Supplementary total/month, shared equally | Lump sum/month, employee only |
| --- | --- | --- |
| 1, default | €46.57 | €31.05 |
| 2 | €56.13 | €37.02 |
| 3 | €66.88 | €44.18 |

Select supplementary and lump-sum categories independently. Supplementary contributions have the same amounts for e-EFKA and TEKA; record the fund explicitly rather than infer it from age. Fixed charges apply for 12 insured months and are not charged again on gifts or leave allowance. They replace the ordinary supplementary component; do not add 3% + 3% supplementary or another percentage-based lump-sum contribution.

## Implementation

- The existing employee view includes profile, supplementary category, lump-sum category, and fund selectors; category 1 is the default. The carrier-only disabled field is replaced by these meaningful choices.
- The 2026 JSON rules contain sourced components and category amounts. Annual contributions charge percentage-based pay plus 12 fixed contributions, with annual tax and net calculations in cents. Reverse estimates use the same forward formula.
- The expandable breakdown shows annual and ordinary-month employee/employer amounts. The main results show labelled averages per salary equivalent. Half-cent payer shares are preserved and displayed with three decimals where needed.
- Store snapshots, dirty detection, shared links, offer comparisons, wiki, mobile, and PDFs carry the same selections. Unsupported engineer years are explicit and do not use generic rates.
- Tests cover the example, all category combinations, caps, 12-versus-14 charging, half-cent shares, fund equivalence, reverse estimates, input changes, shared links, and committed PDF data. General employee year regressions remain unchanged.

Keep Taxemu's salary-equivalent convention explicit: €2,000 × 14 means €28,000 gross annually. Do not silently add the holiday-gift allowance factor. If actual statutory gift calculation is offered later, model each gift separately, including its applicable cap and allowance factor; use official instructions to establish each payment-specific cap. Exact payslip rounding and statutory gift calculations are not part of the initial annual estimate.

## Acceptance example

For €2,000 gross, exactly 14 salary equivalents, 12 insured months, and both first categories: annual employee contributions **€3,555.62**, employer contributions **€5,540.62**, gross after employee contributions **€24,444.38** before income tax, and total employer cost **€33,540.62**. These figures are before payroll-period cent rounding; the example does not specify a net-after-tax amount.

## Supplied official references

- [Circular 4/2026](https://www.e-efka.gov.gr/el/egkyklioi-kai-genika-eggrapha/egkyklios-42026), §§1–3, pp. 2–3: 2026 ceiling and engineer categories. This is the engineer-specific reference supplied by the user, distinct from the repository's earlier 5/2026 and 6/2026 citations.
- [Circular 38/2024](https://www.e-efka.gov.gr/el/egkyklioi-kai-genika-eggrapha/egkyklios-38-24122024), §§1–2 and coverage table PDF p. 11: healthcare rates and codes 1022–1023.
- [Circular 8/2021](https://www.e-efka.gov.gr/sites/default/files/2021-01/%CE%95%CE%93%CE%9A.%208_2021.pdf), §§1–2 and 4.3: categories, defaults, and gifts; [Circular 6/2017](https://www.e-efka.gov.gr/sites/default/files/2018-05/EGK_6_14-02-2017.pdf), §§1–2: engineer coverage and pension split.
- [Circular 48/2020](https://www.efka.gov.gr/sites/default/files/2020-10/%CE%95%CE%93%CE%9A.%2048_2020%20%289%CE%952846%CE%9C%CE%91%CE%A0%CE%A3-%CE%944%CE%91%29.pdf), §2.2: lump-sum default; [General Document 17 September 2024](https://www.efka.gov.gr/sites/default/files/2024-09/1283148_17092024.pdf), p. 9: fixed contributions and gifts.
- TEKA [contributions](https://teka.gov.gr/eisfores/) and [eligibility](https://teka.gov.gr/ypagogi/): supplementary fund and engineer contribution treatment.
- Ministry of Labour [insurance contributions](https://ypergasias.gov.gr/koinoniki-asfalisi/asfalismenoi-eisfores-kai-paroches/asfalistikes-eisfores/), [holiday gifts](https://ypergasias.gov.gr/ergasiakes-scheseis/syllogikes-ergasiakes-scheseis/sychnes-erotiseis/epidomata-eorton-dora-pascha-kai-christougennon/), and [leave/gift guidance](https://ypergasias.gov.gr/ergasiakes-scheseis/atomikes-ergasiakes-scheseis/apospasi-ergazomenon/): wage bases, caps, and holiday-gift allowance factor.
