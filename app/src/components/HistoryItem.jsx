import { Box, Title, Text, Badge } from "@mantine/core";
import urljoin from 'url-join';
import { Link } from 'react-router-dom';
import { baseURL, shortUrl } from '../controller';

export function HistoryItem({ item }) {
  const url = urljoin(baseURL, item.id);

  let type = "";
  let title = "";
  let description = "";

  switch (item.type) {
    case "shorten":
      type = "Shorten";
      title = shortUrl(item.url, 30);
      description = null;
      break;
    case "paste":
      type = "Paste";
      title = "Paste";
      description = null;
      break;
    case "upload":
      type = "Upload";
      title = item.filename;
      description = `SHA256: ${item.hash.substring(0, 4)}...${item.hash.substring(item.hash.length - 4)}`;
      break;
  }

  return (
    <Box mb={6}>
      <Title order={5}>
        {title}
        <Badge ml={10}>{type}</Badge>
      </Title>
      <Text color="dimmed">
        <Text inherit variant="link" to={`/view/${item.id}`} component={Link} color="dimmed">{url}</Text>
        {description && <Text inherit component="span">&nbsp;&bull;&nbsp;{description}</Text>}
        &nbsp;&bull;&nbsp;
        {(new Date(item.date)).toLocaleString()}
      </Text>
    </Box>
  )
}
