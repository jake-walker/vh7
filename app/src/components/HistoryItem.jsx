import { Box, Title, Text, Badge, ActionIcon, Flex } from "@mantine/core";
import urljoin from 'url-join';
import { Link } from 'react-router-dom';
import { baseURL, deleteWithToken, shortUrl } from '../controller';
import { DateTime } from 'luxon';
import { Trash } from "react-feather";
import { useDispatch } from "react-redux";
import { removeItem } from "../slices/history";

function formatDate(date) {
  date = DateTime.fromJSDate(new Date(date));

  if (date.toISODate() === DateTime.local().toISODate()) {
    return `Today at ${date.toLocaleString(DateTime.TIME_SIMPLE)}`;
  }

  return date.toLocaleString(DateTime.DATE_MED);
}

function hasExpired(date) {
  return new Date(date) <= new Date();
}

export function HistoryItem({ item }) {
  const dispatch = useDispatch();
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

  async function del() {
    if (item.deleteToken && confirm(`Are you sure you want to delete ${item.id}? This cannot be undone`)) {
      try {
        await deleteWithToken(item.id, item.deleteToken);
        dispatch(removeItem(item.id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete the item, please check the developer console");
      }
    }
  }

  const expired = hasExpired(expires);

  return (
    <Box mb={6}>
      <Flex align="center" justify="space-between">
        <div>
          <Title order={5} sx={{ overflowX: "clip" }}>
            {title}
            <Badge ml={10}>{type}</Badge>
          </Title>
          <Text color="dimmed">
            <Text inherit variant="link" to={`/view/${item.id}`} component={Link} color="dimmed" strikethrough={expired}>{url}</Text>
            {description && <Text inherit component="span">&nbsp;&bull;&nbsp;{description}</Text>}
            &nbsp;&bull;
            Created {formatDate(created)}
            {expires && <>
                &nbsp;&bull;
                {expired ? " Expired" : " Expires"} {formatDate(expires)}
              </>
            }
          </Text>
        </div>
        {item.deleteToken && <ActionIcon color="red" size="lg" variant="light" onClick={del}><Trash size="18" /></ActionIcon>}
      </Flex>
    </Box>
  )
}
