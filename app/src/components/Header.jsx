import { Center, Text, Title, Box } from "@mantine/core";
import { Link } from 'react-router-dom';

function Header({ small }) {
  return (
    <Box sx={(theme) => ({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[9] : theme.colors.gray[0],
      paddingTop: (small ? 25 : 40),
      paddingBottom: (small ? 25 : 40)
    })}>
      <Center>
        <Title order={1} sx={{ fontSize: (small ? 50 : 100), textDecoration: 'none' }} component={Link} to="/">
          <Text
            inherit
            component="span"
            variant="gradient"
            gradient={{ from: "brand", to: "brand2", deg: 135 }}
          >
            VH7
          </Text>
        </Title>
      </Center>
      <Text align="center" color="gray">
        <Text inherit color="gray" variant="link" component={Link} to="/">Home</Text>
        &nbsp;&bull;&nbsp;
        <Text inherit color="gray" variant="link" component={Link} to="/docs">Docs</Text>
        &nbsp;&bull;&nbsp;
        <Text inherit color="gray" variant="link" component="a" href="https://github.com/jake-walker/vh7" target="_blank">GitHub</Text>
      </Text>
    </Box>
  )
}

export default Header;
