import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PdfView() {
  const { id } = useLocalSearchParams();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // --- DOWNLOAD BINARY PDF & SAVE --- //
  const downloadAndOpenPDF = async () => {
    console.log("pdf id: ", id);
    try {
      const pdfURL = `https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item/${id}`;

      const response = await fetch(pdfURL);
      const arrayBuffer = await response.arrayBuffer();

      const base64Data = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (acc, b) => acc + String.fromCharCode(b),
          ""
        )
      );

      const cacheDirectory = (FileSystem as any)["cacheDirectory"];
      const documentDirectory = (FileSystem as any)["documentDirectory"];

      const dir = documentDirectory || cacheDirectory;
      const fileUri = `${dir}pdf_${id}.pdf`;

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: "base64",
      });

      console.log("PDF saved at:", fileUri);

      // 🔥 THIS OPENS THE PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert("PDF viewer not available on this device.");
      }
    } catch (error) {
      console.log("PDF load error:", error);
    }
  };

  // --- FETCH THUMBNAIL IMAGE --- //
  const loadThumbnail = async () => {
    const url = `https://dev-backend-py-23809827867.us-east1.run.app/agent/sell/item/photo/${id}`;
    setThumbnail(url);
  };

  useEffect(() => {
    if (!id) return;

    (async () => {
      await loadThumbnail();
      setLoading(false);

      // auto open pdf
      await downloadAndOpenPDF();
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

  return (
    <View style={{ padding: 20, paddingTop: 90 }}>
      {/* THUMBNAIL IMAGE */}
      {thumbnail && (
        <Image
          source={{ uri: thumbnail }}
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            resizeMode: "cover",
            marginBottom: 20,
          }}
        />
      )}

      <TouchableOpacity
        onPress={downloadAndOpenPDF}
        style={{
          marginTop: 30,
          backgroundColor: "#000",
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Open PDF Again
        </Text>
      </TouchableOpacity>
    </View>
  );
}
