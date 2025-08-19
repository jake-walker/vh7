import { Center, Text, Title, Box, useComputedColorScheme } from "@mantine/core";
import { Link, useNavigate } from 'react-router';

function Header({ small = false }: { small?: boolean }) {
  const colorScheme = useComputedColorScheme();
  const navigate = useNavigate();

  return (
    <Box style={(theme) => ({
      backgroundColor: colorScheme === 'dark' ? theme.colors.gray[9] : theme.colors.gray[0],
      paddingTop: (small ? 25 : 40),
      paddingBottom: (small ? 25 : 40)
    })}>
      <Center>
        <Title order={1} style={{ fontSize: (small ? 50 : 100), textDecoration: 'none', cursor: "pointer" }} onClick={() => navigate("/")}>
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
      <Text style={{ textAlign: "center" }} c="gray">
        <Text inherit c="gray" variant="link" component={Link} to="/">Home</Text>
        &nbsp;&bull;&nbsp;
        <Text inherit c="gray" variant="link" component={Link} to="/about">About</Text>
        &nbsp;&bull;&nbsp;
        <Text inherit c="gray" variant="link" component="a" href="https://github.com/jake-walker/vh7" target="_blank">GitHub</Text>
      </Text>
    </Box>
  )
}

export default Header;
