import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { PassportData } from "./index";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  brand: { fontSize: 20, fontWeight: 700, color: "#5725B5" },
  title: { fontSize: 16, marginTop: 8, fontWeight: 700 },
  subtitle: { fontSize: 10, color: "#5b5170", marginTop: 4 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#1C0B35" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#e6e0f5" },
  label: { color: "#5b5170" },
  value: { fontWeight: 700 },
  badge: { fontSize: 8, color: "#5b5170" },
  footer: { marginTop: 30, fontSize: 9, color: "#5b5170" },
  scoreBox: { marginTop: 10, padding: 14, backgroundColor: "#f7f5fc", borderRadius: 8 },
  scoreNumber: { fontSize: 28, fontWeight: 700, color: "#5725B5" },
});

export function PassportPdfDocument({ data }: { data: PassportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Kredix Financial Passport</Text>
          <Text style={styles.title}>{data.businessName}</Text>
          <Text style={styles.subtitle}>
            Generated {new Date(data.generatedAt).toLocaleDateString("en-NG")} · Methodology v{data.version}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business profile</Text>
          {data.fields.map((f) => (
            <View style={styles.row} key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <View>
                <Text style={styles.value}>{f.value}</Text>
                <Text style={styles.badge}>{f.status.replace("_", " ")}</Text>
              </View>
            </View>
          ))}
        </View>

        {data.healthScore !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Health Score</Text>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>{data.healthScore}/100</Text>
              <Text style={styles.subtitle}>System-calculated. See methodology for details.</Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text>
            This Financial Passport is informational only. Kredix is not a lender and does not
            guarantee loan approval. Self-declared fields are not independently verified.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
