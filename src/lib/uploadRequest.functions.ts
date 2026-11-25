import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getUploadRequest = createServerFn({ method: "GET" })
  .inputValidator((v: unknown) => z.object({ token: z.string().max(80) }).parse(v))
  .handler(async ({ data }) => {
    const { findRequest, publicView } = await import("./uploadRequest.server");
    const found = await findRequest(data.token);
    return found ? publicView(found.req) : null;
  });
