import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { PatientGuideContent } from "@/lib/types/patient-guide";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 18, marginBottom: 12, color: "#1C1917" },
  updated: { fontSize: 9, color: "#78716C", marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#7F1D1D" },
  bullet: { marginBottom: 4, paddingLeft: 8, color: "#1C1917" },
  greenTitle: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 8, color: "#14532D" },
  catName: { fontSize: 11, fontWeight: "bold", marginTop: 8, color: "#14532D" },
});

export interface GuidePdfDocumentProps {
  guide: PatientGuideContent;
}

/**
 * PDF layout for the personalised patient guide (Phase 1 export).
 */
export function GuidePdfDocument({ guide }: GuidePdfDocumentProps): ReactElement {
  const titleText = guide.title.length > 0 ? guide.title : "Personalised plan";
  const updatedText = `Last updated: ${new Date(guide.updatedAt).toLocaleDateString()}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.updated}>{updatedText}</Text>

        <Text style={styles.sectionTitle}>Foods to limit or avoid</Text>
        {guide.noList.map((item) => (
          <Text key={item} style={styles.bullet}>
            • {item}
          </Text>
        ))}

        <Text style={styles.greenTitle}>Foods you can enjoy</Text>
        {guide.yesCategories.map((cat) => (
          <View key={cat.name}>
            <Text style={styles.catName}>{cat.name}</Text>
            {cat.items.map((it) => (
              <Text key={it} style={styles.bullet}>
                • {it}
              </Text>
            ))}
          </View>
        ))}

        {guide.snacks.length > 0 ? (
          <>
            <Text style={styles.greenTitle}>Snacks</Text>
            {guide.snacks.map((s) => (
              <Text key={s} style={styles.bullet}>
                • {s}
              </Text>
            ))}
          </>
        ) : null}

        {guide.cookingMethods.length > 0 ? (
          <>
            <Text style={styles.greenTitle}>Cooking methods</Text>
            {guide.cookingMethods.map((c) => (
              <Text key={c} style={styles.bullet}>
                • {c}
              </Text>
            ))}
          </>
        ) : null}
      </Page>
    </Document>
  );
}
