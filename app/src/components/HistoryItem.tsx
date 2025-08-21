import { Box, Title, Text, Badge, ActionIcon, Flex } from "@mantine/core";
import { Link } from 'react-router';
import { deleteWithToken, idToUrl, shortUrl } from '../controller';
import { DateTime } from 'luxon';
import { Trash } from "react-feather";
import { useDispatch } from "react-redux";
import { removeItem } from "../slices/history";
import type { HistoryItemType } from "../types";

function formatDate(v: number | string | Date) {
  const date = DateTime.fromJSDate(new Date(v));

  if (date.toISODate() === DateTime.local().toISODate()) {
    return `Today at ${date.toLocaleString(DateTime.TIME_SIMPLE)}`;
  }

  return date.toLocaleString(DateTime.DATE_MED);
}

function hasExpired(date: number | string | Date | null | undefined) {
  if (date === null || date === undefined) return false;

  return new Date(date) <= new Date();
}

export function HistoryItem({ item }: { item: HistoryItemType }) {
  const dispatch = useDispatch();
  const url = idToUrl(item.id);

  let type: string | null = null;
  let title: string | null = null;
  let description: string | null = null;
  let created = item.createdAt;
  let expires = item.expiresAt;

  switch (item.type) {
    case "url":
      type = "Shorten";
      title = shortUrl(item.id);
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
    <Box mb={6} id={`history-item-${item.id}`}>
      <Flex align="center" justify="space-between">
        <div>
          <Title order={5} style={{ overflowX: "clip" }}>
            {title}
            <Badge ml={10}>{type}</Badge>
          </Title>
          <Text c="dimmed">
            <Text inherit variant="link" to={`/${item.id}`} component={Link} c="dimmed" td={expired ? "strikethrough" : undefined}>{url}</Text>
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
        {item.deleteToken && <ActionIcon className="delete-button" color="red" size="lg" variant="light" onClick={del}><Trash size="18" /></ActionIcon>}
      </Flex>
    </Box>
  )
}
