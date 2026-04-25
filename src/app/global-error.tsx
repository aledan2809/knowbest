"use client";

export default function GlobalError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <h2>Something went wrong</h2>
          <button
            onClick={function () {
              props.reset();
            }}
            style={{ marginTop: "1rem" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
