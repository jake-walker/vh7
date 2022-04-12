import { Button, Container, Title } from "@mantine/core";
import Header from "../components/Header";
import { Link } from 'react-router-dom';

function NotFound({ title, description }) {
  return (
    <>
      <Header small />
      <Container my={20}>
        <Title order={2}>
          {title || "Whoops! You've reached a dead end."}
        </Title>
        <p>
          {description || "We could not find the page that you are looking for."}
        </p>
        <Button to="/" component={Link}>
          Go home
        </Button>
      </Container>
      </>
  );
}

export default NotFound;
