import { Container, Flex, Loader } from "@mantine/core";
import Header from "../components/Header";

function Loading() {
  return (
    <>
      <Header small />
      <Container my={20}>
        <Flex w="100%" h="100%" justify="center" align="center">
          <Loader size="lg" />
        </Flex>
      </Container>
    </>
  );
}

export default Loading;
