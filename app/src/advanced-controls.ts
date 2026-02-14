import z from "zod";
import type { AdvancedControlsFormValues } from "./components/AdvancedControls";
import { zodFormValidator } from "./controller";

export const initialValues: AdvancedControlsFormValues = {
  linkType: "short",
  expireDays: "60",
  deletable: true,
};

export const validationRules = {
  expireDays: zodFormValidator(
    z.string().refine((val) => {
      try {
        const n = parseInt(val, 10);
        return (n > 0 && n < 365) || n === -1;
      } catch {
        return false;
      }
    }),
  ),
};
