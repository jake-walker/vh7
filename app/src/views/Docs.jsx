import { Container, TypographyStylesProvider, Text, Badge } from "@mantine/core";
import { Prism } from "@mantine/prism";
import Header from "../components/Header";

function Docs() {
  return (
    <>
      <Header small />
      <Container my={20}>
        <TypographyStylesProvider>
          <h2>Documentation</h2>
          <p>
            VH7 is a free and open source URL shortening, file sharing and pastebin service by <a href="https://jakew.me">Jake Walker</a>.
          </p>
          <h3>FAQ</h3>
          <p>
            <b>How long do short links last?</b> Shortened URLs and pastes last forever*, uploads stay
            for a minimum of 2 months and then deleted and their short links are made available again.

            <Text color="dimmed" size="xs">
              * - I will try my best to keep data backed up and VH7 online, however I can't make any
              promises, so don't use VH7 for anything critical. Also, this is subject to change,
              I may start deleting pastes or changing other things. Finally, any domains where URLs
              break after a while (e.g. online game lobbies or temporary file sharing) will get deleted
              after a minimum of 2 months.
            </Text>
          </p>
          <p>
            <b>How big can uploaded files be?</b> Files uploaded to VH7 can be 256 MB in size. Any
            files larger won't be accepted, but you are welcome to use another service and shorten
            their link. This limit may change in the future.
          </p>
          <p>
            <b>Why can't I download from links directly?</b> For security and convenience, you are
            taken to an intermediary page before downloading files or pastes. You can
            add <code>?direct</code> to the end of the link to bypass the page. We have a filter
            which will take bots and command line applications to a direct download, and browser
            users to the intermediary page. Let me know if there's something that is broken with this.
          </p>
          <h3>API</h3>
          <p>
            Using VH7's API will allow you to build short links into your own application. To keep
            links shorter for everyone, I please ask that you use the API for small projects
            and <a href="https://jakew.me/contact">contact me</a> first for any bigger projects.
          </p>
        </TypographyStylesProvider>
        <h4><Badge>POST</Badge> /api/shorten</h4>
        <p>
          Shortens a given URL.
        </p>
        <p>
          Send a JSON or form data request including a <code>url</code> field.
        </p>
        <h5>Example Request</h5>
        <Prism language="json">{`{\n  "url": "https://example.com"\n}`}</Prism>
        <h5>Example Response</h5>
        <Prism language="json">{`{\n  "id": "abcd",\n  "url": "https://example.com"\n}`}</Prism>
        <h5>cURL Example</h5>
        <Prism language="bash">{`curl \\
  -H 'Content-Type: application/json' -X POST \\
  --data '{"url": "https://example.com"}' \\
  https://vh7.uk/api/shorten`}</Prism>

        <h4><Badge>POST</Badge> /api/paste</h4>
        <p>
          Save given snippet of code to a short link.
        </p>
        <p>
          Send a JSON or form data request including a <code>code</code> and <code>language</code> field.
        </p>
        <h5>Example Request</h5>
        <Prism language="json">{`{\n  "code": "def add(a, b):\\n    return a + b"\n  "language": "python"\n}`}</Prism>
        <h5>Example Response</h5>
        <Prism language="json">{`{\n  "id": "abcd",\n  "code": "def add(a, b):\\n    return a + b"\n  "language": "python"\n}`}</Prism>
        <h5>cURL Example</h5>
        <Prism language="bash">{`curl \\
  -H "Content-Type: application/json" -X POST \\
  --data '{"code": "def add(a, b):\\n    return a + b", "language": "python"}' \\
  https://vh7.uk/api/paste`}</Prism>

        <h4><Badge>POST</Badge> /api/upload</h4>
        <p>
          Upload a file to a short link.
        </p>
        <p>
          Send a form data request including a <code>file</code> field.
        </p>
        <h5>Example Response</h5>
        <Prism language="json">{`{\n  "id": "abcd",\n  "size": 35,\n  "filename": "hello.txt",\n  "hash": "d223c30380ce42d3884b8368196a265e9efecef6885f81cf6426ff688a3ebeed"\n}`}</Prism>
        <Text color="dimmed" size="xs">
          The size is in bytes and the hash is SHA256.
        </Text>

        <h5>cURL Example</h5>
        <Prism language="bash">{`curl -F'file=@hello.txt' https://vh7.uk/api/upload`}</Prism>

        <h4><Badge>GET</Badge> /api/info/:id</h4>
        <p>
          Retreive information about a given link.
        </p>
        <p>
          The response will be a JSON object in a similar format to when creating
          a short link with a <code>created</code> and <code>type</code> field.
        </p>
        <h5>cURL Example</h5>
        <Prism language="bash">{`curl https://vh7.uk/api/info/abcd`}</Prism>

        <h4><Badge>GET</Badge> /:id?direct</h4>
        <p>
          Visiting the short link with <code>?direct</code> will redirect you
          to URLs or download pastes and uploads.
        </p>
        <h5>cURL Example</h5>
        <Prism language="bash">{`curl https://vh7.uk/abcd`}</Prism>
      </Container>
    </>
  )
}

export default Docs;
