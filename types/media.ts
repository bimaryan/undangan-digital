export type UploadedMedia = {
  id: string;
  undangan_id: number;
  filename: string;
  content_type: string;
  size: number;
  content: Buffer;
  created_at?: Date | string;
};

export type UploadedMediaReference = Pick<
  UploadedMedia,
  "id" | "filename" | "content_type" | "size"
>;
