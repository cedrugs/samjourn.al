import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	endpoint: process.env.S3_ENDPOINT,
	region: process.env.S3_REGION || "auto",
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY!,
		secretAccessKey: process.env.S3_SECRET_KEY!,
	},
	forcePathStyle: true,
});

const mimeTypes: Record<string, string> = {
	mp3: "audio/mpeg",
	wav: "audio/wav",
	ogg: "audio/ogg",
	m4a: "audio/mp4",
	aac: "audio/aac",
	flac: "audio/flac",
	webm: "audio/webm",
};

export async function uploadAudio(
	buffer: Buffer,
	filename: string
): Promise<string> {
	const ext = filename.split(".").pop()?.toLowerCase() || "mp3";
	const contentType = mimeTypes[ext] || "audio/mpeg";
	const key = `${Date.now()}-${filename}`;

	await s3.send(
		new PutObjectCommand({
			Bucket: process.env.S3_BUCKET!,
			Key: key,
			Body: buffer,
			ContentType: contentType,
		})
	);

	return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;
}
