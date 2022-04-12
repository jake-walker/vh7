import { Center, Text, Title, Box } from "@mantine/core";
import { Link } from 'react-router-dom';

function Header({ small }) {
  return (
    <Box sx={(theme) => ({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[9] : theme.colors.gray[0]
    })}>
      <Center>
        <Title order={1} sx={{ fontSize: (small ? 50 : 100), textDecoration: 'none' }} my={(small ? 25 : 50)} component={Link} to="/">
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
    </Box>
  )
}

export default Header;
