import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PdfView() {
  const { id } = useLocalSearchParams();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH THUMBNAIL IMAGE --- //

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={{ padding: 20, marginTop: 50 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, fontSize: 18 }}>Loading PDF...</Text>
      </View>
    );
  }

  const pdfURL = `https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item/${id}`;

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
          src="https://docs.google.com/gview?embedded=true&url=${pdfURL}" 
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
}
