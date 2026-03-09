import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fetchAndCacheBlobFile } from "../../api/common";
import { FarmingCourseListItem } from "./types";

interface FarmingCourseCardProps {
  item: FarmingCourseListItem;
  onEdit: () => void;
  onUsers: () => void;
  onToggleStatus: () => void;
}

export default function FarmingCourseCard({ item, onEdit, onUsers, onToggleStatus }: FarmingCourseCardProps) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loadingThumb, setLoadingThumb] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadThumbnail = async () => {
      if (!item.thumbnail) {
        setThumbnailUri(null);
        return;
      }

      setLoadingThumb(true);
      const localUri = await fetchAndCacheBlobFile(item.thumbnail);
      if (mounted) {
        setThumbnailUri(localUri);
        setLoadingThumb(false);
      }
    };

    loadThumbnail();
    return () => {
      mounted = false;
    };
  }, [item.thumbnail]);

  const isLive = Boolean(item.live);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onEdit}>
      <View style={styles.thumbnailWrap}>
        {loadingThumb ? (
          <ActivityIndicator color="#0E7490" />
        ) : (
          <Image
            source={
              thumbnailUri
                ? { uri: thumbnailUri }
                : require("../../../assets/images/logo.png")
            }
            style={styles.thumbnail}
          />
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.title}>{item.cropName}</Text>
        <Text style={styles.price}>
          {item.price != null && item.price !== "" ? `₹ ${item.price}` : "Price not set"}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.statusBtn, isLive ? styles.liveBtn : styles.downBtn]}
            onPress={(event) => {
              event.stopPropagation();
              onToggleStatus();
            }}
          >
            <Text style={[styles.statusText, isLive ? styles.liveText : styles.downText]}>
              {isLive ? "Live" : "Offline"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.usersBtn}
            onPress={(event) => {
              event.stopPropagation();
              onUsers();
            }}
          >
            <Text style={styles.usersBtnText}>👥 Users</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 14,
    marginVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailWrap: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  details: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  meta: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#067728",
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBtn: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  usersBtn: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#0EA5E9",
  },
  usersBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  statusText: {
    fontWeight: "700",
  },
  liveBtn: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
  },
  downBtn: {
    backgroundColor: "#F1F5F9",
    borderColor: "#94A3B8",
  },
  liveText: {
    color: "#166534",
  },
  downText: {
    color: "#334155",
  },
});
