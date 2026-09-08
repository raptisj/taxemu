import React from "react";
import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { uppercaseWithoutDiacritics } from "./formatPdfText";

const purple = "#6C63D5";
const darkPurple = "#5149A8";
const green = "#17724B";
const red = "#9A3C36";
const gray = "#777287";
const lightGray = "#EBE8F2";

const getFontSource = (filename) =>
  typeof window === "undefined" || process.env.NODE_ENV === "test"
    ? `${process.cwd()}/public/fonts/noto-sans/${filename}`
    : `/fonts/noto-sans/${filename}`;

Font.register({
  family: "Noto Sans",
  fonts: [
    { src: getFontSource("NotoSans-Regular.ttf"), fontWeight: 400 },
    { src: getFontSource("NotoSans-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingRight: 46,
    paddingBottom: 54,
    paddingLeft: 46,
    color: "#29263B",
    fontFamily: "Noto Sans",
    fontSize: 9,
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: purple,
  },
  brand: { fontSize: 20, fontWeight: 700 },
  brandTax: { color: purple },
  brandEmu: { color: "#D6A900" },
  title: { marginTop: 4, fontSize: 19, fontWeight: 700 },
  meta: { color: gray, fontSize: 8, textAlign: "right" },
  kicker: {
    marginTop: 18,
    marginBottom: 5,
    color: purple,
    fontSize: 8,
    fontWeight: 700,
  },
  intro: { color: "#514C61", fontSize: 9 },
  assumptions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  assumption: {
    width: "31.8%",
    minHeight: 43,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#F5F2FF",
  },
  assumptionLabel: { color: gray, fontSize: 6.8 },
  assumptionValue: { marginTop: 3, fontSize: 8.5, fontWeight: 700 },
  section: { marginTop: 18 },
  sectionTitle: { marginBottom: 7, color: darkPurple, fontSize: 11, fontWeight: 700 },
  highlight: {
    marginTop: 14,
    padding: 11,
    borderLeftWidth: 3,
    borderLeftColor: purple,
    backgroundColor: "#F7F5FF",
  },
  highlightLabel: { color: "#514C61", fontSize: 8.5 },
  highlightValue: { marginTop: 4, color: darkPurple, fontSize: 14, fontWeight: 700 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 27,
    borderBottomWidth: 1,
    borderBottomColor: lightGray,
  },
  headerRow: { minHeight: 24, borderBottomWidth: 1.5, borderBottomColor: "#DCD7ED" },
  labelCell: { width: "37%", paddingHorizontal: 5, textAlign: "left" },
  valueCell: { width: "21%", paddingHorizontal: 5, textAlign: "right" },
  currentLabelCell: { width: "44%", paddingHorizontal: 5, textAlign: "left" },
  currentValueCell: { width: "28%", paddingHorizontal: 5, textAlign: "right" },
  headerText: { color: gray, fontSize: 7, fontWeight: 700 },
  important: { fontWeight: 700 },
  positive: { color: green, fontWeight: 700 },
  negative: { color: red, fontWeight: 700 },
  neutral: { color: gray },
  caption: { marginTop: 5, color: gray, fontSize: 7 },
  taxWedgeNote: {
    marginTop: 9,
    padding: 9,
    borderLeftWidth: 2,
    borderLeftColor: purple,
    backgroundColor: "#F7F5FF",
  },
  taxWedgeNoteTitle: { color: darkPurple, fontSize: 7.5, fontWeight: 700 },
  taxWedgeNoteText: { marginTop: 3, color: "#514C61", fontSize: 7 },
  taxWedgeFormula: {
    marginTop: 5,
    padding: 5,
    color: "#3E3950",
    fontSize: 7,
    fontWeight: 700,
    backgroundColor: "#EEEAFE",
  },
  taxWedgePercentageFormula: { marginTop: 4, color: gray, fontSize: 6.5 },
  source: { marginBottom: 4, color: "#625D70", fontSize: 7.2 },
  sourceLink: { color: darkPurple, textDecoration: "none" },
  footer: {
    position: "absolute",
    right: 46,
    bottom: 24,
    left: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#DDD9E8",
    color: gray,
    fontSize: 6.8,
  },
  footerDisclaimer: { width: "82%" },
});

const money = new Intl.NumberFormat("el-GR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatMoney = (value, showSign = false) => {
  const number = Number(value) || 0;
  return `${showSign && number > 0 ? "+" : ""}${money.format(number)}`;
};

const formatPercentage = (value, showSign = false) => {
  if (value === null || value === undefined) return "-";
  const number = Number(value);
  const prefix = showSign && number > 0 ? "+" : "";
  return `${prefix}${number.toLocaleString("el-GR", { maximumFractionDigits: 2 })}%`;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatAssumption = (assumption) => {
  if (assumption.type === "money") return formatMoney(assumption.value);
  if (assumption.type === "moneyPair") {
    return `${formatMoney(assumption.value.month)} / μήνα · ${formatMoney(assumption.value.year)} / έτος`;
  }
  return String(assumption.value);
};

const CurrentResults = ({ rows }) => (
  <View style={styles.section} wrap={false}>
    <Text style={styles.sectionTitle}>Αποτελέσματα</Text>
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.currentLabelCell, styles.headerText]}>Κατηγορία</Text>
      <Text style={[styles.currentValueCell, styles.headerText]}>Ανά μήνα</Text>
      <Text style={[styles.currentValueCell, styles.headerText]}>Ανά έτος</Text>
    </View>
    {rows.map((row) => (
      <View key={row.key} style={styles.row}>
        <Text style={[styles.currentLabelCell, row.key === "netIncome" && styles.important]}>
          {row.label}{row.key === "taxWedge" ? "*" : ""}
        </Text>
        <Text style={[styles.currentValueCell, row.key === "netIncome" && styles.important]}>
          {formatMoney(row.value.month)}
          {row.percentage ? ` · ${formatPercentage(row.percentage.month)}` : ""}
        </Text>
        <Text style={[styles.currentValueCell, row.key === "netIncome" && styles.important]}>
          {formatMoney(row.value.year)}
          {row.percentage ? ` · ${formatPercentage(row.percentage.year)}` : ""}
        </Text>
      </View>
    ))}
    {rows.some((row) => row.key === "taxWedge") ? (
      <View style={styles.taxWedgeNote} wrap={false}>
        <Text style={styles.taxWedgeNoteTitle}>
          * Τι είναι η φορολογική επιβάρυνση;
        </Text>
        <Text style={styles.taxWedgeNoteText}>
          Είναι η διαφορά μεταξύ του συνολικού εργοδοτικού κόστους και του καθαρού μισθού.
        </Text>
        <Text style={styles.taxWedgeFormula}>
          Φόρος εισοδήματος + εισφορές εργαζομένου + εργοδοτικές εισφορές
        </Text>
        <Text style={styles.taxWedgeNoteText}>
          Το ποσοστό δείχνει ποιο μέρος του συνολικού εργοδοτικού κόστους αντιστοιχεί σε αυτούς τους φόρους και τις εισφορές.
        </Text>
        <Text style={styles.taxWedgePercentageFormula}>
          Ποσοστό = φορολογική επιβάρυνση ÷ συνολικό εργοδοτικό κόστος
        </Text>
      </View>
    ) : null}
  </View>
);

const comparisonLabel = (entity, key) => {
  if (key === "insurance") return "Ασφαλιστικές εισφορές";
  if (key === "taxableIncome") return "Φορολογητέο εισόδημα";
  if (key === "tax") return "Φόρος εισοδήματος";
  if (key === "adjustment") {
    return entity === "employee" ? "Μείωση φόρου" : "Προκαταβολή φόρου";
  }
  if (key === "netIncome") return "Καθαρό εισόδημα";
  return key;
};

const Comparison = ({ entity, comparison }) => {
  const [base, target] = comparison.results;
  const netDifference = comparison.differences.netIncome;
  const direction = netDifference.annual > 0 ? "αυξάνεται" : netDifference.annual < 0 ? "μειώνεται" : "δεν μεταβάλλεται";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Σύγκριση φορολογικών ετών</Text>
      <Text style={styles.intro}>
        Τα ίδια στοιχεία υπολογίζονται με τους κανόνες του {base.year} και του {target.year}.
      </Text>
      <View style={styles.highlight} wrap={false}>
        <Text style={styles.highlightLabel}>
          Το εκτιμώμενο καθαρό ετήσιο εισόδημα {direction} κατά
        </Text>
        <Text style={styles.highlightValue}>{formatMoney(netDifference.annual, true)} / έτος</Text>
      </View>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.labelCell, styles.headerText]}>Αποτέλεσμα</Text>
        <Text style={[styles.valueCell, styles.headerText]}>{base.year}</Text>
        <Text style={[styles.valueCell, styles.headerText]}>{target.year}</Text>
        <Text style={[styles.valueCell, styles.headerText]}>Μεταβολή</Text>
      </View>
      {Object.entries(base.metrics).map(([key, baseValue]) => {
        const targetValue = target.metrics[key];
        const difference = comparison.differences[key];
        const differenceStyle =
          difference.annual > 0
            ? styles.positive
            : difference.annual < 0
              ? styles.negative
              : styles.neutral;
        return (
          <View key={key} style={styles.row} wrap={false}>
            <Text style={[styles.labelCell, key === "netIncome" && styles.important]}>
              {comparisonLabel(entity, key)}
            </Text>
            <Text style={[styles.valueCell, key === "netIncome" && styles.important]}>
              {formatMoney(baseValue.year)}
            </Text>
            <Text style={[styles.valueCell, key === "netIncome" && styles.important]}>
              {formatMoney(targetValue.year)}
            </Text>
            <Text style={[styles.valueCell, differenceStyle]}>
              {formatMoney(difference.annual, true)}
              {difference.percentage === null ? "" : ` · ${formatPercentage(difference.percentage, true)}`}
            </Text>
          </View>
        );
      })}
      <Text style={styles.caption}>
        Οι μηνιαίες και ετήσιες μεταβολές ενδέχεται να διαφέρουν οριακά λόγω στρογγυλοποίησης.
      </Text>
    </View>
  );
};

