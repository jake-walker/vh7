import { Box, Title, Text, Badge } from "@mantine/core";
import urljoin from 'url-join';
import { Link } from 'react-router-dom';
import { baseURL, shortUrl } from '../controller';
import { DateTime } from 'luxon';

function formatDate(date) {
  date = DateTime.fromJSDate(new Date(date));

  if (date.toISODate() === DateTime.local().toISODate()) {
    return `Today at ${date.toLocaleString(DateTime.TIME_SIMPLE)}`;
  }

  return date.toLocaleString(DateTime.DATE_MED);
}

export function HistoryItem({ item }) {
  const url = urljoin(baseURL, item.id);

  let type = "";
  let title = "";
  let description = "";
  let created = item.createdAt || item.date || item.created;
  let expires = null;

  switch (item.type) {
    case "shorten":
    case "url":
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
    case "url:1":
      type = "Shorten";
      title = shortUrl(item.data.url, 30);
      description = null;
      break;
    case "paste:1":
      type = "Paste";
      title = "Paste";
      description = null;
      break;
    case "upload:1":
      type = "Upload";
      title = item.data.filename;
      description = `SHA256: ${item.data.hash.substring(0, 4)}...${item.data.hash.substring(item.data.hash.length - 4)}`
  }

  if (item.expires && typeof item.expires === "number") {
    expires = item.expires;
  }

  if (item.expiresAt) {
    expires = item.expiresAt;
  }

  return (
    <Box mb={6}>
      <Title order={5} sx={{ overflowX: "clip" }}>
        {title}
        <Badge ml={10}>{type}</Badge>
      </Title>
      <Text color="dimmed">
        <Text inherit variant="link" to={`/view/${item.id}`} component={Link} color="dimmed">{url}</Text>
        {description && <Text inherit component="span">&nbsp;&bull;&nbsp;{description}</Text>}
        &nbsp;&bull;
        Created {formatDate(created)}
        {expires && <Text inherit component="span">
            &nbsp;&bull;
            Expires {formatDate(expires)}
          </Text>
        }
      </Text>
    </Box>
  )
}
