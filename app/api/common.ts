import { Directory, File, Paths } from "expo-file-system";
import { AppConfig } from "../config";

/**
 * Downloads a file from backend using blob_name and stores it locally.
 * The local path mirrors the blobName path under document/blob-cache.
 *
 * Example blobName: farming_subscription/<uuid>/thumbnail.jpg
 */
export async function fetchAndCacheBlobFile(
	blobName: string,
	forceUpdate: boolean = false
): Promise<string | null> {
	try {
		const normalizedBlobName = blobName.trim().replace(/^\/+/, "").replace(/\/+$/, "");

		if (!normalizedBlobName) {
			console.error("blobName is required.");
			return null;
		}

		if (!Paths.document) {
			console.error("File system document directory is not available.");
			return null;
		}

		const pathParts = normalizedBlobName.split("/").filter(Boolean);
		if (pathParts.length === 0) {
			console.error("Invalid blobName.");
			return null;
		}

		const fileName = pathParts[pathParts.length - 1];
		const directoryParts = pathParts.slice(0, -1);

		let targetDir = new Directory(Paths.document, "blob-cache");
		await targetDir.create({ intermediates: true, idempotent: true });

		for (const part of directoryParts) {
			targetDir = new Directory(targetDir, part);
			await targetDir.create({ intermediates: true, idempotent: true });
		}

		const localFile = new File(targetDir, fileName);
		const localFileInfo = await localFile.info();
		if (localFileInfo.exists && !forceUpdate) {
			return localFile.uri;
		}

		if (localFileInfo.exists && forceUpdate) {
			await localFile.delete();
		}

		const fileUrl = `${AppConfig.API_BASE_URL}/file?blob_name=${encodeURIComponent(normalizedBlobName)}`;
		const downloadedFile = await File.downloadFileAsync(fileUrl, localFile, {
			headers: {
				accept: "application/octet-stream",
			},
			idempotent: true,
		});

		const downloadedInfo = await downloadedFile.info();
		if (!downloadedInfo.exists) {
			throw new Error(`Download failed for blobName: ${normalizedBlobName}`);
		}

		return downloadedFile.uri;
	} catch (error) {
		console.error("Error in fetchAndCacheBlobFile:", error);
		return null;
	}
}
