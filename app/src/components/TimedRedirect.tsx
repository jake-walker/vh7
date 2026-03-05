import { Anchor, Progress, Text } from "@mantine/core";
import { useEffect, useState } from "react";

function TimedRedirect({ href }: { href: string }) {
  const maxTimer = 5;
  const [timer, setTimer] = useState(maxTimer);

  useEffect(() => {
    if (timer > 0) {
      setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      window.location.replace(href);
    }
  }, [timer, href]);

  return (
    <>
      <Progress value={(timer / maxTimer) * 100} mb={8} />
      <Text>
        Redirecting to{" "}
        <Anchor inherit component="a" href={href}>
          {href}
        </Anchor>{" "}
        in {timer}...
      </Text>
    </>
  );
}

export default TimedRedirect;
