import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import { CourseService } from './courseCache';

export default function PdfView() {
  const { pdfId } = useLocalSearchParams<{ pdfId: string }>();
  const [uri, setUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!pdfId) return;
      const localUri = await CourseService.getPdfFromStorage(pdfId);
      setUri(localUri);
    })();
  }, [pdfId]);

  if (!uri) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri }}
        style={styles.pdf}
        trustAllCerts={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1 },
});
