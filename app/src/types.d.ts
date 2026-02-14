import type { operations } from "./api.g";

export type AnyShortLinkApiResponse =
  | (operations["postApiShorten"]["responses"][200]["content"]["application/json"] & { type: "url" })
  | (operations["postApiPaste"]["responses"][200]["content"]["application/json"] & { type: "paste" })
  | (operations["postApiUpload"]["responses"][200]["content"]["application/json"] & { type: "upload" });

export type AnyApiResponseHandler = (result: AnyShortLinkResponse) => void;
export type ApiErrorHandler = (error: string | null) => void;

export type CreateFormProps = {
  onResponse: AnyApiResponseHandler;
  onError: ApiErrorHandler;
};

export type HistoryItemType = AnyShortLinkApiResponse & { deleteToken?: string };
