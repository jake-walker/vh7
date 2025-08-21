import { Button, Container, Text, Typography } from "@mantine/core";
import { ArrowRight } from "react-feather";
import Header from "../components/Header";

function About() {
  return (
    <>
      <Header small />
      <Container my={20}>
        <Typography>
          <h2>About</h2>
          <p>
            VH7 is a free and open source URL shortening, file sharing and pastebin service by{" "}
            <a href="https://jakew.me">Jake Walker</a>.
          </p>
          <h3>FAQ</h3>
          <p>
            <b>How long do short links last?</b> Everything lasts for 60 days by default, however this time can be
            changed by clicking the 'Show Advanced' link before pressing the button on the main page. Short links and
            pastes can be set to last from 1 day to forever*. Uploaded files only last a maximum of 30 days at the
            moment (even if set to expire longer).
            <Text c="dimmed" size="xs">
              * - I will try my best to keep data backed up and VH7 online, however I can't make any promises, so don't
              use VH7 for anything critical. Also, this is subject to change, I may start deleting pastes or changing
              other things. Finally, any domains where URLs break after a while (e.g. online game lobbies or temporary
              file sharing) will get deleted after a minimum of 2 months.
            </Text>
          </p>
          <p>
            <b>How big can uploaded files be?</b> Files uploaded to VH7 can be 256 MB in size. Any files larger won't be
            accepted, but you are welcome to use another service and shorten their link. This limit may change in the
            future.
          </p>
          <p>
            <b>Why can't I download from links directly?</b> For security and convenience, you are taken to an
            intermediary page before downloading files or pastes. You can add <code>?direct</code> to the end of the
            link to bypass the page. We have a filter which will take bots and command line applications to a direct
            download, and browser users to the intermediary page. Let me know if there's something that is broken with
            this.
          </p>
          <p>
            <b>How does deletion work?</b> By default, anything you create on this web app is able to be deleted.
            However, other methods of using VH7, for example using curl will not likely to do this by default. When
            something is deletable, a 'delete token' is generated when you create your short link, paste or upload. You
            can then use this 'delete token' to manually delete your item before it is due to expire. Anyone with the
            token is able to delete the item so it should be reasonably random. The web app automatically generates
            these and stores them in your browser. If you have no token set up and would like your data deleted, please
            get in touch.
          </p>
          <h3>API</h3>
          <p>
            Using VH7's API will allow you to build short links into your own application. To keep links shorter for
            everyone, I please ask that you use the API for small projects and{" "}
            <a href="https://jakew.me/about">contact me</a> first for any bigger projects.
          </p>
          <p>
            API documentation is available at the link below, and you can also access the OpenAPI specification at{" "}
            <a href="/api/openapi.json">
              <code>/api/openapi.json</code>
            </a>
            .
          </p>
          <Button
            component="a"
            href="/docs"
            variant="light"
            style={{ textDecoration: "none" }}
            rightSection={<ArrowRight size={16} />}
          >
            See API Documentation
          </Button>
        </Typography>
      </Container>
    </>
  );
}

export default About;