export const PersonalCalculationPdfDocument = ({ data }) => (
  <Document
    title={data.title}
    author="Taxemu"
    subject={`Προσωπικός υπολογισμός για το ${data.taxationYear}`}
    language="el-GR"
  >
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            <Text style={styles.brandTax}>tax</Text>
            <Text style={styles.brandEmu}>emu</Text>
          </Text>
          <Text style={styles.title}>{data.title}</Text>
        </View>
        <Text style={styles.meta}>
          Φορολογικό έτος {data.taxationYear}{"\n"}
          Δημιουργήθηκε {formatDate(data.generatedAt)}
        </Text>
      </View>

      <Text style={styles.kicker}>
        {uppercaseWithoutDiacritics("Παραδοχές υπολογισμού")}
      </Text>
      <Text style={styles.intro}>Η αναφορά βασίζεται στα στοιχεία της τελευταίας ολοκληρωμένης εκτέλεσης.</Text>
      <View style={styles.assumptions}>
        {data.assumptions.map((assumption) => (
          <View key={assumption.label} style={styles.assumption} wrap={false}>
            <Text style={styles.assumptionLabel}>
              {uppercaseWithoutDiacritics(assumption.label)}
            </Text>
            <Text style={styles.assumptionValue}>{formatAssumption(assumption)}</Text>
          </View>
        ))}
      </View>

      <CurrentResults rows={data.results} />
      {data.comparison ? <Comparison entity={data.entity} comparison={data.comparison} /> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Επίσημες πηγές</Text>
        {data.sources.map((source) => (
          <View key={source.url} style={styles.source} wrap={false}>
            <Text>{source.years.join(", ")} · {source.name}</Text>
            <Link src={source.url} style={styles.sourceLink}>{source.url}</Link>
          </View>
        ))}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerDisclaimer}>{data.disclaimer}</Text>
        <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
    </Page>
  </Document>
);
