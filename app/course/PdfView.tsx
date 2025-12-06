import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { CourseService } from './courseCache';

const PdfView: React.FC = () => {
  const { pdfId } = useLocalSearchParams<{ pdfId: string }>();
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!pdfId) throw new Error('No PDF ID provided');

        const localUri = await CourseService.getPdfFromStorage(pdfId);
        console.log('PDF URI:', localUri);
        setPdfUri(localUri);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [pdfId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading PDF...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading PDF</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!pdfUri) return null;

 
  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
      {/* PDF Viewer using WebView */}
      <WebView
        originWhitelist={["*"]}
        source={{
          html: `
      <html>
      <head>
        <style>
          /* Hide Google viewer top bar */
          #toolbar, .ndfHFb-c4YZDc, .ndfHFb-c4YZDc-Wvd9Cc {
            display: none !important;
            height: 0 !important;
            overflow: hidden !important;
          }
        </style>
      </head>
      <body style="margin:0;padding:0;overflow:hidden;">
        <iframe 
          src="https://docs.google.com/gview?embedded=true&url=${pdfUri}" 
          style="width:100%;height:100%;border:0;" 
          frameborder="0">
        </iframe>
      </body>
      </html>
    `,
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontWeight: 'bold', color: 'red', marginBottom: 10 },
});

export default PdfView;
