import { Text } from "@mantine/core"

export function CreateInfo({ form, type }) {
  return (
    <Text color="dimmed" size="sm">
      This will create
      {"aeiou".split("").includes(type.charAt(0)) ? " an " : " a "}
      {type} that
      {form.values.expireDays == "-1"
        ? " will never expire"
        : ` will expire in ${form.values.expireDays} day${form.values.expireDays != "1" ? "s" : ""}`}
      {form.values.deletable ? " and can be deleted by you" : ""}
      .
    </Text>
  )
}
