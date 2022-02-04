export async function save(id: string, value: any) {
  await VH7.put(id, JSON.stringify(value));
}

export async function get(id: string) {
  const data = await VH7.get(id);

  if (data === null) {
    return null;
  }

  return JSON.parse(data);
}

export async function remove(id: string) {
  await VH7.delete(id);
}
