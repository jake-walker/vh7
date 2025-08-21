import type { operations } from "./api.g";

type AnyShortLinkApiResponse =
  | (operations["postApiShorten"]["responses"][200]["content"]["application/json"] & { type: "url" })
  | (operations["postApiPaste"]["responses"][200]["content"]["application/json"] & { type: "paste" })
  | (operations["postApiUpload"]["responses"][200]["content"]["application/json"] & { type: "upload" });

type AnyApiResponseHandler = (result: AnyShortLinkResponse) => void;
type ApiErrorHandler = (error: string | null) => void;

type CreateFormProps = {
  onResponse: AnyApiResponseHandler;
  onError: ApiErrorHandler;
};

type HistoryItemType = AnyShortLinkApiResponse & { deleteToken?: string };
